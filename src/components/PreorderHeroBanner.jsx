import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Sparkles, CheckCircle2, ChevronRight, Bell, Shield, ArrowRight, Eye, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';

const PREORDER_DROPS = [
  {
    id: 'iphone-18-pro',
    badge: 'COMING FALL 2026',
    brand: 'APPLE SPECIAL EVENT',
    title: 'iPhone 18 Pro & Pro Max',
    subtitle: 'Titanium Fusion. Under-Display Face ID. Next-Gen A20 Pro Silicon.',
    tagline: 'Exclusive Day-One Campus Delivery for Ambitious Nigerians.',
    videoSrc: '/videos/iphone_hero.mp4',
    poster: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1200',
    colorAccent: '#FFB800',
    specs: ['A20 Pro (2nm)', 'Zero-Bezel Tandem OLED', '48MP Quad-Spatial Camera', '2TB Max Storage'],
    storageOptions: ['256GB', '512GB', '1TB', '2TB'],
    colorOptions: ['Cosmic Titanium', 'Deep Obsidian', 'Natural Titanium', 'Desert Rose']
  },
  {
    id: 'watch-ultra-3',
    badge: 'WORLDWIDE PREVIEW',
    brand: 'APPLE WEARABLES',
    title: 'Apple Watch Ultra 3',
    subtitle: 'Micro-LED Brightness. Emergency Satellite Messaging. 72hr Endurance.',
    tagline: 'Engineered for the relentless hustle on and off campus.',
    videoSrc: '/videos/iphone_hero.mp4',
    poster: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200',
    colorAccent: '#39D9C4',
    specs: ['Micro-LED 3500 nits', 'Satellite SOS', 'Dual-Frequency GPS', 'Titanium Case'],
    storageOptions: ['GPS + Cellular 64GB'],
    colorOptions: ['Natural Titanium', 'Black Titanium']
  },
  {
    id: 'airpods-max-2',
    badge: 'STUDIO GRADE AUDIO',
    brand: 'ACOUSTIC ENGINEERING',
    title: 'AirPods Max 2',
    subtitle: 'Lossless USB-C Audio. H2 Acoustic Architecture. 2x Active Noise Cancellation.',
    tagline: 'Zero distractions in exam season. Pure acoustic immersion.',
    videoSrc: '/videos/iphone_hero.mp4',
    poster: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=1200',
    colorAccent: '#7C5CFF',
    specs: ['H2 Spatial Audio', 'Lossless USB-C Audio', 'Personalized Spatial Audio', 'Mesh Canopy'],
    storageOptions: ['Standard Edition'],
    colorOptions: ['Midnight', 'Starlight', 'Space Gray', 'Sky Blue']
  }
];

export default function PreorderHeroBanner() {
  const { isAuthenticated, user } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState('256GB');
  const [selectedColor, setSelectedColor] = useState('Cosmic Titanium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReserved, setHasReserved] = useState(false);
  
  const videoRef = useRef(null);
  const currentDrop = PREORDER_DROPS[activeSlide];

  // Check if current user already reserved
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('reavo_preorders') || '[]');
      const match = saved.find(p => p.productId === currentDrop.id);
      setHasReserved(Boolean(match));
    } catch {
      setHasReserved(false);
    }
  }, [activeSlide, user]);

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

  // Handle automatic preorder reservation if guest logged in after clicking preorder
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      try {
        const pending = sessionStorage.getItem('reavo_pending_preorder');
        if (pending) {
          sessionStorage.removeItem('reavo_pending_preorder');
          const data = JSON.parse(pending);
          const drop = PREORDER_DROPS.find(d => d.id === data.dropId) || PREORDER_DROPS[0];
          autoReserveDrop(drop, data.storage || drop.storageOptions[0], data.color || drop.colorOptions[0]);
        }
      } catch (err) {
        console.error('Pending preorder parsing error:', err);
      }
    }
  }, [isAuthenticated, user]);

  const autoReserveDrop = async (drop, storage, color) => {
    if (!drop || !user) return;
    setIsSubmitting(true);
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
      queuePosition: Math.floor(12 + Math.random() * 35)
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
        product_name: `${drop.title} (${storage} - ${color})`,
        customer_email: user.email,
        customer_name: user.user_metadata?.full_name || user.name || 'VIP Member',
        customer_phone: user.user_metadata?.whatsapp || user.phone || '09158554158',
        notes: `Priority Day-One Campus Allocation. Auto-claimed upon login. Queue #${newPreorder.queuePosition}`
      }]);
    } catch (err) {
      console.log('Supabase preorders sync handled:', err?.message);
    }

    setIsSubmitting(false);
    setHasReserved(true);
    setSelectedProduct(null);

    toast.success(`🎉 You're in! Pre-order secured for ${drop.title}! Queue #${newPreorder.queuePosition}`, {
      duration: 6500,
      description: 'Zero questions needed — we will notify your WhatsApp directly as soon as the first shipment lands in Nigeria.'
    });
  };

  const handleOpenPreorder = (drop) => {
    if (!isAuthenticated) {
      try {
        sessionStorage.setItem('reavo_pending_preorder', JSON.stringify({
          dropId: drop.id,
          storage: drop.storageOptions[0],
          color: drop.colorOptions[0]
        }));
      } catch (e) {
        console.error(e);
      }

      toast.info('Sign in or register to instantly secure your priority waitlist allocation!', {
        icon: '🔐'
      });
      setIsAuthModalOpen(true);
      return;
    }

    // If authenticated, instantly reserve 1-click or open customization
    setSelectedProduct(drop);
    setSelectedStorage(drop.storageOptions[0]);
    setSelectedColor(drop.colorOptions[0]);
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
      padding: '24px 0 40px 0',
      background: 'linear-gradient(180deg, rgba(10,12,18,0.95) 0%, var(--bg-void) 100%)',
      borderBottom: '1px solid var(--border-subtle)',
      overflow: 'hidden'
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '20%',
        width: '50vw',
        height: '50vw',
        background: `radial-gradient(circle, ${currentDrop.colorAccent}18 0%, transparent 70%)`,
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'background 0.8s ease'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Top Header & Ticker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 184, 0, 0.15)',
              border: '1px solid rgba(255, 184, 0, 0.3)',
              color: '#FFB800',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              padding: '4px 10px',
              borderRadius: 100,
              textTransform: 'uppercase'
            }}>
              <Sparkles size={12} /> REAVO EXCLUSIVE PRE-ORDER ALLOCATION
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Nigeria Early Access • Limited Wave 1 Slots
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
              HOTLINE: 09158554158
            </span>
          </div>
        </div>

        {/* Hero Spotify-Style Feature Card with Autoplay Video */}
        <div className="glass-panel" style={{
          position: 'relative',
          borderRadius: 24,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#07090e',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          minHeight: 460,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
        }}>
          
          {/* Left Column: Typography, Specs & Pre-Order Action */}
          <div style={{
            padding: '40px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 3,
            background: 'linear-gradient(90deg, #07090e 65%, rgba(7,9,14,0.7) 100%)'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: currentDrop.colorAccent,
              textTransform: 'uppercase',
              marginBottom: 12
            }}>
              <span>{currentDrop.brand}</span> • <span>{currentDrop.badge}</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: '0 0 14px 0',
              color: '#ffffff'
            }}>
              {currentDrop.title}
            </h2>

            <p style={{
              fontSize: 16,
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.85)',
              margin: '0 0 10px 0',
              maxWidth: 480
            }}>
              {currentDrop.subtitle}
            </p>

            <p style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              margin: '0 0 24px 0',
              fontStyle: 'italic'
            }}>
              "{currentDrop.tagline}"
            </p>

            {/* Hardware Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {currentDrop.specs.map((spec, i) => (
                <span key={i} style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 100,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff'
                }}>
                  {spec}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => handleOpenPreorder(currentDrop)}
                className="btn-primary"
                style={{
                  padding: '14px 28px',
                  borderRadius: 100,
                  fontSize: 15,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  background: currentDrop.colorAccent,
                  color: '#000',
                  border: 'none',
                  boxShadow: `0 8px 24px ${currentDrop.colorAccent}40`
                }}
              >
                {hasReserved ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
                {hasReserved ? 'Waitlist Reserved ✓' : 'Pre-Order Allocation'}
              </button>

              <button
                onClick={togglePlay}
                style={{
                  padding: '12px 18px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                {isPlaying ? 'Pause Video' : 'Preview Ad'}
              </button>

              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>

            <div style={{ marginTop: 18, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={13} color="var(--accent-teal)" /> Zero upfront payment required to join priority queue • Official Apple warranty
            </div>
          </div>

          {/* Right Column: Autoplay Video / Visual Screen */}
          <div style={{
            position: 'relative',
            minHeight: 360,
            overflow: 'hidden',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <video
              ref={videoRef}
              src={currentDrop.videoSrc}
              poster={currentDrop.poster}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                inset: 0
              }}
            />

            {/* Gradient edge overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, #07090e 0%, transparent 20%, transparent 80%, #07090e 100%)',
              pointerEvents: 'none'
            }} />

            {/* Spotify-style "Preview" Badge over video */}
            <div style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
              zIndex: 4
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              4K Apple Cinematic Preview
            </div>
          </div>

        </div>

        {/* Bottom Spotify-style Carousel Mini-Cards (Switch between drops) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginTop: 20
        }}>
          {PREORDER_DROPS.map((drop, idx) => {
            const isActive = activeSlide === idx;
            return (
              <div
                key={drop.id}
                onClick={() => setActiveSlide(idx)}
                style={{
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                  border: isActive ? `1px solid ${drop.colorAccent}` : '1px solid var(--border-subtle)',
                  borderRadius: 16,
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#000',
                  flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <img src={drop.poster} alt={drop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: drop.colorAccent, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    {drop.badge}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {drop.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Tap to preview
                  </div>
                </div>
                {isActive && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: drop.colorAccent }} />
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Quick Pre-Order Configuration Modal */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(10px)',
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
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: selectedProduct.colorAccent, textTransform: 'uppercase' }}>
                  Wave 1 Nigeria Allocation
                </span>
                <h3 style={{ fontSize: 22, margin: '4px 0 0 0', color: 'var(--text-primary)' }}>
                  Reserve {selectedProduct.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 20 }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              Lock in your priority spot. Zero deposit required. We will ping your verified WhatsApp when units land in Lagos.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Storage Selection */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                  Select Storage Capacity
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
                        border: '1px solid',
                        borderColor: selectedStorage === opt ? selectedProduct.colorAccent : 'var(--border-subtle)',
                        background: selectedStorage === opt ? selectedProduct.colorAccent : 'var(--bg-inner)',
                        color: selectedStorage === opt ? '#000' : 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                  Select Preferred Finish
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedProduct.colorOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedColor(opt)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: selectedColor === opt ? selectedProduct.colorAccent : 'var(--border-subtle)',
                        background: selectedColor === opt ? selectedProduct.colorAccent : 'var(--bg-inner)',
                        color: selectedColor === opt ? '#000' : 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Confirmation Info */}
              <div style={{
                background: 'var(--bg-inner)',
                padding: 14,
                borderRadius: 12,
                border: '1px solid var(--border-subtle)',
                fontSize: 12,
                color: 'var(--text-secondary)'
              }}>
                <div><strong>Reserved For:</strong> {user?.user_metadata?.full_name || user?.name || user?.email}</div>
                <div><strong>Contact Email:</strong> {user?.email}</div>
                <div><strong>REAVO Support Line:</strong> 09158554158</div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmPreorder}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 100,
                    fontWeight: 700,
                    fontSize: 14,
                    background: selectedProduct.colorAccent,
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Securing Spot...' : 'Confirm 1-Click Reservation'}
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
