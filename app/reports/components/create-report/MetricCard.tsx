import { LucideIcon } from "lucide-react";

interface Metric {
  id: string;
  label: string;
  icon: LucideIcon;
  category: string;
}

interface MetricCardProps {
  metric: Metric;
  onDrop: (metricId: string) => void;
}

export const MetricCard = ({ metric, onDrop }: MetricCardProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("metric", metric.id);
  };

  const handleClick = () => {
    onDrop(metric.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      className="metric-chip drag-handle hover:scale-105 transition-transform cursor-pointer"
    >
      <metric.icon className="h-4 w-4" />
      <span>{metric.label}</span>
    </div>
  );
};
