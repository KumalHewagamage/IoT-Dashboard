import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import dashboardConfig from "./assets/dashboard_config.json";
import deviceConfig from "./assets/device_config.json";
import DeviceCard from "./components/DeviceCard";
import Sidebar from "./components/Sidebar";
import DeviceDetails from "./components/DeviceDetails"; // Import device details page
import ConfigureDevices from "./components/ConfigureDevices"; // Import configure devices page
import "./App.css";

function App() {
  const [deviceData, setDeviceData] = useState({});
  const [theme, setTheme] = useState(dashboardConfig.defaultTheme);

  const themes = dashboardConfig.themes;

  useEffect(() => {
    document.body.style.backgroundColor = themes[theme].background;

    const socket = new WebSocket("ws://localhost:8080");
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setDeviceData((prev) => ({
        ...prev,
        [message.topic]: message,
      }));
    };

    return () => socket.close();
  }, [theme, themes]);

  return (
    <Router>
      <div className="app-container">
        <div className="sidebar">
          <Sidebar theme={themes[theme]} />
        </div>
        <div className="main-content">
          <Routes>
            {/* Main Dashboard */}
            <Route
              path="/"
              element={
                <>
                  <div className="welcome-message">
                    <h1 style={{ color: themes[theme].primary }}>
                      Welcome to IoT Dashboard
                    </h1>
                  </div>
                  <div className="theme-selector">
                    <label htmlFor="themeDropdown">Theme:</label>
                    <select
                      id="themeDropdown"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      {Object.keys(themes).map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="device-grid">
                    {deviceConfig.devices.map((device, index) => {
                      const data = deviceData[device.topic] || {};

                      return (
                        <DeviceCard
                          key={index}
                          device={{
                            name: device.name,
                            image: device.image,
                            temperature: data.temperature || "N/A",
                            humidity: data.humidity || "N/A",
                            co2: data.co2 || "N/A",
                          }}
                          theme={themes[theme]}
                        />
                      );
                    })}
                  </div>
                </>
              }
            />

            {/* Device Details */}
            <Route path="/device/:deviceName" element={<DeviceDetails />} />

            {/* Configure Devices */}
            <Route path="/configure-devices" element={<ConfigureDevices />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
