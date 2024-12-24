const WebSocket = require("ws");
const express = require("express");
const cors = require("cors"); // Import cors middleware
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000; // Backend server port
const WS_PORT = 8080; // WebSocket server port

// Middleware to parse JSON body
app.use(express.json());

// Enable CORS
app.use(cors());

// Path to the JSON file
const JSON_FILE = path.join(__dirname, "src/assets/device_config.json");

// Routes
app.get("/api/devices", (req, res) => {
  fs.readFile(JSON_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("[ERROR] Reading JSON file:", err);
      return res.status(500).send({ error: "Failed to read JSON file" });
    }
    try {
      const jsonData = JSON.parse(data);
      res.send(jsonData);
    } catch (parseError) {
      console.error("[ERROR] Parsing JSON file:", parseError);
      res.status(500).send({ error: "Invalid JSON format" });
    }
  });
});

app.post("/api/devices", (req, res) => {
  const newDevice = req.body; // The device data sent from the client

  fs.readFile(JSON_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("[ERROR] Reading JSON file:", err);
      return res.status(500).send({ error: "Failed to read JSON file" });
    }

    try {
      const devices = JSON.parse(data).devices || [];
      const deviceIndex = devices.findIndex((device) => device.name === newDevice.name);

      if (deviceIndex >= 0) {
        // Update existing device
        devices[deviceIndex] = newDevice;
      } else {
        // Add new device
        devices.push(newDevice);
      }

      fs.writeFile(JSON_FILE, JSON.stringify({ devices }, null, 4), "utf8", (writeErr) => {
        if (writeErr) {
          console.error("[ERROR] Writing JSON file:", writeErr);
          return res.status(500).send({ error: "Failed to write JSON file" });
        }
        res.send({ success: true, message: "Device updated successfully" });
      });
    } catch (parseError) {
      console.error("[ERROR] Parsing JSON file:", parseError);
      res.status(500).send({ error: "Invalid JSON format" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`[DEBUG] JSON API server running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ port: WS_PORT });

console.log(`[DEBUG] WebSocket server is running on ws://localhost:${WS_PORT}`);

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", (ws) => {
  console.log("[DEBUG] New client connected");

  ws.on("message", (message) => {
    console.log(`[DEBUG] Received from Python: ${message}`);
    broadcast(JSON.parse(message));
  });

  ws.on("close", () => {
    console.log("[DEBUG] Client disconnected");
  });
});
