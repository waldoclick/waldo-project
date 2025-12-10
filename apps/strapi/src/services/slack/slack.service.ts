import axios from "axios";

export class SlackService {
  private botToken: string;
  private channelId: string;

  constructor() {
    this.botToken = process.env.SLACK_BOT_TOKEN || "";
    this.channelId = process.env.SLACK_CHANNEL_ID || "";

    if (!this.botToken) {
      throw new Error("SLACK_BOT_TOKEN is required");
    }
    if (!this.channelId) {
      throw new Error("SLACK_CHANNEL_ID is required");
    }
  }

  /**
   * Send notification for new ad creation
   */
  public async sendNewAdNotification(message: string): Promise<void> {
    await this.sendMessage(message);
  }

  /**
   * Send message to Slack using API
   */
  private async sendMessage(message: string): Promise<void> {
    try {
      const payload = {
        channel: this.channelId,
        text: message,
        username: "Waldo Bot",
        icon_emoji: ":robot_face:",
      };

      // console.log('Sending to Slack API:', JSON.stringify(payload, null, 2));
      // console.log('Bot Token:', this.botToken.substring(0, 20) + '...');
      // console.log('Channel ID:', this.channelId);

      const response = await axios.post(
        "https://slack.com/api/chat.postMessage",
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.botToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log('Slack API Response:', JSON.stringify(response.data, null, 2));

      if (response.data.ok) {
        console.log("Slack message sent successfully");
      } else {
        console.error("Slack API Error:", response.data.error);
      }
    } catch (error) {
      console.error("Error sending Slack message:", error);
      throw error;
    }
  }
}
