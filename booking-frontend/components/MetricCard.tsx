type Props = {
  label: string;
  value: string | number;
  valueClassName?: string;
};

export default function MetricCard({ label, value, valueClassName = "text-white" }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
      <p className="text-zinc-500 text-sm uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold ${valueClassName}`}>{value}</p>
    </div>
  );
}
