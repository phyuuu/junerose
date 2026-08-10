const colorSwatches: Record<string, string> = {
  black: "#181716",
  white: "#f9f8f6",
  ivory: "#f2eddc",
  cream: "#e9dfc5",
  beige: "#d5c0a3",
  brown: "#76513d",
  espresso: "#4b3028",
  grey: "#9a9895",
  gray: "#9a9895",
  silver: "#b5b4b2",
  red: "#b84242",
  maroon: "#6f293b",
  pink: "#e3a0b5",
  rose: "#b85f7c",
  "baby pink": "#edc3cf",
  orange: "#ca7843",
  yellow: "#d8bb57",
  gold: "#aa8950",
  green: "#69836c",
  olive: "#77784d",
  blue: "#557da5",
  "sky blue": "#9fc8df",
  navy: "#263653",
  teal: "#3f7e79",
  purple: "#7b5c8d",
  lilac: "#bca8cf",
};

export function getColorSwatchHex(colorName: string): string {
  return colorSwatches[colorName.trim().toLowerCase()] ?? "#d8d3cf";
}
