import React from "react";
import "./DeviceCard.css";
import { useNavigate } from "react-router-dom";

function DeviceCard({ device }) {
  const navigate = useNavigate();

  if (!device) {
    console.error("Device is undefined!");
    return null; // Skip rendering if device is undefined
  }

  const handleMoreClick = () => {
    navigate(`/device/${device.name}`); // Directly navigate to the device page
  };

  return (
    <div className="device-card">
      <img
        src={device.image || "/default-image.png"} // Fallback to a default image
        alt={device.name || "Unknown Device"} // Fallback for missing name
        className="device-image"
      />
      <h2>{device.name || "Unknown Device"}</h2>
      <p>🌡️ Temperature: {device.temperature || "N/A"} °C</p>
      <p>💧 Humidity: {device.humidity || "N/A"} %</p>
      <p>☁️ CO2: {device.co2 || "N/A"} ppm</p>
      <button className="more-button" onClick={handleMoreClick}>
        More
      </button>
    </div>
  );
}

export default DeviceCard;
