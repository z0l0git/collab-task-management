import type { QueryDocumentSnapshot } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import {
  statusesToFirestore,
  workspaceConverter,
} from "@/lib/firebase/converters/workspaceConverter";
import { DEFAULT_STATUSES } from "@/lib/utils/statuses";

const snapshot = (data: Record<string, unknown>) =>
  ({ id: "ws1", data: () => data }) as unknown as QueryDocumentSnapshot;

describe("workspace statuses", () => {
  it("falls back to the default statuses when the field is missing", () => {
    expect(workspaceConverter.fromFirestore(snapshot({})).statuses).toEqual(
      DEFAULT_STATUSES,
    );
  });

  it("reads statuses in order and survives a round trip", () => {
    const statuses = [
      { id: "backlog", name: "Backlog", color: "blue", done: false },
      { id: "shipped", name: "Shipped", color: "green", done: true },
    ] as const;

    const stored = statusesToFirestore([...statuses]);
    expect(stored.shipped).toEqual({
      name: "Shipped",
      color: "green",
      done: true,
      order: 1,
    });
    expect(
      workspaceConverter.fromFirestore(snapshot({ statuses: stored })).statuses,
    ).toEqual(statuses);
  });

  it("repairs a malformed entry instead of crashing", () => {
    const { statuses } = workspaceConverter.fromFirestore(
      snapshot({ statuses: { odd: { name: "Odd", color: "neon" }, bad: 3 } }),
    );
    expect(statuses).toEqual([
      { id: "odd", name: "Odd", color: "gray", done: false },
    ]);
  });
});
