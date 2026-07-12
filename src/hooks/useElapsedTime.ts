import { useEffect, useState } from 'react';

export interface ElapsedBreakdown {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
}

function calcBreakdown(streakStartDate: string | null): ElapsedBreakdown {
  if (!streakStartDate) return { dias: 0, horas: 0, minutos: 0, segundos: 0 };

  const totalMs = Math.max(0, Date.now() - new Date(streakStartDate).getTime());
  const totalSegundos = Math.floor(totalMs / 1000);

  return {
    dias: Math.floor(totalSegundos / 86400),
    horas: Math.floor((totalSegundos % 86400) / 3600),
    minutos: Math.floor((totalSegundos % 3600) / 60),
    segundos: totalSegundos % 60,
  };
}

export function useElapsedTime(streakStartDate: string | null): ElapsedBreakdown {
  const [breakdown, setBreakdown] = useState(() => calcBreakdown(streakStartDate));

  useEffect(() => {
    setBreakdown(calcBreakdown(streakStartDate));
    const id = setInterval(() => setBreakdown(calcBreakdown(streakStartDate)), 1000);
    return () => clearInterval(id);
  }, [streakStartDate]);

  return breakdown;
}
