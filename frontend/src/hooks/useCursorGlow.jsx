// Purpose: Cursor radial glow hook — 60fps indigo glow follows cursor using requestAnimationFrame
import { useEffect, useRef } from 'react';

/**
 * useCursorGlow
 * Creates a fixed-position radial gradient that follows the cursor at 60fps.
 * Brightens when hovering over elements with the class "glow-target".
 *
 * @returns {{ glowRef: React.RefObject }} — attach glowRef to the glow div
 */
export function useCursorGlow() {
  const glowRef = useRef(null);
  const posRef  = useRef({ x: -9999, y: -9999 });
  const rafRef  = useRef(null);
  const isHoverRef = useRef(false);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    /* ── Track mouse position ────────────────────────────────── */
    const onMouseMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    /* ── Detect hover on interactive targets ─────────────────── */
    const onMouseOver = (e) => {
      if (e.target && (
        e.target.closest('.glow-target') ||
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.closest('input') ||
        e.target.closest('textarea')
      )) {
        isHoverRef.current = true;
      }
    };
    const onMouseOut = () => { isHoverRef.current = false; };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('mouseout',  onMouseOut,  { passive: true });

    /* ── Animation loop — smooth 80ms lag via lerp ───────────── */
    let currentX = -9999;
    let currentY = -9999;

    const animate = () => {
      const { x, y } = posRef.current;

      // Lerp for smooth 80ms easing (factor ~0.08 per frame at 60fps)
      currentX += (x - currentX) * 0.1;
      currentY += (y - currentY) * 0.1;

      const glowColor = isHoverRef.current
        ? 'rgba(99,102,241,0.25)'
        : 'rgba(99,102,241,0.12)';

      el.style.transform = `translate(${currentX - 200}px, ${currentY - 200}px)`;
      el.style.background = `radial-gradient(circle 200px at center, ${glowColor} 0%, transparent 70%)`;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout',  onMouseOut);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { glowRef };
}

/**
 * CursorGlow component — render once at root level (inside App.jsx)
 * Usage: <CursorGlow />
 */
export function CursorGlow() {
  const { glowRef } = useCursorGlow();
  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '400px',
        height:        '400px',
        pointerEvents: 'none',
        zIndex:        0,
        willChange:    'transform',
        borderRadius:  '50%',
      }}
    />
  );
}
