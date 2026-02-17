const WebSocket = require("ws");
const Pusher = require("pusher-js/node");
const url = require('url');

const PORT = 8787;
const wss = new WebSocket.Server({ port: PORT });
const relayPools = new Map();

console.log(`Relay Server started on ws://0.0.0.0:${PORT}`);
console.log("Usage: ws://<IP>:8787/?key=<APP_KEY>&cluster=<CLUSTER>&channel=<CHANNEL>&event=<EVENT>");

wss.on('connection', (ws, req) => {
    // 1. Parse Query Params
    const query = url.parse(req.url, true).query;
    const { key, cluster, channel, event } = query;
    console.log(`[Connect] ${req.socket.remoteAddress} -> Key: ${key}, Cluster: ${cluster}, Channel: ${channel}, Event: ${event || '*'}`);
    // 2. Validation
    if (!key || !cluster || !channel) {
        console.log(`[Reject] Missing params from ${req.socket.remoteAddress}`);
        ws.send(JSON.stringify({
            status: 'error',
            message: "Missing required params: key, cluster, channel. (event is optional)"
        }));
        ws.close();
        return;
    }

    const clientId = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
    const eventKey = event || '*';
    const poolKey = `${key}|${cluster}|${channel}|${eventKey}`;
    console.log(`[Connect] ${clientId} -> Key: ${key}, Channel: ${channel}, Event: ${eventKey}`);

    // 3. Reuse Pusher connection for same config
    let pool = relayPools.get(poolKey);
    if (!pool) {
        let pusher;
        try {
            pusher = new Pusher(key, { cluster });
        } catch (e) {
            console.error(`[Error] Failed to init Pusher for ${clientId}:`, e);
            ws.close();
            return;
        }

        const pusherChannel = pusher.subscribe(channel);
        pool = {
            key,
            cluster,
            channel,
            event: eventKey,
            pusher,
            pusherChannel,
            clients: new Set(),
            forward: (eventName, data) => {
                console.log(`[Pusher Event] ${poolKey} -> ${eventName}`);
                const payload = JSON.stringify({
                    channel: channel,
                    event: eventName,
                    data: data,
                    ts: Date.now()
                });
                for (const client of pool.clients) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(payload);
                    }
                }
            }
        };

        pusherChannel.bind('pusher:subscription_succeeded', () => {
            console.log(`[Subscribed] ${poolKey}`);
            for (const client of pool.clients) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'system',
                        status: 'subscribed',
                        channel: channel
                    }));
                }
            }
        });

        pusherChannel.bind('pusher:subscription_error', (status) => {
            console.log(`[Sub Error] ${poolKey}:`, status);
            for (const client of pool.clients) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'system',
                        status: 'error',
                        message: 'Subscription failed',
                        data: status
                    }));
                }
            }
        });

        if (event) {
            pusherChannel.bind(event, (data) => pool.forward(event, data));
        } else {
            pusher.bind_global((eventName, data) => {
                if (eventName.startsWith('pusher:')) return;
                pool.forward(eventName, data);
            });
        }

        relayPools.set(poolKey, pool);
    }

    pool.clients.add(ws);

    // 5. Handle Events
    ws.on('message', (msg) => {
        try {
            const text = msg.toString();
            if (text === 'ping') {
                // Heartbeat from client
                console.log(`[Ping] from ${clientId}`);
                if (ws.readyState === WebSocket.OPEN) ws.send('pong');
                return;
            }
        } catch (e) { /* ignore non-text */ }
    });

    // 6. Cleanup on Disconnect
    ws.on('close', () => {
        console.log(`[Disconnect] ${clientId}`);
        const pool = relayPools.get(poolKey);
        if (!pool) return;
        pool.clients.delete(ws);
        if (pool.clients.size === 0) {
            // Unsubscribe and disconnect Pusher to prevent leaks
            try {
                pool.pusher.unsubscribe(channel);
                pool.pusher.disconnect();
            } catch (e) {
                console.error("Error cleaning up pusher:", e);
            } finally {
                relayPools.delete(poolKey);
            }
        }
    });

    ws.on('error', (e) => {
        console.error(`[WS Error] ${clientId}:`, e);
    });
});
