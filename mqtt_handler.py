import paho.mqtt.client as mqtt
import json
import websocket
import os

# MQTT broker details
BROKER_ADDRESS = "localhost"  # Replace with your broker address
PORT = 1883
CONFIG_FILE = r"src\assets\device_config.json"

# WebSocket server details
WEBSOCKET_URL = "ws://localhost:8080"  # Replace with your WebSocket server URL

# Load device configuration
def load_device_config():
    if not os.path.exists(CONFIG_FILE):
        print(f"[ERROR] Config file {CONFIG_FILE} not found!")
        return {}
    try:
        with open(CONFIG_FILE, "r") as file:
            config = json.load(file)
            return config
    except Exception as e:
        print(f"[ERROR] Failed to load config file: {e}")
        return {}

# Initialize WebSocket connection
def send_to_websocket(data):
    try:
        ws = websocket.create_connection(WEBSOCKET_URL)
        ws.send(json.dumps(data))
        ws.close()
    except Exception as e:
        print("Error sending data to WebSocket: {}".format(e))

# Publish control state to MQTT if changed
def publish_control_states(client, device_config, previous_states):
    for device in device_config.get("devices", []):
        try:
            topic = device.get("topic")
            if not topic:
                continue

            control_data = {
                "fansState": device.get("fansState", False),
                "lightsState": device.get("lightsState", False),
                "hvacState": device.get("hvacState", False)
            }

            # Check if the state has changed
            if topic not in previous_states or previous_states[topic] != control_data:
                control_topic = f"{topic}-control"
                print(f"Publishing control state to topic: {control_topic}")
                print(f"Control data: {control_data}")

                client.publish(control_topic, json.dumps(control_data))
                previous_states[topic] = control_data

        except Exception as e:
            print(f"[ERROR] Failed to publish control state: {e}")

# Callback for when the client connects to the broker
def on_connect(client, userdata, flags, rc):
    device_config = userdata["config"]
    for device in device_config.get("devices", []):
        topic = device.get("topic")
        if topic:
            client.subscribe(topic)

# Callback for when a message is received from the broker
def on_message(client, userdata, msg):
    try:
        message_json = msg.payload.decode("utf-8")
        message = json.loads(message_json)

        # Enrich data with device metadata
        device_config = userdata["config"]
        device_info = next((d for d in device_config["devices"] if d["topic"] == msg.topic), {})
        message.update({
            "device_name": device_info.get("name", "Unknown"),
            "location": device_info.get("location", "Unknown"),
            "topic": msg.topic
        })

        # Send data to WebSocket
        send_to_websocket(message)

    except Exception as e:
        print(f"[ERROR] Error decoding message: {e}")

# Main function
def main():
    # Load device configuration
    device_config = load_device_config()
    if not device_config:
        print("[ERROR] No valid device configuration. Exiting...")
        return

    # Initialize the MQTT client
    client = mqtt.Client(userdata={"config": device_config})
    client.on_connect = on_connect
    client.on_message = on_message

    # Track previous states
    previous_states = {}

    # Connect to the MQTT broker
    client.connect(BROKER_ADDRESS, PORT, 60)

    # Start the MQTT client loop
    try:
        while True:
            device_config = load_device_config()

            if not device_config:
                continue

            # Update userdata and publish control states if changed
            client.user_data_set({"config": device_config})
            publish_control_states(client, device_config, previous_states)

            client.loop(timeout=1.0)

    except KeyboardInterrupt:
        pass
    finally:
        client.disconnect()

if __name__ == "__main__":
    main()
