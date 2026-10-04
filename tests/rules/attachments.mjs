import { call, fileRequest, profile, signIn, uploadFile } from "./helpers.mjs";

const strings = (values) => ({
  arrayValue: { values: values.map((value) => ({ stringValue: value })) },
});

const member = (role) => ({
  mapValue: {
    fields: {
      role: { stringValue: role },
      displayName: { stringValue: "Person" },
      email: { stringValue: "person@example.com" },
      photoURL: { nullValue: null },
    },
  },
});

const MB = 1024 * 1024;

export const run = async () => {
  const owner = await signIn("file-owner@example.com", "hunter2pass");
  const guest = await signIn("file-member@example.com", "hunter2pass");
  const outsider = await signIn("file-outsider@example.com", "hunter2pass");

  for (const uid of [owner.uid, guest.uid, outsider.uid]) {
    await call("PATCH", `/users/${uid}`, {
      token: "owner",
      body: profile(uid),
    });
  }

  const ws = "/workspaces/ws-files";
  await call("PATCH", ws, {
    token: "owner",
    body: {
      fields: {
        name: { stringValue: "Files fixture" },
        description: { stringValue: "" },
        ownerId: { stringValue: owner.uid },
        memberIds: strings([owner.uid, guest.uid]),
        members: {
          mapValue: {
            fields: {
              [owner.uid]: member("owner"),
              [guest.uid]: member("member"),
            },
          },
        },
        labels: strings([]),
        createdAt: { timestampValue: "2026-01-01T00:00:00Z" },
        updatedAt: { timestampValue: "2026-01-01T00:00:00Z" },
      },
    },
  });
  await call("PATCH", `${ws}/tasks/t1`, {
    token: "owner",
    body: { fields: { title: { stringValue: "Has files" } } },
  });

  const file = (id) => `workspaces/ws-files/tasks/t1/${id}`;
  const upload = (id, token, contentType, size) => () =>
    uploadFile(file(id), { token, contentType, bytes: size });

  await uploadFile(file("seeded"), {
    token: owner.idToken,
    contentType: "application/pdf",
    bytes: 64,
  });

  const metadata = (id, uploadedBy, overrides = {}) => ({
    path: `${ws}/tasks/t1/attachments/${id}`,
    token: guest.idToken,
    serverTimestamps: ["createdAt"],
    body: {
      fields: {
        name: { stringValue: "brief.pdf" },
        size: { integerValue: "64" },
        contentType: { stringValue: "application/pdf" },
        storagePath: { stringValue: file(id) },
        uploadedBy: { stringValue: uploadedBy },
        ...overrides,
      },
    },
  });

  return [
    [
      "storage: anonymous cannot download a file",
      403,
      () => fileRequest("GET", file("seeded"), { media: true }),
    ],
    [
      "storage: a non-member cannot download a file",
      403,
      () =>
        fileRequest("GET", file("seeded"), {
          token: outsider.idToken,
          media: true,
        }),
    ],
    [
      "storage: a member can download a file",
      200,
      () =>
        fileRequest("GET", file("seeded"), {
          token: guest.idToken,
          media: true,
        }),
    ],
    [
      "CONTROL storage: a member can upload a PDF",
      200,
      upload("ok", guest.idToken, "application/pdf", 1024),
    ],
    [
      "storage: a non-member cannot upload",
      403,
      upload("intruder", outsider.idToken, "application/pdf", 1024),
    ],
    [
      "storage: a file over 10 MB is rejected",
      403,
      upload("huge", guest.idToken, "application/pdf", 10 * MB + 1),
    ],
    [
      "storage: an HTML file is rejected",
      403,
      upload("page", guest.idToken, "text/html", 1024),
    ],
    [
      "storage: an SVG is rejected",
      403,
      upload("vector", guest.idToken, "image/svg+xml", 1024),
    ],
    [
      "storage: an existing file cannot be overwritten",
      403,
      upload("seeded", guest.idToken, "application/pdf", 1024),
    ],
    [
      "storage: files outside a task folder are blocked",
      403,
      () =>
        uploadFile("workspaces/ws-files/loose.pdf", {
          token: guest.idToken,
          contentType: "application/pdf",
          bytes: 1024,
        }),
    ],
    [
      "storage: a non-member cannot delete a file",
      403,
      () => fileRequest("DELETE", file("ok"), { token: outsider.idToken }),
    ],
    [
      "CONTROL storage: a member can delete a file",
      204,
      () => fileRequest("DELETE", file("ok"), { token: guest.idToken }),
    ],

    [
      "a non-member cannot list attachments",
      403,
      {
        method: "GET",
        path: `${ws}/tasks/t1/attachments`,
        token: outsider.idToken,
      },
    ],
    [
      "CONTROL: a member can record an attachment",
      200,
      metadata("a1", guest.uid),
    ],
    [
      "an attachment cannot point at another task's file",
      403,
      metadata("a2", guest.uid, {
        storagePath: { stringValue: "workspaces/ws-files/tasks/t2/a2" },
      }),
    ],
    [
      "an attachment cannot be recorded on someone else's behalf",
      403,
      metadata("a3", owner.uid),
    ],
    [
      "an attachment cannot claim more than 10 MB",
      403,
      metadata("a4", guest.uid, {
        size: { integerValue: String(10 * MB + 1) },
      }),
    ],
    [
      "CONTROL: a member can delete an attachment record",
      200,
      {
        method: "DELETE",
        path: `${ws}/tasks/t1/attachments/a1`,
        token: guest.idToken,
      },
    ],
  ];
};
