import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { FaHome } from "react-icons/fa";
import dashboardConfig from "../assets/dashboard_config.json";
import "./DeviceDetails.css";

// Register chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

function DeviceDetails() {
  const { deviceName } = useParams();
  const navigate = useNavigate();

  const [deviceData, setDeviceData] = useState({
    name: deviceName,
    temperature: "N/A",
    humidity: "N/A",
    co2: "N/A",
    fansState: false,
    lightsState: false,
    hvacState: false,
  });

  const [temperatureHistory, setTemperatureHistory] = useState([]);
  const [humidityHistory, setHumidityHistory] = useState([]);
  const [co2History, setCo2History] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);

  const theme = dashboardConfig.themes[dashboardConfig.defaultTheme]; // Get the active theme

  // Fetch device configuration from REST API
  useEffect(() => {
    const fetchDeviceConfig = async () => {
      try {
        console.log("[DEBUG] Fetching device configuration from REST API...");
        const response = await fetch("http://localhost:3000/api/devices");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const device = data.devices.find((d) => d.name === deviceName);
        if (device) {
          setDeviceData((prev) => ({ ...prev, ...device }));
        }
      } catch (error) {
        console.error("[ERROR] Failed to fetch device configuration:", error.message);
        alert("Failed to load device configuration. Please try again.");
      }
    };

    fetchDeviceConfig();
  }, [deviceName]);

  // Fetch real-time data from WebSocket for charts
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log(`[DEBUG] WebSocket connected for device: ${deviceName}`);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("[DEBUG] WebSocket message received:", message);

        if (message.device_name === deviceName) {
          const currentTime = new Date().toLocaleTimeString();

          setDeviceData((prev) => ({
            ...prev,
            temperature: message.temperature,
            humidity: message.humidity,
            co2: message.co2,
          }));

          setTemperatureHistory((prev) => [...prev.slice(-19), message.temperature]);
          setHumidityHistory((prev) => [...prev.slice(-19), message.humidity]);
          setCo2History((prev) => [...prev.slice(-19), message.co2]);
          setTimeLabels((prev) => [...prev.slice(-19), currentTime]);
        }
      } catch (error) {
        console.error("[ERROR] Failed to process WebSocket message:", error.message);
      }
    };

    socket.onerror = (error) => {
      console.error("[ERROR] WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("[DEBUG] WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, [deviceName]);

  // Update device state (fans, lights, HVAC)
  const handleControlStateChange = async (controlKey) => {
    const updatedState = !deviceData[controlKey];

    try {
      const response = await fetch("http://localhost:3000/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...deviceData,
          [controlKey]: updatedState,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to update device control state: ${error.error}`);
      }

      setDeviceData((prev) => ({
        ...prev,
        [controlKey]: updatedState,
      }));

      alert(`${controlKey} updated successfully: ${updatedState ? "ON" : "OFF"}`);
    } catch (error) {
      console.error("[ERROR] Failed to update control state:", error.message);
      alert("Failed to update control state. Please try again.");
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: theme.text,
          font: {
            family: "Arial",
            size: 14,
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutCubic",
    },
  };

  return (
    <div className="device-details" style={{ backgroundColor: theme.background }}>
      <div className="details-header">
        <h1 style={{ color: theme.primary, textShadow: "2px 2px 4px #000" }}>Device Details</h1>
        <button
          className="home-button"
          style={{
            background: theme.buttonBackground,
            color: theme.buttonText,
            borderRadius: "8px",
            padding: "10px 20px",
          }}
          onClick={() => navigate("/")}
        >
          <FaHome className="home-icon" />
          Home
        </button>
      </div>
      <h2 style={{ color: theme.text, textAlign: "center", textShadow: "1px 1px 3px #666" }}>
        Device: {deviceData.name}
      </h2>
      <div className="device-info">
        <p style={{ color: theme.text, fontWeight: "bold" }}>
          🌡️ Temperature: {deviceData.temperature} °C
        </p>
        <p style={{ color: theme.text, fontWeight: "bold" }}>
          💧 Humidity: {deviceData.humidity} %
        </p>
        <p style={{ color: theme.text, fontWeight: "bold" }}>
          ☁️ CO2: {deviceData.co2} ppm
        </p>
      </div>
      <div className="charts-container">
        <div className="chart">
          <h3 style={{ color: theme.primary, textAlign: "center" }}>Temperature</h3>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Temperature (°C)",
                  data: temperatureHistory,
                  borderColor: theme.accent1,
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
        <div className="chart">
          <h3 style={{ color: theme.primary, textAlign: "center" }}>Humidity</h3>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Humidity (%)",
                  data: humidityHistory,
                  borderColor: theme.accent2,
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
        <div className="chart">
          <h3 style={{ color: theme.primary, textAlign: "center" }}>CO2</h3>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "CO2 (ppm)",
                  data: co2History,
                  borderColor: theme.accent3,
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      </div>
      <div className="controls-section">
        <h3 style={{ color: theme.primary, textAlign: "center" }}>Controls</h3>
        <div className="control-buttons">
          <button
            className="control-button"
            style={{
              background: deviceData.fansState ? theme.accent1 : theme.buttonBackground,
              color: deviceData.fansState ? "#fff" : theme.buttonText,
            }}
            onClick={() => handleControlStateChange("fansState")}
          >
            {deviceData.fansState ? "Fans OFF" : "Fans ON"}
          </button>
          <button
            className="control-button"
            style={{
              background: deviceData.lightsState ? theme.accent2 : theme.buttonBackground,
              color: deviceData.lightsState ? "#fff" : theme.buttonText,
            }}
            onClick={() => handleControlStateChange("lightsState")}
          >
            {deviceData.lightsState ? "Lights OFF" : "Lights ON"}
          </button>
          <button
            className="control-button"
            style={{
              background: deviceData.hvacState ? theme.accent3 : theme.buttonBackground,
              color: deviceData.hvacState ? "#fff" : theme.buttonText,
            }}
            onClick={() => handleControlStateChange("hvacState")}
          >
            {deviceData.hvacState ? "HVAC OFF" : "HVAC ON"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeviceDetails;
