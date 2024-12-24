import React from "react";
import { FaHome, FaPlus, FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import navigation
import "./Sidebar.css";

const Sidebar = ({ theme }) => {
  const navigate = useNavigate(); // Initialize navigation

  return (
    <div
      className="sidebar"
      style={{
        backgroundColor: theme.sidebarBackground,
        color: theme.text,
      }}
    >
      <h2 className="sidebar-title" style={{ color: theme.primary }}>IoT Dashboard</h2>
      <div className="sidebar-buttons">
        {/* Dashboard/Home Button */}
        <button
          className="sidebar-btn"
          style={{
            backgroundColor: theme.cardBackground,
            color: theme.text,
          }}
          onClick={() => navigate("/")} // Navigate to home
        >
          <FaHome className="sidebar-icon" /> Dashboard
        </button>

        {/* Configure Devices Button */}
        <button
          className="sidebar-btn"
          style={{
            backgroundColor: theme.cardBackground,
            color: theme.text,
          }}
          onClick={() => navigate("/configure-devices")} // Navigate to Configure Devices page
        >
          <FaPlus className="sidebar-icon" /> Configure Devices
        </button>

        {/* Settings Placeholder Button */}
        <button
          className="sidebar-btn"
          style={{
            backgroundColor: theme.cardBackground,
            color: theme.text,
          }}
        >
          <FaCog className="sidebar-icon" /> Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
