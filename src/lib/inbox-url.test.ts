import { describe, expect, it } from "vitest";
import { inboxHref } from "./inbox-url";

const defaults = { quality: "relevant", hideContacted: false } as const;

describe("inboxHref", () => {
  it("leaves out default values", () => {
    expect(inboxHref(defaults)).toBe("/");
    expect(inboxHref(defaults, "op_35")).toBe("/?id=op_35");
  });

  it("keeps the filters and the selected row", () => {
    expect(inboxHref({ quality: "low", hideContacted: true }, "op_01")).toBe(
      "/?quality=low&hideContacted=1&id=op_01",
    );
  });
});
