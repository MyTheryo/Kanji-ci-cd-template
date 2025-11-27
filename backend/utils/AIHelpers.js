/**
 * This Function gets AI generated summaries and extract sections against the headings provided in parameter.
 * 
 * @param {string} text - The input text to extract sections from.
 * @param {Array<string>} headings - An array of headings to identify sections in the text.
 * @returns {Array<Object>} - Returns an array of objects, each containing a heading and the corresponding content.
 * 
 * @example
 * const text = "**Target Therapist Profile:**\nContent for profile.\n**Email Template for Therapists:**\nContent for email.";
 * const headings = ["**Target Therapist Profile:**", "**Email Template for Therapists:**"];
 * const result = extractSections(text, headings);
 * console.log(result);
 * // Output: [
 * //   { heading: "Target Therapist Profile", content: "Content for profile." },
 * //   { heading: "Email Template for Therapists", content: "Content for email." }
 * // ]
 */
function extractSections(text, headings) {
  if (typeof text !== 'string') {
    throw new Error("Invalid input: text must be a string.");
  }
  if (!Array.isArray(headings) || headings.some(h => typeof h !== 'string')) {
    throw new Error("Invalid input: headings must be an array of strings.");
  }

  const sections = [];

  const lines = text.split('\n');

  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (headings.includes(trimmedLine)) {
      if (currentSection !== null) {
        sections.push({
          heading: currentSection,
          content: currentContent.join('\n').trim()
        });
      }
      
      currentSection = trimmedLine.replace(/^\*\*|\*\*$/g, "");
      currentContent = [];
    } else if (currentSection !== null) {
      currentContent.push(line);
    }
  }

  if (currentSection !== null) {
    sections.push({
      heading: currentSection,
      content: currentContent.join('\n').trim()
    });
  }

  return sections;
}

export default extractSections;