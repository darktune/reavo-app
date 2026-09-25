export function detectIntentLocally(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("cart")) return "SHOW_CART";
  if (lowerText.includes("home")) return "GO_HOME";
  if (lowerText.includes("checkout")) return "CHECKOUT";
  
  if (lowerText.includes("swap") || lowerText.includes("trade") || lowerText.includes("upgrade")) return "TRADE_IN";
  if (lowerText.includes("kora") || lowerText.includes("pay")) return "PAYMENT_HELP";
  
  // Ambiguous -> Send to AI
  return "AMBIGUOUS";
}
