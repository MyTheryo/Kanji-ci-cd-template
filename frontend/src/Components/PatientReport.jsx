import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
// Stylesheet for the PDF document
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFF",
    position: "relative",
    fontSize: 12,
    padding: 10, // Ensure consistent padding
  },
  section: {
    margin: 10,
    padding: 15,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
  },
  title: {
    fontSize: 20,
    textAlign: "left",
    color: "#172554",
    marginBottom: 12,
    fontWeight: "bold",
    marginRight: 16,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1, // Added border width
    borderColor: "#14b8a6",
  },
  column: {
    width: "48%", // This will ensure that columns take roughly half the space when wrapping
  },
  columnTeam: {
    width: "30%", // This will ensure that columns take roughly half the space when wrapping
  },
  subtitle: {
    fontSize: 12,
    color: "#3b82f6",
    marginBottom: 4,
    marginTop: 8,
  },
  smallText: {
    fontSize: 10,
    marginBottom: 4,
  },
  image: {
    width: 80, // Specify the width
    height: 80, // Specify the height
    marginBottom: 10,
    borderRadius: 50,
  },
  profileSection: {
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  profileContent: {},
  mainTitle: {
    height: 220,
    backgroundColor: "#2dd4bf",
    fontSize: 30,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    paddingTop: 30,
    paddingBottom: 10, // Adjust padding for spacing
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20, // Add marginBottom for spacing
  },
  innerContent: {
    position: "absolute",
    backgroundColor: "#fff",
    top: 110,
    left: 30,
    right: 30,
    padding: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4, // Increased height for more shadow
    },
    shadowOpacity: 0.75, // Increased opacity for darker shadow
    shadowRadius: 6, // Increased radius for a more pronounced shadow
    elevation: 10, // Increased elevation for Android shadow
  },
  page: {
    flexDirection: "column",
    position: "relative",
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    fontSize: 10,
    bottom: 25,
    right: 30,
    textAlign: "right",
    width: "100%",
    color: "grey",
  },
  disclaimerContainer: {
    position: "static",
    bottom: 50,
    left: 30,
    right: 30,
  },
  disclaimer: {
    fontSize: 10,
    marginTop: 15,
    color: "red",
  },
});
const renderTextWithHeadings = (text) => {
  // Split the text into lines, remove leading asterisks, and trim spaces
  const lines = text
    .split("\n")
    .map((line) => line.replace(/(\*+|\*\*+)/g, "").trim());

  // Map each line to a Text component with the appropriate style
  return lines.map((line, index) => {
    if (line.startsWith("###")) {
      // Render line as an h1 heading
      return (
        <Text key={index} style={styles.h1}>
          {line.substring(3).trim()}
        </Text>
      );
    } else if (line.startsWith("##")) {
      // Render line as an h2 heading
      return (
        <Text key={index} style={styles.h2}>
          {line.substring(2).trim()}
        </Text>
      );
    } else {
      // Render line as normal text
      return (
        <Text key={index} style={styles.normalText}>
          {line}
        </Text>
      );
    }
  });
};
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
};

// Helper function to parse bold text within a line
function parseBoldText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/).map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return {
        type: "text",
        content: part.slice(2, -2),
        style: { fontWeight: "bold", fontSize: 12 },
      };
    }
    return {
      type: "text",
      content: part,
      style: { fontWeight: "normal", fontSize: 12 },
    };
  });
  return parts;
}

function summaryParser(dateString, text) {
  let date;

  // Check if dateString is provided and is a valid date string
  if (dateString) {
    date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Check if date is invalid
      // console.log("Provided date string is invalid, using current date.");
      date = new Date(); // Use current date if provided date is invalid
    }
  } else {
    // console.log("No date string provided, using current date.");
    date = new Date(); // Use the current date if no date string is provided
  }

  // Format the date as 'Month day, year' (e.g., 'October 15, 2023')
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Replace the "(date)" placeholder in the text with the formatted date
  text = text.replace("(date)", `(${formattedDate})`);

  // Split content by new lines first to process each individually
  const lines = text.split("\n");
  const parsedData = [];

  lines.forEach((line) => {
    if (line.startsWith("### ")) {
      parsedData.push({
        type: "subsection",
        content: line.replace(/[#*]/g, "").trim(),
        style: {
          fontSize: 14,
          fontWeight: "bold",
          fontFamily: "Helvetica",
          marginTop: 12,
          marginBottom: 4,
        },
      });
    } else if (line.startsWith("## ")) {
      parsedData.push({
        type: "section",
        content: line.replace(/[#*]/g, "").trim(),
        style: {
          fontSize: 16,
          fontWeight: 900,
          marginTop: 16,
          marginBottom: 6,
        },
      });
    } else if (line.trim().startsWith("- ")) {
      parsedData.push({
        type: "bullet",
        content: line.substring(2).replace(/[#*]/g, "").trim(),
        style: { fontSize: 12, marginLeft: 10, marginTop: 2 },
      });
    } else {
      const parts = parseBoldText(line);
      parsedData.push(...parts);
    }
  });

  return parsedData;
}

const PatientReport = ({
  data,
  formData,
  date,
  invitedDoctors,
  goalData,
  summaryData,
  sevenDayData,
}) => {
  const parsedSummary = summaryParser(
    date,
    summaryData ? summaryData?.data?.summary : ""
  );

  const renderClientInformation = () => (
    <View style={styles.profileSection}>
      <Text style={styles.title}>Client Information</Text>
      <View style={styles.profileContent}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#5eead4",
            width: "100%",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                backgroundColor: "#5eead4",
                fontSize: 10,
                paddingTop: 5,
                paddingLeft: 3,
                marginRight: 5,
                paddingRight: 10,
                paddingBottom: 5,
              }}
            >
              First Name
            </Text>
            <Text style={{ fontSize: 10 }}>{formData.firstName}</Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                backgroundColor: "#5eead4",
                fontSize: 10,
                paddingTop: 5,
                paddingLeft: 3,
                marginRight: 5,
                paddingRight: 10,
                paddingBottom: 5,
              }}
            >
              Last Name
            </Text>
            <Text style={{ fontSize: 10 }}>{formData.lastName}</Text>
          </View>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#5eead4",
            width: "100%",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                backgroundColor: "#5eead4",
                fontSize: 10,
                paddingTop: 5,
                paddingLeft: 3,
                marginRight: 5,
                paddingRight: 10,
                paddingBottom: 5,
              }}
            >
              Phone Number
            </Text>
            <Text style={{ fontSize: 10 }}>{formData.phoneNumber}</Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                backgroundColor: "#5eead4",
                fontSize: 10,
                paddingTop: 5,
                paddingLeft: 3,
                marginRight: 5,
                paddingRight: 10,
                paddingBottom: 5,
              }}
            >
              Address
            </Text>
            <Text style={{ fontSize: 10 }}>
              {formData.address || "No address provided"}
            </Text>
          </View>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#5eead4",
            width: "100%",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                backgroundColor: "#5eead4",
                fontSize: 10,
                paddingTop: 5,
                paddingLeft: 3,
                marginRight: 5,
                paddingRight: 10,
                paddingBottom: 5,
              }}
            >
              City
            </Text>
            <Text style={{ fontSize: 10 }}>{formData.city || "No city"}</Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                backgroundColor: "#5eead4",
                fontSize: 10,
                paddingTop: 5,
                paddingLeft: 3,
                marginRight: 5,
                paddingRight: 10,
                paddingBottom: 5,
              }}
            >
              State
            </Text>
            <Text style={{ fontSize: 10 }}>{formData.state || "No state"}</Text>
          </View>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#5eead4",
            width: "100%",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                backgroundColor: "#5eead4",
                fontSize: 10,
                paddingTop: 5,
                paddingLeft: 3,
                marginRight: 5,
                paddingRight: 10,
                paddingBottom: 5,
              }}
            >
              Account Created
            </Text>
            <Text style={{ fontSize: 10 }}>
              {new Date(formData.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                backgroundColor: "#5eead4",
                fontSize: 10,
                paddingTop: 5,
                paddingLeft: 3,
                marginRight: 5,
                paddingRight: 10,
                paddingBottom: 5,
              }}
            >
              Zip Code
            </Text>
            <Text style={{ fontSize: 10 }}>
              {formData.zipCode || "No zip code"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTeamInformation = () => {
    if (!invitedDoctors || invitedDoctors?.length === 0) {
      return <Text>No Invited Providers Found</Text>;
    }

    return (
      <View style={{ marginBottom: 10 }}>
        <Text style={styles.title}>Team Information</Text>
        {invitedDoctors
          ?.filter((invite) => invite?.invitationStatus !== "deleted") // Filter out deleted records
          .map((invite, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <View style={styles.row}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#5eead4",
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        backgroundColor: "#5eead4",
                        fontSize: 10,
                        paddingTop: 3,
                        paddingLeft: 3,
                        marginRight: 3,
                        paddingRight: 5,
                        paddingBottom: 5,
                      }}
                    >
                      Provider Name:
                    </Text>
                    <Text style={{ fontSize: 10 }}>{invite?.doctorName}</Text>
                  </View>
                </View>
    
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#5eead4",
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        backgroundColor: "#5eead4",
                        fontSize: 10,
                        paddingTop: 3,
                        paddingLeft: 3,
                        marginRight: 3,
                        paddingRight: 5,
                        paddingBottom: 5,
                      }}
                    >
                      NPI No:
                    </Text>
                    <Text style={{ fontSize: 10 }}>{invite?.npiNumber}</Text>
                  </View>
                </View>
    
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#5eead4",
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        backgroundColor: "#5eead4",
                        fontSize: 10,
                        paddingTop: 3,
                        paddingLeft: 3,
                        marginRight: 3,
                        paddingRight: 5,
                        paddingBottom: 5,
                      }}
                    >
                      Connection Date:
                    </Text>
                    <Text style={{ fontSize: 10 }}>{formatDate(invite?.sentOn)}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
      </View>
    );
    
  };

  const renderGoalsInformation = () => {
    if (
      !goalData ||
      !Array.isArray(goalData?.goals) ||
      goalData?.goals?.length === 0
    ) {
      return <Text>No Goals Found</Text>;
    }

    return (
      <View style={{ marginBottom: 10 }}>
        <Text style={styles.title}>Goals Information</Text>
        {goalData?.goals?.map((goal, index) => (
          <View key={index} style={styles.row}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                // marginBottom: 10,
                borderWidth: 1,
                borderColor: "#5eead4",
                width: "100%",
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    backgroundColor: "#5eead4",
                    fontSize: 10,
                    paddingTop: 5,
                    paddingLeft: 3,
                    marginRight: 5,
                    paddingRight: 10,
                    paddingBottom: 5,
                  }}
                >
                  Title
                </Text>
                <Text style={{ fontSize: 10 }}>{goal?.goalTitle}</Text>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    backgroundColor: "#5eead4",
                    fontSize: 10,
                    paddingTop: 5,
                    paddingLeft: 3,
                    marginRight: 5,
                    paddingRight: 10,
                    paddingBottom: 5,
                  }}
                >
                  Status
                </Text>
                <Text style={{ fontSize: 10 }}>
                  {goal?.isDeleted ? "Completed" : "In Progress"}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSummarySection = (title, summaryData) => (
    <Page size="A4" style={styles.page}>
      <Text style={styles.mainTitle}>{title}</Text>
      <View style={styles.innerContent}>
        {Array.isArray(summaryData) && summaryData?.length > 0 ? (
          summaryData?.map((item, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              {" "}
              {/* Add marginBottom to each item */}
              {item.type === "bullet" ? (
                <View style={{ flexDirection: "column", marginBottom: 6 }}>
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <Text style={{ width: 20, marginLeft: 12 }}>
                      {"\u2022"}
                    </Text>
                    <Text style={{ flex: 1, marginRight: 4 }}>
                      {item?.content}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={item.style}>{item?.content}</Text>
              )}
            </View>
          ))
        ) : (
          <Text>No Summary Found</Text>
        )}
      </View>
    </Page>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.mainTitle}>Client Mental Health Report</Text>
        <View style={styles.innerContent}>
          {renderClientInformation()}
          {renderTeamInformation()}
          {invitedDoctors?.length <= 6 && renderGoalsInformation()}
        </View>
      </Page>

      {invitedDoctors?.length > 6 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.innerContent}>{renderGoalsInformation()}</View>
        </Page>
      )}

      {/* Render the Mental Health Report section with spacing */}
      {renderSummarySection("Mental Health Report", parsedSummary)}

      {/* Render the Seven Day Summary section with spacing */}
      {renderSummarySection("Seven Day Summary", sevenDayData)}

      <Page size="A4" style={styles.page}>
        <Text style={styles.disclaimer}>
          DISCLAIMER: This report was generated using artificial intelligence
          (AI), which may produce errors, inaccuracies, or biases. The
          information provided should not be used as a substitute for
          professional medical advice, diagnosis, treatment, or independent
          research and analysis. Always consult a licensed healthcare provider
          before making any health-related decisions. The content has not been
          independently verified, and Theryo assumes no liability for reliance
          on this AI-generated report. Human review, critical evaluation, and
          judgment are essential when utilizing the information herein. By using
          this report, you acknowledge and agree to these terms.
        </Text>
      </Page>
    </Document>
  );
};

export default PatientReport;
