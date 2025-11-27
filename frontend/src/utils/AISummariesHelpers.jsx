function summaryParser(dateString, text, customHeading = "") {
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

  if (customHeading) {
    parsedData.push({
      type: "section",
      content: customHeading,
    });
  }

  lines.forEach((line, index) => {
    if (line.startsWith("### ")) {
      const content = line.replace(/[#*]/g, "").trim();
      if (content) {
        parsedData.push({
          type: "bold",
          content: content,
        });
      }
    } else if (line.startsWith("## ") || /^\s*\*\*(.*)\*\*\s*$/.test(line)) {
      const content = line.replace(/[#*]/g, "").trim();
      if (content) {
        parsedData.push({
          type: customHeading ? "bold" : "section",
          content: content,
        });
      }
    } else if (line.trim().startsWith("----")) {
      const content = parseBoldText(line.substring(4).trim());
      if (content.length > 0) {
        parsedData.push({
          type: "bulletFour",
          content: content,
        });
      }
    } else if (line.trim().startsWith("---")) {
      const content = parseBoldText(line.substring(3).trim());
      if (content.length > 0) {
        parsedData.push({
          type: "bulletThree",
          content: content,
        });
      }
    } else if (line.trim().startsWith("--")) {
      const content = parseBoldText(line.substring(2).trim());
      if (content.length > 0) {
        parsedData.push({
          type: "bulletTwo",
          content: content,
        });
      }
    } else if (line.trim().startsWith("-")) {
      const content = parseBoldText(line.substring(1).trim());
      if (content.length > 0) {
        parsedData.push({
          type: "bulletOne",
          content: content,
        });
      }
    } else if (/\*\*(.*?)\*\*/.test(line)) {
      const parts = parseBoldText(line);
      if (parts.length > 0) {
        parsedData.push({
          type: "nested",
          content: parts,
          style: { fontSize: 12, marginLeft: 10, marginTop: 2 },
        });
      }
    } else if (/^\d+\.\s/.test(line.trim())) {
      const content = line.trim();
      parsedData.push({
        type: "textNested",
        content: content,
      });
    } else {
      if (index > 0) {
        parsedData.push({
          type: "text",
          content: line.trim(),
        });
      }
      // const parts = parseBoldText(line);
      // if (parts.length > 0) {
      //     parsedData.push(...parts);
      // }
    }
  });

  return parsedData;
}

function parseBoldText(line) {
  const parts = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      const text = line.substring(lastIndex, match.index).trim();
      if (text) {
        parts.push({
          type: "nested",
          content: text,
        });
      }
    }
    const boldText = match[1].trim();
    if (boldText) {
      parts.push({
        type: "boldNested",
        content: boldText,
        style: { fontWeight: "bold" },
      });
    }
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    const text = line.substring(lastIndex).trim();
    if (text) {
      parts.push({
        type: "textNested",
        content: text,
      });
    }
  }

  return parts;
}

function formatViewSummary(text, dateString, colorBold = true) {
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

  if (!text) {
    text = "No Records Found";
  }

  // Replace the "(date)" placeholder in the text with the formatted date
  text = text.replace("(date)", `(${formattedDate})`);

  // Split the text into lines
  let lines = text.split("\n");

  // Track if the first instance of ## has been encountered
  let firstH2Encountered = false;

  // Process each line
  lines = lines
    .map((line, index) => {
      // Check if the line contains any special formatting or ** for bold text
      const isSpecial =
        line.startsWith("## ") ||
        line.startsWith("### ") ||
        line.startsWith("- ") ||
        /\*\*(.*?)\*\*/.test(line);

      // Remove first and last lines if they are not special and do not include ** bold text
      if (index === 0 && !isSpecial && !line.includes("**")) {
        return null; // Return null for lines to be removed
      }

      // Replace text between ** with bold
      if (line.trim().startsWith("**") && line.trim().endsWith("**")) {
        line = line.replace(
          /\*\*(.*?)\*\*/g,
          colorBold
            ? '<div class="border my-3 p-2 bg-primary text-white f-w-700">$1</div>'
            : "<b>$1</b>"
        );
      } else {
        line = line.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
      }
      // Replace text between ** with bold
      // line = line.replace(/\*\*(.*?)\*\*/g, (colorBold ? '<b style="color: #00b2a9;">$1</b>' : '<b>$1</b>'));

      // If the first line is not ##, set firstH2Encountered to true
      if (index === 0 && !line.startsWith("## ")) {
        firstH2Encountered = true;
      }

      // Convert lines starting with ## to <h2> tags
      if (line.startsWith("## ")) {
        if (!firstH2Encountered) {
          firstH2Encountered = true;
          return line.replace(
            /^##\s+(.*)$/,
            '<h2 class="text-primary text-center underline text-2xl font-extrabold my-5">$1</h2>'
          );
        } else {
          return line.replace(
            /^##\s+(.*)$/,
            '<h2 class="text-xl my-2">$1</h2>'
          );
        }
      }

      // Convert lines starting with ### to <h3> tags
      if (line.startsWith("### ")) {
        return line.replace(/^###\s+(.*)$/, '<h3 class="my-2">$1</h3>');
      }

      // Convert lines starting with hyphens to <li> with proper indentation
      if (/^----/.test(line)) {
        return line.replace(
          /^----\s*(.*)$/,
          '<li style="margin-left: 110px;">$1</li>'
        );
      } else if (/^---/.test(line)) {
        return line.replace(
          /^---\s*(.*)$/,
          '<li style="margin-left: 80px; list-style-type: square;">$1</li>'
        );
      } else if (/^--/.test(line)) {
        return line.replace(
          /^--\s*(.*)$/,
          '<li style="margin-left: 50px; list-style-type: circle;">$1</li>'
        );
      } else if (/^-/.test(line)) {
        return line.replace(
          /^\-\s*(.*)$/,
          '<li style="margin-left: 20px;">$1</li>'
        );
      }

      // If the line contains bold text but isn't special, wrap it in a <p> tag
      return `<p>${line}</p>`;
    })
    .filter((line) => line !== null); // Filter out lines marked for removal

  // Join the lines back together
  let formattedText = lines.join("");

  // Replace multiple <br> tags with a single <br> tag
  formattedText = formattedText.replace(/(<br>)+/g, "<br>");

  // Remove <br> tags after headings and list items
  formattedText = formattedText.replace(/(<\/h2>|<\/h3>|<\/li>)<br>/g, "$1");

  // Wrap <li> elements in <ul> tags with inline styles for list-style-type, margin, and padding
  formattedText = formattedText.replace(/(<li>.*?<\/li>)/gs, (match) => {
    return `<ul style="list-style-type: disc; margin: 0 16px; padding: 0 16px;">${match}</ul>`;
  });

  // Ensure <ul> tags don't nest incorrectly
  formattedText = formattedText.replace(/<\/ul><ul>/g, "");

  return formattedText;
}

function extractNotesSections(text) {
  const headings = [
    "**PROGRESS NOTE (CLINICAL NOTE)**",
    "**PSYCHOTHERAPY NOTE (PROCESS NOTE)**",
  ];

  // Initialize an array to store the sections
  const sections = [];

  // Split the text into lines
  const lines = text.split("\n");

  // Initialize variables to keep track of the current section and its content
  let currentSection = null;
  let currentContent = [];

  // Iterate over each line to extract content based on the headings
  for (const line of lines) {
    if (headings.includes(line.trim())) {
      // If a new heading is found, store the previous section's content
      if (currentSection !== null) {
        sections.push({
          heading: currentSection,
          content: currentContent.join("\n").trim(),
        });
      }
      // Update the current section
      currentSection = line.trim().replace(/^\*\*|\*\*$/g, "");
      currentContent = [];
    } else if (currentSection !== null) {
      // If within a section, add the line to the current content
      currentContent.push(line);
    }
  }

  // Store the last section's content
  if (currentSection !== null) {
    sections.push({
      heading: currentSection,
      content: currentContent.join("\n").trim(),
    });
  }

  // Return the sections as a JSON array
  return sections;
  // return JSON.stringify(sections, null, 2);
}

module.exports = {
  summaryParser,
  parseBoldText,
  formatViewSummary,
  extractNotesSections,
};
