import process from "node:process";
import "./load-root-env.mjs";

const command = process.argv[2];
const commandModules = {
  next: "next/dist/bin/next",
  payload: new URL("../node_modules/payload/bin.js", import.meta.url).href,
  tsx: "tsx/cli",
};

if (!command || !(command in commandModules)) {
  console.error("Perintah CMS tidak dikenali oleh pembungkus environment.");
  process.exitCode = 1;
} else {
  process.argv.splice(2, 1);
  await import(commandModules[command]);
}
