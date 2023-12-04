import React, { useState, useCallback, useMemo } from "react";
import { PixelRatio } from "react-native";
import { config } from "../lib/config";
import { Image as RNImage, ImageErrorEventData, ImageProps } from "expo-image";

// This is 48x48 in 1x, 2x, and 3x DPIs
const avatarVariants = [48, 96, 144];

/**
 * This component handles DPI for you
 */
export function Image(
  props: {
    source: { uri: string };
    width?: number;
    height: number;
    type: "profile" | "cast";
  } & ImageProps
) {
  const [didError, setDidError] = useState(false);
  const [imgSrc] = useState(props.source);

  const formatSource = useCallback(
    ({
      src,
      width,
      height,
    }: {
      src: { uri: string };
      width?: number;
      height: number;
    }): { uri: string; width?: number; height: number } => {
      // fallback to original url if cloudflare url fails, maybe not cached yet.
      if (didError)
        return {
          uri: `${config.apiUrl}/api/img?w=${width}&h=${height}&t=${
            props.type === "cast" ? "inside" : "cover"
          }&i=${imgSrc.uri}&position=${
            props.type === "profile" ? "center" : "top"
          }`,
          height,
          width,
        };

      return {
        uri: `https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_${width},h_${
          height ?? width
        }/${encodeURIComponent(src.uri)}`,
        width,
        height,
      };
    },
    [props.type, didError, imgSrc.uri]
  );

  const w = props.width
    ? PixelRatio.getPixelSizeForLayoutSize(props.width)
    : undefined;
  const h = PixelRatio.getPixelSizeForLayoutSize(props.height);
  const source = formatSource({
    src: imgSrc,
    width: w,
    height: h,
  });

  return (
    <RNImage
      contentFit={props.type === "profile" ? "cover" : "contain"}
      onError={(event: ImageErrorEventData) => {
        if (!didError) setDidError(true);
      }}
      {...props}
      source={source}
    />
  );
}
