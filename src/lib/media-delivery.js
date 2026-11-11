const NEXT_IMAGE_WIDTHS = [384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

const nextImageWidth = (width) =>
  NEXT_IMAGE_WIDTHS.find((candidate) => candidate >= width) ?? 3840;

const IMAGEKIT_HOST = "ik.imagekit.io";

// ImageKit transforms ride on the `tr` query parameter. A URL that already
// carries its own `tr` is left as it is.
const addImageKitTransform = (src, transform) => {
  if (typeof src !== "string" || !src.includes(IMAGEKIT_HOST)) return src;
  if (/[?&]tr=/.test(src)) return src;
  return `${src}${src.includes("?") ? "&" : "?"}tr=${transform}`;
};

export const optimizeImageUrl = (src, width = 1600) => {
  if (typeof src !== "string") return src;

  if (src.startsWith("/") && !src.startsWith("/_next/") && !src.endsWith(".svg")) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${nextImageWidth(width)}&q=75`;
  }

  // ImageKit picks AVIF/WebP per browser (which also turns HEIC uploads
  // into something every browser can show) and caps the width without
  // upscaling smaller originals (c-at_max).
  return addImageKitTransform(src, `w-${width},c-at_max,q-80`);
};

export const optimizeVideoUrl = (src, width = 1280) =>
  addImageKitTransform(src, `w-${width},q-50`);

// A still from an ImageKit video, to paint while the video buffers.
export const videoPosterUrl = (src, width = 1280) => {
  if (typeof src !== "string" || !src.includes(IMAGEKIT_HOST)) return undefined;
  const [base] = src.split("?");
  return addImageKitTransform(`${base}/ik-thumbnail.jpg`, `w-${width},q-70`);
};
