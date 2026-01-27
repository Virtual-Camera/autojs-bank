const http = require('http');
const https = require('https');

const PORT = 2910;
const BASH_URL = 'https://raw.githubusercontent.com/Virtual-Camera/autojs-bank/refs/heads/main/setup/bash.sh';

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/bash') {
        console.log(`[${new Date().toISOString()}] Received request for /bash`);

        https.get(BASH_URL, (proxyRes) => {
            if (proxyRes.statusCode !== 200) {
                res.writeHead(proxyRes.statusCode, { 'Content-Type': 'text/plain' });
                res.end(`Failed to fetch script from GitHub. Status: ${proxyRes.statusCode}`);
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            proxyRes.pipe(res);
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
