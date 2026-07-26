import { useState, useEffect, useMemo } from 'react';
import { financialAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, BarChart3, ArrowUpDown } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

type PeriodOption = { value: string; label: string };

type Row = {
  category: string;
  month: string;
  year: number;
  month_number?: number;
  current_value?: number | string;
  amount?: number | string;
  investment?: number | string;
  created_at?: string;
};

const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '0'));
  return Number.isFinite(n) ? n : 0;
};

export default function Comparison() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [periodOptions, setPeriodOptions] = useState<PeriodOption[]>([]);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(true);
  const [selectedPeriod1, setSelectedPeriod1] = useState('');
  const [selectedPeriod2, setSelectedPeriod2] = useState('');

  // Build the period list from the user's actual monthly entries, newest first.
  useEffect(() => {
    if (!user) {
      setIsLoadingPeriods(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setIsLoadingPeriods(true);
        const response = await financialAPI.getAll();
        const data: Row[] = response?.data ?? [];
        const monthSet = new Map<
          string,
          { month: string; year: number; monthNumber: number }
        >();
        for (const item of data) {
          const key = `${item.month}-${item.year}`;
          if (!monthSet.has(key)) {
            monthSet.set(key, {
              month: item.month,
              year: item.year,
              monthNumber: item.month_number || 0,
            });
          }
        }
        const options = Array.from(monthSet.values())
          .sort((a, b) =>
            a.year !== b.year ? b.year - a.year : b.monthNumber - a.monthNumber,
          )
          .map((m) => ({
            value: `${m.month}-${m.year}`,
            label: `${m.month.substring(0, 3)}-${m.year}`,
          }));

        if (cancelled) return;
        setRows(data);
        setPeriodOptions(options);
        // Default to the two most recent periods.
        setSelectedPeriod1((prev) => prev || options[0]?.value || '');
        setSelectedPeriod2((prev) => prev || options[1]?.value || '');
      } catch {
        if (!cancelled) {
          setRows([]);
          setPeriodOptions([]);
        }
      } finally {
        if (!cancelled) setIsLoadingPeriods(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // A period picked in one dropdown is removed from the other's option list.
  const period1Options = useMemo(
    () => periodOptions.filter((o) => o.value !== selectedPeriod2),
    [periodOptions, selectedPeriod2],
  );
  const period2Options = useMemo(
    () => periodOptions.filter((o) => o.value !== selectedPeriod1),
    [periodOptions, selectedPeriod1],
  );

  // Picking the value already held by the other select swaps them instead of
  // leaving a duplicate selection.
  const handlePeriod1Change = (value: string) => {
    if (value === selectedPeriod2) setSelectedPeriod2(selectedPeriod1);
    setSelectedPeriod1(value);
  };
  const handlePeriod2Change = (value: string) => {
    if (value === selectedPeriod1) setSelectedPeriod1(selectedPeriod2);
    setSelectedPeriod2(value);
  };

  const period1Label =
    periodOptions.find((o) => o.value === selectedPeriod1)?.label ?? 'Period 1';
  const period2Label =
    periodOptions.find((o) => o.value === selectedPeriod2)?.label ?? 'Period 2';

  // Latest entry per category within a given period.
  const totalsFor = (period: string) => {
    const map = new Map<string, number>();
    for (const r of rows) {
      if (`${r.month}-${r.year}` !== period) continue;
      const value = num(r.current_value) || num(r.amount);
      map.set(r.category, (map.get(r.category) ?? 0) + value);
    }
    return map;
  };

  // Category rows combining both selected periods.
  const periodComparison = useMemo(() => {
    if (!selectedPeriod1) return [];
    const t1 = totalsFor(selectedPeriod1);
    const t2 = selectedPeriod2 ? totalsFor(selectedPeriod2) : new Map();
    const categories = Array.from(
      new Set([...t1.keys(), ...t2.keys()]),
    ).sort();
    return categories.map((category) => {
      const p1 = t1.get(category) ?? 0;
      const p2 = t2.get(category) ?? 0;
      const growth = p2 !== 0 ? ((p1 - p2) / p2) * 100 : 0;
      return { category, p1, p2, growth };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, selectedPeriod1, selectedPeriod2]);

  // Total value per period across the whole history, oldest first.
  const trendData = useMemo(() => {
    const map = new Map<
      string,
      { label: string; year: number; monthNumber: number; total: number }
    >();
    for (const r of rows) {
      const key = `${r.month}-${r.year}`;
      const existing = map.get(key) ?? {
        label: `${String(r.month).substring(0, 3)}-${r.year}`,
        year: r.year,
        monthNumber: r.month_number || 0,
        total: 0,
      };
      existing.total += num(r.current_value) || num(r.amount);
      map.set(key, existing);
    }
    return Array.from(map.values())
      .sort((a, b) =>
        a.year !== b.year ? a.year - b.year : a.monthNumber - b.monthNumber,
      )
      .map((m) => ({ month: m.label, total: m.total }));
  }, [rows]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const period1Total = periodComparison.reduce((acc, i) => acc + i.p1, 0);
  const period2Total = periodComparison.reduce((acc, i) => acc + i.p2, 0);
  const totalDifference = period1Total - period2Total;
  const totalGrowth =
    period2Total !== 0 ? (totalDifference / period2Total) * 100 : 0;
  const bestPerformer = periodComparison.reduce<
    (typeof periodComparison)[number] | null
  >((best, item) => (!best || item.growth > best.growth ? item : best), null);
  const hasComparison = Boolean(selectedPeriod1 && selectedPeriod2);


  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Period Comparison
        </h1>
        <p className="text-muted-foreground text-lg">
          Compare your financial performance across different time periods
        </p>
      </motion.div>

      {/* Period Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Select Periods to Compare</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Period 1</label>
              <Select
                value={selectedPeriod1}
                onValueChange={handlePeriod1Change}
                disabled={isLoadingPeriods || periodOptions.length === 0}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue
                    placeholder={
                      isLoadingPeriods
                        ? 'Loading periods...'
                        : 'No periods available'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {period1Options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Period 2</label>
              <Select
                value={selectedPeriod2}
                onValueChange={handlePeriod2Change}
                disabled={isLoadingPeriods || periodOptions.length < 2}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue
                    placeholder={
                      isLoadingPeriods
                        ? 'Loading periods...'
                        : 'No other period available'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {period2Options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>
        </GlassCard>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard hover className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Overall Growth
            </p>
            <p
              className={`text-3xl font-bold ${
                totalGrowth >= 0 ? 'text-success' : 'text-destructive'
              }`}
            >
              {hasComparison
                ? `${totalGrowth >= 0 ? '+' : ''}${totalGrowth.toFixed(2)}%`
                : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {hasComparison
                ? `${period1Label} vs ${period2Label}`
                : 'Select two periods'}
            </p>
          </div>
        </GlassCard>

        <GlassCard hover className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Best Performer
            </p>
            <p className="text-2xl font-bold text-primary">
              {hasComparison && bestPerformer ? bestPerformer.category : '—'}
            </p>
            <p
              className={`text-xs mt-1 ${
                (bestPerformer?.growth ?? 0) >= 0
                  ? 'text-success'
                  : 'text-destructive'
              }`}
            >
              {hasComparison && bestPerformer
                ? `${bestPerformer.growth >= 0 ? '+' : ''}${bestPerformer.growth.toFixed(2)}% growth`
                : 'No data'}
            </p>
          </div>
        </GlassCard>

        <GlassCard hover className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Total Difference
            </p>
            <p className="text-2xl font-bold text-foreground">
              {hasComparison ? formatCurrency(totalDifference) : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalDifference >= 0 ? 'Absolute increase' : 'Absolute decrease'}
            </p>
          </div>
        </GlassCard>

      </motion.div>

      {/* Category-wise Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-chart-3" />
            <h2 className="text-xl font-semibold">Category-wise Comparison</h2>
          </div>

          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={periodComparison}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={value => `₹${(value / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name === 'q2Assets' ? 'Q2 2024' : 'Q1 2024',
                  ]}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="q2Assets"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="q2Assets"
                />
                <Bar
                  dataKey="q1Assets"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                  name="q1Assets"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Q2 2024
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Q1 2024
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Growth %
                  </th>
                  <th className="text-right py-3 font-medium text-muted-foreground">
                    Difference
                  </th>
                </tr>
              </thead>
              <tbody>
                {periodComparison.map((item, index) => {
                  const difference = item.q2Assets - item.q1Assets;
                  const isPositive = difference >= 0;

                  return (
                    <motion.tr
                      key={item.category}
                      className="border-b border-border/20 hover:bg-accent/20"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="py-4 font-medium">{item.category}</td>
                      <td className="py-4 text-right">
                        {formatCurrency(item.q2Assets)}
                      </td>
                      <td className="py-4 text-right">
                        {formatCurrency(item.q1Assets)}
                      </td>
                      <td
                        className={`py-4 text-right font-bold ${
                          isPositive ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {item.growth.toFixed(1)}%
                      </td>
                      <td
                        className={`py-4 text-right font-bold ${
                          isPositive ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatCurrency(difference)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* Monthly Trend Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-success" />
            <h2 className="text-xl font-semibold">Monthly Trend Comparison</h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyComparison}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={value => `₹${(value / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name === 'period1' ? 'Q2 2024' : 'Q1 2024',
                  ]}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="period1"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                  name="period1"
                />
                <Line
                  type="monotone"
                  dataKey="period2"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 6 }}
                  name="period2"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
