import { LucideIcon } from "lucide-react";

export interface PlaceholderConfig {
  slug: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  accent: string;
  bullets: string[];
}

export const placeholderPages: PlaceholderConfig[] = [];
