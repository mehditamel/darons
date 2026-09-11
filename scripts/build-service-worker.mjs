import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const templateUrl = new URL("../public/sw.template.js", import.meta.url);
const template = await readFile(templateUrl, "utf8");
// Every production build invalidates cached icons, manifest and offline content,
// even when the worker template itself did not change. Dev has no build ID yet.
const buildId = await readFile(new URL("../.next/BUILD_ID", import.meta.url), "utf8")
  .catch(() => String(Date.now()));
const version = createHash("sha256").update(template).update(buildId).digest("hex").slice(0, 16);
await writeFile(new URL("../public/sw.js", import.meta.url), template.replaceAll("__BUILD_ID__", version));
