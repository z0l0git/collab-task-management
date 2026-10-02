import { call, commitWrite } from "./helpers.mjs";
import { run as users } from "./users.mjs";
import { run as workspaces } from "./workspaces.mjs";

const suites = [
  ["users", users],
  ["workspaces", workspaces],
];

const main = async () => {
  let total = 0;
  let failed = 0;

  for (const [name, load] of suites) {
    console.log(`\n${name}`);
    const cases = await load();

    for (const [label, expected, options] of cases) {
      const { method, path, token, body, serverTimestamps } = options;
      const status = serverTimestamps
        ? await commitWrite(path, body.fields, { token, serverTimestamps })
        : await call(method, path, { token, body });
      const ok = status === expected;
      total += 1;
      if (!ok) failed += 1;
      console.log(
        `  ${ok ? "pass" : "FAIL"}  got ${status}, want ${expected}  ${label}`,
      );
    }
  }

  console.log(`\n${total} checks, ${failed} failing`);
  if (failed > 0) process.exit(1);
};

main().catch((error) => {
  console.error(
    "Rules checks could not run. Start the emulators: npm run emulators",
  );
  console.error(error.message);
  process.exit(1);
});
