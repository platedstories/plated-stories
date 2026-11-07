const CLOUDINARY_IMAGE_MARKER = "/image/upload/";
const CLOUDINARY_VIDEO_MARKER = "/video/upload/";
const NEXT_IMAGE_WIDTHS = [384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

const nextImageWidth = (width) =>
  NEXT_IMAGE_WIDTHS.find((candidate) => candidate >= width) ?? 3840;

const addCloudinaryTransform = (src, marker, transform) => {
  if (typeof src !== "string" || !src.includes(marker)) return src;

  const [base, query = ""] = src.split("?");
  const optimized = base.replace(marker, `${marker}${transform}/`);
  return query ? `${optimized}?${query}` : optimized;
};

export const optimizeImageUrl = (src, width = 1600) => {
  if (typeof src !== "string") return src;

  if (src.startsWith("/") && !src.startsWith("/_next/") && !src.endsWith(".svg")) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${nextImageWidth(width)}&q=75`;
  }

  return addCloudinaryTransform(
    src,
    CLOUDINARY_IMAGE_MARKER,
    `f_auto,q_auto:good,c_limit,w_${width}`
  );
};

const IMAGEKIT_HOST = "ik.imagekit.io";

// ImageKit transforms ride on the `tr` query parameter.
const addImageKitTransform = (src, transform) => {
  if (typeof src !== "string" || !src.includes(IMAGEKIT_HOST)) return src;
  return `${src}${src.includes("?") ? "&" : "?"}tr=${transform}`;
};

export const optimizeVideoUrl = (src, width = 1280) => {
  if (typeof src === "string" && src.includes(IMAGEKIT_HOST)) {
    return addImageKitTransform(src, `w-${width},q-50`);
  }

  return addCloudinaryTransform(
    src,
    CLOUDINARY_VIDEO_MARKER,
    `f_auto,q_auto:eco,vc_auto,c_limit,w_${width}`
  );
};

// A still from an ImageKit video, to paint while the video buffers.
export const videoPosterUrl = (src, width = 1280) => {
  if (typeof src !== "string" || !src.includes(IMAGEKIT_HOST)) return undefined;
  const [base] = src.split("?");
  return addImageKitTransform(`${base}/ik-thumbnail.jpg`, `w-${width},q-70`);
};
