import { useEffect, useRef, useState } from 'react';

// Interpola suavemente de um valor exibido até o novo alvo (ease-out), em vez
// de "pular" direto pro número novo — usado nos números de economia, que
// mudam a cada poucos segundos (tempo fracionário) e caem pra perto de 0 numa
// recaída.
export function useCountUp(target: number | null, duration = 700): number | null {
  const [displayed, setDisplayed] = useState<number | null>(target);
  const fromRef = useRef<number | null>(target);

  useEffect(() => {
    if (target == null) {
      fromRef.current = null;
      setDisplayed(null);
      return;
    }

    const from = fromRef.current ?? target;
    const start = Date.now();
    let rafId: number;

    function tick() {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplayed(from + (target! - from) * eased);
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    }
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return displayed;
}
