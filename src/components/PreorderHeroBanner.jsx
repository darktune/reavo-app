import { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Shield, ArrowRight, Layers, Eye, Zap, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';

const PREORDER_DROPS = [
  {
    id: 'iphone-16-pro',
    badge: 'APPLE FLAGSHIP',
    category: 'TITANIUM SERIES',
    title: 'iPhone 16 Pro & Pro Max',
    tagline: 'Forged in Grade 5 Titanium. Driven by A18 Pro silicon and tactile Camera Control.',
    description: 'The most powerful iPhone ever built. Featuring larger 6.3" and 6.9" Super Retina XDR displays with the thinnest borders on any Apple product, 4K 120 fps Dolby Vision video, and next-generation A18 Pro performance.',
    heroImage: '/images/preorders/iphone-16-pro-hero.jpg',
    galleryImage: '/images/preorders/iphone-16-pro-finishes.jpg',
    galleryLabel: 'All 4 Titanium Finishes',
    heroLabel: 'Hero Desert Titanium',
    accentColor: '#39D9C4', // REAVO Electric Teal
    highlightHex: '#C5A98E', // Desert Titanium
    priceEst: 'From ₦1,850,000',
    specs: [
      { label: 'CHIP', value: 'A18 Pro (2nd-Gen 3nm)' },
      { label: 'CONTROL', value: 'Tactile Camera Control' },
      { label: 'CAMERAS', value: '48MP Fusion • 5x Tele' },
      { label: 'VIDEO', value: '4K 120 fps Dolby Vision' }
    ],
    storageOptions: ['128GB', '256GB', '512GB', '1TB'],
    colorOptions: [
      { name: 'Desert Titanium', hex: '#C5A98E' },
      { name: 'Natural Titanium', hex: '#9E988F' },
      { name: 'White Titanium', hex: '#EDECE8' },
      { name: 'Black Titanium', hex: '#343538' }
    ]
  },
  {
    id: 'iphone-16',
    badge: 'NEW GENERATION',
    category: 'COLOR-INFUSED GLASS',
    title: 'iPhone 16 & iPhone 16 Plus',
    tagline: 'Vibrant color-infused glass with A18 chip, Camera Control, and 48MP 2-in-1 Fusion.',
    description: 'Built from the ground up for Apple Intelligence and creative hustle. Featuring aerospace-grade aluminum, the customizable Action button, tactile Camera Control, and macro photography in five striking finishes.',
    heroImage: '/images/preorders/iphone-16-hero.jpg',
    galleryImage: '/images/preorders/iphone-16-finishes.jpg',
    galleryLabel: '5 Color Lineup',
    heroLabel: 'Ultramarine & Teal Hero',
    accentColor: '#3D8BFF',
    highlightHex: '#4A6FA5',
    priceEst: 'From ₦1,380,000',
    specs: [
      { label: 'CHIP', value: 'A18 Silicon (5-Core GPU)' },
      { label: 'BUTTON', value: 'Camera Control + Action' },
      { label: 'CAMERA', value: '48MP Fusion 2-in-1' },
      { label: 'GLASS', value: 'Latest Ceramic Shield' }
    ],
    storageOptions: ['128GB', '256GB', '512GB'],
    colorOptions: [
      { name: 'Ultramarine', hex: '#4A6FA5' },
      { name: 'Teal', hex: '#82B6B0' },
      { name: 'Pink', hex: '#EBB4C3' },
      { name: 'White', hex: '#F5F5F7' },
      { name: 'Black', hex: '#323438' }
    ]
  },
  {
    id: 'watch-series-10',
    badge: '10TH ANNIVERSARY',
    category: 'THINNEST APPLE WATCH EVER',
    title: 'Apple Watch Series 10',
    tagline: 'Nearly 10% thinner than Series 9, with Apple’s largest and brightest wide-angle OLED.',
    description: 'A landmark milestone. At just 9.7mm thin, Series 10 features a breakthrough wide-angle OLED that offers up to 40% brighter viewing off-axis, high-gloss Jet Black polished aluminum, and 80% fast-charging in only 30 minutes.',
    heroImage: '/images/preorders/watch-s10-hero.jpg',
    galleryImage: '/images/preorders/watch-s10-lineup.jpg',
    galleryLabel: 'Finishes Lineup',
    heroLabel: 'Jet Black Polished Finish',
    accentColor: '#7C5CFF', // REAVO Purple
    highlightHex: '#121316',
    priceEst: 'From ₦640,000',
    specs: [
      { label: 'PROFILE', value: '9.7mm Thinnest Ever' },
      { label: 'DISPLAY', value: 'Wide-Angle OLED' },
      { label: 'CHARGING', value: '80% in 30 Minutes' },
      { label: 'SENSORS', value: 'Depth Gauge & Water Temp' }
    ],
    storageOptions: ['42mm GPS', '46mm GPS', '42mm GPS + Cellular', '46mm GPS + Cellular'],
    colorOptions: [
      { name: 'Jet Black (Polished)', hex: '#111215' },
      { name: 'Rose Gold', hex: '#ECC5B8' },
      { name: 'Silver Aluminum', hex: '#E3E4E6' },
      { name: 'Slate Titanium', hex: '#484A4E' }
    ]
  },
  {
    id: 'watch-ultra-2-black',
    badge: 'FLAGSHIP WEARABLE',
    category: 'BLACK TITANIUM EDITION',
    title: 'Apple Watch Ultra 2 (Black Titanium)',
    tagline: 'The ultimate sports and adventure watch, now in stunning satin-black Grade 5 titanium.',
    description: 'Engineered for extreme endurance and executive presence. Coated with diamond-like carbon PVD for premier scratch resistance, paired with the all-new Titanium Milanese Loop band and 3,000 nits extreme brightness.',
    heroImage: '/images/preorders/watch-ultra2-black.jpg',
    galleryImage: '/images/preorders/watch-ultra2-black.jpg',
    galleryLabel: 'Titanium Milanese Loop',
    heroLabel: 'Satin Black Case',
    accentColor: '#39D9C4', // REAVO Electric Teal
    highlightHex: '#222327',
    priceEst: 'From ₦1,280,000',
    specs: [
      { label: 'FINISH', value: 'Diamond-Like Carbon PVD' },
      { label: 'BAND', value: 'Titanium Milanese Loop' },
      { label: 'BRIGHTNESS', value: '3,000 nits Retina' },
      { label: 'BATTERY', value: 'Up to 72 Hours' }
    ],
    storageOptions: ['49mm GPS + Cellular'],
    colorOptions: [
      { name: 'Satin Black Titanium', hex: '#1C1D20' },
      { name: 'Natural Titanium', hex: '#8E8D88' }
    ]
  },
  {
    id: 'airpods-4-max',
    badge: 'STUDIO ACOUSTICS',
    category: 'NEXT-GEN AUDIO',
    title: 'AirPods 4 ANC & AirPods Max (USB-C)',
    tagline: 'Groundbreaking open-ear ANC, H2 audio silicon, and refreshed AirPods Max in USB-C.',
    description: 'For the first time, Active Noise Cancellation comes to an open-ear fit in AirPods 4 with Adaptive Audio and Conversational Awareness. Alongside updated AirPods Max offering high-fidelity lossless USB-C audio in five fresh colors.',
    heroImage: '/images/preorders/airpods-4-hero.jpg',
    galleryImage: '/images/preorders/airpods-max-usbc.jpg',
    galleryLabel: 'AirPods Max 5 Colors',
    heroLabel: 'AirPods 4 ANC + Case',
    accentColor: '#7C5CFF', // REAVO Purple
    highlightHex: '#7C5CFF',
    priceEst: '₦290K (AirPods 4) • ₦860K (Max)',
    specs: [
      { label: 'NOISE CONTROL', value: 'Open-Ear ANC + Transparency' },
      { label: 'SILICON', value: 'Apple H2 Headphone Chip' },
      { label: 'CASE', value: 'Smallest Case with Speaker' },
      { label: 'MAX AUDIO', value: 'Lossless Audio via USB-C' }
    ],
    storageOptions: ['AirPods 4 (Standard)', 'AirPods 4 (with ANC)', 'AirPods Max (USB-C)'],
    colorOptions: [
      { name: 'White (AirPods 4)', hex: '#FFFFFF' },
      { name: 'Midnight (Max)', hex: '#232A35' },
      { name: 'Starlight (Max)', hex: '#EBE6DC' },
      { name: 'Sky Blue (Max)', hex: '#7799B8' },
      { name: 'Purple (Max)', hex: '#877B96' },
      { name: 'Orange (Max)', hex: '#EA7557' }
    ]
  }
];

export default function PreorderHeroBanner() {
  const { isAuthenticated, user } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeView, setActiveView] = useState('hero'); // 'hero' or 'gallery'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReserved, setHasReserved] = useState(false);
  const [hoveredColor, setHoveredColor] = useState(null);

  const currentDrop = PREORDER_DROPS[activeSlide];

  // Reset image view and check reservation status on slide switch
  useEffect(() => {
    setActiveView('hero');
    setHoveredColor(null);
    try {
      const saved = JSON.parse(localStorage.getItem('reavo_preorders') || '[]');
      const match = saved.find(p => p.productId === currentDrop.id);
      setHasReserved(Boolean(match));
    } catch {
      setHasReserved(false);
    }
  }, [activeSlide, currentDrop.id, user]);

  // Handle pending preorders after authentication
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
        console.error('Pending preorder error:', err);
      }
    }
  }, [isAuthenticated, user]);

  const autoReserveDrop = async (drop, storage, color) => {
    if (!drop || !user) return;
    setIsSubmitting(true);

    const queueNumber = Math.floor(14 + Math.random() * 28);
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
        notes: `REAVO Priority Wave 1 Nigeria Allocation. Spot #${queueNumber}. Estimated Retail: ${drop.priceEst}`
      }]);
    } catch (err) {
      console.log('Supabase preorder sync:', err?.message);
    }

    setIsSubmitting(false);
    setHasReserved(true);
    setSelectedProduct(null);

    toast.success(`Priority Spot Secured! Wave 1 Queue #${queueNumber}`, {
      duration: 6500,
      description: `${drop.title} (${storage} • ${color}) is locked to your account. We will notify your WhatsApp as soon as flights land in Lagos.`
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

      toast.info('Sign in to claim your priority Nigerian preorder waitlist allocation.', {
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
      padding: '48px 0 60px 0',
      background: 'var(--bg-void)',
      borderBottom: '1px solid var(--border-subtle)',
      overflow: 'hidden'
    }}>
      {/* Dynamic REAVO Ambient Glow (Electric Teal & Purple) */}
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

      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '5%',
        width: '45vw',
        height: '45vw',
        background: 'radial-gradient(circle, rgba(124, 92, 255, 0.08) 0%, transparent 65%)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Top Ticker / Header Bar conforming to REAVO UI */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 100,
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'blur(12px)'
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
                OFFICIAL APPLE RELEASE • WAVE 1 ALLOCATION
              </span>
            </div>

            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Nigeria Early Access • Lagos & Campus Dispatch
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              REAVO VIP DESK: +234 915 855 4158
            </span>
          </div>
        </div>

        {/* Master Showcase Glass Panel */}
        <div className="glass-panel" style={{
          position: 'relative',
          borderRadius: 24,
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.55)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          minHeight: 520
        }}>
          
          {/* Left Column: Authentic Specs, Typography, & Action */}
          <div style={{
            padding: 'clamp(28px, 4vw, 48px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 3,
            background: 'linear-gradient(135deg, rgba(17, 17, 19, 0.98) 0%, rgba(17, 17, 19, 0.88) 100%)'
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
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--accent-teal)',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  {currentDrop.priceEst}
                </span>
              </div>

              {/* Title */}
              <h2 style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: 'clamp(28px, 3.8vw, 44px)',
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: '-0.04em',
                margin: '0 0 16px 0',
                color: 'var(--text-primary)'
              }}>
                {currentDrop.title}
              </h2>

              {/* Tagline */}
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                lineHeight: 1.55,
                color: 'var(--text-primary)',
                margin: '0 0 12px 0',
                fontWeight: 500
              }}>
                {currentDrop.tagline}
              </p>

              {/* Detailed Description */}
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                margin: '0 0 24px 0',
                maxWidth: 520
              }}>
                {currentDrop.description}
              </p>

              {/* Technical Specifications Grid (JetBrains Mono) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10,
                marginBottom: 26
              }}>
                {currentDrop.specs.map((spec, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: '10px 14px'
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

              {/* Interactive Color Finishes Swatches */}
              <div style={{ marginBottom: 28 }}>
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
                        setActiveView('gallery');
                      }}
                      title={color.name}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: color.hex,
                        border: '2px solid rgba(255, 255, 255, 0.25)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: hoveredColor === color.name ? 'scale(1.2)' : 'scale(1)'
                      }}
                    >
                      {hoveredColor === color.name && (
                        <Check size={14} color={['#FFFFFF', '#F5F5F7', '#EDECE8', '#EBE6DC', '#E3E4E6'].includes(color.hex) ? '#000' : '#fff'} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs & Trust Badges */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => handleOpenPreorder(currentDrop)}
                  className="btn-primary"
                  style={{
                    padding: '14px 30px',
                    borderRadius: 100,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: 'var(--accent-primary)',
                    color: '#0A0A0C',
                    boxShadow: '0 8px 24px rgba(57, 217, 196, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  {hasReserved ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
                  {hasReserved ? 'Priority Queue Secured ✓' : 'Pre-Order Priority Allocation'}
                </button>

                {/* View Angle Switcher Button */}
                <button
                  type="button"
                  onClick={() => setActiveView(activeView === 'hero' ? 'gallery' : 'hero')}
                  className="btn-ghost"
                  style={{
                    padding: '13px 20px',
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer'
                  }}
                >
                  <Layers size={15} />
                  {activeView === 'hero' ? currentDrop.galleryLabel : currentDrop.heroLabel}
                </button>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: 'var(--text-secondary)'
              }}>
                <Shield size={14} color="var(--accent-primary)" />
                <span>Zero advance deposit needed • 100% genuine Apple official 1-year warranty</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Definition Official Apple Studio Showcase */}
          <div style={{
            position: 'relative',
            minHeight: 440,
            overflow: 'hidden',
            background: '#060709',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            
            {/* Subtle background ambient mesh */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              opacity: 0.7
            }} />

            {/* Official Product Image with smooth transition */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              minHeight: 440,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(16px, 4vw, 36px)',
              overflow: 'hidden'
            }}>
              <img
                key={`${currentDrop.id}-${activeView}`}
                src={activeView === 'hero' ? currentDrop.heroImage : currentDrop.galleryImage}
                alt={currentDrop.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))',
                  transform: 'scale(1.02)',
                  transition: 'transform 0.4s ease, opacity 0.35s ease'
                }}
              />
            </div>

            {/* View Switcher Overlay Pills */}
            <div style={{
              position: 'absolute',
              top: 20,
              right: 20,
              display: 'flex',
              gap: 8,
              zIndex: 5
            }}>
              <button
                type="button"
                onClick={() => setActiveView('hero')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  background: activeView === 'hero' ? 'rgba(57, 217, 196, 0.2)' : 'rgba(0,0,0,0.6)',
                  border: activeView === 'hero' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  color: activeView === 'hero' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  backdropFilter: 'blur(8px)',
                  cursor: 'pointer'
                }}
              >
                Hero View
              </button>

              <button
                type="button"
                onClick={() => setActiveView('gallery')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  background: activeView === 'gallery' ? 'rgba(57, 217, 196, 0.2)' : 'rgba(0,0,0,0.6)',
                  border: activeView === 'gallery' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  color: activeView === 'gallery' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  backdropFilter: 'blur(8px)',
                  cursor: 'pointer'
                }}
              >
                Finishes
              </button>
            </div>

            {/* Bottom Status Tag */}
            <div style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              background: 'rgba(10, 10, 12, 0.85)',
              backdropFilter: 'blur(12px)',
              padding: '6px 14px',
              borderRadius: 100,
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              color: 'var(--text-secondary)',
              zIndex: 4
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent-primary)'
              }} />
              <span>Official Apple Studio Asset</span>
            </div>

          </div>

        </div>

        {/* Bottom Carousel / Product Selector (Browse all 5 official releases) */}
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
                onClick={() => setActiveSlide(idx)}
                style={{
                  background: isActive ? 'var(--glass-bg)' : 'rgba(255, 255, 255, 0.02)',
                  border: isActive ? `1px solid var(--accent-primary)` : '1px solid var(--border-subtle)',
                  borderRadius: 16,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: isActive ? '0 8px 24px rgba(57, 217, 196, 0.12)' : 'none'
                }}
              >
                <div style={{
                  width: 46,
                  height: 46,
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
                    src={drop.heroImage}
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
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {drop.priceEst.split('•')[0]}
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
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: 480,
            background: 'var(--bg-card)',
            borderRadius: 24,
            padding: 32,
            border: '1px solid var(--border-active)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.7)'
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
              marginBottom: 20,
              lineHeight: 1.55
            }}>
              Lock in your day-one priority queue. Zero deposit required. We will message your verified WhatsApp when units touch down in Nigeria.
            </p>

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
                  Select Storage / Size
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
                        background: selectedStorage === opt ? 'rgba(57, 217, 196, 0.15)' : 'var(--bg-inner)',
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
                        background: selectedColor === opt.name ? 'rgba(57, 217, 196, 0.15)' : 'var(--bg-inner)',
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
                <div><strong>Delivery Target:</strong> Verified Campus / Home in Nigeria</div>
                <div><strong>REAVO Concierge:</strong> 09158554158</div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmPreorder}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: 100,
                    fontWeight: 700,
                    fontSize: 14,
                    background: 'var(--accent-primary)',
                    color: '#0A0A0C',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Reserving Spot...' : 'Confirm 1-Click Priority Queue'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="btn-ghost"
                  style={{ padding: '14px 20px', borderRadius: 100 }}
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
