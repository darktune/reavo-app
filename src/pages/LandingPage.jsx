import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Shield, Truck, Zap, MessageCircle, ChevronRight, Check, Sparkles } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { products } from '../data/products';
import SEO from '../components/SEO';
import PreorderHeroBanner from '../components/PreorderHeroBanner';
import PersonalizedGreeting from '../components/PersonalizedGreeting';
import ProductCard from '../components/ProductCard';
import { toast } from 'sonner';

const HARDWARE_SHORTCUTS = [
  { label: 'Laptops & MacBooks', icon: '💻', type: 'laptops' },
  { label: 'iPads & Tablets', icon: '📱', type: 'tablets' },
  { label: 'Audio & AirPods', icon: '🎧', type: 'audio' },
  { label: 'Gear & Sleeves', icon: '⚡', type: 'gear' },
  { label: 'Campus Bundles', icon: '📦', type: 'kits' },
  { label: 'Under ₦150k Deals', icon: '🔥', type: 'deals' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTrendingTab, setActiveTrendingTab] = useState('all');
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "REAVO",
    "url": "https://reavoglobal.com",
    "logo": "https://reavoglobal.com/logos/reavo_logo_black.png",
    "description": "Nigeria's No. 1 Student Gadget Brand • Campus Tech, Laptops, Phones & Accessories",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+234-915-855-4158",
      "contactType": "Customer Service",
      "areaServed": "NG"
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText('REAVOFIRST');
    setCopiedCoupon(true);
    toast.success('₦5,000 Voucher Code REAVOFIRST copied! Apply at checkout.');
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  // Filter trending products based on active tab
  let trendingProducts = products.slice(0, 4);
  if (activeTrendingTab === 'laptops') {
    trendingProducts = products.filter(p => /macbook|laptop|thinkpad|rog|dell|zenbook|hp/i.test(p.name)).slice(0, 4);
  } else if (activeTrendingTab === 'tablets') {
    trendingProducts = products.filter(p => /ipad|tablet|galaxy tab/i.test(p.name)).slice(0, 4);
  } else if (activeTrendingTab === 'deals') {
    trendingProducts = products.filter(p => p.price <= 150000).slice(0, 4);
  }

  const openWhatsAppHelp = () => {
    const text = encodeURIComponent('Hello REAVO! I am looking for gadget recommendations for my studies/work.');
    window.open(`https://wa.me/2349158554158?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <main style={{ background: 'var(--bg-void)' }}>
      <SEO 
        title="REAVO • Campus Gadgets in Nigeria" 
        url="/" 
        schema={orgSchema}
      />

      {/* 1. Top First-Visit Incentive & Voucher Ribbon (Loss Aversion & Incentive) */}
      <div 
        onClick={handleCopyCoupon}
        style={{
          background: 'linear-gradient(90deg, rgba(57, 217, 196, 0.15) 0%, rgba(124, 92, 255, 0.15) 100%)',
          borderBottom: '1px solid rgba(57, 217, 196, 0.25)',
          padding: '8px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 40,
          marginTop: 64,
          transition: 'background 0.2s ease'
        }}
        title="Tap to copy voucher code"
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, fontWeight: 500, flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={14} />
            <strong>New Student Welcome:</strong>
          </span>
          <span style={{ color: 'var(--text-primary)' }}>
            Get <strong>₦5,000 Off</strong> your first order with code <code style={{ background: 'var(--bg-inner)', padding: '2px 6px', borderRadius: 4, color: 'var(--accent-primary)', fontWeight: 700 }}>REAVOFIRST</code>
          </span>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 4, 
            color: copiedCoupon ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontSize: 11,
            marginLeft: 4,
            fontWeight: 600
          }}>
            {copiedCoupon ? <><Check size={12} /> Copied!</> : '• Tap to copy'}
          </span>
        </div>
      </div>

      {/* 2. Hero Section: Clean, uncluttered, focused */}
      <section style={{
        minHeight: 'calc(80vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        padding: 'clamp(40px, 8vw, 80px) 0',
        overflow: 'hidden'
      }}>
        {/* Background Effects */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, var(--dot-color, rgba(255,255,255,0.04)) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(57,217,196,0.1) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />

        <div className="container hero-grid" style={{ position: 'relative', zIndex: 10, alignItems: 'center' }}>
          <div>
            <ScrollReveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <PersonalizedGreeting variant="hero" />
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 12px',
                  borderRadius: 100,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--glass-bg)'
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>NIGERIA'S NO. 1 STUDENT GADGET BRAND</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', lineHeight: 1.1, marginBottom: 20, fontWeight: 700 }}>
                The right tech<br />
                for who <span style={{ color: 'var(--accent-primary)' }}>you're</span><br />
                becoming.
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)', maxWidth: 500, marginBottom: 32, lineHeight: 1.6 }}>
                Laptops, iPads, AirPods & gear curated for Nigerian students, creators and founders. Zero ads spent, backed by 1-year official warranty.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link to="/shop" className="btn-primary" style={{ padding: '14px 28px', fontSize: 15 }}>
                  Shop All Gadgets <ArrowRight size={18} />
                </Link>
                <Link to="/shop?type=deals" className="btn-ghost" style={{ padding: '14px 24px', fontSize: 15 }}>
                  Student Deals 🔥
                </Link>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={300}>
            {/* Featured Hero Product Card */}
            <div className="hero-visual" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <div 
                className="ios26-card" 
                onClick={() => navigate('/product/macbook-pro-m4')}
                style={{
                  width: '100%',
                  maxWidth: 520,
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img 
                  src={products[0].image} 
                  alt="Featured MacBook Pro M4 • Nigerian Student Gadget" 
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    aspectRatio: '16 / 10', 
                    objectFit: 'cover', 
                    display: 'block' 
                  }} 
                />
                <div style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: 12,
                  padding: '12px 16px',
                  borderRadius: 16,
                  background: 'rgba(10, 12, 16, 0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>MacBook Pro M4</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Liquid Retina XDR • Campus Ready</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                      ₦1,950,000
                    </span>
                    <span style={{ fontSize: 11, background: 'var(--text-primary)', color: 'var(--bg-void)', padding: '4px 8px', borderRadius: 8, fontWeight: 600 }}>
                      View
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. Hardware Category Quick-Pills (Hick's Law: Direct 1-tap paths to concrete hardware) */}
      <section style={{ 
        borderTop: '1px solid var(--border-subtle)', 
        borderBottom: '1px solid var(--border-subtle)', 
        background: 'rgba(255, 255, 255, 0.01)',
        padding: '16px 0' 
      }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            gap: 10, 
            overflowX: 'auto', 
            scrollbarWidth: 'none', 
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '4px 0'
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap', marginRight: 4 }}>
              Fast Discovery:
            </span>
            {HARDWARE_SHORTCUTS.map((item) => (
              <button
                key={item.type}
                onClick={() => navigate(`/shop?type=${item.type}`)}
                className="glass-hover"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 100,
                  background: 'var(--bg-inner)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Trust & Frictionless Value Strip (Eliminating Buying Anxiety) */}
      <section style={{ padding: '28px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(57, 217, 196, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Truck size={18} color="var(--accent-primary)" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Campus & Lagos Direct</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Hostel drop-off across 50+ universities</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124, 92, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={18} color="var(--accent-purple, #7C5CFF)" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>1-Year Official Warranty</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Full repair or swap coverage</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(180, 255, 57, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={18} color="#B4FF39" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Zero-Password Checkout</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Buy in 60s as a Guest or Student</div>
              </div>
            </div>

            <div 
              onClick={openWhatsAppHelp}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
              title="Chat with a Student Tech Advisor"
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37, 211, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageCircle size={18} color="#25D366" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>WhatsApp VIP Desk</div>
                <div style={{ fontSize: 11, color: '#25D366', fontWeight: 600 }}>• Instant human tech advice</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Flagship Pre-Order Video Hero Showcase (Apple & Spotify Style) */}
      <PreorderHeroBanner />

      {/* 6. Interactive Trending Showcase (Using Full ProductCard with 1-Tap Add to Bag & Wishlist) */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: 6 }}>
                Trending on Campus
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Real devices trusted by students, developers, and creators right now.
              </p>
            </div>

            {/* Sub-tabs for Instant Tabbed Shelf without full page reload */}
            <div style={{ display: 'flex', gap: 6, background: 'var(--bg-inner)', padding: 4, borderRadius: 100, border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
              {[
                { id: 'all', label: '🔥 All' },
                { id: 'laptops', label: '💻 Laptops' },
                { id: 'tablets', label: '📱 iPads' },
                { id: 'deals', label: '⚡ Under ₦150k' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTrendingTab(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 100,
                    background: activeTrendingTab === tab.id ? 'var(--text-primary)' : 'transparent',
                    color: activeTrendingTab === tab.id ? 'var(--bg-void)' : 'var(--text-secondary)',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: activeTrendingTab === tab.id ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="trending-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
            gap: 24 
          }}>
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link 
              to="/shop" 
              className="btn-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontSize: 14 }}
            >
              <span>Explore All 120+ Products in Catalog</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Explore REAVO Universe (Clean Bento Ecosystem Hub - Links to all pages on site with zero clutter!) */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 0', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inner)' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', 
                borderRadius: 100, background: 'rgba(124, 92, 255, 0.1)', border: '1px solid rgba(124, 92, 255, 0.3)',
                color: 'var(--accent-purple, #7C5CFF)', fontSize: 11, fontWeight: 700, marginBottom: 12
              }}>
                THE REAVO NETWORK
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, marginBottom: 10 }}>
                Explore the REAVO Ecosystem
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 540, margin: '0 auto' }}>
                Everything you need to know about our student tech movement, campus partners, and team.
              </p>
            </div>
          </ScrollReveal>

          {/* Bento Portal Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20
          }}>
            {/* Card 1: Our Story & Kinetic Manifesto */}
            <ScrollReveal delay={100}>
              <div 
                onClick={() => navigate('/story')}
                className="glass-panel glass-hover"
                style={{
                  padding: 28,
                  borderRadius: 20,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  minHeight: 220
                }}
              >
                <div>
                  <div style={{ fontSize: 24, marginBottom: 12 }}>📖</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                    Our Story & Manifesto
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Built for the creator editing between lectures, the gamer grinding after class, and the hustler running a business from a hostel room.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-purple, #7C5CFF)', fontSize: 13, fontWeight: 600, marginTop: 18 }}>
                  <span>Experience the Kinetic Story</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2: Campus Ambassadors & Community */}
            <ScrollReveal delay={200}>
              <div 
                onClick={() => navigate('/ambassadors')}
                className="glass-panel glass-hover"
                style={{
                  padding: 28,
                  borderRadius: 20,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  minHeight: 220
                }}
              >
                <div>
                  <div style={{ fontSize: 24, marginBottom: 12 }}>🎓</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                    Campus Ambassadors
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Meet our team across 50+ Nigerian universities. Connecting students with tech grants, discounts, and verified campus delivery.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-primary)', fontSize: 13, fontWeight: 600, marginTop: 18 }}>
                  <span>Meet Campus Reps</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </ScrollReveal>

            {/* Card 3: School Labs & Bulk Partnerships */}
            <ScrollReveal delay={300}>
              <div 
                onClick={() => navigate('/partnerships')}
                className="glass-panel glass-hover"
                style={{
                  padding: 28,
                  borderRadius: 20,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  minHeight: 220
                }}
              >
                <div>
                  <div style={{ fontSize: 24, marginBottom: 12 }}>🤝</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                    Institutional Partnerships
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Complete hardware lab kits, bulk iPad bundles, and audio packages for universities, faculties, and student associations.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B4FF39', fontSize: 13, fontWeight: 600, marginTop: 18 }}>
                  <span>Partner With REAVO</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 8. Reassurance & WhatsApp VIP Concierge Strip */}
      <section style={{ padding: '40px 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 20,
          background: 'var(--bg-card)',
          padding: '24px 32px',
          borderRadius: 20,
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              Need advice choosing a gadget?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Chat with our student tech concierge on WhatsApp for specs, course recommendations, and custom payment options.
            </p>
          </div>
          <button 
            onClick={openWhatsAppHelp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 100,
              background: '#25D366',
              color: '#FFFFFF',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MessageCircle size={16} />
            <span>Chat on WhatsApp</span>
          </button>
        </div>
      </section>

      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 36px;
        }
        .hero-visual {
          height: auto;
        }
        .trending-grid {
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .trending-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </main>
  );
}
