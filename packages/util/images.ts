export function getImageProxyUrl({
  src,
  width,
  height,
  format,
  position,
  fit,
  // ${process.env.NEXT_PUBLIC_ORIGIN}
  origin,
}: {
  src: string;
  width: number;
  format?: null | "png" | "jpg";
  height: number;
  position: "top" | "center";
  fit: "cover" | "inside";
  origin: string;
}) {
  // keep url short
  return `https://res.cloudinary.com/merkle-manufactory/image/fetch/c_${
    fit === "inside" ? "fit" : "crop"
  },f_${format},w_${width},h_${height}/${encodeURIComponent(src)}`;
}
