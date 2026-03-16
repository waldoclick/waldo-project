import { SlackService } from "./slack.service";

const slackService = new SlackService();

export const sendNewAdNotification = (message: string, blocks?: object[]) =>
  slackService.sendNewAdNotification(message, blocks);

export { SlackService };
