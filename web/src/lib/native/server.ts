import { headers } from "next/headers";
import { NATIVE_UA_TAG } from "./platform";

/** Server-side native detection via the appended User-Agent tag. Used to gate
 * payment UI/flows out of the native apps (Apple 3.1.1 / Play Billing). */
export async function isNativeRequest(): Promise<boolean> {
  const h = await headers();
  return (h.get("user-agent") ?? "").includes(NATIVE_UA_TAG);
}
