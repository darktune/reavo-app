import { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle2, Shield, ArrowRight, Layers, Eye, Play, Pause, Volume2, VolumeX, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';

const PREORDER_DROPS = [
  {
    id: 'iphone-18-pro',
    badge: 'APPLE FLAGSHIP',
    category: 'TITANIUM PRO SERIES',
    title: 'iPhone 18 Pro & Pro Max',
    tagline: 'Variable Aperture Fusion Camera. Next-Gen A20 Pro Silicon. Vapor Chamber Cooling.',
    description: 'The definitive pro smartphone. Featuring an all-new 48MP Fusion Main camera with mechanical variable aperture (ƒ/1.48 to ƒ/4.0), 2nm A20 Pro silicon with integrated vapor chamber thermals, and the largest battery leap in iPhone history.',
    videoSrc: 'https://www.apple.com/newsroom/videos/2026/autoplay/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/apple-iphone-18-pro-dynamic-island/large_2x.mp4',
    localVideoSrc: '/videos/preorders/iphone_18_pro.mp4',
    heroImage: '/images/preorders/iphone-18-pro-hero.jpg',
    galleryImage: '/images/preorders/iphone-18-pro-colors.jpg',
    chipImage: '/images/preorders/iphone-18-pro-chip.jpg',
    galleryLabel: 'All 4 Finishes',
    heroLabel: 'Hero View',
    accentColor: '#39D9C4', // REAVO Electric Teal
    priceEst: 'From ₦1,980,000',
    specs: [
      { label: 'CHIP', value: 'A20 Pro Silicon (2nm)' },
      { label: 'APERTURE', value: 'Variable ƒ/1.48 to ƒ/4.0' },
      { label: 'THERMAL', value: 'Next-Gen Vapor Chamber' },
      { label: 'BATTERY', value: 'All-Day Pro+ Endurance' }
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
    title: 'iPhone Duo (Foldable)',
    tagline: '7.6" Inner Nano-Texture OLED. 5.4" Outer Cover Display. Polished Mirror Titanium.',
    description: 'Apple’s first foldable smartphone. Fusing a seamless 7.6-inch inner display with nano-texture anti-reflective coating, a zero-crease titanium hinge, dual-battery architecture, and reimagined split-view iOS 27 multitasking.',
    videoSrc: 'https://www.apple.com/newsroom/videos/2026/autoplay/09/apple-unveils-iphone-duo/apple-iphone-duo-opening/large_2x.mp4',
    localVideoSrc: '/videos/preorders/iphone_duo_opening.mp4',
    heroImage: '/images/preorders/iphone-duo-hero.jpg',
    galleryImage: '/images/preorders/iphone-duo-colors.jpg',
    chipImage: '/images/preorders/iphone-duo-display.jpg',
    galleryLabel: 'Fold Finishes',
    heroLabel: 'Unfold View',
    accentColor: '#7C5CFF', // REAVO Purple
    priceEst: 'From ₦2,650,000',
    specs: [
      { label: 'INNER DISPLAY', value: '7.6" Nano-Texture OLED' },
      { label: 'OUTER COVER', value: '5.4" Super Retina XDR' },
      { label: 'CHASSIS', value: 'Polished Mirror Titanium' },
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
    badge: '5.6MM ULTRA-THIN',
    category: 'AEROSPACE MONOCOQUE',
    title: 'iPhone Air 2',
    tagline: 'The thinnest iPhone ever created. 5.6mm ultralight titanium profile at just 165g.',
    description: 'Pure minimalist engineering. Sculpted with a single-piece titanium monocoque measuring just 5.6mm thin, high-efficiency A20 architecture, a flush plateau camera housing, and Ceramic Shield 2 durability.',
    videoSrc: 'https://www.apple.com/newsroom/videos/2025/autoplay/09/apple-iphone-air-plateau/large_2x.mp4',
    localVideoSrc: '/videos/preorders/iphone_air_plateau.mp4',
    heroImage: '/images/preorders/iphone-air-hero.jpg',
    galleryImage: '/images/preorders/iphone-air-colors.jpg',
    chipImage: '/images/preorders/iphone-air-profile.jpg',
    galleryLabel: '4 Color Lineup',
    heroLabel: 'Profile View (5.6mm)',
    accentColor: '#3D8BFF', // REAVO Blue
    priceEst: 'From ₦1,450,000',
    specs: [
      { label: 'THICKNESS', value: '5.6mm Thinnest Ever' },
      { label: 'WEIGHT', value: '165g Ultralight' },
      { label: 'CAMERA', value: '48MP Fusion Plateau' },
      { label: 'CHASSIS', value: 'Grade 5 Titanium Frame' }
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
    tagline: '3,500 Nits Micro-LED. Emergency Satellite Communications. 72hr Endurance.',
    description: 'Built for extreme expeditions and the relentless Nigerian daily hustle. Features Apple’s first 3,500-nit Micro-LED display, standalone two-way satellite messaging, titanium Milanese loop band, and precision dual-frequency GPS.',
    videoSrc: 'https://www.apple.com/newsroom/videos/videos-2024/autoplay/2024/09/apple-watch-ultra-2-black-titanium/large_2x.mp4',
    localVideoSrc: '/videos/preorders/watch_ultra_black.mp4',
    heroImage: '/images/preorders/watch-ultra2-black.jpg',
    galleryImage: '/images/preorders/watch-ultra2-black.jpg',
    galleryLabel: 'Milanese Loop',
    heroLabel: 'Satin Black Case',
    accentColor: '#39D9C4', // REAVO Electric Teal
    priceEst: 'From ₦1,320,000',
    specs: [
      { label: 'DISPLAY', value: '3,500 nits Micro-LED' },
      { label: 'SATELLITE', value: 'Emergency Satellite SOS' },
      { label: 'DURABILITY', value: 'Diamond-Like Carbon PVD' },
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
    tagline: 'Lossless Studio Audio over USB-C. Apple H2 Silicon. 2x Active Noise Cancellation.',
    description: 'The apex of personal audio. Custom engineered with Apple H2 acoustic architecture, high-resolution lossless audio playback via USB-C, touch swipe controls, personalized spatial audio with dynamic head tracking, and breathable knit mesh.',
    videoSrc: 'https://www.apple.com/newsroom/videos/videos-2024/autoplay/2024/09/apple-airpods-hearing-test/large_2x.mp4',
    localVideoSrc: '/videos/preorders/airpods_video.mp4',
    heroImage: '/images/preorders/airpods-max-usbc.jpg',
    galleryImage: '/images/preorders/airpods-4-hero.jpg',
    galleryLabel: 'AirPods 4 Edition',
    heroLabel: 'AirPods Max USB-C',
    accentColor: '#7C5CFF', // REAVO Purple
    priceEst: 'From ₦890,000',
    specs: [
      { label: 'AUDIO', value: 'High-Res Lossless USB-C' },
      { label: 'SILICON', value: 'Apple H2 Architecture' },
      { label: 'NOISE CONTROL', value: '2x Enhanced Active ANC' },
      { label: 'BATTERY', value: '24hr Studio Playback' }
    ],
    storageOptions: ['AirPods Max 2', 'AirPods 4 (with ANC)'],
    colorOptions: [
      { name: 'Midnight', hex: '#232A35' },
      { name: 'Starlight', hex: '#EBE6DC' },
      { name: 'Sky Blue', hex: '#7799B8' },
      { name: 'Purple', hex: '#877B96' },
      { name: 'Orange', hex: '#EA7557' }
    ]
  }
];

export default function PreorderHeroBanner() {
  const { isAuthenticated, user } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [mediaMode, setMediaMode] = useState('video'); // 'video' or 'photo'
  const [activePhotoView, setActivePhotoView] = useState('hero'); // 'hero' or 'gallery'
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReserved, setHasReserved] = useState(false);
  const [hoveredColor, setHoveredColor] = useState(null);

  const videoRef = useRef(null);
  const currentDrop = PREORDER_DROPS[activeSlide];

  // Auto-play video when slide changes
  useEffect(() => {
    setActivePhotoView('hero');
    setHoveredColor(null);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
        setIsPlaying(false);
      });
    }

    try {
      const saved = JSON.parse(localStorage.getItem('reavo_preorders') || '[]');
      const match = saved.find(p => p.productId === currentDrop.id);
      setHasReserved(Boolean(match));
    } catch {
      setHasReserved(false);
    }
  }, [activeSlide, currentDrop.id, user]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
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
        notes: `REAVO Priority Wave 1 Nigeria Allocation. Queue #${queueNumber}. Estimated Retail: ${drop.priceEst}`
      }]);
    } catch (err) {
      console.log('Supabase preorder sync:', err?.message);
    }

    setIsSubmitting(false);
    setHasReserved(true);
    setSelectedProduct(null);

    toast.success(`Priority Spot Secured! Wave 1 Queue #${queueNumber}`, {
      duration: 6500,
      description: `${drop.title} (${storage} • ${color}) is locked to your REAVO account. We will notify your WhatsApp as soon as flights land in Lagos.`
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
      padding: '48px 0 60px 0',
      background: 'var(--bg-void)',
      borderBottom: '1px solid var(--border-subtle)',
      overflow: 'hidden'
    }}>
      {/* Dynamic REAVO Ambient Glow (Teal & Purple) */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '15%',
        width: '55vw',
        height: '55vw',
        background: `radial-gradient(circle, ${currentDrop.accentColor}18 0%, transparent 65%)`,
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
                OFFICIAL 2026 APPLE RELEASE • WAVE 1 ALLOCATION
              </span>
            </div>

            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Nigeria Early Access • Lagos & University Campus Delivery
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              REAVO VIP DESK: +234 915 855 4158
            </span>
          </div>
        </div>

        {/* Master Showcase Card */}
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

              {/* Color Swatches */}
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
                        setMediaMode('photo');
                        setActivePhotoView('gallery');
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
                        <Check size={14} color={['#FFFFFF', '#F5F5F7', '#F0EFEA', '#F3F4F6', '#E4E5E8', '#CAD8DF'].includes(color.hex) ? '#000' : '#fff'} />
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

                {/* Media Mode Switcher (Video vs Photos) */}
                <button
                  type="button"
                  onClick={() => {
                    if (mediaMode === 'video') {
                      setMediaMode('photo');
                    } else {
                      setMediaMode('video');
                      setIsPlaying(true);
                      if (videoRef.current) {
                        videoRef.current.play().catch(() => {});
                      }
                    }
                  }}
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
                  {mediaMode === 'video' ? 'Inspect Studio Photos' : 'Watch 4K Cinematic Ad'}
                </button>

                {/* If in video mode, show Play/Pause and Mute */}
                {mediaMode === 'video' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>
                )}
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

          {/* Right Column: Authentic 4K Video Player & Studio Imagery */}
          <div style={{
            position: 'relative',
            minHeight: 440,
            overflow: 'hidden',
            background: '#040507',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            
            {/* Ambient grid lines */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              opacity: 0.7,
              zIndex: 1
            }} />

            {/* If Video Mode: Real 4K Apple Video for each product */}
            {mediaMode === 'video' ? (
              <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
                <video
                  ref={videoRef}
                  key={currentDrop.id}
                  poster={currentDrop.heroImage}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                >
                  <source src={currentDrop.localVideoSrc} type="video/mp4" />
                  <source src={currentDrop.videoSrc} type="video/mp4" />
                </video>
                {/* Edge gradient blending */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to right, rgba(17,17,19,0.9) 0%, transparent 15%, transparent 85%, rgba(17,17,19,0.9) 100%)',
                  pointerEvents: 'none'
                }} />
              </div>
            ) : (
              /* If Photo Mode: Official Apple Studio Imagery with View Switcher */
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: 440,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(16px, 4vw, 36px)',
                zIndex: 2
              }}>
                <img
                  key={`${currentDrop.id}-${activePhotoView}`}
                  src={activePhotoView === 'hero' ? currentDrop.heroImage : currentDrop.galleryImage}
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
            )}

            {/* Media Mode and View Switcher Overlay (Top Right) */}
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
                onClick={() => {
                  setMediaMode('video');
                  setIsPlaying(true);
                  if (videoRef.current) videoRef.current.play().catch(() => {});
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  background: mediaMode === 'video' ? 'rgba(57, 217, 196, 0.2)' : 'rgba(0,0,0,0.65)',
                  border: mediaMode === 'video' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  color: mediaMode === 'video' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  backdropFilter: 'blur(8px)',
                  cursor: 'pointer'
                }}
              >
                4K Video
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaMode('photo');
                  setActivePhotoView('hero');
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  background: mediaMode === 'photo' && activePhotoView === 'hero' ? 'rgba(57, 217, 196, 0.2)' : 'rgba(0,0,0,0.65)',
                  border: mediaMode === 'photo' && activePhotoView === 'hero' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  color: mediaMode === 'photo' && activePhotoView === 'hero' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  backdropFilter: 'blur(8px)',
                  cursor: 'pointer'
                }}
              >
                Hero View
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaMode('photo');
                  setActivePhotoView('gallery');
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  background: mediaMode === 'photo' && activePhotoView === 'gallery' ? 'rgba(57, 217, 196, 0.2)' : 'rgba(0,0,0,0.65)',
                  border: mediaMode === 'photo' && activePhotoView === 'gallery' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  color: mediaMode === 'photo' && activePhotoView === 'gallery' ? 'var(--accent-primary)' : 'var(--text-secondary)',
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
              <span>{mediaMode === 'video' ? 'Official Apple 4K Cinematic Ad' : 'Official Apple Newsroom Studio Asset'}</span>
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
              Lock in your day-one priority queue. Zero deposit required. We will message your verified WhatsApp when shipments touch down in Lagos.
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
                <div><strong>REAVO Hotline:</strong> 09158554158</div>
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
