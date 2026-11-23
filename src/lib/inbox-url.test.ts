import { describe, expect, it } from "vitest";
import { inboxHref } from "./inbox-url";

describe("inboxHref", () => {
  it("leaves out default values", () => {
    expect(inboxHref({ quality: "relevant" })).toBe("/");
    expect(inboxHref({ quality: "relevant", id: "op_35" })).toBe("/?id=op_35");
  });

  it("keeps the quality view and the selected row", () => {
    expect(inboxHref({ quality: "low", id: "op_01" })).toBe("/?quality=low&id=op_01");
  });
});
