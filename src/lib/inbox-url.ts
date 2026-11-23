import type { InboxFilters } from "./quality";

/** Builds an inbox URL. Default values are left out, so the plain inbox is just "/". */
export function inboxHref(filters: InboxFilters, id?: string) {
  const params = new URLSearchParams();
  if (filters.quality !== "relevant") params.set("quality", filters.quality);
  if (filters.hideContacted) params.set("hideContacted", "1");
  if (id) params.set("id", id);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
