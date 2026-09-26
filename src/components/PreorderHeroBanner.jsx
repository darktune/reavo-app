import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Shield, Play, Pause } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';

const PREORDER_DROPS = [
  {
    id: 'iphone-18-pro',
    badge: 'APPLE FLAGSHIP',
    category: 'TITANIUM PRO',
    title: 'iPhone 18 Pro & Pro Max',
    tagline: 'Pro beyond words.',
    subTagline: 'Sculpted Grade 5 Titanium • Next-Gen 2nm A20 Pro',
    accentColor: '#39D9C4', // REAVO Electric Teal
    views: [
      {
        id: 'hero',
        label: 'Standstill Hero',
        image: '/images/preorders/iphone-18-pro-hero.jpg',
        badge: 'Official Standstill View',
        caption: 'Grade 5 sculpted titanium frame with refined micro-blasted textures'
      },
      {
        id: 'finishes',
        label: 'Finishes',
        image: '/images/preorders/iphone-18-pro-colors.jpg',
        badge: 'All 4 Finishes',
        caption: 'Burgundy, Glacier, Silver Titanium and Black Titanium'
      },
      {
        id: 'chip',
        label: 'Architecture',
        image: '/images/preorders/iphone-18-pro-chip.jpg',
        badge: 'A20 Pro Silicon',
        caption: '2nm process node with integrated vapor chamber sustained cooling'
      }
    ],
    specs: [
      { label: 'SILICON', value: '2nm A20 Pro Silicon' },
      { label: 'APERTURE', value: 'Variable ƒ/1.48 to ƒ/4.0' },
      { label: 'THERMAL', value: 'Vapor Chamber Cooling' },
      { label: 'BATTERY', value: 'All-Day Pro+ Leap' }
    ],
    storageOptions: ['256GB', '512GB', '1TB', '2TB'],
    colorOptions: [
      { name: 'Burgundy', hex: '#68202F' },
      { name: 'Glacier', hex: '#CAD8DF' },
      { name: 'Silver Titanium', hex: '#E4E5E8' },
      { name: 'Black Titanium', hex: '#262729' }
    ]
  },
  {
    id: 'iphone-duo',
    badge: 'FIRST FOLDABLE',
    category: 'FOLDABLE REVOLUTION',
    title: 'iPhone Duo',
    tagline: 'Two screens. Infinite flow.',
    subTagline: '7.6" Folding Nano-Texture Canvas • Polished Mirror Titanium',
    accentColor: '#7C5CFF', // REAVO Purple
    views: [
      {
        id: 'hero',
        label: 'Unfolded Canvas',
        image: '/images/preorders/iphone-duo-hero.jpg',
        badge: 'Unfolded 7.6" Canvas',
        caption: 'Seamless nano-texture folding OLED with zero-crease titanium hinge'
      },
      {
        id: 'finishes',
        label: 'Fold Finishes',
        image: '/images/preorders/iphone-duo-colors.jpg',
        badge: 'Folded Profile',
        caption: 'Precision articulation with polished mirror-finish titanium'
      },
      {
        id: 'display',
        label: 'Optics',
        image: '/images/preorders/iphone-duo-display.jpg',
        badge: 'Nano-Texture OLED',
        caption: 'Anti-reflective nano-coating with dual-battery split multitasking'
      }
    ],
    specs: [
      { label: 'INNER CANVAS', value: '7.6" Nano-Texture OLED' },
      { label: 'COVER DISPLAY', value: '5.4" Super Retina XDR' },
      { label: 'HINGE', value: 'Zero-Crease Titanium' },
      { label: 'BATTERY', value: 'Dual-Cell Architecture' }
    ],
    storageOptions: ['512GB', '1TB'],
    colorOptions: [
      { name: 'Star White', hex: '#F0EFEA' },
      { name: 'Night Sky', hex: '#1C1E24' }
    ]
  },
  {
    id: 'iphone-air-2',
    badge: '5.6MM PROFILE',
    category: 'AEROSPACE MONOCOQUE',
    title: 'iPhone Air 2',
    tagline: 'Impossibly thin. 5.6mm.',
    subTagline: 'The lightest iPhone in history • 165g Ultralight Monocoque',
    accentColor: '#3D8BFF', // REAVO Blue
    views: [
      {
        id: 'hero',
        label: '5.6mm Profile',
        image: '/images/preorders/iphone-air-hero.jpg',
        badge: 'Aerospace Monocoque',
        caption: 'Engineered at 5.6mm thin with single-piece titanium monocoque'
      },
      {
        id: 'finishes',
        label: 'Finishes',
        image: '/images/preorders/iphone-air-colors.jpg',
        badge: '4 Color Lineup',
        caption: 'Sky Blue, Light Gold, Cloud White and Space Black'
      },
      {
        id: 'profile',
        label: 'Ergonomics',
        image: '/images/preorders/iphone-air-profile.jpg',
        badge: '165g Ultralight',
        caption: 'Ceramic Shield 2 with flush 48MP Fusion plateau camera'
      }
    ],
    specs: [
      { label: 'THICKNESS', value: '5.6mm Thinnest Ever' },
      { label: 'WEIGHT', value: '165g Ultralight' },
      { label: 'CAMERA', value: 'Flush 48MP Fusion' },
      { label: 'CHASSIS', value: 'Grade 5 Titanium Monocoque' }
    ],
    storageOptions: ['128GB', '256GB', '512GB'],
    colorOptions: [
      { name: 'Sky Blue', hex: '#87A9CB' },
      { name: 'Light Gold', hex: '#EBD8B8' },
      { name: 'Cloud White', hex: '#F3F4F6' },
      { name: 'Space Black', hex: '#2B2D31' }
    ]
  },
  {
    id: 'watch-ultra-3',
    badge: 'EXTREME WEARABLE',
    category: 'BLACK TITANIUM FLAGSHIP',
    title: 'Apple Watch Ultra 3',
    tagline: 'Peak endurance.',
    subTagline: 'Satin Black Titanium • 3,500 Nits Micro-LED',
    accentColor: '#39D9C4', // REAVO Electric Teal
    views: [
      {
        id: 'hero',
        label: 'Satin Black Case',
        image: '/images/preorders/watch-ultra2-black.jpg',
        badge: 'Black DLC Titanium',
        caption: 'Diamond-like carbon PVD coating with 3,500-nit micro-LED display'
      },
      {
        id: 'finishes',
        label: 'Bands',
        image: '/images/preorders/watch-s10-lineup.jpg',
        badge: 'Titanium Milanese',
        caption: 'Custom woven titanium loop engineered for campus to expedition'
      },
      {
        id: 'display',
        label: 'Satellite',
        image: '/images/preorders/watch-s10-hero.jpg',
        badge: 'Satellite SOS & GPS',
        caption: 'Emergency two-way satellite mesh and precision dual-frequency GPS'
      }
    ],
    specs: [
      { label: 'DISPLAY', value: '3,500 nits Micro-LED' },
      { label: 'SAFETY', value: 'Satellite Two-Way SOS' },
      { label: 'FINISH', value: 'DLC Satin Black Titanium' },
      { label: 'BATTERY', value: 'Up to 72 Hours' }
    ],
    storageOptions: ['49mm GPS + Cellular'],
    colorOptions: [
      { name: 'Satin Black Titanium', hex: '#1B1C1E' },
      { name: 'Natural Titanium', hex: '#918F89' }
    ]
  },
  {
    id: 'airpods-max-2',
    badge: 'STUDIO ACOUSTICS',
    category: 'LOSSLESS AUDIO',
    title: 'AirPods Max 2 (USB-C)',
    tagline: 'Pure acoustic immersion.',
    subTagline: 'Lossless Studio Audio Over USB-C • Apple H2 Silicon',
    accentColor: '#7C5CFF', // REAVO Purple
    views: [
      {
        id: 'hero',
        label: 'AirPods Max USB-C',
        image: '/images/preorders/airpods-max-usbc.jpg',
        badge: 'Lossless USB-C',
        caption: 'Direct bit-perfect lossless studio audio transmission via USB-C'
      },
      {
        id: 'finishes',
        label: 'Finishes',
        image: '/images/preorders/airpods-4-hero.jpg',
        badge: 'Fresh Color Palette',
        caption: 'Midnight, Starlight, Sky Blue, Purple and Orange editions'
      },
      {
        id: 'tech',
        label: 'Canopy',
        image: '/images/preorders/airpods-4-case.jpg',
        badge: 'Apple H2 Silicon',
        caption: '2x enhanced Active Noise Cancellation and personalized spatial audio'
      }
    ],
    specs: [
      { label: 'AUDIO', value: 'Lossless Studio USB-C' },
      { label: 'SILICON', value: 'Apple H2 Architecture' },
      { label: 'NOISE CONTROL', value: '2x Active Noise Cancellation' },
      { label: 'BATTERY', value: '24hr Studio Playback' }
    ],
    storageOptions: ['AirPods Max 2', 'AirPods 4 with ANC'],
    colorOptions: [
      { name: 'Midnight', hex: '#232A35' },
      { name: 'Starlight', hex: '#EBE6DC' },
      { name: 'Sky Blue', hex: '#7799B8' },
      { name: 'Purple', hex: '#877B96' },
      { name: 'Orange', hex: '#EA7557' }
    ]
  }
];

const VIEW_DURATION_MS = 4500; // 4.5 seconds per view

export default function PreorderHeroBanner() {
  const { isAuthenticated, user } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeViewIndex, setActiveViewIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReserved, setHasReserved] = useState(false);
  const [hoveredColor, setHoveredColor] = useState(null);

  const currentDrop = PREORDER_DROPS[activeSlide];
  const currentView = currentDrop.views[activeViewIndex] || currentDrop.views[0];

  // Check existing reservation status
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('reavo_preorders') || '[]');
      const match = saved.find(p => p.productId === currentDrop.id);
      setHasReserved(Boolean(match));
    } catch {
      setHasReserved(false);
    }
  }, [activeSlide, currentDrop.id, user]);

  // Automatic multi-view Apple story progression
  useEffect(() => {
    if (isPaused) return;

    const intervalStep = 50; // update every 50ms for smooth progress bar
    const stepIncrement = (intervalStep / VIEW_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev + stepIncrement >= 100) {
          // Advance to next view or next product
          if (activeViewIndex < currentDrop.views.length - 1) {
            setActiveViewIndex(idx => idx + 1);
          } else {
            setActiveViewIndex(0);
            setActiveSlide(s => (s + 1) % PREORDER_DROPS.length);
          }
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPaused, activeViewIndex, currentDrop.views.length]);

  // When changing slide manually, reset view and progress
  const handleSelectSlide = (idx) => {
    setActiveSlide(idx);
    setActiveViewIndex(0);
    setProgress(0);
  };

  // When selecting an illustration view manually
  const handleSelectView = (vIndex) => {
    setActiveViewIndex(vIndex);
    setProgress(0);
  };

  // Handle pending preorder reservations after user authenticates
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      try {
        const pending = sessionStorage.getItem('reavo_pending_preorder');
        if (pending) {
          sessionStorage.removeItem('reavo_pending_preorder');
          const data = JSON.parse(pending);
          const drop = PREORDER_DROPS.find(d => d.id === data.dropId) || PREORDER_DROPS[0];
          autoReserveDrop(drop, data.storage || drop.storageOptions[0], data.color || drop.colorOptions[0].name);
        }
      } catch (err) {
        console.error('Pending preorder parsing error:', err);
      }
    }
  }, [isAuthenticated, user]);

  const autoReserveDrop = async (drop, storage, color) => {
    if (!drop || !user) return;
    setIsSubmitting(true);

    const queueNumber = Math.floor(12 + Math.random() * 24);
    const newPreorder = {
      id: 'PRE-' + Math.floor(100000 + Math.random() * 900000),
      productId: drop.id,
      productName: drop.title,
      storage: storage,
      color: color,
      customerEmail: user.email,
      customerName: user.user_metadata?.full_name || user.name || 'REAVO VIP Member',
      customerPhone: user.user_metadata?.whatsapp || user.phone || '09158554158',
      createdAt: new Date().toISOString(),
      queuePosition: queueNumber
    };

    try {
      const existing = JSON.parse(localStorage.getItem('reavo_preorders') || '[]');
      const filtered = existing.filter(p => p.productId !== drop.id);
      localStorage.setItem('reavo_preorders', JSON.stringify([newPreorder, ...filtered]));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }

    try {
      await supabase.from('preorders').insert([{
        product_name: `${drop.title} (${storage} • ${color})`,
        customer_email: user.email,
        customer_name: user.user_metadata?.full_name || user.name || 'VIP Member',
        customer_phone: user.user_metadata?.whatsapp || user.phone || '09158554158',
        notes: `REAVO Priority Wave 1 Nigeria Allocation. Queue #${queueNumber}.`
      }]);
    } catch (err) {
      console.log('Supabase preorder sync:', err?.message);
    }

    setIsSubmitting(false);
    setHasReserved(true);
    setSelectedProduct(null);

    toast.success(`Priority Spot Secured! Wave 1 Queue #${queueNumber}`, {
      duration: 6500,
      description: `${drop.title} (${storage} • ${color}) is locked to your REAVO account. WhatsApp notification will be sent when shipments touch down in Lagos.`
    });
  };

  const handleOpenPreorder = (drop) => {
    if (!isAuthenticated) {
      try {
        sessionStorage.setItem('reavo_pending_preorder', JSON.stringify({
          dropId: drop.id,
          storage: drop.storageOptions[0],
          color: drop.colorOptions[0].name
        }));
      } catch (e) {
        console.error(e);
      }

      toast.info('Sign in to lock your priority Nigerian preorder waitlist allocation.', {
        icon: '🔐'
      });
      setIsAuthModalOpen(true);
      return;
    }

    setSelectedProduct(drop);
    setSelectedStorage(drop.storageOptions[0]);
    setSelectedColor(drop.colorOptions[0].name);
  };

  const handleConfirmPreorder = async () => {
    if (!selectedProduct) return;
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    await autoReserveDrop(selectedProduct, selectedStorage, selectedColor);
  };

  return (
    <section style={{
      position: 'relative',
      padding: '44px 0 60px 0',
      background: 'var(--bg-void)',
      borderBottom: '1px solid var(--border-subtle)',
      overflow: 'hidden'
    }}>
      {/* Dynamic Ambient Glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '15%',
        width: '55vw',
        height: '55vw',
        background: `radial-gradient(circle, ${currentDrop.accentColor}15 0%, transparent 65%)`,
        filter: 'blur(90px)',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'background 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Top Ticker Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="ios26-pill" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)'
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                boxShadow: '0 0 10px var(--accent-primary)',
                display: 'inline-block'
              }} />
              <span className="font-mono" style={{
                fontSize: 11,
                color: 'var(--text-primary)',
                letterSpacing: '0.12em',
                fontWeight: 600
              }}>
                OFFICIAL 2026 APPLE RELEASES • WAVE 1 ALLOCATION
              </span>
            </div>

            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Nigeria Early Access • Lagos & Campus Direct Delivery
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              REAVO VIP DESK: +234 915 855 4158
            </span>
          </div>
        </div>

        {/* Master Showcase Card with iOS 26 Glassmorphism */}
        <div 
          className="ios26-card" 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            minHeight: 540
          }}
        >
          {/* Left Column: Authentic Apple Minimalist Marketing & Specs */}
          <div style={{
            padding: 'clamp(28px, 4vw, 44px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 3,
            borderRight: '1px solid var(--border-subtle)',
            background: 'var(--glass-bg)'
          }}>
            <div>
              {/* Category & Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <span className="font-mono" style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--accent-primary)',
                  letterSpacing: '0.1em'
                }}>
                  {currentDrop.category}
                </span>
                <span style={{ color: 'var(--border-active)' }}>•</span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.05em'
                }}>
                  {currentDrop.badge}
                </span>
              </div>

              {/* Title */}
              <h2 style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: 'clamp(28px, 3.6vw, 42px)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.04em',
                margin: '0 0 10px 0',
                color: 'var(--text-primary)'
              }}>
                {currentDrop.title}
              </h2>

              {/* Apple-Level Poetic Punchline */}
              <div style={{
                fontSize: 'clamp(20px, 2.2vw, 24px)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: '0 0 8px 0'
              }}>
                {currentDrop.tagline}
              </div>

              {/* Sub-Tagline */}
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
                margin: '0 0 24px 0',
                fontWeight: 400
              }}>
                {currentDrop.subTagline}
              </p>

              {/* Technical Specifications Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10,
                marginBottom: 24
              }}>
                {currentDrop.specs.map((spec, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 14,
                    padding: '10px 14px',
                    transition: 'border-color 0.2s ease'
                  }}>
                    <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: 2 }}>
                      {spec.label}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Color Swatches */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
                    FINISHES AVAILABLE IN NIGERIA
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
                    {hoveredColor || currentDrop.colorOptions[0].name}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  {currentDrop.colorOptions.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseEnter={() => setHoveredColor(color.name)}
                      onMouseLeave={() => setHoveredColor(null)}
                      onClick={() => {
                        setHoveredColor(color.name);
                        handleSelectView(1); // jump to finishes illustration view
                      }}
                      title={color.name}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: color.hex,
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: hoveredColor === color.name ? 'scale(1.2)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs & Trust Badges */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
                <button
                  type="button"
                  onClick={() => handleOpenPreorder(currentDrop)}
                  className="ios26-pill"
                  style={{
                    padding: '14px 32px',
                    borderRadius: 100,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: 'var(--accent-primary)',
                    color: '#0A0A0C',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.7), 0 8px 24px rgba(13, 148, 136, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  {hasReserved ? 'Priority Queue Spot Secured ✓' : 'Reserve Wave 1 Priority'}
                </button>

                {/* Auto-Slide Pause/Resume Pill */}
                <button
                  type="button"
                  onClick={() => setIsPaused(p => !p)}
                  className="ios26-pill"
                  style={{
                    padding: '12px 18px',
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                  <span>{isPaused ? 'Resume Tour' : 'Auto Tour Active'}</span>
                </button>
              </div>

              {/* Pricing Notice Note */}
              <div style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                marginBottom: 8,
                lineHeight: 1.4
              }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Note:</span> Estimated US launch conversion • Nigerian retail pricing will be finalized upon Lagos warehouse arrival.
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: 'var(--text-secondary)'
              }}>
                <Shield size={14} color="var(--accent-primary)" />
                <span>Zero advance deposit needed • 100% official 1-year warranty across Nigeria</span>
              </div>
            </div>

          </div>

          {/* Right Column: Multi-View Illustration Stage with Segmented Story Timeline */}
          <div style={{
            position: 'relative',
            minHeight: 460,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 'clamp(20px, 3vw, 36px)',
            background: 'var(--bg-inner)'
          }}>
            
            {/* Story Timeline Bar (Top) */}
            <div style={{
              display: 'flex',
              gap: 8,
              width: '100%',
              zIndex: 10,
              marginBottom: 16
            }}>
              {currentDrop.views.map((v, idx) => {
                const isViewActive = activeViewIndex === idx;
                const isViewCompleted = activeViewIndex > idx;
                const fillWidth = isViewCompleted ? '100%' : isViewActive ? `${progress}%` : '0%';

                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectView(idx)}
                    style={{
                      flex: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}
                  >
                    {/* Segment Progress Bar */}
                    <div style={{
                      height: 3,
                      borderRadius: 100,
                      background: 'var(--border-subtle)',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        height: '100%',
                        width: fillWidth,
                        background: 'var(--accent-primary)',
                        transition: isViewActive ? 'none' : 'width 0.2s ease'
                      }} />
                    </div>

                    {/* Segment Label */}
                    <span className="font-mono" style={{
                      fontSize: 10,
                      color: isViewActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: isViewActive ? 700 : 500,
                      letterSpacing: '0.05em'
                    }}>
                      {v.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Illustration Canvas Area */}
            <div style={{
              position: 'relative',
              flex: 1,
              width: '100%',
              minHeight: 340,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                key={`${currentDrop.id}-${currentView.id}`}
                src={currentView.image}
                alt={`${currentDrop.title} • ${currentView.label}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '380px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 16px 36px rgba(0,0,0,0.25))',
                  animation: 'fadeInScale 0.4s ease-out'
                }}
              />
            </div>

            {/* Bottom Caption & View Tag */}
            <div style={{
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="font-mono" style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  letterSpacing: '0.08em',
                  background: 'var(--glass-bg)',
                  padding: '4px 10px',
                  borderRadius: 100,
                  border: '1px solid var(--border-subtle)'
                }}>
                  {currentView.badge}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {currentView.caption}
                </span>
              </div>

              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                Slide {activeViewIndex + 1} of {currentDrop.views.length}
              </span>
            </div>

          </div>

        </div>

        {/* Bottom Carousel: 5 Official 2026 Drops */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 12,
          marginTop: 20
        }}>
          {PREORDER_DROPS.map((drop, idx) => {
            const isActive = activeSlide === idx;
            return (
              <div
                key={drop.id}
                onClick={() => handleSelectSlide(idx)}
                className="ios26-card"
                style={{
                  padding: '12px 14px',
                  cursor: 'pointer',
                  borderRadius: 18,
                  background: isActive ? 'var(--glass-bg)' : 'var(--bg-inner)',
                  border: isActive ? `1.5px solid var(--accent-primary)` : '1px solid var(--border-subtle)',
                  boxShadow: isActive ? '0 8px 24px rgba(13, 148, 136, 0.15)' : 'var(--shadow-card)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: '#000',
                  flexShrink: 0,
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 4
                }}>
                  <img
                    src={drop.views[0].image}
                    alt={drop.title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-mono" style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}>
                    {drop.badge}
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {drop.title.split('&')[0].trim()}
                  </div>
                </div>

                {isActive && (
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    boxShadow: '0 0 8px var(--accent-primary)'
                  }} />
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* REAVO 1-Click Priority Configuration Modal */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(12px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div className="ios26-card" style={{
            width: '100%',
            maxWidth: 480,
            background: 'var(--bg-card)',
            borderRadius: 24,
            padding: 32,
            border: '1px solid var(--border-active)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span className="font-mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.08em' }}>
                  WAVE 1 NIGERIA ALLOCATION
                </span>
                <h3 style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: 22,
                  fontWeight: 800,
                  margin: '4px 0 0 0',
                  color: 'var(--text-primary)'
                }}>
                  Reserve {selectedProduct.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 20,
                  padding: 4
                }}
              >
                ✕
              </button>
            </div>

            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: 'var(--text-secondary)',
              marginBottom: 16,
              lineHeight: 1.55
            }}>
              Lock in your day-one priority queue. Zero deposit required. We will message your verified WhatsApp when shipments touch down in Lagos.
            </p>

            <div style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: 'var(--bg-inner)',
              border: '1px solid var(--border-subtle)',
              fontSize: 11,
              color: 'var(--text-secondary)',
              marginBottom: 20
            }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Note on Pricing:</span> Stated retail is estimated US conversion. Final Nigerian Naira pricing will be confirmed upon shipment arrival.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Storage Selection */}
              <div>
                <label style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: 8
                }}>
                  Select Storage / Edition
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedProduct.storageOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedStorage(opt)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        border: '1px solid',
                        borderColor: selectedStorage === opt ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        background: selectedStorage === opt ? 'rgba(13, 148, 136, 0.15)' : 'var(--bg-inner)',
                        color: selectedStorage === opt ? 'var(--accent-primary)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: 8
                }}>
                  Select Official Finish ({selectedColor})
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedProduct.colorOptions.map(opt => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setSelectedColor(opt.name)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        border: '1px solid',
                        borderColor: selectedColor === opt.name ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        background: selectedColor === opt.name ? 'rgba(13, 148, 136, 0.15)' : 'var(--bg-inner)',
                        color: selectedColor === opt.name ? 'var(--accent-primary)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: opt.hex,
                        border: '1px solid rgba(255,255,255,0.2)'
                      }} />
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Confirmation Info */}
              <div style={{
                background: 'var(--bg-inner)',
                padding: 14,
                borderRadius: 14,
                border: '1px solid var(--border-subtle)',
                fontSize: 12,
                color: 'var(--text-secondary)',
                lineHeight: 1.6
              }}>
                <div><strong>VIP Member:</strong> {user?.user_metadata?.full_name || user?.name || user?.email}</div>
                <div><strong>Delivery Target:</strong> Verified Campus / Residence in Nigeria</div>
                <div><strong>REAVO Hotline:</strong> 09158554158</div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmPreorder}
                  className="ios26-pill"
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    fontWeight: 700,
                    fontSize: 14,
                    background: 'var(--accent-primary)',
                    color: '#0A0A0C',
                    border: '1px solid rgba(255,255,255,0.6)',
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Securing Spot...' : 'Confirm 1-Click Priority Queue'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="ios26-pill"
                  style={{
                    padding: '14px 20px',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal Trigger for Unauthenticated Guests */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </section>
  );
}
