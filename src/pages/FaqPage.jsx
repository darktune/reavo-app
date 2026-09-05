import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, PlayCircle, ShieldCheck, Truck, MessageSquare, ShoppingBag } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Using AI Copilot',
      icon: <MessageSquare size={24} color="var(--text-primary)" />,
      items: [
        {
          question: 'How do I use the REAVO AI Assistant?',
          answer: 'Tap the chat bubble icon in the bottom right corner of your screen at any time. You can ask the AI to find specific products, track your orders, explain our return policies, or even give styling advice. It understands natural language and context.'
        },
        {
          question: 'Can the AI track my order?',
          answer: 'Yes! Simply open the chat widget and type "Track my latest order" or "Where is my package?". The AI will instantly fetch your real-time order status from our database.'
        }
      ]
    },
    {
      category: 'Orders & Shipping',
      icon: <Truck size={24} color="var(--text-primary)" />,
      items: [
        {
          question: 'How long does delivery take?',
          answer: 'Standard shipping takes 3-5 business days. Express shipping is available at checkout for 1-2 business days delivery. Once shipped, you will receive a tracking link via email and your profile.'
        },
        {
          question: 'How do I track my order?',
          answer: 'You can check your order status anytime by navigating to Profile > My Orders. Alternatively, ask the AI Assistant to pull up your recent order history.'
        }
      ]
    },
    {
      category: 'Returns & Refunds',
      icon: <ShieldCheck size={24} color="var(--text-primary)" />,
      items: [
        {
          question: 'What is your return policy?',
          answer: 'We accept returns within 14 days of delivery. Items must be unworn, unwashed, and have original tags attached. To initiate a return, go to Profile > Customer Support and email us your order details.'
        },
        {
          question: 'When will I get my refund?',
          answer: 'Refunds are processed within 3-5 business days after we receive your return. The funds will be credited back to your original Korapay payment method.'
        }
      ]
    },
    {
      category: 'Shopping & Payments',
      icon: <ShoppingBag size={24} color="var(--text-primary)" />,
      items: [
        {
          question: 'Is my payment secure?',
          answer: 'Absolutely. All transactions are securely processed through Korapay with bank-grade encryption. We do not store your credit card information on our servers.'
        },
        {
          question: 'How do I save items for later?',
          answer: 'Click the heart icon on any product card to add it to your Wishlist. You can view all your saved items anytime in your Profile under the "Saved Items" tab.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div style={{ paddingTop: 120, paddingBottom: 120, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', marginBottom: 24, letterSpacing: '-0.04em' }}>Help & Tutorials</h1>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
              Everything you need to know about shopping, shipping, and using the REAVO AI Copilot.
            </p>
          </div>

          <div style={{ position: 'relative', marginBottom: 64 }}>
            <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search for answers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '24px 24px 24px 64px',
                borderRadius: 100,
                border: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-primary)',
                fontSize: 16,
                outline: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}
            />
          </div>
        </ScrollReveal>

        {filteredFaqs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 64 }}>
            No results found for "{searchQuery}"
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {filteredFaqs.map((category, catIndex) => (
              <ScrollReveal key={catIndex} delay={catIndex * 100}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 16 }}>
                    {category.icon}
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 600 }}>{category.category}</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {category.items.map((item, itemIndex) => {
                    const globalIndex = `${catIndex}-${itemIndex}`;
                    const isOpen = openIndex === globalIndex;
                    
                    return (
                      <div 
                        key={itemIndex}
                        className="glass-panel"
                        style={{ 
                          borderRadius: 16, 
                          overflow: 'hidden',
                          border: isOpen ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border-subtle)'
                        }}
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          style={{
                            width: '100%',
                            padding: 24,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 16,
                            fontWeight: 500
                          }}
                        >
                          <span style={{ paddingRight: 24 }}>{item.question}</span>
                          {isOpen ? <ChevronUp size={20} color="var(--text-secondary)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
                        </button>
                        
                        {isOpen && (
                          <div style={{ 
                            padding: '0 24px 24px 24px', 
                            color: 'var(--text-secondary)', 
                            lineHeight: 1.6,
                            animation: 'fadeIn 0.3s ease forwards'
                          }}>
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
