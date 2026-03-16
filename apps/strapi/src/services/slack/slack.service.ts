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
   * Send notification for new ad creation using Block Kit for rich formatting.
   */
  public async sendNewAdNotification(
    text: string,
    blocks?: object[]
  ): Promise<void> {
    await this.sendMessage(text, blocks);
  }

  /**
   * Send message to Slack using API.
   * @param text - Fallback plain text (shown in notifications/previews)
   * @param blocks - Optional Block Kit blocks for rich formatting
   */
  private async sendMessage(text: string, blocks?: object[]): Promise<void> {
    try {
      const payload: Record<string, unknown> = {
        channel: this.channelId,
        text,
        username: "Waldo Bot",
        icon_emoji: ":robot_face:",
        ...(blocks ? { blocks } : {}),
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
