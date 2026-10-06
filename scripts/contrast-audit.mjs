import { readFileSync } from "node:fs";

const css = readFileSync(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8",
);

const tokensIn = (selector) => {
  const start = css.indexOf(`${selector} {`);
  const block = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,6}|rgb\([^)]*\))/gi)].map(
      ([, name, value]) => [name, value],
    ),
  );
};

const rgb = (value) => {
  if (value.startsWith("#")) {
    const h =
      value.length === 4
        ? [...value.slice(1)].map((c) => c + c).join("")
        : value.slice(1);
    return { c: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)), a: 1 };
  }
  const [r, g, b, a = "1"] = value.match(/[\d.]+/g);
  return { c: [r, g, b].map(Number), a: Number(a) };
};

const over = (fg, bg, alpha = fg.a) => ({
  c: fg.c.map((v, i) => Math.round(v * alpha + bg.c[i] * (1 - alpha))),
  a: 1,
});

const luminance = ({ c }) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const light = tokensIn(":root");
const themes = { light, dark: { ...light, ...tokensIn(".dark") } };

const TEXT_BACKGROUNDS = [
  "canvas",
  "panel",
  "column",
  "surface-1",
  "surface-2",
  "surface-3",
  "surface-4",
];
const ICON_BACKGROUNDS = ["panel", "column", "surface-1", "surface-3"];
const STATUS = [
  "gray",
  "blue",
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
  "pink",
];
const PRIORITY = ["low", "medium", "high", "urgent"];

let failing = 0;
const rows = [];

for (const [theme, t] of Object.entries(themes)) {
  const color = (name) => rgb(t[name]);
  const check = (label, fg, bg, min) => {
    const value = ratio(fg, bg);
    const pass = value >= min;
    if (!pass) failing += 1;
    rows.push(
      `${theme.padEnd(5)} ${pass ? "pass" : "FAIL"} ${value.toFixed(2).padStart(5)} (min ${min})  ${label}`,
    );
  };

  for (const ink of ["ink", "ink-muted", "ink-subtle"])
    for (const bg of TEXT_BACKGROUNDS)
      check(`${ink} text / ${bg}`, color(ink), color(bg), 4.5);

  for (const bg of ["panel", "column"])
    check(`ink-tertiary icon / ${bg}`, color("ink-tertiary"), color(bg), 3);

  for (const name of ["danger", "success", "warning", "info", "accent-soft"])
    for (const bg of ["panel", "surface-1"])
      check(`${name} text / ${bg}`, color(name), color(bg), 4.5);

  check(
    "danger text / danger 10% tint",
    color("danger"),
    over(color("danger"), color("panel"), 0.1),
    4.5,
  );
  check(
    "ink text / accent 10% tint (active filter)",
    color("ink"),
    over(color("accent"), color("surface-1"), 0.1),
    4.5,
  );

  for (const [fg, bg] of [
    ["on-accent", "accent"],
    ["on-accent", "accent-fill-hover"],
    ["on-danger", "danger-solid"],
    ["on-danger", "danger-solid-hover"],
  ])
    check(`${fg} text / ${bg}`, color(fg), color(bg), 4.5);

  for (const name of STATUS)
    for (const bg of ICON_BACKGROUNDS)
      check(
        `status-${name} icon / ${bg}`,
        color(`status-${name}`),
        color(bg),
        3,
      );

  for (const name of PRIORITY)
    for (const bg of ["panel", "column"])
      check(
        `priority-${name} icon / ${bg}`,
        color(`priority-${name}`),
        color(bg),
        3,
      );

  for (const bg of ["panel", "surface-1", "surface-3"])
    check(
      `focus ring / ${bg}`,
      over(color("focus-ring"), color(bg)),
      color(bg),
      3,
    );
  check(
    "progress bar status-green / surface-4",
    color("status-green"),
    color("surface-4"),
    3,
  );
}

console.log(
  rows.filter((row) => row.includes("FAIL")).join("\n") || "no failures",
);
console.log(`\n${rows.length} pairs checked, ${failing} failing`);
