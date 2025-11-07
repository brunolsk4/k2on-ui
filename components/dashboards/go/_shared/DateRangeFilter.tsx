import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeFilterProps {
  onDateRangeChange: (range: DateRange) => void;
}

export function DateRangeFilter({ onDateRangeChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedPreset, setSelectedPreset] = useState("Últimos 30 dias");
  const [isCustom, setIsCustom] = useState(false);
  const [tempFrom, setTempFrom] = useState<Date | undefined>();

  const presets = [
    { label: "Hoje", getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: "Ontem", getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
    { label: "Hoje e Ontem", getValue: () => ({ from: subDays(new Date(), 1), to: new Date() }) },
    { label: "Últimos 7 dias", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: "Últimos 14 dias", getValue: () => ({ from: subDays(new Date(), 14), to: new Date() }) },
    { label: "Últimos 28 dias", getValue: () => ({ from: subDays(new Date(), 28), to: new Date() }) },
    { label: "Últimos 30 dias", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: "Esta semana", getValue: () => ({ from: startOfWeek(new Date(), { locale: ptBR }), to: endOfWeek(new Date(), { locale: ptBR }) }) },
    { label: "Semana passada", getValue: () => ({ from: startOfWeek(subDays(new Date(), 7), { locale: ptBR }), to: endOfWeek(subDays(new Date(), 7), { locale: ptBR }) }) },
    { label: "Este mês", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: "Mês passado", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
    { label: "Máximo", getValue: () => ({ from: new Date(2020, 0, 1), to: new Date() }) },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    const range = preset.getValue();
    setDateRange(range);
    setSelectedPreset(preset.label);
    setIsCustom(false);
  };

  const handleApply = () => {
    onDateRangeChange(dateRange);
    setOpen(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (!tempFrom) {
      setTempFrom(date);
      setDateRange({ from: date, to: date });
    } else {
      if (date < tempFrom) {
        setDateRange({ from: date, to: tempFrom });
      } else {
        setDateRange({ from: tempFrom, to: date });
      }
      setTempFrom(undefined);
    }
    setIsCustom(true);
    setSelectedPreset("");
  };

  const formatDateRange = (range: DateRange) => {
    return `${format(range.from, "d 'de' MMMM", { locale: ptBR })} — ${format(range.to, "d 'de' MMMM", { locale: ptBR })}`;
  };

  return (
    <div className="flex items-center gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal w-[400px]">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Left sidebar with presets */}
            <div className="w-48 border-r border-border p-4 space-y-1">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors",
                    selectedPreset === preset.label && !isCustom && "bg-accent"
                  )}
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => setIsCustom(true)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors",
                  isCustom && "bg-accent"
                )}
              >
                Personalizado
              </button>
            </div>

            {/* Right side with calendar */}
            <div className="p-4">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                    setIsCustom(true);
                    setSelectedPreset("");
                  }
                }}
                numberOfMonths={2}
                className={cn("pointer-events-auto")}
                locale={ptBR}
              />

              <div className="text-xs text-muted-foreground mb-4 mt-4">
                Fuso horário das datas: Horário de São Paulo
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleApply}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
