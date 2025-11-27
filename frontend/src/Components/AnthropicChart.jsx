"use client";
import React from "react";

const STATUS = {
  OPERATIONAL: "Resolved",
  ISSUES: "Identified",
  DOWN: "Investigating",
};

const AnthropicChart = ({ rssData }) => {
  // Get color for the current status
  const getStatusColor = (status) => {
    switch (status) {
      case STATUS.OPERATIONAL:
        return "#28a745"; // Green for operational
      case STATUS.ISSUES:
        return "#ffc107"; // Yellow for Under Maintenance
      case STATUS.DOWN:
        return "#dc3545"; // Red for Inaccessible
      default: 
        return "green "; // Default green for operational
    }
  };

  // Filter updates to include only relevant statuses
  const filteredUpdates = rssData
  .filter((update) => {
    return (
      update.status === STATUS.OPERATIONAL ||
      update.status === STATUS.ISSUES ||
      update.status === STATUS.DOWN
    );
  })
  .map((update) => {
    if (update.status === STATUS.ISSUES) {
      update.label = "Under Maintenance"; // Add a custom label for ISSUES status yellow color
    }
    if (update.status === STATUS.DOWN) {
      update.label = "Inaccessible"; // Add a custom label for DOWN status red color
    }
    if (update.status === STATUS.OPERATIONAL) {
      update.label = "Operational"; // Add a custom label for OPERATIONAL status green color 
    }
    return update;
  });

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      {filteredUpdates.length > 0 ? (
        <ul
          style={{
            listStyleType: "none",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
          }}
        >
          {filteredUpdates.map((update, index) => (
            <li
              key={index}
              style={{
                width: "80%",
                maxWidth: "400px",
                padding: "15px",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                // border: `3px solid ${getStatusColor(update.status)}`,
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              {/* Traffic Light with Hover Effect */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  margin: "0 auto 15px",
                  backgroundColor: getStatusColor(update.status),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "12px",
                  textAlign: "center",
                  position: "relative",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.2)"; // Increase circle size
                  e.target.style.boxShadow = "0 8px 12px rgba(0, 0, 0, 0.2)"; // Add shadow
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)"; // Reset size
                  e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"; // Reset shadow
                }}
              >
              </div>

              {/* Status Information */}
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: getStatusColor(update.status),
                  marginBottom: "5px",
                }}
              >
                {update.status}
              </p>
              <p style={{ fontSize: "14px", color: "#555" }}>
                <strong>Time:</strong> {update?.timestamp}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div
          style={{
            width: "90%",
            maxWidth: "600px",
            padding: "15px",
            borderRadius: "8px",
            // boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            // border: `3px solid #28a745`,
            backgroundColor: "#eafbea",
            textAlign: "center",
          }}
        >
          {/* Green Block for No Incident */}
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              margin: "0 auto 15px",
              backgroundColor: "#28a745",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "12px",
              textAlign: "center",
              position: "relative",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.2)"; // Increase circle size
              e.target.style.boxShadow = "0 8px 12px rgba(0, 0, 0, 0.2)"; // Add shadow
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)"; // Reset size
              e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"; // Reset shadow
            }}
          ></div>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#28a745",
              marginBottom: "5px",
            }}
          >
            Operational
          </p>
        </div>
      )}
    </div>
  );
};

export default AnthropicChart;

