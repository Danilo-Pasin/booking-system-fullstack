import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({ icon, title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="border-2 border-dashed border-border rounded-2xl py-16 px-6 text-center hover:border-muted-foreground/30 transition">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
