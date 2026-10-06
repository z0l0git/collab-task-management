import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const COLORS = [
  "canvas",
  "surface-1",
  "surface-2",
  "surface-3",
  "surface-4",
  "hairline",
  "hairline-strong",
  "hairline-tertiary",
  "ink",
  "ink-muted",
  "ink-subtle",
  "ink-tertiary",
  "accent",
  "accent-fill-hover",
  "accent-fill-active",
  "accent-focus",
  "accent-soft",
  "accent-soft-hover",
  "on-accent",
  "success",
  "warning",
  "danger",
  "danger-solid",
  "danger-solid-hover",
  "on-danger",
  "info",
  "priority-low",
  "priority-medium",
  "priority-high",
  "priority-urgent",
  "status-gray",
  "status-blue",
  "status-green",
  "status-yellow",
  "status-orange",
  "status-red",
  "status-purple",
  "status-pink",
  "scrim",
  "panel",
  "column",
];

const FONT_SIZES = [
  "display-xl",
  "display-lg",
  "display-md",
  "headline",
  "card-title",
  "title",
  "subhead",
  "body-lg",
  "body",
  "body-sm",
  "caption",
  "button",
  "eyebrow",
  "mono",
];

const RADII = ["xs", "sm", "md", "lg", "xl", "2xl"];

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: COLORS,
      text: FONT_SIZES,
      radius: RADII,
    },
  },
});

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
