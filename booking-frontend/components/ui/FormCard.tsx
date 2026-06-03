import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function FormCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="max-w-lg mx-auto px-4 py-16 sm:py-20">
      <Card className={cn("p-6", className)}>
        <CardHeader className="px-0 pt-0 text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {subtitle && (
            <CardDescription className="text-sm mt-1">{subtitle}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {children}
        </CardContent>
      </Card>
    </main>
  );
}
