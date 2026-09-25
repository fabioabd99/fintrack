import {
  ArrowLeftRight,
  Banknote,
  Bus,
  Clapperboard,
  CircleDashed,
  HeartPulse,
  Home,
  Laptop,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Icons for the default category names, with a fallback.
const ICONS: Record<string, LucideIcon> = {
  salary: Banknote,
  freelance: Laptop,
  rent: Home,
  groceries: ShoppingCart,
  utilities: Zap,
  transport: Bus,
  dining: UtensilsCrossed,
  health: HeartPulse,
  entertainment: Clapperboard,
  shopping: ShoppingBag,
  subscriptions: Repeat,
};

export function CategoryIcon({
  category,
  color,
  isTransfer = false,
  solid = false,
  className,
}: {
  category: string | null;
  color: string | null;
  isTransfer?: boolean;
  solid?: boolean;
  className?: string;
}) {
  const Icon = isTransfer
    ? ArrowLeftRight
    : (category && ICONS[category.toLowerCase()]) || CircleDashed;

  return (
    <span
      className={className}
      style={
        color && !isTransfer
          ? solid
            ? { backgroundColor: color, color: "#fff" }
            : // light tint of the category colour
              { backgroundColor: `${color}1f`, color }
          : undefined
      }
    >
      <Icon className="size-4.5" aria-hidden />
    </span>
  );
}
