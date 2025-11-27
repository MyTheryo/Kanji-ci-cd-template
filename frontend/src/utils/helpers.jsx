function daysInYear(year) {
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    return 366;
  } else {
    return 365;
  }
}

function dayOfYear(dateString) {
  const date = new Date(dateString);
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  const startOfYear = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 0));
  const diff = utcDate - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function dayIndex(year, month, day) {
  return Math.ceil(
    (new Date(year, month, day) - new Date(year, 0, 1)) / 86400000
  );
}

function currDayIndex() {
  const date = new Date();
  return dayIndex(date.getFullYear(), date.getMonth(), date.getDate());
}

function currYear() {
  return new Date().getFullYear();
}

function dayToMonthMemo(day) {
  let year = currYear();
  let cache = {};

  return (day) => {
    if (year !== new Date().getFullYear()) {
      year = new Date().getFullYear();
      cache = {};
    }
    if (day in cache) return cache[day];
    const nextYear = new Date(year + 1, 0, 1);
    for (
      let d = new Date(year, 0, 1);
      d < nextYear;
      d.setDate(d.getDate() + 1)
    ) {
      if (day === dayIndex(d.getFullYear(), d.getMonth(), d.getDate())) {
        cache[day] = d.getMonth();
        return cache[day];
      }
    }
  };
}

const dayToMonth = dayToMonthMemo();

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
        type: "h3",
        content: line.slice(4).trim(),
      });
    } else if (line.startsWith("## ")) {
      parsedData.push({
        type: "h2",
        content: line.slice(3).trim(),
      });
    } else if (line.trim().startsWith("- ")) {
      parsedData.push({
        type: "bullet",
        content: line.substring(2).trim(),
      });
    } else {
      parsedData.push({
        type: "text",
        content: line.trim(),
      });
    }
  });

  return parsedData;
}

function encodeBase64(str) {
  return btoa(str + process.env.NEXT_PUBLIC_ENCODE_KEY);
}

function decodeBase64(str) {
  if(str?.length > 6){
    return atob(str).split("-")[0];
  }else{
    return str;
  }
}

module.exports = {
  daysInYear,
  daysInMonth,
  dayIndex,
  currDayIndex,
  currYear,
  dayToMonthMemo,
  dayToMonth,
  dayOfYear,
  summaryParser,
  encodeBase64,
  decodeBase64,
};
