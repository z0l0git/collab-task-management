import { describe, expect, it } from "vitest";

import {
  formatBytes,
  MAX_ATTACHMENT_BYTES,
  validateAttachment,
} from "../types";

describe("validateAttachment", () => {
  it("accepts an allowed type within the size limit", () => {
    expect(validateAttachment({ type: "application/pdf", size: 1024 })).toBe(
      "",
    );
  });

  it("rejects a type that isn't on the list", () => {
    expect(validateAttachment({ type: "image/svg+xml", size: 1024 })).toMatch(
      /isn't supported/,
    );
    expect(validateAttachment({ type: "", size: 1024 })).toMatch(
      /isn't supported/,
    );
  });

  it("rejects empty and oversized files", () => {
    expect(validateAttachment({ type: "image/png", size: 0 })).toMatch(/empty/);
    expect(
      validateAttachment({ type: "image/png", size: MAX_ATTACHMENT_BYTES + 1 }),
    ).toMatch(/10 MB/);
  });
});

describe("formatBytes", () => {
  it("picks a readable unit", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(3.5 * 1024 * 1024)).toBe("3.5 MB");
  });
});
