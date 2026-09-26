import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, ChevronRight, MessageCircle } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { products, categories } from '../data/products';
import DotNav from '../components/DotNav';
import SEO from '../components/SEO';
import PreorderHeroBanner from '../components/PreorderHeroBanner';
import PersonalizedGreeting from '../components/PersonalizedGreeting';
import ProductCard from '../components/ProductCard';

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
            <img 
              src={src} 
              alt={isAmbassadors ? `REAVO Campus Ambassador • Nigeria` : `REAVO community event • Nigerian student tech culture`} 
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        ))}
      </div>
      <DotNav total={images.length} activeIndex={activeIndex} onDotClick={scrollTo} />
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');

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

  // Filter trending products based on active student category tab
  let trendingProducts = products.slice(0, 4);
  if (activeCategoryTab !== 'all') {
    const matched = products.filter(p => p.category === activeCategoryTab);
    if (matched.length > 0) trendingProducts = matched.slice(0, 4);
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

      {/* 1. Hero Section: Clean, uncluttered, image and visual first */}
      <section style={{
        minHeight: '85vh',
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
        }} />
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '70vw',
          height: '70vw',
          background: 'radial-gradient(circle, rgba(57,217,196,0.12) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />

        <div className="container hero-grid" style={{ position: 'relative', zIndex: 10, alignItems: 'center' }}>
          <div>
            <ScrollReveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
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
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>EST. 2023 • NIGERIA</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 style={{ fontSize: 'clamp(42px, 6vw, 76px)', lineHeight: 1.1, marginBottom: 24, fontWeight: 700 }}>
                The right tech<br />
                for who <span style={{ color: 'var(--accent-primary)' }}>you're</span><br />
                becoming.
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <h2 style={{ fontSize: '24px', marginBottom: 16, fontWeight: 500, color: 'var(--text-primary)' }}>
                Your style, our <span style={{ color: 'var(--accent-purple, #7C5CFF)' }}>tech</span>.
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 480, marginBottom: 40, lineHeight: 1.6 }}>
                REAVO is where Nigeria's most ambitious young people find the tech that fits who they are. Trusted by 30,000+ students, zero ads spent.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link to="/shop" className="btn-primary" style={{ padding: '14px 28px', fontSize: 15 }}>
                  Shop all products <ArrowRight size={18} />
                </Link>
                <Link to="/story" className="btn-ghost" style={{ padding: '14px 24px', fontSize: 15 }}>
                  Our story
                </Link>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={400}>
            {/* Visual Hero Mockup */}
            <div className="hero-visual" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <div 
                className="ios26-card" 
                onClick={() => navigate('/product/macbook-pro-m4')}
                style={{
                  width: '100%',
                  maxWidth: 560,
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <img 
                  src={products[0].image} 
                  alt="Featured MacBook Pro M4 • REAVO campus tech" 
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>MacBook Pro M4</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Liquid Retina XDR • Campus Ready</div>
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

      {/* 2. Flagship Pre-Order Video Hero Showcase (Apple & Spotify Style) */}
      <PreorderHeroBanner />

      {/* 3. Student Category Showcase (Creators, Gamers, Students, Entrepreneurs...) */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) 0', background: 'var(--bg-void)', position: 'relative' }}>
        <div className="container">
          <div className="landing-category-grid" style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 24, scrollbarWidth: 'none' }}>
            {categories.map((cat, i) => (
              <ScrollReveal key={cat.id} delay={i * 80}>
                <div 
                  className="glass-panel glass-hover" 
                  style={{ 
                    minWidth: 190, 
                    padding: '28px 24px', 
                    borderRadius: 22,
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
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    background: cat.color, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: `0 0 24px ${cat.color}35`
                  }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-void)' }} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.label}</h3>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Trending Products Section: Image & product first */}
      <section style={{ padding: 'clamp(40px, 6vw, 80px) 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <ScrollReveal>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700 }}>Trending right now</h2>
            </ScrollReveal>

            {/* Persona filter tabs: clean typography, no emojis */}
            <div style={{ display: 'flex', gap: 6, background: 'var(--bg-inner)', padding: 4, borderRadius: 100, border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'creators', label: 'Creators' },
                { id: 'gamers', label: 'Gamers' },
                { id: 'students', label: 'Students' },
                { id: 'biz', label: 'Entrepreneurs' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryTab(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 100,
                    background: activeCategoryTab === tab.id ? 'var(--text-primary)' : 'transparent',
                    color: activeCategoryTab === tab.id ? 'var(--bg-void)' : 'var(--text-secondary)',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: activeCategoryTab === tab.id ? 700 : 500,
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
              <span>Explore all products</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Meet the Community Section (Restored: Visual-first social proof) */}
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

      {/* 6. Our Ambassadors Section (Restored: Real faces of REAVO across universities) */}
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

      {/* 7. Explore REAVO Links (Clean portal linking to all other pages without clutter) */}
      <section style={{ padding: 'clamp(40px, 6vw, 60px) 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20
          }}>
            <div 
              onClick={() => navigate('/story')}
              className="glass-panel glass-hover"
              style={{
                padding: '24px 28px',
                borderRadius: 20,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>Our Story</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>The manifesto behind Nigeria's student tech brand.</p>
              </div>
              <ChevronRight size={18} color="var(--accent-purple, #7C5CFF)" />
            </div>

            <div 
              onClick={() => navigate('/partnerships')}
              className="glass-panel glass-hover"
              style={{
                padding: '24px 28px',
                borderRadius: 20,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>Partnerships</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>School labs, faculty packages & bulk orders.</p>
              </div>
              <ChevronRight size={18} color="var(--accent-primary)" />
            </div>

            <div 
              onClick={openWhatsAppHelp}
              className="glass-panel glass-hover"
              style={{
                padding: '24px 28px',
                borderRadius: 20,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>Student Desk</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Need advice? Chat directly on WhatsApp.</p>
              </div>
              <MessageCircle size={18} color="#25D366" />
            </div>
          </div>
        </div>
      </section>

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
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
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
