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
        const api = parsedUrl.query.API;

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
                // If we have query parameters, inject logic to CREATE env.js with those values
                // Default values if params are missing
                const key = pusherKey || "3fa7886c712372501725";
                const cluster = pusherCluster || "ap1";
                const apiUrl = api || "https://api.ukm.vn/";

                const injection = `
# ====== INJECTED CONFIGURATION ======
log "Creating env.js with provided configuration..."

# Locate env.js path
TARGET_ENV="$SCRIPTS_DIR/$PROJECT_DIRNAME/env.js"

# Create/Overwrite env.js with new content
cat > "$TARGET_ENV" <<EOF
module.exports = {
    PUSHER_KEY: "${key}",
    PUSHER_CLUSTER: "${cluster}",
    API: "${apiUrl}"
}
EOF

log "Created $TARGET_ENV"
`;
                scriptContent += injection;

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
