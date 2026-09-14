import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { products, categories } from '../data/products';
import DotNav from '../components/DotNav';
import SEO from '../components/SEO';
import PreorderHeroBanner from '../components/PreorderHeroBanner';

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
            <img src={src} alt={isAmbassadors ? `REAVO Campus Ambassador — Nigeria` : `REAVO community event — Nigerian student tech culture`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
      <DotNav total={images.length} activeIndex={activeIndex} onDotClick={scrollTo} />
    </div>
  );
}

export default function LandingPage() {
  const { userName } = useUser();
  const navigate = useNavigate();

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "REAVO",
    "url": "https://reavo-app.vercel.app",
    "logo": "https://reavo-app.vercel.app/logos/reavo_logo_black.png",
    "description": "Premium Campus Gadgets, Phones, Laptops & Electronics in Nigeria",
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
        title="REAVO — Campus Gadgets in Nigeria" 
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                {userName && (
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Welcome back, <strong style={{ color: 'var(--accent-purple)', textShadow: '0 0 10px rgba(124, 92, 255, 0.5)' }}>{userName}</strong>
                  </span>
                )}
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
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>EST. 2023 — NIGERIA</span>
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
                REAVO is where Nigeria's most ambitious young people find the tech that fits who they are — trusted by 30,000+ students, zero ads spent.
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
            <div className="hero-visual" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="glass-panel" style={{
                width: '80%',
                height: '80%',
                borderRadius: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-active)',
                overflow: 'hidden',
                padding: 'clamp(12px, 3vw, 24px)',
                background: 'var(--bg-inner)'
              }}>
                <img src={products[0].image} alt="Featured REAVO campus gadget — premium tech for Nigerian students" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 20 }} />
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

      {/* Community Section */}
      <section style={{ padding: 'clamp(60px, 8vw, 80px) 0', borderTop: '1px solid var(--border-subtle)' }}>
        <ScrollReveal>
          <div className="container" style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="heading-primary" style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginBottom: 16 }}>Loved by the Community.</h2>
            <p className="text-secondary" style={{ fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
              Built by students, for students. We're more than a tech brand — we're a movement across campuses.
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
