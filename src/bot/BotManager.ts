import ListenersHandler from "./ListenersHandler";
import {
    Telegraf,
    Context,
} from 'telegraf';
import GoogleSheetsManager from "../google-table/SheetsManager";

class BotManager {
    private readonly bot: Telegraf<Context>;

    constructor(token: string) {
        this.bot = new Telegraf(token);

        ListenersHandler.initListeners(this.bot);
    }

    public async start(): Promise<void> {
        await this.bot.launch();
        console.log('Bot has been started...');

        // handle bot end
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
}

export default BotManager;
