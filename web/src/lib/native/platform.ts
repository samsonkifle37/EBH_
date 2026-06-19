// Client-side native context detection + thin, lazily-loaded plugin wrappers.
// Detection uses the appended User-Agent tag (set in capacitor.config.ts) so
// this module imports nothing from Capacitor at the top level — keeping the web
// SSR/build path completely unaffected. Actual plugins are dynamic-imported
// inside handlers, only on native, after a user action.

export const NATIVE_UA_TAG = "EBHApp";

export function isNative(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.userAgent.includes(NATIVE_UA_TAG);
}

export function nativePlatform(): "ios" | "android" | "web" {
  if (!isNative()) return "web";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "web";
}

/** OS share sheet (native) — caller falls back to Web Share / clipboard on web. */
export async function nativeShare(opts: { title?: string; text?: string; url?: string }): Promise<void> {
  const { Share } = await import("@capacitor/share");
  await Share.share(opts);
}

/** Light haptic tap on a meaningful action (no-op/throws-safe on web). */
export async function tapHaptic(): Promise<void> {
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* not available */
  }
}

/** Pick/take a photo natively → returns a File ready for the existing uploader. */
export async function nativePickPhoto(source: "camera" | "photos"): Promise<File | null> {
  const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
  const photo = await Camera.getPhoto({
    quality: 82,
    resultType: CameraResultType.Uri,
    source: source === "camera" ? CameraSource.Camera : CameraSource.Photos,
    allowEditing: false,
  });
  if (!photo.webPath) return null;
  const res = await fetch(photo.webPath);
  const blob = await res.blob();
  const ext = (photo.format || "jpeg").toLowerCase();
  const type = blob.type || `image/${ext === "jpg" ? "jpeg" : ext}`;
  return new File([blob], `photo.${ext}`, { type });
}
