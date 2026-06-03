import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  valueClassName?: string;
};

export default function MetricCard({ label, value, valueClassName = "text-foreground" }: Props) {
  return (
    <div className="border rounded-2xl p-5 text-center bg-card">
      <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">{label}</p>
      <p className={cn("text-3xl font-bold", valueClassName)}>{value}</p>
    </div>
  );
}
