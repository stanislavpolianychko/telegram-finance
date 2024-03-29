interface RGBColor {
  r: number,
  g: number,
  b: number,
}

abstract class ColorsTransformer {
  static hexToRgb(hexColor: string): RGBColor | undefined {
    // get grb by regex from hex color
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);

    // return formatted result
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : undefined;
  }
}