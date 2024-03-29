import {Telegraf, Context, Markup} from 'telegraf';

class TelegramBotManager {
    private bot: Telegraf<Context>;

    constructor(token: string) {
        this.bot = new Telegraf(token);

        this.initializeListeners();
    }

    private initializeListeners(): void {
        this.bot.command('options', (ctx) => this.sendOptions(ctx));
        this.bot.on('text', (ctx) => this.handleMessage(ctx));
    }

    private sendOptions(ctx: Context): void {
        const optionsKeyboard = Markup.keyboard([
            ['Option 1', 'Option 2'], // First row of buttons
            ['Option 3', 'Option 4']  // Second row of buttons
        ]).resize().oneTime(); // Resize keyboard to fit button contents and make it one-time use

        ctx.reply('Choose an option:', optionsKeyboard);
    }

    private handleMessage(ctx: Context): void {
        // Check if the update is a text message
        if ('text' in ctx.message!) {
            this.handleTextMessage(ctx, ctx.message.text);
        }
    }

    private handleTextMessage(ctx: Context, text: string): void {
        console.log(`Received message: ${text}`);
        // Respond based on the text, for example:
        ctx.reply("I received your message!");
    }

    public start(): void {
        this.bot.launch();
        console.log('Bot has been started...');
        // Enable graceful stop
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
}

export default TelegramBotManager;
