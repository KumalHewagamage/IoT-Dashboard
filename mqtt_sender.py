import paho.mqtt.client as mqtt
import json
import time
import random

# MQTT broker details
BROKER_ADDRESS = "localhost"  # Replace with your broker address
PORT = 1883
TOPICS = ["temp1", "temp2", "temp3", "temp4"]  # Topics for multiple devices

# Function to simulate publishing data for multiple devices
def simulate_devices():
    client = mqtt.Client()
    client.connect(BROKER_ADDRESS, PORT, 60)
    print("[DEBUG] Connected to MQTT broker")

    try:
        while True:
            for topic in TOPICS:
                # Generate random data
                data = {
                    "temperature": round(random.uniform(20.0, 30.0), 2),
                    "humidity": round(random.uniform(30.0, 70.0), 2),
                    "co2": round(random.uniform(400, 800), 2)
                }
                payload = json.dumps(data)

                # Publish to the respective topic
                client.publish(topic, payload)
                print(f"[DEBUG] Sent to {topic}: {payload}")

                time.sleep(1)  # Short delay between each device data

    except KeyboardInterrupt:
        print("[DEBUG] Simulation stopped.")
    finally:
        client.disconnect()
        print("[DEBUG] Disconnected from MQTT broker")

if __name__ == "__main__":
    simulate_devices()
