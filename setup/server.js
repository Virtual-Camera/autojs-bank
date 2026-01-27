const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 2910;
const BASH_URL = 'https://raw.githubusercontent.com/Virtual-Camera/autojs-bank/refs/heads/main/setup/bash.sh';

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET' && parsedUrl.pathname === '/bash') {
        const pusherKey = parsedUrl.query.PUSHER_KEY;
        const pusherCluster = parsedUrl.query.PUSHER_CLUSTER;

        console.log(`[${new Date().toISOString()}] Received request for /bash`);

        https.get(BASH_URL, (proxyRes) => {
            if (proxyRes.statusCode !== 200) {
                res.writeHead(proxyRes.statusCode, { 'Content-Type': 'text/plain' });
                res.end(`Failed to fetch script from GitHub. Status: ${proxyRes.statusCode}`);
                return;
            }

            let scriptContent = '';

            proxyRes.on('data', (chunk) => {
                scriptContent += chunk;
            });

            proxyRes.on('end', () => {
                // If we have query parameters, inject the sed logic to update env.js
                if (pusherKey || pusherCluster) {
                    const injection = `
# ====== INJECTED CONFIGURATION ======
log "Applying injected configuration..."

# Locate env.js (Created after sync_repo)
TARGET_ENV="$SCRIPTS_DIR/$PROJECT_DIRNAME/env.js"

if [ -f "$TARGET_ENV" ]; then
    ${pusherKey ? `log "Updating PUSHER_KEY..."
    sed -i -e "s|PUSHER_KEY: \\\".*\\\"|PUSHER_KEY: \\\"${pusherKey}\\\"|"` : ''} "${pusherCluster ? ` -e "s|PUSHER_CLUSTER: \\\".*\\\"|PUSHER_CLUSTER: \\\"${pusherCluster}\\\"|"` : ''} "$TARGET_ENV"
    log "Configuration updated in $TARGET_ENV"
else
    warn "env.js not found at $TARGET_ENV. Skipping configuration update."
fi
`;
                    // Append before the final 'log "Done."' if possible, or just append to end.
                    // The original script ends with `log "Done."`. 
                    // To be safe and ensure variables like SCRIPTS_DIR are available, we append it.
                    scriptContent += injection;
                }

                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(scriptContent);
            });

        }).on('error', (e) => {
            console.error(`Error fetching from GitHub: ${e.message}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error while fetching script');
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Endpoint available at: http://localhost:${PORT}/bash`);
});
