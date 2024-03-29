import {
    Telegraf,
    Context,
    Markup
} from 'telegraf';

import {
    COMMANDS_OPTIONS,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES
} from "../config/config";

import SessionState from "../enums/SessionState";
import UserSession from './SessionHandler';

class BotManager {
    private userSession?: UserSession;
    private bot: Telegraf<Context>;

    constructor(token: string) {
        this.bot = new Telegraf(token);

        this.initializeListeners();
    }

    private initializeListeners(): void {
        // on /start
        this.bot.command('start', async (ctx) => {
            const userId = ctx.from.id;
            try {
                this.userSession = new UserSession(userId);
            } catch (e) {
                ctx.reply('Sorry, bot was created by @staspolianychko for personal usage only.');
                console.log(e);
                return;
            }

            await this.userSession.clearBotSessionMessages(ctx);

            await this.sendOptions(ctx);
        });

        // on option choose
        this.bot.action(COMMANDS_OPTIONS.map(option => option.callback_data), async (ctx) => {
            if (this.userSession == undefined) {
                ctx.reply('Please, start a session with /start first.');
                return;
            }

            await this.userSession.clearBotSessionMessages(ctx);

            const selectedOption = COMMANDS_OPTIONS.find(option => option.callback_data === ctx.match[0]);

            if (selectedOption) {
                switch (selectedOption.callback_data) {
                    case COMMANDS_OPTIONS[0].callback_data:
                        this.userSession.chosenCategoryType = COMMANDS_OPTIONS[0].callback_data;
                        await this.sendExpensesCategories(ctx);
                        break;
                    case COMMANDS_OPTIONS[1].callback_data:
                        this.userSession.chosenCategoryType = COMMANDS_OPTIONS[1].callback_data;
                        await this.sendIncomesCategories(ctx);
                        break;
                }
            }
        });


        this.bot.action(EXPENSE_CATEGORIES.map(c => c.name), async (ctx) => {
            if (this.userSession == undefined) {
                ctx.reply('Please, start a session with /start first.');
                return;
            }

            await this.userSession.clearBotSessionMessages(ctx);

            const category = ctx.match[0];

            this.userSession.currentState = SessionState.EnteringDetails;
            this.userSession.chosenCategory = category;

            ctx.reply('Please enter the expense amount and description (e.g., "100 groceries").');
        });

        this.bot.action(INCOME_CATEGORIES.map(c => c.name), async (ctx) => {
            if (this.userSession == undefined) {
                ctx.reply('Please, start a session with /start first.');
                return;
            }
            await this.userSession.clearBotSessionMessages(ctx);

            const category = ctx.match[0];

            this.userSession.currentState = SessionState.EnteringDetails;
            this.userSession.chosenCategory = category;

            await ctx.reply('Please enter the expense amount and description (e.g., "100 groceries").');
        });

        this.bot.on('text', async (ctx) => {
            if (this.userSession == undefined) {
                ctx.reply('Please, start a session with /start first.');
                return;
            }

            await this.userSession.clearBotSessionMessages(ctx);

            const userId = ctx.from.id;

            if (this.userSession && this.userSession.currentState === SessionState.EnteringDetails) {
                // User is entering expense details, process the input
                const details = ctx.message.text;
                // Assuming a function to process and store the expense
                this.processAndStoreExpense(userId, this.userSession.chosenCategory!, details);

                await ctx.reply(`New ${this.userSession.chosenCategoryType} was recorder in ${this.userSession.chosenCategory} with value ${this.userSession.enteredDetails}`);

                try {
                    this.userSession = new UserSession(userId);
                } catch (e) {
                    ctx.reply('Sorry, bot was created by @staspolianychko for personal usage only.');
                    console.log(e);
                    return;
                }

                await this.userSession.clearBotSessionMessages(ctx);

                await this.sendOptions(ctx);
            } else {
                // Handle other text messages normally
            }
        });
    }

    private processAndStoreExpense(userId: number, category: string, details: string): void {
        console.log(`Storing expense for user ${userId}: Category ${category}, Details: ${details}`);
        // Add your logic here to process and store the expense
        // This might involve parsing the details string and storing the data in a database
    }


    private async sendOptions(ctx: Context): Promise<void> {
        this.userSession!.currentState = SessionState.ChoosingCategoryType;
        const message = await ctx.reply('Choose an option:', Markup.inlineKeyboard(
            COMMANDS_OPTIONS.map(option => [Markup.button.callback(option.text, option.callback_data)])
        ));
        // Store the message ID for potential future deletion
        this.userSession!.saveBotSentMessage(message.message_id)
    }

    private async sendExpensesCategories(ctx: Context): Promise<void> {
        const message = await ctx.reply('Choose an expense category:', Markup.inlineKeyboard(
            EXPENSE_CATEGORIES.map(category => [Markup.button.callback(category.name + " " + category.emoji, category.name)])
        ));
        this.userSession!.saveBotSentMessage(message.message_id);
    }

    private async sendIncomesCategories(ctx: Context): Promise<void> {
        const message = await ctx.reply('Choose an income category:', Markup.inlineKeyboard(
            INCOME_CATEGORIES.map(category => [Markup.button.callback(category.name + " " + category.emoji, category.name)])
        ));
        this.userSession!.saveBotSentMessage(message.message_id);
    }


    public async start(): Promise<void> {
        await this.bot.launch();
        console.log('Bot has been started...');

        this.stopBot();
    }

    public stopBot(): void {
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
}

export default BotManager;
