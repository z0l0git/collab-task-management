import type { FirebaseOptions } from "firebase/app";

const rawConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} satisfies Record<string, string | undefined>;

const ENV_VAR_NAMES: Record<keyof typeof rawConfig, string> = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
};

const missingKeys = (
  Object.keys(ENV_VAR_NAMES) as Array<keyof typeof rawConfig>
).filter((key) => !rawConfig[key]);

if (missingKeys.length > 0) {
  const names = missingKeys.map((key) => ENV_VAR_NAMES[key]).join(", ");
  throw new Error(
    `Missing Firebase environment variables: ${names}. ` +
      `Locally, copy .env.example to .env.local and fill them in. ` +
      `When deploying, set them in the host's environment settings for the ` +
      `environment being built, then trigger a new deployment — changing them ` +
      `does not rebuild on its own.`,
  );
}

export const firebaseConfig: FirebaseOptions = rawConfig;

export const attachmentsEnabled =
  process.env.NEXT_PUBLIC_ATTACHMENTS_ENABLED !== "false";

export const emulatorConfig = {
  enabled: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true",
  host: process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "127.0.0.1",
  authPort: Number(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT) || 9099,
  firestorePort:
    Number(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT) || 8080,
  storagePort:
    Number(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT) || 9199,
} as const;
