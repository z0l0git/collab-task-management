import { describe, expect, it } from "vitest";

import { cn } from "../cn";

describe("cn", () => {
  it("keeps a custom colour and a custom font size together", () => {
    const result = cn("text-on-accent", "text-button");
    expect(result).toContain("text-on-accent");
    expect(result).toContain("text-button");
  });

  it("keeps a semantic colour alongside the caption size", () => {
    const result = cn("text-caption", "text-priority-urgent");
    expect(result).toContain("text-caption");
    expect(result).toContain("text-priority-urgent");
  });

  it("lets a later class win within the same group", () => {
    expect(cn("bg-accent", "bg-danger-solid")).toBe("bg-danger-solid");
    expect(cn("rounded-md", "rounded-lg")).toBe("rounded-lg");
  });

  it("drops falsy values", () => {
    expect(cn("bg-surface-1", false, undefined, null, "text-ink")).toBe(
      "bg-surface-1 text-ink",
    );
  });
});
