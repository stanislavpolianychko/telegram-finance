import BotManager from "./bot/BotManager";
import loadConfig, { TG_BOT_TOKEN } from "./config/config";

loadConfig();

const botManager = new BotManager(TG_BOT_TOKEN);
botManager.start().then();
