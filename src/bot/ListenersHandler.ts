import UserSession from "./SessionHandler";
import SessionState from "../enums/SessionState";
import MessagesHandler from "./BotMessagesSender";
import {
    Context,
    Telegraf
} from "telegraf";
import {
    COMMANDS_OPTIONS,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES
} from "../config/config";
import GoogleSheetsManager from "../google-table/SheetsManager";
import { Update } from "telegraf/typings/core/types/typegram";

abstract class ListenersHandler {
    private static sheetManager: GoogleSheetsManager = new GoogleSheetsManager();
    private static userSession?: UserSession;

    public static initListeners(bot: Telegraf<Context>): void {
        bot.command('start', async (ctx) => {
            await ListenersHandler.onStart(ctx)
        });

        // on option choose
        bot.action(COMMANDS_OPTIONS.map(option => option.callback_data), async (ctx) => {
            await ListenersHandler.onCategoryTypeChoice(ctx);
        });


        bot.action(EXPENSE_CATEGORIES.map(c => c.name), async (ctx) => {
            await ListenersHandler.onCategoryChoice(ctx);
        });

        bot.action(INCOME_CATEGORIES.map(c => c.name), async (ctx) => {
            await ListenersHandler.onCategoryChoice(ctx);
        });

        bot.on('text', async (ctx) => {
            await ListenersHandler.onTransactionDetailsEntering(ctx);
        });
    }
    private static async onStart(context: Context<Update>) {
        const userId = context!.from!.id;
        try {
            this.userSession = new UserSession(userId);
        } catch (e) {
            await MessagesHandler.sendTextMessage(context,'Sorry, bot was created by @staspolianychko for personal usage only.');
            console.log(e);
            return;
        }

        await MessagesHandler.clearMessages(context);

        this.userSession.currentState = SessionState.ChoosingCategoryType;

        await MessagesHandler.sendCategoriesTypesKeyboard(context);
    }

    private static async onCategoryTypeChoice(context: Context<Update>) {
        if (this.userSession == undefined) {
            await MessagesHandler.sendTextMessage(context,'Please, start a session with /start first.');
            return;
        }

        await MessagesHandler.clearMessages(context);

        const callbackQueryContext = context as Context & { match: RegExpExecArray };
        const selectedOption: {callback_data: string, text: string} | undefined = COMMANDS_OPTIONS.find(option => option.callback_data === callbackQueryContext.match[0]);

        if (selectedOption) {
            switch (selectedOption.callback_data) {
                case COMMANDS_OPTIONS[0].callback_data:
                    this.userSession.chosenCategoryType = COMMANDS_OPTIONS[0].callback_data;
                    await MessagesHandler.sendExpensesCategoriesKeyboard(context);
                    break;
                case COMMANDS_OPTIONS[1].callback_data:
                    this.userSession.chosenCategoryType = COMMANDS_OPTIONS[1].callback_data;
                    await MessagesHandler.sendIncomesCategoriesKeyboard(context);
                    break;
            }
        }
    }

    private static async onCategoryChoice(context: Context) {
        if (this.userSession == undefined) {
            await MessagesHandler.sendTextMessage(context,'Please, start a session with /start first.');
            return;
        }

        await MessagesHandler.clearMessages(context);
        const callbackQueryContext = context as Context & { match: RegExpExecArray };
        const category = callbackQueryContext.match[0];


        this.userSession.currentState = SessionState.EnteringDetails;
        this.userSession.chosenCategory = category;

        await MessagesHandler.sendTextMessage(context,'Please enter the transaction amount and description (e.g., "100 groceries").');
    }

    private static async onTransactionDetailsEntering(context: Context) {
        if (this.userSession == undefined) {
            await MessagesHandler.sendTextMessage(context,'Please, start a session with /start first.');
            return;
        }

        await MessagesHandler.clearMessages(context);

        const userId = context!.from!.id;
        if (!userId) return;

        const message = context.message;
        if (!message || !("text" in message)) {
            await MessagesHandler.sendTextMessage(context, "Sorry, I didn't understand that.");
            return;
        }
        const details = message.text;

        if (this.userSession && this.userSession.currentState === SessionState.EnteringDetails) {
            this.userSession.enteredDetails = details;
            await this.processAndStoreExpense(this.userSession);
            await context.reply(`New ${this.userSession.chosenCategoryType} was recorder in ${this.userSession.chosenCategory} with value ${this.userSession.enteredDetails}`);

            try {
                this.userSession = new UserSession(userId);
            } catch (e) {
                await MessagesHandler.sendTextMessage(context, 'Sorry, bot was created by @staspolianychko for personal usage only.');
                console.log(e);
                return;
            }

            await MessagesHandler.clearMessages(context);

            await MessagesHandler.sendCategoriesTypesKeyboard(context);
        }
    }

    // todo: testing only, update for storing in google table
    private static async processAndStoreExpense(session: UserSession): Promise<void> {
        const [amount, ...textParts] = session.enteredDetails?.split(" ") ?? ['', ''];
        const text = textParts.join(" ");
        await this.sheetManager.appendRow([session.chosenCategoryType ?? "", session.chosenCategory ?? "", text, amount]);
    }
}

export default ListenersHandler;