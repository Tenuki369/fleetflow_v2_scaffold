import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, "package.json");
const workflowsDir = path.join(repoRoot, ".github", "workflows");

const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
const scripts = new Set(Object.keys(packageJson.scripts ?? {}));
const workflowFiles = (await readdir(workflowsDir)).filter((file) => file.endsWith(".yml"));

const missing = [];

for (const workflowFile of workflowFiles) {
  const workflowPath = path.join(workflowsDir, workflowFile);
  const workflow = await readFile(workflowPath, "utf8");
  const matches = workflow.matchAll(/\bnpm(?:\.cmd)?\s+run\s+([A-Za-z0-9:_-]+)/g);

  for (const match of matches) {
    const scriptName = match[1];
    if (!scripts.has(scriptName)) {
      missing.push({ workflowFile, scriptName });
    }
  }
}

if (missing.length > 0) {
  console.error("Workflow scripts validation failed.");
  for (const entry of missing) {
    console.error(`- ${entry.workflowFile} references missing npm script "${entry.scriptName}"`);
  }
  process.exit(1);
}

console.log(`Workflow scripts validation passed for ${workflowFiles.length} workflow file(s).`);
