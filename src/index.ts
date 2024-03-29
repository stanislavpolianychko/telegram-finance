import TelegramBotManager from "./bot/TelegramBotManager";
import * as dotenv from 'dotenv';


dotenv.config();

const token = process.env.TG_BOT_TOKEN;
if (token == undefined) {
    console.error("");
    process.exit(0);
}


const botManager = new TelegramBotManager(token);
botManager.start();