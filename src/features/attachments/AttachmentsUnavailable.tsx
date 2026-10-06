import { Paperclip } from "lucide-react";

export const AttachmentsUnavailable = () => (
  <section aria-labelledby="attachments-heading" className="space-y-3">
    <h3 id="attachments-heading" className="text-eyebrow text-ink-muted">
      Attachments
    </h3>
    <p className="border-hairline text-body-sm text-ink-subtle flex gap-2.5 rounded-md border border-dashed px-3 py-2.5">
      <Paperclip className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        File attachments are turned off on this demo: Needs a paid plan. Run the
        app locally with the emulators to try uploads :) .
      </span>
    </p>
  </section>
);
