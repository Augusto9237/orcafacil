'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
  isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { type DateRange } from 'react-day-picker';

export type PresetRangeKey =
  | 'hoje'
  | 'ultimos_7_dias'
  | 'ultimos_30_dias'
  | 'este_mes'
  | 'mes_passado'
  | 'este_ano'
  | 'todos'
  | 'personalizado';

export interface DashboardDateFilter {
  key: PresetRangeKey;
  label: string;
  from?: Date;
  to?: Date;
}

export const PRESET_OPTIONS: { key: PresetRangeKey; label: string; getRange: () => { from?: Date; to?: Date } }[] = [
  {
    key: 'hoje',
    label: 'Hoje',
    getRange: () => {
      const now = new Date();
      return { from: startOfDay(now), to: endOfDay(now) };
    },
  },
  {
    key: 'ultimos_7_dias',
    label: 'Últimos 7 dias',
    getRange: () => {
      const now = new Date();
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    },
  },
  {
    key: 'ultimos_30_dias',
    label: 'Últimos 30 dias',
    getRange: () => {
      const now = new Date();
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    },
  },
  {
    key: 'este_mes',
    label: 'Este mês',
    getRange: () => {
      const now = new Date();
      return { from: startOfMonth(now), to: endOfDay(now) };
    },
  },
  {
    key: 'mes_passado',
    label: 'Mês passado',
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    },
  },
  {
    key: 'este_ano',
    label: 'Este ano',
    getRange: () => {
      const now = new Date();
      return { from: startOfYear(now), to: endOfDay(now) };
    },
  },
  {
    key: 'todos',
    label: 'Todo o período',
    getRange: () => ({ from: undefined, to: undefined }),
  },
];

interface DateRangePickerProps {
  value: DashboardDateFilter;
  onChange: (filter: DashboardDateFilter) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(() => ({
    from: value.from,
    to: value.to,
  }));
  const [activePreset, setActivePreset] = React.useState<PresetRangeKey>(value.key);

  React.useEffect(() => {
    setTempRange({ from: value.from, to: value.to });
    setActivePreset(value.key);
  }, [value, open]);

  const handleSelectPreset = (presetKey: PresetRangeKey) => {
    const preset = PRESET_OPTIONS.find((p) => p.key === presetKey);
    if (preset) {
      const { from, to } = preset.getRange();
      setActivePreset(presetKey);
      setTempRange({ from, to });
      onChange({
        key: presetKey,
        label: preset.label,
        from,
        to,
      });
      setOpen(false);
    }
  };

  const handleCustomRangeSelect = (range: DateRange | undefined) => {
    setTempRange(range);
    setActivePreset('personalizado');
  };

  const handleApplyCustom = () => {
    if (!tempRange?.from) return;

    const from = startOfDay(tempRange.from);
    const to = tempRange.to ? endOfDay(tempRange.to) : endOfDay(tempRange.from);

    let label = 'Personalizado';
    if (isSameDay(from, to)) {
      label = format(from, "dd 'de' MMM, yyyy", { locale: ptBR });
    } else {
      label = `${format(from, 'dd/MM/yy', { locale: ptBR })} - ${format(to, 'dd/MM/yy', { locale: ptBR })}`;
    }

    onChange({
      key: 'personalizado',
      label,
      from,
      to,
    });
    setOpen(false);
  };

  const getDisplayLabel = () => {
    if (value.key === 'todos') {
      return 'Todo o período';
    }
    if (value.from && value.to) {
      if (isSameDay(value.from, value.to)) {
        return `${value.label} (${format(value.from, 'dd/MM/yyyy')})`;
      }
      return `${value.label} (${format(value.from, 'dd/MM/yy')} - ${format(value.to, 'dd/MM/yy')})`;
    }
    if (value.from) {
      return `${value.label} (a partir de ${format(value.from, 'dd/MM/yyyy')})`;
    }
    return value.label;
  };

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="btn-date-range-picker"
            variant="outline"
            size="sm"
            className={cn(
              'h-9 justify-between text-left font-normal bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 shadow-xs px-3 gap-2.5 text-xs sm:text-sm',
              !value && 'text-muted-foreground'
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <CalendarIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                {getDisplayLabel()}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-950"
          align="end"
          sideOffset={8}
        >
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800">
            {/* Presets Sidebar */}
            <div className="p-3 w-full md:w-48 flex flex-col gap-1 bg-zinc-50/50 dark:bg-zinc-900/30">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
                Atalhos Rápidos
              </span>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
                {PRESET_OPTIONS.map((preset) => {
                  const isSelected = activePreset === preset.key;
                  return (
                    <button
                      key={preset.key}
                      onClick={() => handleSelectPreset(preset.key)}
                      className={cn(
                        'flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors text-left cursor-pointer',
                        isSelected
                          ? 'bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white font-semibold shadow-xs'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      <span>{preset.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calendar section */}
            <div className="p-3 flex flex-col gap-3">
              <div className="px-2 pt-1 flex items-center justify-between border-b pb-2 border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Ou selecione no calendário:
                </span>
                {tempRange?.from && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {format(tempRange.from, 'dd/MM/yyyy')}
                    {tempRange.to ? ` até ${format(tempRange.to, 'dd/MM/yyyy')}` : ' ...'}
                  </span>
                )}
              </div>

              <div className="p-0.5">
                <Calendar
                  mode="range"
                  defaultMonth={tempRange?.from || new Date()}
                  selected={tempRange}
                  onSelect={handleCustomRangeSelect}
                  numberOfMonths={1}
                  locale={ptBR}
                  className="rounded-lg border border-zinc-100 dark:border-zinc-800/80"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectPreset('ultimos_30_dias')}
                  className="h-8 text-xs text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100 gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Padrão (30d)
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpen(false)}
                    className="h-8 text-xs"
                  >
                    Fechar
                  </Button>
                  <Button
                    size="sm"
                    disabled={!tempRange?.from}
                    onClick={handleApplyCustom}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                  >
                    Aplicar Intervalo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
