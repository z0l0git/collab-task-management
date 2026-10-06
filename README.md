# Collab Taskboard

**Demo:** [https://collab-task-management.vercel.app](https://collab-task-management.vercel.app)

## Features

- Бүртгүүлэх, нэвтрэх (email эсвэл Google)
- Workspace: owner, member эрх; owner гишүүн нэмж хасна
- Task: төлөв, priority, хариуцагч, due date, label, тайлбар. Өөрчлөлт шууд
  хадгалагдана
- Kanban board (drag & drop), list view, өөрийн төлөвүүд (custom status)
- Real-time: task, comment, гишүүнчлэл refresh хийлгүй шинэчлэгдэнэ
- Comment, файл хавсралт (зургийн preview). Demo дээр хавсралт унтраалттай
- Хайлт, шүүлтүүр, эрэмбэлэлт. URL-д хадгалагдана
- Dashboard: төлөв бүрийн тоо, хугацаа хэтэрсэн, надад оноогдсон
- Light/dark mode, гар утас, таблет, desktop

## Used Technology

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
Firebase Auth, Firestore, Storage · dnd-kit · lucide-react ·
Vitest + Testing Library · Firebase Emulator Suite · GitHub Actions · Vercel

## Get Started

Node.js 22+ болон Java (emulator-т хэрэгтэй) суусан байх ёстой.

```bash
git clone https://github.com/z0l0git/collab-task-management.git
cd collab-task-management
npm install
cp .env.example .env.local
```

`.env.local`-д дараах утгуудыг оруулна. Жинхэнэ Firebase project хэрэггүй:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-collab-task.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-collab-task
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-collab-task.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:0000000000000000000000
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
```

```bash
npm run dev:local   # app :3000, emulator UI :4000
```

Emulator болон `next dev` нэг terminal дээр асна. Ctrl+C дарахад emulator-ын
өгөгдөл `.emulator-data`-д хадгалагдана.

| Команд                       | Үйлдэл                       |
| ---------------------------- | ---------------------------- |
| `npm run dev:local`          | Emulator + dev server        |
| `npm run dev`                | Зөвхөн dev server            |
| `npm run emulators`          | Зөвхөн emulator              |
| `npm run build`, `npm start` | Production build, ажиллуулах |
| `npm test`                   | Unit, component тест         |

## Environment variables

Бүгд `.env.example`-д тайлбартай. Firebase-ийн 6 утгыг Firebase console →
Project settings → Web app-аас авна. Эдгээр нь нууц биш, өгөгдлийг security
rules хамгаална.

| Хувьсагч                                       | Утга                                          |
| ---------------------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_*` (6)                   | Firebase web config                           |
| `NEXT_PUBLIC_USE_FIREBASE_EMULATORS`           | Local дээр `true`, production-д `false`       |
| `NEXT_PUBLIC_ATTACHMENTS_ENABLED`              | `false` бол файл хавсралтыг нууна             |
| `NEXT_PUBLIC_FIREBASE_EMULATOR_HOST`, `…_PORT` | Emulator хаяг, default нь `firebase.json`-оос |

Firebase-ийн аль нэг утга дутуу бол build дээрээ алдаа заана.

## Folder Structure

```
src/
  app/            route, layout, error / loading / not-found
  components/     ui/ (Button, Modal, Menu…), layout/, theme/
  features/       auth, workspaces, tasks, board, comments, attachments,
                  dashboard: component + hooks/
  services/       Firebase бичилт, уншилт
  lib/firebase/   SDK, emulator, алдааны мессеж, converters/
  lib/utils/      туслах функц: ordering, dueDate, statuses, taskFilters
  hooks/          олон feature ашигладаг hook
  types/          domain type
tests/rules/      security rules тест
firestore.rules, storage.rules, firestore.indexes.json
```

## Firestore data model

```
users/{uid}
  id, displayName, email, emailLower, photoURL, createdAt, updatedAt

workspaces/{workspaceId}
  name, description, ownerId
  memberIds: string[]
  members: { [uid]: { role, displayName, email, photoURL } }
  labels: string[]
  statuses?: { [id]: { name, color, done, order } }
  createdAt, updatedAt

  tasks/{taskId}
    title, description, status, priority, assigneeId, dueDate,
    labels, order, createdBy, createdAt, updatedAt

    comments/{commentId}
      authorId, authorName, authorPhotoURL, message, createdAt

    attachments/{attachmentId}
      name, size, contentType, storagePath, uploadedBy, createdAt

Storage: workspaces/{workspaceId}/tasks/{taskId}/{attachmentId}
```

- `memberIds` нь query, rules-д; `members` нь нэр, зураг харуулахад.
  Санаатай давхар хадгалсан
- Task төлөвийн нэрийг биш id-г хадгална, тиймээс нэр солиход task
  өөрчлөгдөхгүй. `statuses` байхгүй бол Todo / In progress / Done
- Comment, attachment нь task-ийн subcollection, task нээхэд л ачаална

## Security

Эрхийг `firestore.rules`, `storage.rules` шалгана. UI зөвхөн юу харуулахаа
шийднэ.

- Нэвтрээгүй хэрэглэгч үйлдэл хийх боломжгүй
- Уригдсан гишүүд л Wоrkspace ийг харна
- Owner: workspace засах, гишүүн, label, status удирдах, устгах. Member зөвхөн
  өөрөө гарч болно
- Task-ийг гишүүн бүр засаж болно, үүсгэсэн хүн эсвэл owner л устгана
- Comment засагдахгүй, зөвхөн бичсэн хүн устгана

`npm run test:rules`: emulator дээр 90 шалгалт, CI дээр бас ажиллана.

## Гол шийдэлүүд

| Шийдэл                                                                | Яагаад                                                                                                            | Сул тал                                                              |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Dashboard-ийн тоог `count()` query-гээр авсан                         | Бүх task-ийг татахгүйгээр нийт тоог цөөхөн read-ээр гаргана                                                       | Шууд шинэчлэгддэггүй; хуудас нээх эсвэл tab руу буцахад шинэчлэгдэнэ |
| Drag & drop-д dnd-kit ашигласан                                       | Утсан дээр хуруугаар чирж болно, accessibility сайн                                                               | Нэмэлт dependency                                                    |
| Owner өөрийн төлөвүүдийг үүсгэнэ, аль нь "дууссан" гэдгийг тэмдэглэнэ | Төлөвийн нэр юыгаар ч өгж болох тул app "дууссан"-ыг нэрээр нь таньж чадахгүй. энэ тэмдгээр дууссан гэж харуулдаг | Rules төлөвийн тоог л шалгана, доторх утгыг шалгаж чадахгүй          |
| Task-ийн утга автоматаар хадгалагдана, шинэ task form-оор үүснэ       | Нэг утга засахад Save дарах шаардлагагүй; Create дарах хүртэл task үүсэхгүй                                       | Өөрчлөлт бүр тусдаа write болно                                      |
| Гишүүнийг email-ээр нэмнэ (бүртгэлтэй хэрэглэгч)                      | Урилгын систем хийх шаардлагагүй, энгийн                                                                          | Нэмэгдэх хүн эхлээд бүртгүүлсэн байх ёстой                           |
| Route-ийг client талд хамгаална                                       | Firebase client SDK-тай хамгийн энгийн; өгөгдлийг rules хамгаална                                                 | Анх ороход богино хугацаанд loading харагдана                        |

## Design

[Linear](https://linear.app)-аас санаа авсан. Light, dark
mode. Өнгө, хэмжээ бүгд `globals.css`-д нэг дор.

## Test and CI

- `npm test`: filter, sort, ordering, converter, validation, гол component-ууд
  (45 тест)
- `npm run test:rules`: 90 шалгалт
- GitHub Actions push бүр дээр format, lint, typecheck, test, build, rules
  ажиллуулсан.

## Limitation

- **Demo дээр файл хавсралт ажиллахгүй.** Шинэ Storage bucket үүсгэхэд Blaze (төлбөртэй) plan шаардлагатай болсон тул үүнийг хийх боломжгүй байсан.
- **Workspace устгахад task-ууд нь үлдэнэ.** Firestore subcollection-ийг
  автоматаар устгадаггүй. Rules-ийн улмаас хэн ч уншиж чадахгүй ч өгөгдөл
  үлдэнэ.

## Үргэлжлүүлж хийхээр бол

- Cloud Functions: workspace устгахад цэвэрлэх, зургийн thumbnail
- Activity history, notification
- Playwright E2E тест
- Бүртгэлгүй хүнд урилга илгээх
- Том workspace-д server-side хайлт (Algolia)
- Offline дэмжлэг
