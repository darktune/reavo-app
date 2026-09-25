import { aiProvider } from './_core/aiProvider.js';
import { detectIntentLocally } from './_core/intentRouter.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, state } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  // 1. Local Intent Detection (Token Caveman Rule: Do NOT call AI for simple tasks)
  const localIntent = detectIntentLocally(message);
  if (['SHOW_CART', 'GO_HOME', 'CHECKOUT'].includes(localIntent)) {
    return res.status(200).json({ 
      intent: localIntent, 
      message: 'Sure thing!',
      products: [],
      actions: []
    });
  }

  // 2. Fetch all products from DB (Determinism)
  const { data: products } = await supabase.from('products').select('*');
  let candidates = products || [];
  
  // Very basic local budget extraction
  const budgetMatch = message.match(/(\d+)\s*(k|thousand|m|million)?/i);
  let budget = state?.budget || null;
  if (budgetMatch) {
    let num = parseFloat(budgetMatch[1]);
    let mult = budgetMatch[2]?.toLowerCase();
    if (mult === 'k' || mult === 'thousand') num *= 1000;
    if (mult === 'm' || mult === 'million') num *= 1000000;
    if (num > 1000) budget = num; // naive check
  }

  if (budget) {
    candidates = candidates.filter(p => p.price <= budget);
  }

  // Minify candidates (Token Caveman Rule: FIELD MINIFICATION)
  const minified = candidates.slice(0, 10).map(p => ({
    id: p.id, 
    name: p.name, 
    price: p.price, 
    category: p.category,
    specs: p.specs.join(', ')
  }));

  // 3. Gemini Pipeline - MeshLLM Routing
  const modelMesh = [
    "gemini-flash-lite-latest", // Primary (Lowest Cost/High Scale)
    "gemini-2.5-flash",         // Fallback 1
    "gemini-2.0-flash",         // Fallback 2
  ];

  const systemPrompt = `ROLE: REAVO AI Shopping Assistant.
RULES:
1. Never invent inventory. You MUST ONLY recommend from the CANDIDATES list below.
2. Be extremely concise. No long greetings. Max 2 sentences for the message.
3. If the user asks about payments or Kora, explain it simply.
4. If a budget is provided, respect it.
5. You MUST return output matching this EXACT JSON schema:
{
  "intent": "PRODUCT_RECOMMENDATION" | "GENERAL_CHAT" | "PAYMENT_HELP" | "TRADE_IN",
  "message": "Your short response.",
  "products": [ { "id": "p123", "reason": "Short reason (max 10 words)" } ],
  "actions": ["view", "add", "compare"]
}`;

  const userPrompt = `STATE: ${JSON.stringify({ ...state, budget })}
USER: "${message}"
CANDIDATES: ${JSON.stringify(minified)}`;

  // 4. AI Call (Token Caveman Rule: TOKEN BUDGET PER REQUEST)
  const response = await aiProvider.generateResponse(modelMesh, systemPrompt, userPrompt, 800);

  return res.status(200).json(response);
}
