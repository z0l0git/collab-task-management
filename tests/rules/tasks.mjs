import { call, profile, signIn } from "./helpers.mjs";

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

const task = (createdBy, overrides = {}) => ({
  fields: {
    title: { stringValue: "Write the brief" },
    description: { stringValue: "" },
    status: { stringValue: "todo" },
    priority: { stringValue: "medium" },
    assigneeId: { nullValue: null },
    dueDate: { nullValue: null },
    labels: strings([]),
    order: { integerValue: "1" },
    createdBy: { stringValue: createdBy },
    ...overrides,
  },
});

const stored = (createdBy, overrides = {}) => ({
  fields: {
    ...task(createdBy, overrides).fields,
    createdAt: { timestampValue: "2026-01-01T00:00:00Z" },
    updatedAt: { timestampValue: "2026-01-01T00:00:00Z" },
  },
});

export const run = async () => {
  const owner = await signIn("task-owner@example.com", "hunter2pass");
  const guest = await signIn("task-member@example.com", "hunter2pass");
  const outsider = await signIn("task-outsider@example.com", "hunter2pass");

  for (const uid of [owner.uid, guest.uid, outsider.uid]) {
    await call("PATCH", `/users/${uid}`, {
      token: "owner",
      body: profile(uid),
    });
  }

  const ws = "/workspaces/ws-tasks";
  await call("PATCH", ws, {
    token: "owner",
    body: {
      fields: {
        name: { stringValue: "Tasks fixture" },
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
        labels: strings(["bug"]),
        createdAt: { timestampValue: "2026-01-01T00:00:00Z" },
        updatedAt: { timestampValue: "2026-01-01T00:00:00Z" },
      },
    },
  });

  const seeds = {
    "by-owner": stored(owner.uid),
    "by-member": stored(guest.uid),
    "owner-deletes": stored(guest.uid),
    legacy: stored(guest.uid, {
      labels: strings(["retired"]),
      assigneeId: { stringValue: "former-member" },
    }),
  };
  for (const [id, body] of Object.entries(seeds)) {
    await call("PATCH", `${ws}/tasks/${id}`, { token: "owner", body });
  }

  const create = (id, token, body) => ({
    path: `${ws}/tasks/${id}`,
    token,
    body,
    serverTimestamps: ["createdAt", "updatedAt"],
  });

  const update = (id, token, body) => ({
    path: `${ws}/tasks/${id}`,
    token,
    body,
    serverTimestamps: ["updatedAt"],
  });

  const edited = (createdBy, overrides = {}) => ({
    fields: {
      ...task(createdBy, overrides).fields,
      createdAt: { timestampValue: "2026-01-01T00:00:00Z" },
    },
  });

  return [
    [
      "anonymous cannot read a task",
      403,
      { method: "GET", path: `${ws}/tasks/by-owner` },
    ],
    [
      "a non-member cannot read a task",
      403,
      { method: "GET", path: `${ws}/tasks/by-owner`, token: outsider.idToken },
    ],
    [
      "a non-member cannot list tasks",
      403,
      { method: "GET", path: `${ws}/tasks`, token: outsider.idToken },
    ],
    [
      "a member can read a task",
      200,
      { method: "GET", path: `${ws}/tasks/by-owner`, token: guest.idToken },
    ],
    [
      "a member can list tasks",
      200,
      { method: "GET", path: `${ws}/tasks`, token: guest.idToken },
    ],

    [
      "CONTROL: a member can create a task with an assignee and label",
      200,
      create(
        "created",
        guest.idToken,
        task(guest.uid, {
          assigneeId: { stringValue: owner.uid },
          labels: strings(["bug"]),
          dueDate: { timestampValue: "2026-12-01T00:00:00Z" },
          priority: { stringValue: "urgent" },
        }),
      ),
    ],
    [
      "CONTROL: a member can edit someone else's task",
      200,
      update(
        "by-owner",
        guest.idToken,
        edited(owner.uid, { status: { stringValue: "in_progress" } }),
      ),
    ],
    [
      "CONTROL: an edit may keep a removed label and former assignee",
      200,
      update(
        "legacy",
        guest.idToken,
        edited(guest.uid, {
          labels: strings(["retired"]),
          assigneeId: { stringValue: "former-member" },
          title: { stringValue: "Renamed" },
        }),
      ),
    ],

    [
      "a non-member cannot create a task",
      403,
      create("intruder", outsider.idToken, task(outsider.uid)),
    ],
    [
      "a task cannot be created on someone else's behalf",
      403,
      create("forged", guest.idToken, task(owner.uid)),
    ],
    [
      "a task cannot have a blank title",
      403,
      create(
        "blank",
        guest.idToken,
        task(guest.uid, { title: { stringValue: "" } }),
      ),
    ],
    [
      "a task cannot have an unknown status",
      403,
      create(
        "bad-status",
        guest.idToken,
        task(guest.uid, { status: { stringValue: "blocked" } }),
      ),
    ],
    [
      "a task cannot have an unknown priority",
      403,
      create(
        "bad-priority",
        guest.idToken,
        task(guest.uid, { priority: { stringValue: "asap" } }),
      ),
    ],
    [
      "a task cannot be assigned to a non-member",
      403,
      create(
        "bad-assignee",
        guest.idToken,
        task(guest.uid, { assigneeId: { stringValue: outsider.uid } }),
      ),
    ],
    [
      "a task cannot use a label the workspace doesn't have",
      403,
      create(
        "bad-label",
        guest.idToken,
        task(guest.uid, { labels: strings(["made-up"]) }),
      ),
    ],
    [
      "a task cannot carry unexpected fields",
      403,
      create(
        "extra",
        guest.idToken,
        task(guest.uid, { secret: { stringValue: "x" } }),
      ),
    ],
    [
      "an edit cannot change who created the task",
      403,
      update("by-member", guest.idToken, edited(owner.uid)),
    ],
    [
      "an edit cannot add a new unknown label",
      403,
      update(
        "by-member",
        guest.idToken,
        edited(guest.uid, { labels: strings(["made-up"]) }),
      ),
    ],

    [
      "a member cannot delete someone else's task",
      403,
      { method: "DELETE", path: `${ws}/tasks/by-owner`, token: guest.idToken },
    ],
    [
      "CONTROL: a member can delete their own task",
      200,
      { method: "DELETE", path: `${ws}/tasks/by-member`, token: guest.idToken },
    ],
    [
      "CONTROL: the owner can delete a member's task",
      200,
      {
        method: "DELETE",
        path: `${ws}/tasks/owner-deletes`,
        token: owner.idToken,
      },
    ],
  ];
};
