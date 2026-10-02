const PROJECT = "demo-collab-task";
const AUTH = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts";
const FS = `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents`;

export const signIn = async (email, password) => {
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

export const call = async (method, path, { token, body } = {}) => {
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

export const profile = (uid) => ({
  fields: {
    id: { stringValue: uid },
    displayName: { stringValue: "Person" },
    email: { stringValue: "person@example.com" },
    emailLower: { stringValue: "person@example.com" },
    photoURL: { nullValue: null },
    createdAt: { timestampValue: "2026-01-01T00:00:00Z" },
    updatedAt: { timestampValue: "2026-01-01T00:00:00Z" },
  },
});

const DOC_ROOT = `projects/${PROJECT}/databases/(default)/documents`;

export const commitWrite = async (
  path,
  fields,
  { token, serverTimestamps },
) => {
  const res = await fetch(`${FS}:commit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      writes: [
        {
          update: { name: `${DOC_ROOT}${path}`, fields },
          updateTransforms: serverTimestamps.map((fieldPath) => ({
            fieldPath,
            setToServerValue: "REQUEST_TIME",
          })),
        },
      ],
    }),
  });
  return res.status;
};
