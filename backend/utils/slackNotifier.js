import axios from "axios"; // Use ES Modules import

// set via environment variable
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL;
const SLACK_USERNAME = process.env.SLACK_USERNAME;
const SLACK_ICON = process.env.SLACK_ICON;

// Function to send a Slack notification
export async function sendSlackNotification(message) {
  const payload = {
    text: message,
    channel: SLACK_CHANNEL,       // Send to the specified channel
    username: SLACK_USERNAME,     // Set a custom username for the bot
    icon_emoji: SLACK_ICON,       // Set a custom icon emoji for the bot
  };

  try {
    const response = await axios.post(SLACK_WEBHOOK_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      console.log("Slack notification sent successfully!");
    } else {
      console.error(`Error sending Slack notification: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending Slack notification:", error.message);
  }
}
