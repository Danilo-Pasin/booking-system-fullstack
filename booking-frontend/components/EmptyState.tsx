import Link from "next/link";

type Props = {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({ icon, title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl py-16 px-6 text-center hover:border-zinc-700 transition">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-zinc-300 mb-1">{title}</h3>
      {description && (
        <p className="text-zinc-500 text-sm max-w-md mx-auto mb-6">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-500 transition text-sm"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
