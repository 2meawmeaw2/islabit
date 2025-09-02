import { Platform } from "react-native";

type ShadowArgs = {
  color: string;
  offset?: { width: number; height: number };
  opacity?: number;
  radius?: number;
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const bigint = parseInt(expanded, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
};

export const shadowStyle = ({
  color,
  offset = { width: 0, height: 2 },
  opacity = 0.2,
  radius = 4,
}: ShadowArgs) => {
  if (Platform.OS === "web") {
    const { width, height } = offset;
    const alpha = Math.max(0, Math.min(1, opacity));
    const boxShadow = `${width}px ${height}px ${radius}px rgba(${hexToRgb(color)}, ${alpha})`;
    return { boxShadow } as any;
  }
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
  } as any;
};
