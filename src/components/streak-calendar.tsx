import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { ThemedText } from '@/components/themed-text';
import { Accent, Colors, Spacing } from '@/constants/theme';

interface StreakCalendarProps {
  /** Data efetiva a partir da qual o app passou a rastrear dias (trackingStartDate ?? streakStartDate). */
  trackingStartDate: string | null;
  relapseDates: string[];
}

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatMonthLabel(date: Date): string {
  const texto = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function buildMonthGrid(mesAtual: Date): (Date | null)[] {
  const primeiroDia = startOfMonth(mesAtual);
  const offset = primeiroDia.getDay();
  const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();

  const celulas: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) celulas.push(null);
  for (let dia = 1; dia <= diasNoMes; dia++) {
    celulas.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia));
  }
  while (celulas.length % 7 !== 0) celulas.push(null);
  return celulas;
}

function buildWeekRows(celulas: (Date | null)[]): (Date | null)[][] {
  const semanas: (Date | null)[][] = [];
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7));
  return semanas;
}

type DiaStatus = 'futuro' | 'naoRastreado' | 'recaida' | 'limpo';

function DayCell({ date, status }: { date: Date; status: DiaStatus }) {
  const isDestaque = status === 'recaida' || status === 'limpo';
  const backgroundColor =
    status === 'recaida' ? Accent.dangerBg : status === 'limpo' ? Accent.successBg : 'transparent';
  const textColor = status === 'recaida' ? Accent.dangerText : status === 'limpo' ? Accent.success : Colors.textTertiary;

  return (
    <View style={styles.dayCell}>
      <View style={[styles.dayCircle, isDestaque && { backgroundColor }]}>
        <ThemedText type="small" style={{ color: textColor }}>
          {date.getDate()}
        </ThemedText>
      </View>
    </View>
  );
}

export function StreakCalendar({ trackingStartDate, relapseDates }: StreakCalendarProps) {
  const [mesAtual, setMesAtual] = useState(() => startOfMonth(new Date()));

  const relapseSet = useMemo(
    () => new Set(relapseDates.map((d) => new Date(d).toDateString())),
    [relapseDates],
  );
  const inicioEfetivo = trackingStartDate ? new Date(trackingStartDate) : null;
  const celulas = useMemo(() => buildMonthGrid(mesAtual), [mesAtual]);
  const semanas = useMemo(() => buildWeekRows(celulas), [celulas]);
  const hoje = new Date();
  const isMesAtualCorrente = sameMonth(mesAtual, hoje);

  function statusDoDia(date: Date): DiaStatus {
    if (date > hoje && !sameDay(date, hoje)) return 'futuro';
    if (inicioEfetivo && date < inicioEfetivo && !sameDay(date, inicioEfetivo)) return 'naoRastreado';
    if (relapseSet.has(date.toDateString())) return 'recaida';
    return 'limpo';
  }

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Pressable onPress={() => setMesAtual((m) => addMonths(m, -1))} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
        </Pressable>
        <ThemedText type="smallBold">{formatMonthLabel(mesAtual)}</ThemedText>
        <Pressable
          onPress={() => setMesAtual((m) => addMonths(m, 1))}
          disabled={isMesAtualCorrente}
          hitSlop={8}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isMesAtualCorrente ? Colors.textTertiary : Colors.textSecondary}
          />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((w, i) => (
          <View key={i} style={styles.dayCell}>
            <ThemedText type="small" themeColor="textTertiary">{w}</ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {semanas.map((semana, si) => (
          <View key={si} style={styles.weekRow}>
            {semana.map((data, i) =>
              data ? <DayCell key={i} date={data} status={statusDoDia(data)} /> : <View key={i} style={styles.dayCell} />,
            )}
          </View>
        ))}
      </View>

      <View style={styles.legenda}>
        <View style={styles.legendaItem}>
          <View style={[styles.dot, { backgroundColor: Accent.success }]} />
          <ThemedText type="small" themeColor="textSecondary">Dia limpo</ThemedText>
        </View>
        <View style={styles.legendaItem}>
          <View style={[styles.dot, { backgroundColor: Accent.dangerText }]} />
          <ThemedText type="small" themeColor="textSecondary">Recaída</ThemedText>
        </View>
      </View>

      <ThemedText type="small" themeColor="textTertiary" style={styles.nota}>
        O calendário mostra os dias desde que você começou a usar o FORJA.
      </ThemedText>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  grid: {
    flexDirection: 'column',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legenda: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nota: {
    lineHeight: 16,
  },
});
