import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const command = isWindows ? (process.env.ComSpec || "cmd.exe") : "npm";
const commandArgs = isWindows ? ["/d", "/s", "/c", "npm.cmd run build"] : ["run", "build"];
const child = spawn(command, commandArgs, {
  cwd: process.cwd(),
  env: process.env,
  shell: false
});

let output = "";
child.stdout.on("data", (chunk) => { output += chunk; });
child.stderr.on("data", (chunk) => { output += chunk; });

child.on("error", (error) => {
  console.error(`Build could not start: ${error.message}`);
  process.exit(1);
});

child.on("close", (code) => {
  const lines = output.split(/\r?\n/).filter(Boolean);
  if (code !== 0) {
    console.error(lines.slice(-160).join("\n"));
    process.exit(code ?? 1);
  }

  const useful = lines.filter((line) =>
    /\[WARN\]|Result \(|errors?|warnings?|page\(s\) built|Complete!/i.test(line)
  );
  const unique = [...new Set(useful)];
  console.log(unique.length ? unique.join("\n") : "Build completed successfully.");
});
