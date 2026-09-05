export default function DotNav({ total, activeIndex, onDotClick }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick && onDotClick(i)}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: i === activeIndex ? 'var(--text-primary)' : 'var(--border-active)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: i === activeIndex ? 'scale(1.2)' : 'scale(1)',
            padding: 0,
            cursor: 'pointer'
          }}
        />
      ))}
    </div>
  );
}
