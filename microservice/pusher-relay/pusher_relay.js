const WebSocket = require("ws");
const Pusher = require("pusher-js/node");
const url = require('url');

const PORT = 8787;
const wss = new WebSocket.Server({ port: PORT });

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
    console.log(`[Connect] ${clientId} -> Key: ${key}, Channel: ${channel}, Event: ${event || '*'}`);

    // 3. Initialize Pusher for this client
    let pusher;
    try {
        pusher = new Pusher(key, {
            cluster: cluster,
        });
    } catch (e) {
        console.error(`[Error] Failed to init Pusher for ${clientId}:`, e);
        ws.close();
        return;
    }

    // 4. Subscribe
    const pusherChannel = pusher.subscribe(channel);

    pusherChannel.bind('pusher:subscription_succeeded', () => {
        console.log(`[Subscribed] ${clientId} -> ${channel}`);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'system',
                status: 'subscribed',
                channel: channel
            }));
        }
    });

    pusherChannel.bind('pusher:subscription_error', (status) => {
        console.log(`[Sub Error] ${clientId} -> ${channel}:`, status);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'system',
                status: 'error',
                message: 'Subscription failed',
                data: status
            }));
        }
    });

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

    // Function to forward data to WS
    const forwardEvent = (eventName, data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                channel: channel,
                event: eventName,
                data: data,
                ts: Date.now()
            }));
        }
    };

    if (event) {
        // Bind to specific event
        pusherChannel.bind(event, (data) => forwardEvent(event, data));
    } else {
        // Bind to all events (Note: pusher-js doesn't support global bind on channel easily in all versions, 
        // using bind_global on the client level catches EVERYTHING for that client)
        pusher.bind_global((eventName, data) => {
            // Filter out internal pusher events if desired, or keep them useful for debug
            // Only forward if it matches our channel (though we created a fresh client, so it should be fine)
            // But 'bind_global' catches events from ALL channels on this client. 
            // Since we limit 1 channel per client here, it's safe.
            if (eventName.startsWith('pusher:')) return;
            forwardEvent(eventName, data);
        });
    }

    // 6. Cleanup on Disconnect
    ws.on('close', () => {
        console.log(`[Disconnect] ${clientId}`);
        // Unsubscribe and disconnect Pusher to prevent leaks
        try {
            pusher.unsubscribe(channel);
            pusher.disconnect();
        } catch (e) {
            console.error("Error cleaning up pusher:", e);
        }
    });

    ws.on('error', (e) => {
        console.error(`[WS Error] ${clientId}:`, e);
    });
});
