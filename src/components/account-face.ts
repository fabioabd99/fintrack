import { Banknote, CreditCard, Landmark, PiggyBank } from "lucide-react";

// Card gradient per account kind, shared by the Accounts page and Home.
export const ACCOUNT_FACE = {
  checking: {
    icon: Landmark,
    label: "Current account",
    face: "bg-[linear-gradient(135deg,#1d3fb8_0%,#2f63e0_100%)]",
  },
  savings: {
    icon: PiggyBank,
    label: "Savings",
    face: "bg-[linear-gradient(135deg,#4c1d95_0%,#7040d0_100%)]",
  },
  cash: {
    icon: Banknote,
    label: "Cash",
    face: "bg-[linear-gradient(135deg,#9a3412_0%,#c2410c_100%)]",
  },
  card: {
    icon: CreditCard,
    label: "Card",
    face: "bg-[linear-gradient(135deg,#111827_0%,#374151_100%)]",
  },
} as const;
