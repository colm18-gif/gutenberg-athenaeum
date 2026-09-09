import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceDirectory = path.resolve("texts");
const outputDirectory = path.join(sourceDirectory, "local");
const files = (await readdir(sourceDirectory))
  .filter((name) => /^pg\d+\.txt$/i.test(name))
  .sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)));

await mkdir(outputDirectory, { recursive: true });

for (const filename of files) {
  const id = filename.match(/\d+/)[0];
  const text = await readFile(path.join(sourceDirectory, filename), "utf8");
  const encoded = JSON.stringify(text)
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
  const moduleText =
    "window.ATHENAEUM_LOCAL_TEXTS = window.ATHENAEUM_LOCAL_TEXTS || {};\n" +
    `window.ATHENAEUM_LOCAL_TEXTS[${JSON.stringify(id)}] = ${encoded};\n`;
  await writeFile(path.join(outputDirectory, `pg${id}.js`), moduleText, "utf8");
}

console.log(`Prepared ${files.length} local book scripts in ${outputDirectory}`);
