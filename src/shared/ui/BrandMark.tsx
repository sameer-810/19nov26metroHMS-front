import React from "react";
import { Image, type ImageStyle, type StyleProp } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import { brandColors } from "../designSystem";

/** Mark's own aspect: the pulse line runs past the ring on both sides. */
const MARK_RATIO = 400 / 300;

interface MarkProps {
  /** Rendered width; height follows the mark's 4:3 aspect. */
  size?: number;
  /** Single-colour version for dark or coloured backgrounds. */
  mono?: string;
}

/** The Metro Hospital ring-and-pulse mark, drawn as vectors so it stays sharp at any size. */
export function BrandMark({ size = 40, mono }: MarkProps) {
  return (
    <Svg
      width={size}
      height={size / MARK_RATIO}
      viewBox="0 0 400 300"
      accessibilityLabel="Metro Hospital"
    >
      <Circle
        cx={200}
        cy={150}
        r={128}
        fill="none"
        stroke={mono ?? brandColors.navy}
        strokeWidth={16}
      />
      <Polyline
        points="14,150 143,150 168,80 198,213"
        fill="none"
        stroke={mono ?? brandColors.blue}
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="198,213 233,85 255,150 386,150"
        fill="none"
        stroke={mono ?? brandColors.red}
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Logo lockup's aspect ratio (cropped artwork in assets/brand). */
const LOGO_RATIO = 966 / 326;

interface LogoProps {
  width?: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * Full bilingual lockup: mark, Devanagari and English wordmark, service line.
 * Artwork is navy and red on transparent, so place it on a light surface.
 */
export function BrandLogo({ width = 280, style }: LogoProps) {
  return (
    <Image
      source={require("../../../assets/brand/metro-hospital-logo.png")}
      style={[{ width, height: width / LOGO_RATIO }, style]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Metro Hospital — General, Maternity, Surgical, Pediatric"
    />
  );
}
