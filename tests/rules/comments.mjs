import { call, profile, signIn } from "./helpers.mjs";

const strings = (values) => ({
  arrayValue: { values: values.map((value) => ({ stringValue: value })) },
});

const member = (role, displayName) => ({
  mapValue: {
    fields: {
      role: { stringValue: role },
      displayName: { stringValue: displayName },
      email: { stringValue: "person@example.com" },
      photoURL: { nullValue: null },
    },
  },
});

const comment = (authorId, authorName, overrides = {}) => ({
  fields: {
    authorId: { stringValue: authorId },
    authorName: { stringValue: authorName },
    authorPhotoURL: { nullValue: null },
    message: { stringValue: "Looks good to me" },
    ...overrides,
  },
});

export const run = async () => {
  const owner = await signIn("comment-owner@example.com", "hunter2pass");
  const guest = await signIn("comment-member@example.com", "hunter2pass");
  const outsider = await signIn("comment-outsider@example.com", "hunter2pass");

  for (const uid of [owner.uid, guest.uid, outsider.uid]) {
    await call("PATCH", `/users/${uid}`, {
      token: "owner",
      body: profile(uid),
    });
  }

  const ws = "/workspaces/ws-comments";
  await call("PATCH", ws, {
    token: "owner",
    body: {
      fields: {
        name: { stringValue: "Comments fixture" },
        description: { stringValue: "" },
        ownerId: { stringValue: owner.uid },
        memberIds: strings([owner.uid, guest.uid]),
        members: {
          mapValue: {
            fields: {
              [owner.uid]: member("owner", "Olive Owner"),
              [guest.uid]: member("member", "Mo Member"),
            },
          },
        },
        labels: strings([]),
        createdAt: { timestampValue: "2026-01-01T00:00:00Z" },
        updatedAt: { timestampValue: "2026-01-01T00:00:00Z" },
      },
    },
  });

  const task = `${ws}/tasks/t1`;
  await call("PATCH", task, {
    token: "owner",
    body: {
      fields: {
        title: { stringValue: "Discuss me" },
        createdBy: { stringValue: owner.uid },
      },
    },
  });

  const stored = (authorId, authorName) => ({
    fields: {
      ...comment(authorId, authorName).fields,
      createdAt: { timestampValue: "2026-01-01T00:00:00Z" },
    },
  });
  await call("PATCH", `${task}/comments/by-owner`, {
    token: "owner",
    body: stored(owner.uid, "Olive Owner"),
  });
  await call("PATCH", `${task}/comments/by-member`, {
    token: "owner",
    body: stored(guest.uid, "Mo Member"),
  });

  const create = (path, token, body) => ({
    path,
    token,
    body,
    serverTimestamps: ["createdAt"],
  });

  return [
    [
      "anonymous cannot read comments",
      403,
      { method: "GET", path: `${task}/comments` },
    ],
    [
      "a non-member cannot read comments",
      403,
      { method: "GET", path: `${task}/comments`, token: outsider.idToken },
    ],
    [
      "a member can read comments",
      200,
      { method: "GET", path: `${task}/comments`, token: guest.idToken },
    ],

    [
      "CONTROL: a member can comment as themselves",
      200,
      create(
        `${task}/comments/new`,
        guest.idToken,
        comment(guest.uid, "Mo Member"),
      ),
    ],
    [
      "a non-member cannot comment",
      403,
      create(
        `${task}/comments/intruder`,
        outsider.idToken,
        comment(outsider.uid, "Person"),
      ),
    ],
    [
      "a comment cannot be posted as someone else",
      403,
      create(
        `${task}/comments/forged`,
        guest.idToken,
        comment(owner.uid, "Olive Owner"),
      ),
    ],
    [
      "a comment cannot use a made-up author name",
      403,
      create(
        `${task}/comments/renamed`,
        guest.idToken,
        comment(guest.uid, "The Boss"),
      ),
    ],
    [
      "a comment cannot be empty",
      403,
      create(
        `${task}/comments/empty`,
        guest.idToken,
        comment(guest.uid, "Mo Member", { message: { stringValue: "" } }),
      ),
    ],
    [
      "a comment cannot be longer than 2000 characters",
      403,
      create(
        `${task}/comments/long`,
        guest.idToken,
        comment(guest.uid, "Mo Member", {
          message: { stringValue: "x".repeat(2001) },
        }),
      ),
    ],
    [
      "a comment cannot carry unexpected fields",
      403,
      create(
        `${task}/comments/extra`,
        guest.idToken,
        comment(guest.uid, "Mo Member", { pinned: { booleanValue: true } }),
      ),
    ],
    [
      "a comment cannot be posted on a task that doesn't exist",
      403,
      create(
        `${ws}/tasks/missing/comments/orphan`,
        guest.idToken,
        comment(guest.uid, "Mo Member"),
      ),
    ],

    [
      "a comment cannot be edited, even by its author",
      403,
      create(
        `${task}/comments/by-member`,
        guest.idToken,
        comment(guest.uid, "Mo Member", {
          message: { stringValue: "Edited" },
        }),
      ),
    ],
    [
      "the workspace owner cannot delete a member's comment",
      403,
      {
        method: "DELETE",
        path: `${task}/comments/by-member`,
        token: owner.idToken,
      },
    ],
    [
      "CONTROL: the author can delete their comment",
      200,
      {
        method: "DELETE",
        path: `${task}/comments/by-member`,
        token: guest.idToken,
      },
    ],
  ];
};
