import React, { useState, useEffect } from "react";
import "./ConfigureDevices.css";
import { useNavigate } from "react-router-dom";

function ConfigureDevices() {
  const [devices, setDevices] = useState([]); // State to store devices
  const [newDevice, setNewDevice] = useState({
    location: "",
    topic: "",
    image: null,
  });

  const navigate = useNavigate();
  
  // Fetch the current devices from the API
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        console.log("trying fetch")
        const response = await fetch("http://localhost:3000/api/devices"); // Explicit URL
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setDevices(data.devices || []);
      } catch (error) {
        console.error("Error fetching devices:", error.message);
        alert("Failed to load devices. Please try again.");
      }
    };

    fetchDevices();
  }, []);

  // Handle input changes for new device fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDevice((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setNewDevice((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  // Add a new device
  const handleAddDevice = async () => {
    if (!newDevice.location || !newDevice.topic) {
      alert("Please fill in all required fields!");
      return;
    }

    const imageName = newDevice.image
      ? `/location_img/${newDevice.location.toLowerCase().replace(/\s+/g, "_")}.png`
      : "/location_img/default.png";

    const newDeviceEntry = {
      name: newDevice.location,
      location: newDevice.location,
      topic: newDevice.topic,
      image: imageName,
    };

    try {
      const response = await fetch("http://localhost:3000/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDeviceEntry),
      });

      if (response.ok) {
        setDevices((prevDevices) => [...prevDevices, newDeviceEntry]);
        alert("Device added successfully!");
        setNewDevice({ location: "", topic: "", image: null });
      } else {
        const error = await response.json();
        alert("Failed to add device: " + error.error);
      }
    } catch (error) {
      console.error("Error adding device:", error.message);
      alert("An error occurred. Please try again.");
    }
  };

  // Remove a device
  const handleRemoveDevice = async (deviceIndex) => {
    const deviceToRemove = devices[deviceIndex];

    try {
      const response = await fetch(`http://localhost:3000/api/devices/${deviceToRemove.topic}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDevices((prevDevices) =>
          prevDevices.filter((_, index) => index !== deviceIndex)
        );
        alert("Device removed successfully!");
      } else {
        const error = await response.json();
        alert("Failed to remove device: " + error.error);
      }
    } catch (error) {
      console.error("Error removing device:", error.message);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="configure-devices">
      <h1>Configure Devices</h1>
      <button className="back-button" onClick={() => navigate("/")}>
        Back to Dashboard
      </button>

      {/* Add Devices Section */}
      <section className="add-devices">
        <h2>Add New Device</h2>
        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={newDevice.location}
            onChange={handleInputChange}
            placeholder="Enter device location"
          />
        </div>
        <div className="form-group">
          <label>MQTT Topic:</label>
          <input
            type="text"
            name="topic"
            value={newDevice.topic}
            onChange={handleInputChange}
            placeholder="Enter MQTT topic"
          />
        </div>
        <div className="form-group">
          <label>Upload Image:</label>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button className="add-button" onClick={handleAddDevice}>
          Add Device
        </button>
      </section>

      {/* Remove Devices Section */}
      <section className="remove-devices">
        <h2>Remove Devices</h2>
        {devices.length > 0 ? (
          devices.map((device, index) => (
            <div className="device-item" key={index}>
              <p>
                <strong>Name:</strong> {device.name} <br />
                <strong>Location:</strong> {device.location} <br />
                <strong>MQTT Topic:</strong> {device.topic}
              </p>
              <button
                className="remove-button"
                onClick={() => handleRemoveDevice(index)}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No devices available.</p>
        )}
      </section>
    </div>
  );
}

export default ConfigureDevices;
