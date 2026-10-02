# Taskboard

A collaborative task management application: shared workspaces, a real-time
Kanban board, task comments and file attachments, built with Next.js and
Firebase.

> **Status: Sprint 0 (foundation).** The toolchain, design system, Firebase
> wiring and emulator setup are in place. Authentication, workspaces and tasks
> land in the sprints that follow, and this README grows with them.

## Stack

| Concern       | Choice                                            |
| ------------- | ------------------------------------------------- |
| Framework     | Next.js 16 (App Router), React 19                 |
| Language      | TypeScript, `strict` + `noUncheckedIndexedAccess` |
| Styling       | Tailwind CSS v4, CSS-variable design tokens       |
| Design system | Dark-first, four-step surface ladder, one accent  |
| Backend       | Firebase Auth, Cloud Firestore, Cloud Storage     |
| Local backend | Firebase Emulator Suite                           |
| Icons         | lucide-react                                      |
| Quality       | ESLint, Prettier, GitHub Actions                  |

## Getting started

Requirements: Node.js 22+, npm, and a Java runtime (the Firestore and Storage
emulators run on the JVM).

```bash
git clone <repository-url>
cd collab-task-management
npm install
cp .env.example .env.local
```

For local development you do not need a real Firebase project. Set the
emulator values in `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-collab-task.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-collab-task
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-collab-task.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:0000000000000000000000
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
```

A project id starting with `demo-` is never contacted over the network, so the
emulators run entirely offline with placeholder credentials.

Then, in two terminals:

```bash
npm run emulators   # Auth :9099, Firestore :8080, Storage :9199, UI :4000
npm run dev         # http://localhost:3000
```

### Running against a real Firebase project

1. Create a project in the [Firebase console](https://console.firebase.google.com),
   add a **Web app**, and enable **Authentication** (Email/Password and Google),
   **Cloud Firestore** and **Cloud Storage**.
2. Copy the web app's SDK config into `.env.local` and set
   `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false`.
3. Point the CLI at the project and deploy the rules:

   ```bash
   npx firebase use --add
   npx firebase deploy --only firestore:rules,storage:rules,firestore:indexes
   ```

The `NEXT_PUBLIC_FIREBASE_*` values are not secrets — the Firebase web SDK
ships them to the browser by design. What protects the data is
`firestore.rules` and `storage.rules`.

## Scripts

| Command                    | What it does                                          |
| -------------------------- | ----------------------------------------------------- |
| `npm run dev`              | Dev server at http://localhost:3000                   |
| `npm run build`            | Production build                                      |
| `npm start`                | Serve the production build                            |
| `npm run lint`             | ESLint                                                |
| `npm run lint:fix`         | ESLint with autofix                                   |
| `npm run typecheck`        | Generate route types, then `tsc --noEmit`             |
| `npm run format`           | Prettier write                                        |
| `npm run format:check`     | Prettier check (runs in CI)                           |
| `npm run emulators`        | Auth, Firestore and Storage emulators                 |
| `npm run emulators:export` | Save current emulator data to `.emulator-data`        |
| `npm run emulators:import` | Start emulators from `.emulator-data`, saving on exit |

## Project structure

```
src/
  app/              Routes only — layouts, pages, loading/error/not-found
  components/
    ui/             Design system (Button, Input, Modal, Card, Badge, ...)
    layout/         App shell, navigation
    theme/          Dark mode store, provider and toggle
  features/         One folder per domain: auth, workspaces, tasks, board,
                    comments, attachments, dashboard — each with its own
                    components, hooks, services and types
  lib/
    firebase/       SDK init, emulator wiring, error mapping
    utils/          Shared helpers
  hooks/            Cross-feature hooks
  types/            Shared domain types
tests/
  rules/            Firestore and Storage security rules tests
  e2e/              Playwright end-to-end tests
firestore.rules     Firestore security rules
storage.rules       Storage security rules
```

Three rules keep the layering honest:

- Files in `app/` compose feature components and hold no business logic.
- Components never touch Firebase directly — they use hooks, and hooks use
  services in `features/*/services` or `lib/firebase`.
- Colours and radii come from the tokens in `src/app/globals.css`, never from
  raw palette classes, so light and dark mode stay in sync by construction.

## Design system

Dark-first. The page sits on a near-black canvas and hierarchy comes from a
four-step surface ladder (`canvas` → `surface-1` → `surface-2` → …) plus 1px
hairline borders — **nothing in the app casts a shadow except the modal**.
A single lavender accent marks the primary action, the brand mark and the
focus ring; it is never decorative. Priority and status get a small
badge-only palette, always paired with a text label so colour is never the
only signal.

Every token pair is measured against WCAG AA. Where a value failed, it was
changed rather than copied — the full audit and a re-runnable script live in
`.design/linear-reskin/`.

```
bg-canvas  bg-surface-1..4   border-hairline[-strong|-tertiary]
text-ink   text-ink-muted    text-ink-subtle   text-ink-tertiary
bg-accent  text-accent-soft  bg-danger-solid
text-body-sm (14px base)  text-body (prose)  text-headline  text-caption
rounded-md (8px, controls)  rounded-lg (12px, cards)  rounded-full
```

## Security

Permissions are enforced in `firestore.rules` and `storage.rules`; the UI only
checks permissions to decide what to show. Both rule files currently deny all
access, and each collection is opened up — with tests — as the feature that
needs it lands.

## Roadmap

Authentication → workspaces and roles → task CRUD with real-time sync →
drag-and-drop Kanban board → comments and attachments → search, filter, sort
and dashboard → hardening, tests and deployment.
