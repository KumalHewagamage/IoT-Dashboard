#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "SLT-FTTH-3042";
const char* password = "Slt@2223042";

// MQTT broker details
const char* mqtt_server = "192.168.1.4";
const int mqtt_port = 1883;
const char* mqtt_topic = "esptest";
const char* mqtt_control_topic = "esptest-control";

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
  delay(10);
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected!");
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.println(topic);

  // Check if the message is for the control topic
  if (strcmp(topic, mqtt_control_topic) == 0) {
    // Decode the JSON payload
    StaticJsonDocument<128> doc;
    DeserializationError error = deserializeJson(doc, payload, length);

    if (error) {
      Serial.print("Failed to parse control message: ");
      Serial.println(error.c_str());
      return;
    }

    // Extract control values
    bool fansState = doc["fansState"] | false;
    bool lightsState = doc["lightsState"] | false;
    bool hvacState = doc["hvacState"] | false;

    // Print control values
    Serial.println("Control Data:");
    Serial.print("Fans State: ");
    Serial.println(fansState ? "ON" : "OFF");
    Serial.print("Lights State: ");
    Serial.println(lightsState ? "ON" : "OFF");
    Serial.print("HVAC State: ");
    Serial.println(hvacState ? "ON" : "OFF");
  }
}

void reconnect() {
  // Loop until connected
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    if (client.connect("ESP32Client")) {
      Serial.println("MQTT connected!");

      // Subscribe to the control topic
      client.subscribe(mqtt_control_topic);
      Serial.print("Subscribed to: ");
      Serial.println(mqtt_control_topic);
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Generate random data
  float temperature = random(200, 300) / 10.0;
  float humidity = random(300, 700) / 10.0;
  float co2 = random(400, 800);

  // Create JSON payload
  StaticJsonDocument<128> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["co2"] = co2;

  char payload[128];
  serializeJson(doc, payload);

  // Publish data to MQTT topic
  Serial.print("Publishing data: ");
  Serial.println(payload);
  client.publish(mqtt_topic, payload);

  delay(5000); // Send data every 5 seconds
}
