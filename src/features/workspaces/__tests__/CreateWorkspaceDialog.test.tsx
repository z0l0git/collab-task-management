import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { CreateWorkspaceDialog } from "../CreateWorkspaceDialog";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/features/auth/AuthProvider", () => ({
  useAuth: () => ({ user: { uid: "u1" }, loading: false }),
}));
vi.mock("@/services/workspaceService", () => ({ createWorkspace: vi.fn() }));
vi.mock("@/lib/firebase", () => ({ toUserMessage: () => "" }));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
  };
});

describe("CreateWorkspaceDialog", () => {
  it("submits its own form even when another copy is on the page", () => {
    render(
      <>
        <CreateWorkspaceDialog open={false} onClose={() => undefined} />
        <CreateWorkspaceDialog open onClose={() => undefined} />
      </>,
    );

    const buttons = screen.getAllByRole("button", {
      name: "Create workspace",
      hidden: true,
    });
    const [hidden, visible] = buttons.map((button) =>
      button.getAttribute("form"),
    );

    expect(hidden).not.toBe(visible);
    const visibleForm = document.getElementById(visible ?? "");
    expect(visibleForm?.closest("dialog")).toHaveAttribute("open");
  });
});
