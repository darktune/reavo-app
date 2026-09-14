import { Link } from 'react-router';
import ScrollReveal from '../components/ScrollReveal';
import Counter from '../components/Counter';
import UniversityMap from '../components/UniversityMap';

export default function AboutPage() {
  return (
    <div style={{ paddingTop: 120, paddingBottom: 120 }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        
        {/* Header */}
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 120 }}>
            <h1 style={{ fontSize: 'clamp(42px, 6vw, 72px)', marginBottom: 24, letterSpacing: '-0.04em' }}>The REAVO Story</h1>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
              Born on campus, designed for the real world. We are building the most trusted lifestyle technology brand for young Africans.
            </p>
          </div>
        </ScrollReveal>

        {/* Founders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48, marginBottom: 120 }}>
          <ScrollReveal delay={100}>
            <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', borderRadius: 24, overflow: 'hidden' }}>
              <div style={{ background: 'var(--bg-inner)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                {/* Placeholder for Edison's image */}
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>E.E.</div>
                  <div className="font-mono">mr_reavo.jpg</div>
                </div>
              </div>
              <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: 'var(--accent-primary)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>FOUNDER · CEO</div>
                <h2 style={{ fontSize: 32, marginBottom: 4 }}>Emuan Edison</h2>
                <div style={{ fontSize: 16, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 24 }}>a.k.a Mr. Reavo</div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  The vision and the engine behind REAVO — campus presence, product curation, and the relationships that turned a brand built on zero paid ads into a ₦30M+ operation spanning 6+ states and 5+ universities. Mr. Reavo doesn't just sell tech; he embodies it.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', borderRadius: 24, overflow: 'hidden' }}>
              <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', order: 2 }}>
                <div style={{ color: 'var(--accent-purple)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>CO-FOUNDER · CDO</div>
                <h2 style={{ fontSize: 32, marginBottom: 24 }}>Oreoluwa Owojaiye</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  The design and direction force at REAVO — shaping how the brand looks, feels, and speaks to a generation of ambitious young Nigerians. His conviction: that premium technology should be accessible without compromise, community-first, not ad-spend-first.
                </p>
              </div>
              <div style={{ background: 'var(--bg-inner)', minHeight: 320, order: 1, position: 'relative', overflow: 'hidden' }}>
                <img 
                  src="/founders/oreoluwa.jpg" 
                  alt="Oreoluwa Owojaiye — Co-Founder & CDO of REAVO" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 320 }}
                  loading="lazy"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Philosophy */}
        <ScrollReveal>
          <div style={{ marginBottom: 120 }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>PHILOSOPHY</div>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>WHAT WE STAND FOR</h2>
              <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 16 }}>Three things we never compromise.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
              <div className="glass-panel" style={{ padding: 40, borderRadius: 24 }}>
                <h3 style={{ fontSize: 20, marginBottom: 16 }}>The tech should fit the person.</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  Not the other way around. REAVO starts with who you are — creator, student, founder, institution — and works backwards to the right product.
                </p>
              </div>
              <div className="glass-panel" style={{ padding: 40, borderRadius: 24 }}>
                <h3 style={{ fontSize: 20, marginBottom: 16 }}>Trust is built in person.</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  That's why REAVO is physically present on campuses, at trade fairs, and in communities. Word-of-mouth isn't a strategy — it's the result of showing up right.
                </p>
              </div>
              <div className="glass-panel" style={{ padding: 40, borderRadius: 24 }}>
                <h3 style={{ fontSize: 20, marginBottom: 16 }}>Growth should be real.</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  ₦30M+ in two years, 100%+ year-on-year growth. Numbers built through genuine value, not paid hype. That's the only kind of growth that compounds.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* The Track Record */}
        <ScrollReveal>
          <div style={{ marginBottom: 80 }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ color: 'var(--accent-lime)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>THE TRACK RECORD</div>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>Proof, not promise.</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 48 }}>
              
              <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', borderRadius: 24 }}>
                <div style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 8 }}>
                  <Counter target={2} suffix="+" />
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Years in operation</div>
              </div>

              <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', borderRadius: 24 }}>
                <div style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--accent-primary)', marginBottom: 8 }}>
                  <Counter prefix="₦" target={30} suffix="M+" />
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Cumulative revenue</div>
              </div>

              <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', borderRadius: 24 }}>
                <div style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--accent-purple)', marginBottom: 8 }}>
                  <Counter target={100} suffix="%+" />
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Annual growth</div>
              </div>

              <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', borderRadius: 24 }}>
                <div style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 8 }}>
                  <Counter target={30000} suffix="+" />
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Students reached</div>
              </div>
            </div>

            <p style={{ fontSize: 20, lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
              REAVO is where Nigeria's most ambitious young people find the tech that fits who they are. Trusted by 30,000+ students, zero ads spent.
            </p>

            {/* University Map Section */}
            <div className="glass-panel" style={{ padding: 48, borderRadius: 24, marginTop: 48 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--text-primary)' }}><Counter target={6} suffix="+" /></div>
                    <div style={{ color: 'var(--text-secondary)' }}>States delivered to</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--text-primary)' }}><Counter target={5} suffix="+" /></div>
                    <div style={{ color: 'var(--text-secondary)' }}>Universities active</div>
                  </div>
                </div>
                
                <UniversityMap />
              </div>
            </div>
            
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div style={{ textAlign: 'center', marginTop: 120 }}>
            <Link to="/shop" className="btn-primary" style={{ padding: '20px 40px', borderRadius: 100, fontSize: 18 }}>
              Explore the Collection
            </Link>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
