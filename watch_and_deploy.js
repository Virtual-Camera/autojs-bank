const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const DEPLOY_SCRIPT = 'deploy.bat';
const IGNORED_DIRS = ['.git', 'node_modules', '.custom_states', '.agent'];
const DEBOUNCE_MS = 1000;

let debounceTimer = null;
let isDeploying = false;
let last_deploy = 0;

console.log(`Analyzing project structure...`);
console.log(`Watching for file changes to run ${DEPLOY_SCRIPT}...`);

// Hàm chạy deploy.bat
function runDeploy() {
    if (isDeploying) return;
    if (Date.now() - last_deploy < 10000) {
        console.log(`\n[${new Date().toLocaleTimeString()}] Deploy is running...`);
        return;
    }
    isDeploying = true;
    last_deploy = Date.now();

    console.log(`\n[${new Date().toLocaleTimeString()}] Change detected. Running deploy...`);

    // Spawn child process to run the batch file
    const child = spawn('cmd.exe', ['/c', DEPLOY_SCRIPT], { stdio: 'inherit' });

    child.on('close', (code) => {
        console.log(`Deploy finished with code ${code}`);
        isDeploying = false;
        console.log('Waiting for changes...');
    });
}

// Logic debounce để tránh chạy nhiều lần khi save 1 file
function onFileChange(eventType, filename) {
    if (!filename) return;

    // Check ignored directories
    for (const ignored of IGNORED_DIRS) {
        if (filename.includes(ignored) || filename.startsWith(ignored)) return;
    }

    // Check if it's the deploy script itself (optional, to avoid loops if deploy modifies something, though unlikely)
    if (filename === 'watch_and_deploy.js') return;

    // Clear old timer
    if (debounceTimer) clearTimeout(debounceTimer);

    // Set new timer
    debounceTimer = setTimeout(() => {
        runDeploy();
    }, DEBOUNCE_MS);
}

// Start Watching
try {
    fs.watch('.', { recursive: true }, onFileChange);
} catch (e) {
    console.error("Error watching files:", e);
    console.log("Fallback: Watching specific folders if recursive watch fails.");
    // Fallback logic could go here if needed, but Windows supports recursive watch mostly.
}
