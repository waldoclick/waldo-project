import { SlackService } from "./slack.service";

const slackService = new SlackService();

export const sendNewAdNotification = (message: string) =>
  slackService.sendNewAdNotification(message);

export { SlackService };
