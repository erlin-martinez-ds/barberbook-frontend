import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createMockApiServer } from "./mock-api.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const appPort = Number(process.env.E2E_APP_PORT ?? 4173);
const apiPort = Number(process.env.E2E_API_PORT ?? 4174);
const appUrl = `http://127.0.0.1:${appPort}`;
const apiUrl = `http://127.0.0.1:${apiPort}/api`;
const apiServer = createMockApiServer();
let vite;

function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForUrl(url, child) {
  const deadline = Date.now() + 30000;
  let lastError;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Vite cerró antes de iniciar (código ${child.exitCode}).`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await wait(300);
  }
  throw new Error(`Tiempo agotado esperando ${url}: ${lastError?.message ?? "sin respuesta"}`);
}

function stopProcess(child) {
  if (child && child.exitCode === null) child.kill();
}

async function runTests() {
  const testProcess = spawn(
    process.execPath,
    ["--test", "--test-concurrency=1", "e2e/barberbook.e2e.test.js"],
    { cwd: root, env: { ...process.env, E2E_BASE_URL: appUrl }, stdio: "inherit" },
  );
  return new Promise((resolve, reject) => {
    testProcess.once("error", reject);
    testProcess.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`Las pruebas E2E terminaron con código ${code ?? signal}.`));
    });
  });
}

try {
  await listen(apiServer, apiPort);
  vite = spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(appPort), "--strictPort"],
    {
      cwd: root,
      env: { ...process.env, VITE_API_URL: apiUrl },
      stdio: "inherit",
    },
  );
  await waitForUrl(appUrl, vite);
  await runTests();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  stopProcess(vite);
  await new Promise((resolve) => apiServer.close(resolve));
}
