interface LiveWordProps {
  category: string;
  label: string;
  vertical?: boolean;
}

const categoryColor: Record<string, string> = {
  route: "text-blue-500",
  driver: "text-purple-500",
  citizen: "text-emerald-500",
  alert: "text-red-500",
  collection: "text-amber-500",
  system: "text-gray-500",
};

export default function LiveWord({ category, label, vertical }: LiveWordProps) {
  const color = categoryColor[category] ?? "text-gray-500";
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider ${color} ${
        vertical ? "[writing-mode:vertical-rl] rotate-180" : ""
      }`}
    >
      {label}
    </span>
  );
}
