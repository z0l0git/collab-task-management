const PROJECT = "demo-collab-task";
const AUTH = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts";
const FS = `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents`;

const signIn = async (email, password) => {
  const body = { email, password, returnSecureToken: true };
  const post = (op) =>
    fetch(`${AUTH}:${op}?key=demo-api-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  let res = await post("signUp");
  if (!res.ok) res = await post("signInWithPassword");
  if (!res.ok) throw new Error(`could not sign in ${email}: ${res.status}`);

  const { idToken, localId } = await res.json();
  return { idToken, uid: localId };
};

const call = async (method, path, { token, body } = {}) => {
  const res = await fetch(`${FS}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.status;
};

const profile = (uid) => ({
  fields: {
    id: { stringValue: uid },
    displayName: { stringValue: "Mallory" },
    email: { stringValue: "x@example.com" },
    emailLower: { stringValue: "x@example.com" },
    photoURL: { nullValue: null },
    createdAt: { timestampValue: "2026-01-01T00:00:00Z" },
    updatedAt: { timestampValue: "2026-01-01T00:00:00Z" },
  },
});

const run = async () => {
  const alice = await signIn("rules-alice@example.com", "hunter2pass");
  const bob = await signIn("rules-bob@example.com", "hunter2pass");

  for (const uid of [alice.uid, bob.uid]) {
    await call("PATCH", `/users/${uid}`, {
      token: "owner",
      body: profile(uid),
    });
  }

  const cases = [
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

  let failed = 0;
  for (const [name, expected, { method, path, token, body }] of cases) {
    const status = await call(method, path, { token, body });
    const ok = status === expected;
    if (!ok) failed += 1;
    console.log(
      `${ok ? "pass" : "FAIL"}  got ${status}, want ${expected}  ${name}`,
    );
  }

  console.log(`\n${cases.length} checks, ${failed} failing`);
  if (failed > 0) process.exit(1);
};

run().catch((error) => {
  console.error(
    "Rules checks could not run. Start the emulators: npm run emulators",
  );
  console.error(error.message);
  process.exit(1);
});
