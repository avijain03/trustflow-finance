// Purpose: useAutoScroll hook — scrolls to bottom on new messages, skips if user scrolled up
import { useEffect, useRef } from 'react';

/**
 * useAutoScroll — Auto-scrolls a container to its bottom when deps change.
 * Does NOT scroll if the user has manually scrolled up (ux-friendly).
 *
 * @param {any[]} deps — typically [messages.length]
 * @returns {{ bottomRef: React.RefObject, containerRef: React.RefObject }}
 */
export function useAutoScroll(deps) {
  const bottomRef    = useRef(null);
  const containerRef = useRef(null);
  const userScrolled = useRef(false);

  // Detect manual scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Within 100px of bottom = treat as "at bottom"
      userScrolled.current = scrollHeight - scrollTop - clientHeight > 100;
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-scroll when deps change
  useEffect(() => {
    if (!userScrolled.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { bottomRef, containerRef };
}
