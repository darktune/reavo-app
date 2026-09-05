import { aiProvider } from './core/aiProvider.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('your-project-id') &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))
);

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : {
      auth: { getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase unconfigured') }) },
      from: () => ({ select: () => ({ or: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) })
    };


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 0. Enforce Server-Side Authorization (Vulnerability 03 & 74 Fix)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  // Verify Admin Role from staff table or metadata (Supports DEVELOPER, OWNER, ADMIN, etc.)
  const { data: staffMember } = await supabase
    .from('staff')
    .select('role, is_active')
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle();

  const userRole = (staffMember?.role || user.user_metadata?.role || user.app_metadata?.role || '').toUpperCase();
  const isActive = staffMember ? staffMember.is_active : true;

  const allowedRoles = ['OWNER', 'ADMIN', 'DEVELOPER', 'MANAGER', 'SUPERADMIN', 'INVENTORY', 'SUPPORT', 'ANALYST', 'ORDER MANAGER', 'CONTENT'];
  if (!isActive || (!allowedRoles.includes(userRole) && user.email !== 'admin@reavo.com')) {
    return res.status(403).json({ error: 'Forbidden: Requires administrative privileges' });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  // 1. Fetch Admin Context (Token Caveman Rule: Minify data)
  const [{ data: products }, { data: orders }] = await Promise.all([
    supabase.from('products').select('id, name, price, stock_quantity, category'),
    supabase.from('orders').select('id, total_amount, status, created_at')
  ]);

  // Aggregate orders for the prompt
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
  const pendingOrders = orders?.filter(o => o.status === 'Pending').length || 0;
  
  // Aggregate products
  const lowStockProducts = products?.filter(p => p.stock_quantity <= 5) || [];
  
  const adminState = {
    totalRevenue,
    pendingOrders,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    allProducts: products
  };

  // 2. Gemini Pipeline - MeshLLM Routing
  const modelMesh = [
    "gemini-flash-lite-latest", // Primary (Fast)
    "gemini-2.5-flash"          // Fallback
  ];

  const systemPrompt = `ROLE: REAVO Admin AI Copilot.
You are assisting the owner of the REAVO ecommerce store.
You have read access to their database state, and you can PROPOSE write operations if asked (but you must ask for approval).

RULES:
1. Be professional and concise.
2. If the admin asks about sales, use the totalRevenue and pendingOrders data.
3. If the admin asks about stock, look at the lowStockProducts array.
4. If the admin asks to change a price or update stock, you MUST return a "proposal" type with the EXACT action_payload so the frontend can execute it.
5. Do NOT hallucinate data. Only use the provided STATE.
6. When changing a product, look up its id in the allProducts list based on the name they mentioned.
7. Do not output raw markdown header symbols (like ###) or tacky emojis. Communicate in clean, professional, executive prose.

OUTPUT SCHEMA (Must be EXACT JSON):
{
  "type": "info" | "success" | "warning" | "error" | "proposal",
  "text": "Your response message to the admin",
  "action": "Button text (e.g. 'Approve Price Change') - ONLY if type is proposal",
  "action_payload": {
    "table": "products",
    "operation": "update",
    "match_column": "id",
    "match_value": "prod-123",
    "update_data": { "price": 99999 }
  } // ONLY if type is proposal
}`;

  const userPrompt = `STATE: ${JSON.stringify(adminState)}
ADMIN QUERY: "${message}"`;

  // 3. AI Call
  try {
    const response = await aiProvider.generateResponse(modelMesh, systemPrompt, userPrompt, 1000);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Admin AI Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
