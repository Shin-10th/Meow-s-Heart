// Simple rule-based (no external AI API, no per-message cost) canned-reply
// engine for the customer service chat widget. Matches keywords in the
// customer's message against a small set of rules and returns the first
// hit, or a generic fallback that tells them a human has been notified.
// An admin can take over the conversation at any time (see
// support_conversations.human_engaged), at which point the widget stops
// auto-replying so it doesn't talk over the admin.

interface BotRule {
  keywords: string[]
  reply: string
}

const rules: BotRule[] = [
  {
    keywords: ['track', 'where is my order', 'order status', 'my order'],
    reply:
      "You can check your order's progress anytime from My Account → Order History. Orders move from Awaiting Confirmation → Processing → Shipped → Completed. If yours has been stuck for a while, let us know and an admin will take a look! 🐾",
  },
  {
    keywords: ['refund', 'return', 'money back'],
    reply:
      "Sorry to hear that! For refunds or returns, please share your order number and the reason here — an admin will review it and follow up with you shortly. 💗",
  },
  {
    keywords: ['cancel'],
    reply:
      "If your order hasn't shipped yet, we may be able to cancel it. Please share your order number and an admin will confirm and help you right away.",
  },
  {
    keywords: ['kpay', 'kbzpay', 'payment', 'pay', 'receipt'],
    reply:
      "For KBZPay orders, please upload your payment receipt on the checkout payment step — once it's confirmed your order moves to Processing automatically. If you've already uploaded it and it's been a while, an admin will double-check for you.",
  },
  {
    keywords: ['cash on delivery', 'cod'],
    reply:
      'Cash on Delivery is available for Yangon, Mandalay, and Naypyitaw. Your order will need a quick admin confirmation before it ships — this usually happens fast!',
  },
  {
    keywords: ['ship', 'deliver', 'delivery time', 'how long'],
    reply:
      'Delivery usually takes 2–5 business days depending on your city. You can see the current status of your order under My Account → Order History.',
  },
  {
    keywords: ['price', 'cost', 'how much', 'discount', 'promo', 'coupon'],
    reply:
      "You'll find current prices on each product page in the Shop. Keep an eye on your Meow's Paws loyalty points — they can be used toward future perks! An admin can share any active promos with you too.",
  },
  {
    keywords: ['paw', 'loyalty', 'points'],
    reply:
      "Meow's Paws are our loyalty points — you earn 1 paw for every 30,000 MMK spent once your order is confirmed. Check your balance on the Loyalty page!",
  },
  {
    keywords: ['broken', 'damaged', 'wrong item', 'wrong product', 'missing'],
    reply:
      "We're really sorry about that! Please tell us your order number and what went wrong — an admin will make this right for you as soon as possible.",
  },
  {
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good evening'],
    reply: "Hi there! 🎀 I'm Meow's Heart's assistant. Ask me about orders, payments, or delivery — or let me know if you'd like to speak with our team directly.",
  },
  {
    keywords: ['thank', 'thanks', 'thx'],
    reply: "You're so welcome! Let us know if there's anything else we can help with. 🐾",
  },
]

const fallback =
  "Thanks for reaching out! I've noted your message and one of our team members will reply here shortly. 🎀"

export function getBotReply(message: string): string {
  const lower = message.toLowerCase()
  for (const rule of rules) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) return rule.reply
  }
  return fallback
}
