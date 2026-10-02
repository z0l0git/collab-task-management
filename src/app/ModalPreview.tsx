"use client";

import { useState } from "react";

import { Button, Modal } from "@/components/ui";

export function ModalPreview() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open modal
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Native dialog"
        description="Focus trapping, Escape to close and background inerting come from the platform."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Got it</Button>
          </>
        }
      >
        <p className="text-ink-subtle text-body-sm">
          The only surface in this system that casts a shadow. Try Tab, Escape,
          and clicking the backdrop.
        </p>
      </Modal>
    </>
  );
}
