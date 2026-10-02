import { call, profile, signIn } from "./helpers.mjs";

export const run = async () => {
  const alice = await signIn("rules-alice@example.com", "hunter2pass");
  const bob = await signIn("rules-bob@example.com", "hunter2pass");

  for (const uid of [alice.uid, bob.uid]) {
    await call("PATCH", `/users/${uid}`, {
      token: "owner",
      body: profile(uid),
    });
  }

  return [
    [
      "anonymous cannot read a profile",
      403,
      { method: "GET", path: `/users/${alice.uid}` },
    ],
    ["anonymous cannot list users", 403, { method: "GET", path: "/users" }],
    [
      "anonymous cannot write a profile",
      403,
      { method: "PATCH", path: "/users/intruder", body: profile("intruder") },
    ],
    [
      "a member can read another profile",
      200,
      { method: "GET", path: `/users/${alice.uid}`, token: bob.idToken },
    ],
    [
      "a member can list users for lookup",
      200,
      { method: "GET", path: "/users", token: bob.idToken },
    ],
    [
      "a member cannot write another profile",
      403,
      {
        method: "PATCH",
        path: `/users/${bob.uid}`,
        token: alice.idToken,
        body: profile(bob.uid),
      },
    ],
    [
      "a member cannot forge the id field",
      403,
      {
        method: "PATCH",
        path: `/users/${alice.uid}`,
        token: alice.idToken,
        body: profile(bob.uid),
      },
    ],
    [
      "a member cannot backdate updatedAt",
      403,
      {
        method: "PATCH",
        path: `/users/${alice.uid}`,
        token: alice.idToken,
        body: profile(alice.uid),
      },
    ],
    [
      "profiles cannot be deleted",
      403,
      { method: "DELETE", path: `/users/${alice.uid}`, token: alice.idToken },
    ],
    [
      "collections without rules stay closed",
      403,
      {
        method: "PATCH",
        path: "/secrets/x",
        token: alice.idToken,
        body: { fields: {} },
      },
    ],
  ];
};
