import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const templateUrl = new URL("../public/sw.template.js", import.meta.url);
const template = await readFile(templateUrl, "utf8");
// Only public assets are cached. A content digest also works before a Next build.
const version = createHash("sha256").update(template).digest("hex").slice(0, 16);
await writeFile(new URL("../public/sw.js", import.meta.url), template.replaceAll("__BUILD_ID__", version));
