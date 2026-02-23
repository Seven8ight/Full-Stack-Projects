import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

// Use shorter dimension to avoid ultra-tall phone distortion
const guidelineBaseWidth = 375; // iPhone base width reference
const guidelineBaseHeight = 812;

const shortDimension = Math.min(width, height);

export const scale = (size: number) =>
  (shortDimension / guidelineBaseWidth) * size;

export const verticalScale = (size: number) =>
  (height / guidelineBaseHeight) * size;

export const moderateScale = (size: number, factor = 0.4) =>
  size + (scale(size) - size) * factor;

export const normalizeFont = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(moderateScale(size)));
