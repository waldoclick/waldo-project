export const useColor = () => {
  const hexToRgba = (hex: string, alpha: number) => {
    let r = 0,
      g = 0,
      b = 0;

    // Convertir hex a RGB
    if (hex.length === 4) {
      r = Number.parseInt(hex[1] + hex[1], 16);
      g = Number.parseInt(hex[2] + hex[2], 16);
      b = Number.parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = Number.parseInt(hex[1] + hex[2], 16);
      g = Number.parseInt(hex[3] + hex[4], 16);
      b = Number.parseInt(hex[5] + hex[6], 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const bgColorWithTransparency = (color: string, alpha: number = 0.3) => {
    return hexToRgba(color, alpha);
  };

  return {
    hexToRgba,
    bgColorWithTransparency,
  };
};
