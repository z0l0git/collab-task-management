import { call, profile, signIn } from "./helpers.mjs";

const memberEntry = (uid, ownerUid) => [
  uid,
  {
    mapValue: {
      fields: {
        role: { stringValue: uid === ownerUid ? "owner" : "member" },
        displayName: { stringValue: "Person" },
        email: { stringValue: "person@example.com" },
        photoURL: { nullValue: null },
      },
    },
  },
];

const workspace = (ownerUid, memberUids, overrides = {}) => ({
  fields: {
    name: { stringValue: "Launch plan" },
    description: { stringValue: "" },
    ownerId: { stringValue: ownerUid },
    memberIds: {
      arrayValue: { values: memberUids.map((uid) => ({ stringValue: uid })) },
    },
    members: {
      mapValue: {
        fields: Object.fromEntries(
          memberUids.map((uid) => memberEntry(uid, ownerUid)),
        ),
      },
    },
    labels: { arrayValue: { values: [] } },
    ...overrides,
  },
});

const existing = (ownerUid, memberUids, overrides = {}) => {
  const base = workspace(ownerUid, memberUids, overrides);
  return {
    fields: {
      ...base.fields,
      createdAt: { timestampValue: "2026-01-01T00:00:00Z" },
    },
  };
};

export const run = async () => {
  const owner = await signIn("ws-owner@example.com", "hunter2pass");
  const guest = await signIn("ws-member@example.com", "hunter2pass");
  const outsider = await signIn("ws-outsider@example.com", "hunter2pass");

  for (const uid of [owner.uid, guest.uid, outsider.uid]) {
    await call("PATCH", `/users/${uid}`, {
      token: "owner",
      body: profile(uid),
    });
  }

  const id = "ws-fixture";
  const members = [owner.uid, guest.uid];

  await call("PATCH", `/workspaces/${id}`, {
    token: "owner",
    body: {
      fields: {
        ...existing(owner.uid, members).fields,
        updatedAt: { timestampValue: "2026-01-01T00:00:00Z" },
      },
    },
  });

  const update = (token, body) => ({
    path: `/workspaces/${id}`,
    token,
    body,
    serverTimestamps: ["updatedAt"],
  });

  const create = (path, token, body) => ({
    path,
    token,
    body,
    serverTimestamps: ["createdAt", "updatedAt"],
  });

  return [
    [
      "anonymous cannot read a workspace",
      403,
      { method: "GET", path: `/workspaces/${id}` },
    ],
    [
      "a non-member cannot read a workspace",
      403,
      { method: "GET", path: `/workspaces/${id}`, token: outsider.idToken },
    ],
    [
      "a member can read a workspace",
      200,
      { method: "GET", path: `/workspaces/${id}`, token: guest.idToken },
    ],

    [
      "CONTROL: the owner can rename a workspace",
      200,
      update(
        owner.idToken,
        existing(owner.uid, members, { name: { stringValue: "Renamed" } }),
      ),
    ],
    [
      "CONTROL: the owner can add a member",
      200,
      update(owner.idToken, existing(owner.uid, [...members, outsider.uid])),
    ],
    [
      "CONTROL: a member can leave",
      200,
      update(guest.idToken, existing(owner.uid, [owner.uid, outsider.uid])),
    ],
    [
      "CONTROL: a signed-in user can create their own workspace",
      200,
      create(
        "/workspaces/ws-new",
        outsider.idToken,
        workspace(outsider.uid, [outsider.uid]),
      ),
    ],

    [
      "a non-member cannot write a workspace",
      403,
      update(
        outsider.idToken,
        existing(owner.uid, [owner.uid, outsider.uid, guest.uid]),
      ),
    ],
    [
      "a member cannot rename a workspace",
      403,
      update(
        guest.idToken,
        existing(owner.uid, [owner.uid, outsider.uid, guest.uid], {
          name: { stringValue: "Renamed by a member" },
        }),
      ),
    ],
    [
      "a member cannot add other members",
      403,
      update(
        guest.idToken,
        existing(owner.uid, [owner.uid, outsider.uid, guest.uid, "someone"]),
      ),
    ],
    [
      "a member cannot seize ownership",
      403,
      update(guest.idToken, existing(guest.uid, [owner.uid, outsider.uid])),
    ],
    [
      "a member cannot remove someone else",
      403,
      update(guest.idToken, existing(owner.uid, [owner.uid])),
    ],
    [
      "a member cannot delete a workspace",
      403,
      { method: "DELETE", path: `/workspaces/${id}`, token: guest.idToken },
    ],

    [
      "a workspace cannot be created with someone else as owner",
      403,
      create(
        "/workspaces/forged",
        outsider.idToken,
        workspace(owner.uid, [owner.uid]),
      ),
    ],
    [
      "a workspace cannot be created with extra members",
      403,
      create(
        "/workspaces/stacked",
        outsider.idToken,
        workspace(outsider.uid, [outsider.uid, owner.uid]),
      ),
    ],
    [
      "a workspace cannot be created with a blank name",
      403,
      create(
        "/workspaces/blank",
        outsider.idToken,
        workspace(outsider.uid, [outsider.uid], { name: { stringValue: "" } }),
      ),
    ],
  ];
};
