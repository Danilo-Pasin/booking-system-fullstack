import { cn } from "@/lib/utils";

type Props = {
  src?: string;
  name: string;
  className?: string;
  textClassName?: string;
};

export default function AvatarWithFallback({ src, name, className = "w-10 h-10", textClassName = "text-sm" }: Props) {
  const initial = name.charAt(0).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover shrink-0", className)}
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          if (target.parentElement) {
            const fallback = document.createElement("span");
            fallback.className = `flex items-center justify-center font-bold text-muted-foreground ${textClassName} ${className}`;
            fallback.textContent = initial;
            target.parentElement.appendChild(fallback);
          }
        }}
      />
    );
  }

  return (
    <div className={cn("rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground shrink-0", className)}>
      <span className={textClassName}>{initial}</span>
    </div>
  );
}
