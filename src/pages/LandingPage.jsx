import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { products, categories } from '../data/products';
import DotNav from '../components/DotNav';
import SEO from '../components/SEO';
import PreorderHeroBanner from '../components/PreorderHeroBanner';
import PersonalizedGreeting from '../components/PersonalizedGreeting';
import { useUser } from '../context/UserContext';

const communityImages = [
  "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/DSC04369.b9a907ea.jpeg",
  "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/26.37738781.jpeg",
  "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/21.a3a213b3.jpeg",
  "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/2.adc787b5.jpeg",
  "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0335.ea9bbfbb.jpeg",
  "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0358.070b81ee.jpeg",
  "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0311.1547b02a.jpeg",
  "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0255.fb2308c7.jpeg",
  "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0275.9046d256.jpeg"
];

const ambassadorImages = [
  "/ambassadors/14.jpg",
  "/ambassadors/18.jpg",
  "/ambassadors/20.jpg",
  "/ambassadors/21.jpg",
  "/ambassadors/24.jpg",
  "/ambassadors/26.jpg",
  "/ambassadors/29.jpg",
  "/ambassadors/31.jpg",
  "/ambassadors/32.jpg",
  "/ambassadors/34.jpg",
  "/ambassadors/35.jpg",
  "/ambassadors/37.jpg",
  "/ambassadors/photo_2026-08-17_20-56-56.jpg",
  "/ambassadors/photo_2026-08-17_20-58-49.jpg",
];

function ImageGallery({ images, isAmbassadors = false }) {
  const [skew, setSkew] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const scrollVelocityTimeout = useRef(null);
  const lastScrollLeft = useRef(0);

  const handleScroll = (e) => {
    const currentScroll = e.target.scrollLeft;
    const velocity = currentScroll - lastScrollLeft.current;
    lastScrollLeft.current = currentScroll;
    
    const newSkew = Math.max(-25, Math.min(25, velocity * 0.8));
    setSkew(newSkew);

    const itemWidth = 280 + 24;
    const index = Math.round(currentScroll / itemWidth);
    setActiveIndex(Math.min(Math.max(index, 0), images.length - 1));

    clearTimeout(scrollVelocityTimeout.current);
    scrollVelocityTimeout.current = setTimeout(() => {
      setSkew(0);
    }, 150);
  };

  const scrollTo = (index) => {
    if (scrollRef.current) {
      const itemWidth = 280 + 24;
      scrollRef.current.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
    }
  };

  return (
    <div>
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ 
          display: 'flex', 
          gap: 24, 
          padding: '0 24px', 
          overflowX: 'auto', 
          scrollbarWidth: 'none', 
          paddingBottom: 40,
          scrollSnapType: 'x mandatory',
          perspective: '1200px'
        }}
      >
        {images.map((src, i) => (
          <div key={i} className="glass-panel" style={{ 
            minWidth: '280px', 
            height: isAmbassadors ? '420px' : '360px', 
            borderRadius: 24, 
            overflow: 'hidden',
            flexShrink: 0,
            scrollSnapAlign: 'center',
            border: '1px solid var(--border-subtle)',
            transform: `rotateY(${-skew}deg) scale(${1 - Math.abs(skew)/250})`,
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <img src={src} alt={isAmbassadors ? `REAVO Campus Ambassador • Nigeria` : `REAVO community event • Nigerian student tech culture`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
      <DotNav total={images.length} activeIndex={activeIndex} onDotClick={scrollTo} />
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { userName } = useUser();

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

  return (
    <main style={{ background: 'var(--bg-void)' }}>
      <SEO 
        title="REAVO • Campus Gadgets in Nigeria" 
        url="/" 
        schema={orgSchema}
      />
      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        paddingTop: 64,
        overflow: 'hidden'
      }}>
        {/* Background Effects */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, var(--dot-color, rgba(255,255,255,0.04)) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '70vw',
          height: '70vw',
          background: 'radial-gradient(circle, rgba(57,217,196,0.12) 0%, transparent 60%)',
          pointerEvents: 'none'
        }}></div>

        <div className="container hero-grid" style={{ position: 'relative', zIndex: 10, alignItems: 'center' }}>
          <div>
            <ScrollReveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <PersonalizedGreeting variant="hero" />
                <Link
                  to="/story"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 100,
                    border: '1px solid rgba(124, 92, 255, 0.35)',
                    background: 'rgba(124, 92, 255, 0.12)',
                    color: 'var(--accent-purple, #7C5CFF)',
                    fontSize: 11,
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(124, 92, 255, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 0 16px rgba(124, 92, 255, 0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(124, 92, 255, 0.12)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  title="Discover Nigeria's No. 1 Student Brand Manifesto"
                >
                  <span style={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    background: 'var(--accent-purple)', 
                    boxShadow: '0 0 8px rgba(124, 92, 255, 0.7)',
                    display: 'inline-block'
                  }} />
                  <span>Our Story</span>
                </Link>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 12px',
                  borderRadius: 100,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--glass-bg)'
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>EST. 2023 • NIGERIA</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 style={{ fontSize: 'clamp(42px, 6vw, 76px)', marginBottom: 24 }}>
                The right tech<br/>
                for who <span style={{ color: 'var(--accent-primary)' }}>you're</span><br/>
                becoming.
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <h2 style={{ fontSize: '24px', marginBottom: 16, fontWeight: 500 }}>
                Your style, our <span style={{ color: 'var(--accent-purple)' }}>tech</span>.
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 480, marginBottom: 40 }}>
                REAVO is where Nigeria's most ambitious young people find the tech that fits who they are • trusted by 30,000+ students, zero ads spent.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link to="/shop" className="btn-primary">
                  Shop all products <ArrowRight size={18} />
                </Link>
                <Link to="/about" className="btn-ghost">
                  Our story
                </Link>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={400}>
            {/* Mockup visual area */}
            <div className="hero-visual" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <div className="ios26-card" style={{
                width: '100%',
                maxWidth: 560,
                borderRadius: 24,
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                position: 'relative'
              }}>
                <img 
                  src={products[0].image} 
                  alt="Featured REAVO campus gadget • premium tech for Nigerian students" 
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
                  bottom: 14,
                  left: 14,
                  right: 14,
                  padding: '12px 18px',
                  borderRadius: 16,
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>MacBook Pro M4</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Campus Ready • Liquid Retina XDR</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                    ₦1,950,000
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Flagship Pre-Order Video Hero Showcase (Apple & Spotify Style) */}
      <PreorderHeroBanner />

      {/* Categories */}
      <section style={{ padding: 'clamp(60px, 10vw, 120px) 0', background: 'var(--bg-void)', position: 'relative' }}>
        <div className="container">
          <div className="landing-category-grid" style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 40, scrollbarWidth: 'none' }}>
            {categories.map((cat, i) => (
              <ScrollReveal key={cat.id} delay={i * 100}>
                <div 
                  className="glass-panel glass-hover" 
                  style={{ 
                    minWidth: 200, 
                    padding: 32, 
                    borderRadius: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)'
                  }}
                  onClick={() => navigate(`/shop?cat=${cat.id}`)}
                >
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-void)' }}></div>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 600 }}>{cat.label}</h3>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section style={{ padding: 'clamp(60px, 10vw, 120px) 0' }}>
        <div className="container">
          <ScrollReveal>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: 48 }}>Trending right now</h2>
          </ScrollReveal>
          
          <div className="trending-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: 24 
          }}>
            {products.slice(0, 4).map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 100}>
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ height: 4, background: categories.find(c => c.id === product.category)?.color || 'var(--accent-primary)' }}></div>
                  <div style={{ height: 'clamp(210px, 45vw, 260px)', background: 'var(--bg-inner)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 18, marginBottom: 8 }}>{product.name}</h3>
                    <div className="font-mono" style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                      ₦{product.price.toLocaleString()}
                    </div>
                    <Link to={`/product/${product.id}`} className="btn-ghost" style={{ width: '100%' }}>View Details</Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Student Brand Manifesto Section (reserved to small link & ambassadors for identified users) */}
      {!userName && (
        <section style={{ padding: 'clamp(50px, 8vw, 90px) 0', position: 'relative' }}>
          <div className="container">
            <ScrollReveal>
              <div 
                onClick={() => navigate('/story')}
                className="glass-panel"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 28,
                  padding: 'clamp(32px, 5vw, 64px)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(124, 92, 255, 0.5)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.2), 0 0 35px rgba(124, 92, 255, 0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                  <span style={{ 
                    background: 'rgba(57, 217, 196, 0.12)', 
                    border: '1px solid rgba(57, 217, 196, 0.3)', 
                    color: 'var(--accent-primary)', 
                    fontSize: 11, 
                    fontWeight: 700, 
                    padding: '4px 12px', 
                    borderRadius: 100, 
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}>
                    Nigeria's No. 1 Student Gadget Brand
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>• Tap to experience full kinetic story</span>
                </div>

                <h2 style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: 'clamp(24px, 4vw, 48px)',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  marginBottom: 20,
                  maxWidth: 950
                }}>
                  Built for the creator editing between lectures, the gamer grinding after class, and the hustler running a business from a hostel room.
                </h2>

                <p style={{
                  fontSize: 'clamp(14px, 1.8vw, 18px)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  maxWidth: 750,
                  marginBottom: 28
                }}>
                  Real devices, real prices, real people. From Lagos to Ilorin, to Abia, to Abuja, round Nigeria. 
                  <strong style={{ 
                    background: 'linear-gradient(135deg, #C084FC 0%, #F472B6 50%, #38BDF8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: '#C084FC',
                    marginLeft: 8,
                    fontWeight: 700
                  }}>
                    Your Style. Our Tech. Infinite Possibilities.
                  </strong>
                </p>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'var(--accent-purple)',
                  border: 'none',
                  borderRadius: 100,
                  padding: '12px 24px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: '0 4px 14px rgba(124, 92, 255, 0.35)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}>
                  <span>Experience the Kinetic Story</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Community Section */}
      <section style={{ padding: 'clamp(60px, 8vw, 80px) 0', borderTop: '1px solid var(--border-subtle)' }}>
        <ScrollReveal>
          <div className="container" style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="heading-primary" style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginBottom: 16 }}>Loved by the Community.</h2>
            <p className="text-secondary" style={{ fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
              Built by students, for students. We're more than a tech brand • we're a movement across campuses.
            </p>
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={200}>
          <ImageGallery images={communityImages} />
        </ScrollReveal>
      </section>

      {/* Ambassadors Section */}
      <section style={{ padding: 'clamp(60px, 8vw, 80px) 0', background: 'var(--bg-inner)', borderTop: '1px solid var(--border-subtle)' }}>
        <ScrollReveal>
          <div className="container" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
            <div>
              <h2 className="heading-primary" style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginBottom: 16 }}>Our Ambassadors.</h2>
              <p className="text-secondary" style={{ fontSize: 18, maxWidth: 500 }}>
                The faces of REAVO. Representing our vision for accessible, premium technology in universities across Nigeria.
              </p>
            </div>
            <Link to="/ambassadors" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Meet the Team <ArrowRight size={18} />
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <ImageGallery images={ambassadorImages} isAmbassadors={true} />
        </ScrollReveal>
      </section>

      {/* Removed Big Logo Finale as requested */}

      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
        }
        .hero-visual {
          height: 600px;
        }
        .trending-grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .hero-visual {
            height: 350px;
          }
          .trending-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .landing-category-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
            overflow-x: visible !important;
            padding-bottom: 24px !important;
          }
          .landing-category-grid > div {
            min-width: 0 !important;
          }
          .landing-category-grid .glass-panel {
            padding: 24px 16px !important;
          }
        }
      `}</style>
    </main>
  );
}
