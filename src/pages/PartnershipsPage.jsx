import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Calendar, Package, Mic2, CheckCircle2, ArrowRight, Send, Phone } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const IMG_BASE = 'https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4';

const partnershipTypes = [
  {
    id: 'bulk',
    icon: Package,
    title: 'Bulk Device Supply',
    description: 'Laptops, tablets, phones, and accessories at institutional scale. Properly sourced, properly priced.',
    features: ['MacBooks & Windows laptops', 'iPads & Android tablets', 'Accessories & charger packs', 'Flexible payment terms'],
    color: '#FFB800',
  },
  {
    id: 'activation',
    icon: Mic2,
    title: 'Campus Activations',
    description: 'Pop-up booths, product demonstrations, and community-driven sales that actually move units.',
    features: ['Trade fair booth setup & staffing', 'Product demo sessions', 'Events calendar coordination', 'Revenue-sharing available'],
    color: '#7C5CFF',
  },
  {
    id: 'event',
    icon: Calendar,
    title: 'Event Tech Deployment',
    description: 'For conferences, convocations, and large-scale events. AV equipment, camera kits, PA systems • all handled.',
    features: ['PA systems & stage audio', 'Camera & livestream setups', 'Projectors & display screens', 'Lighting rigs for venues'],
    color: '#39D9C4',
  },
];

const stats = [
  { value: '110.9%', label: 'ROI in two days' },
  { value: '48hrs', label: 'Total event window' },
  { value: '₦0', label: 'Promotion spend' },
  { value: '100%', label: 'Organic foot traffic' },
];

export default function PartnershipsPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    organisation: '',
    email: '',
    type: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type) {
      setErrorMsg('Please select a partnership type.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      // Send data to our new API endpoint (handles DB insert + Email)
      const res = await fetch('/api/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry');
      
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-void)', paddingTop: 80 }}>

      {/* Hero */}
      <section style={{ padding: '100px 0 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-30%', right: '-15%',
          width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(255, 184, 0, 0.1) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: 800 }}>
          <ScrollReveal>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '4px 14px', borderRadius: 100,
              border: '1px solid var(--border-subtle)', background: 'var(--glass-bg)',
              marginBottom: 24,
            }}>
              <Building2 size={14} style={{ color: 'var(--accent-primary)' }} />
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                SCHOOLS · INSTITUTIONS · EVENTS
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', marginBottom: 20, lineHeight: 1.1 }}>
              Your campus deserves a tech partner that{' '}
              <span style={{ color: 'var(--accent-primary)' }}>actually shows up.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 580, marginBottom: 40 }}>
              REAVO partners with schools, institutions, and event organisers to supply, activate,
              and deploy the right technology • without the procurement theatre.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <a href="#book-a-call" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Book a call <ArrowRight size={18} />
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* What We Do • 3 Cards */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <ScrollReveal>
            <p className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: 1 }}>
              WHAT WE DO FOR INSTITUTIONS
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: 48 }}>
              Three ways to work together.
            </h2>
          </ScrollReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}>
            {partnershipTypes.map((type, i) => (
              <ScrollReveal key={type.id} delay={i * 120}>
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 20,
                  padding: 32,
                  border: '1px solid var(--border-subtle)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${type.color}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${type.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                  }}>
                    <type.icon size={24} style={{ color: type.color }} />
                  </div>

                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{type.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                    {type.description}
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                    {type.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={14} style={{ color: type.color, flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section style={{
        padding: '60px 0',
        background: 'var(--bg-inner)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="container">
          <ScrollReveal>
            <p style={{
              fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: 1,
            }} className="font-mono">
              LANDMARK UNIVERSITY · KWARA STATE
            </p>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', marginBottom: 40 }}>
              A trade fair. Two days.{' '}
              <span style={{ color: 'var(--accent-primary)' }}>110.9% ROI.</span>
            </h2>
          </ScrollReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
          }}>
            {stats.map((stat, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 16,
                  padding: '28px 24px',
                  textAlign: 'center',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-primary)', marginBottom: 6 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={500}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 32, maxWidth: 600 }}>
              No paid promotion. No sponsored placements. REAVO showed up, set up, and let the products speak.
              The campus came, and they didn't leave empty-handed.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Form • Simple & Straightforward */}
      <section id="book-a-call" style={{ padding: '100px 0' }}>
        <div className="container" style={{ maxWidth: 640, margin: '0 auto' }}>
          <ScrollReveal>
            <p className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: 1 }}>
              WORK WITH REAVO
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: 12 }}>
              Book a call, not a pitch deck.
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.6 }}>
              Tell us who you are and what you're trying to do. We'll have a real conversation
              about whether REAVO is the right fit • no decks, no formalities.
            </p>
          </ScrollReveal>

          {/* Trust signals */}
          <ScrollReveal delay={100}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
              {[
                'We respond to every enquiry personally.',
                'No commitment required from the first call.',
                'We\'ve worked with schools across 6 Nigerian states.',
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  {text}
                </div>
              ))}
            </div>
          </ScrollReveal>

          {submitted ? (
            <ScrollReveal>
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 20,
                padding: 48,
                textAlign: 'center',
                border: '1px solid var(--border-subtle)',
              }}>
                <CheckCircle2 size={48} style={{ color: 'var(--accent-primary)', marginBottom: 16 }} />
                <h3 style={{ fontSize: 24, marginBottom: 12 }}>Message sent!</h3>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>
                  We'll get back to you within 24 hours. In the meantime, feel free to explore our products.
                </p>
                <button onClick={() => navigate('/shop')} className="btn-primary">
                  Browse Products <ArrowRight size={18} />
                </button>
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal delay={200}>
              <form
                onSubmit={handleSubmit}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 20,
                  padding: 36,
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}
              >
                {/* Name */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>
                    Your name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="e.g. Emuan Edison"
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 12,
                      background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)', fontSize: 15, outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>

                {/* Organisation */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>
                    Your institution or organisation
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organisation}
                    onChange={e => handleChange('organisation', e.target.value)}
                    placeholder="e.g. Landmark University"
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 12,
                      background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)', fontSize: 15, outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="you@institution.edu.ng"
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 12,
                      background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)', fontSize: 15, outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>

                {/* Partnership Type • Simple pill selector */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: 'block', color: 'var(--text-secondary)' }}>
                    What are you looking for?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['Bulk device supply', 'Campus activation', 'Event tech deployment', 'Something else'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleChange('type', option)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: 100,
                          fontSize: 13,
                          fontWeight: 500,
                          border: '1px solid',
                          borderColor: formData.type === option ? 'var(--accent-primary)' : 'var(--border-subtle)',
                          background: formData.type === option ? 'var(--accent-primary)' : 'var(--bg-inner)',
                          color: formData.type === option ? '#000' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message • optional */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>
                    Anything else? <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={e => handleChange('message', e.target.value)}
                    placeholder="Tell us about your needs, timeline, or any questions..."
                    rows={3}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 12,
                      background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)', fontSize: 15, outline: 'none',
                      resize: 'vertical', fontFamily: 'inherit',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>

                {/* Error Message */}
                {errorMsg && (
                  <div style={{ color: 'var(--accent-coral)', fontSize: 14, background: 'rgba(255, 107, 74, 0.1)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 107, 74, 0.2)' }}>
                    {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading} className="btn-primary" style={{
                  width: '100%', padding: '16px', fontSize: 16,
                  borderRadius: 14, marginTop: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  <Send size={18} />
                  {loading ? 'Sending...' : 'Send a message'}
                </button>
              </form>
            </ScrollReveal>
          )}

          {/* Direct contact */}
          <ScrollReveal delay={300}>
            <div style={{
              marginTop: 32, textAlign: 'center',
              fontSize: 14, color: 'var(--text-secondary)',
            }}>
              <p style={{ marginBottom: 4 }}>Or reach us directly:</p>
              <a
                href="mailto:partnerships@reavoglobal.com"
                style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}
              >
                partnerships@reavoglobal.com
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
