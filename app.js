const express = require('express');
const app = express();
const port = 3000;

const WebSocket = require('ws');
const { getTaskDetails } = require('./widget');

app.use(express.json());

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

// WebSocket server setup
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    clients.push(ws);

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log('Client disconnected');
    });
});

// Webhook endpoint for Zoho CRM tasks
app.post('/webhook/tasks', async (req, res) => {
    const { id } = req.body;  // Task ID from webhook payload
    const taskDetails = await getTaskDetails(id);

    console.log('Full Task Details:', taskDetails);
    
    // Send task update to all WebSocket clients
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(taskDetails));
        }
    });

    res.status(200).send({ message: 'Task details fetched and broadcasted' });
});


app.get('/', (req, res) => {
  res.send('Hello, Node.js!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
