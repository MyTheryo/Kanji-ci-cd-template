import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { marked } from "marked";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFF",
    position: "relative",
    fontSize: 12,
    padding: 10, // Ensure consistent padding
  },
  smallText: {
    fontSize: 10,
    marginBottom: 4,
  },
  content: {
    fontSize: 12,
    textAlign: "justify",
    marginTop: 2,
    fontWeight: 900,
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    textDecoration: "underline",
  },
  listItem: {
    marginBottom: 5,
  },
  h1: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  h2: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  h3: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  blockquote: {
    borderLeft: "4px solid #ccc",
    paddingLeft: 10,
    marginBottom: 10,
    fontStyle: "italic",
  },
  section: {
    margin: 10,
    padding: 15,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
  },
  mainTitle: {
    backgroundColor: "#43b9b2",
    fontSize: 18,
    padding: 10,
    color: "#fff",
    fontWeight: 900,
    marginBottom: 6,
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

// Helper function to parse bold text within a line
function parseBoldText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/).map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return {
        type: "text",
        content: part.slice(2, -2),
        style: { fontWeight: 900, fontSize: 12 },
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
      date = new Date(); // Use current date if provided date is invalid
    }
  } else {
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
    } else if (line.startsWith("**")) {
      parsedData.push({
        type: "section",
        content: line.replace(/[#*]/g, "").trim(),
        style: {
          fontSize: 14,
          fontWeight: 900,
          marginTop: 6,
          marginBottom: 6,
        },
      });
    } else if (line.trim().startsWith("- ")) {
      parsedData.push({
        type: "bullet",
        content: line.substring(2).replace(/[#*]/g, "").trim(),
        style: { fontSize: 12 },
      });
    } else {
      const parts = parseBoldText(line);
      parsedData.push(...parts);
    }
  });

  return parsedData;
}

// Function to render HTML content as PDF components
const renderHtmlContent = (htmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const body = doc.body;

  const renderNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return <Text style={styles.content}>{node.textContent}</Text>;
    }

    switch (node.nodeName) {
      case "P":
        return (
          <Text style={styles.content}>
            {Array.from(node.childNodes).map(renderNode)}
          </Text>
        );
      case "STRONG":
        return (
          <Text style={{ ...styles.content, ...styles.bold }}>
            {Array.from(node.childNodes).map(renderNode)}
          </Text>
        );
      case "B":
        return (
          <Text style={{ ...styles.content, ...styles.bold }}>
            {Array.from(node.childNodes).map(renderNode)}
          </Text>
        );
      case "DIV":
        return (
          <Text style={{ ...styles.content, ...styles.bold }}>
            {Array.from(node.childNodes).map(renderNode)}
          </Text>
        );
      case "EM":
        return (
          <Text style={{ ...styles.content, ...styles.italic }}>
            {Array.from(node.childNodes).map(renderNode)}
          </Text>
        );
      case "U":
        return (
          <Text style={{ ...styles.content, ...styles.underline }}>
            {Array.from(node.childNodes).map(renderNode)}
          </Text>
        );
      case "LI":
        return (
          <Text style={{ ...styles.content, ...styles.listItem }}>
            • {Array.from(node.childNodes).map(renderNode)}
          </Text>
        );
      case "H1":
        return (
          <Text style={styles.h1}>
            {Array.from(node.childNodes).map(renderNode)}
          </Text>
        );
      case "H2":
        return (
          <Text style={styles.h2}>
            {Array.from(node.childNodes).map(renderNode)}
          </Text>
        );
      case "H3":
        return (
          <Text style={styles.h3}>
            {Array.from(node.childNodes).map(renderNode)}
          </Text>
        );
      case "BLOCKQUOTE":
        return (
          <Text style={styles.blockquote}>
            {Array.from(node.childNodes).map(renderNode)}
          </Text>
        );
      case "BR":
        return <Text>{"\n"}</Text>;
      default:
        return (
          <Text style={styles.content}>
            {Array.from(node.childNodes).map(renderNode)}
          </Text>
        );
    }
  };

  return Array.from(body.childNodes).map(renderNode);
};

// Helper to create a default title if none exists
const createTitle = (weekRange) => {
  return `Journal Report for Week (${weekRange})`;
};

// Function to generate report content based on provider or client data
const generateReportContent = (data) => {
  let content = "";

  if (data.content) {
    content = data.content;
  } else if (data.weekRange && data.summary) {
    content += `${data.summary}`;
  } else {
    content = "No content available.";
  }

  return content;
};

// Create Document Component
const ReportDocument = ({ item }) => {
 
  // Create a title if it doesn't exist using the weekRange
  const title = item?.title || createTitle(item?.weekRange);

  // Generate report content based on item data
  const htmlContent = generateReportContent(item);

  // Check for journal-related titles and parse summary if necessary
  let parsedSummary = "";
  if (title.split(" ")[0] === "Journal") {
    parsedSummary = summaryParser("", item?.content ? item?.content : "");
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.mainTitle}>
            {item?.title ? item.title : createTitle(item?.weekRange)}
          </Text>
          {htmlContent ? (
            renderHtmlContent(htmlContent)
          ) : Array.isArray(parsedSummary) && parsedSummary?.length > 0 ? (
            parsedSummary?.map((item, index) => (
              <View key={index} style={{ marginBottom: 10 }}>
                {item.type === "bullet" ? (
                  <View style={{ flexDirection: "column", marginBottom: 1 }}>
                    <View
                      style={{ flexDirection: "row", alignItems: "flex-start" }}
                    >
                      <Text style={{ width: 10, marginLeft: 1 }}>
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
            <Text>No Report Data Found</Text>
          )}
          <Text style={styles.disclaimer}>
            DISCLAIMER: This report was generated using artificial intelligence
            (AI), which may produce errors, inaccuracies, or biases. The
            information provided should not be used as a substitute for
            professional medical advice, diagnosis, treatment, or independent
            research and analysis. Always consult a licensed healthcare provider
            before making any health-related decisions. The content has not been
            independently verified, and Theryo assumes no liability for reliance
            on this AI-generated report. Human review, critical evaluation, and
            judgment are essential when utilizing the information herein. By
            using this report, you acknowledge and agree to these terms.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReportDocument;


