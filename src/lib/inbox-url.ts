import type { QualityView } from "./quality";

/** Builds an inbox URL. Default values are left out, so the plain inbox is just "/". */
export function inboxHref({ quality, id }: { quality: QualityView; id?: string }) {
  const params = new URLSearchParams();
  if (quality !== "relevant") params.set("quality", quality);
  if (id) params.set("id", id);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
