import {Context, Markup} from "telegraf";
import UserSession from "./SessionHandler";
import {
    COMMANDS_OPTIONS,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES
} from "../config/config";


abstract class MessagesHandler {
    public static sentMessages: number[] = [];


    public static async sendTextMessage(context: Context, text: string, userSession?: UserSession) {
        let message = await context.reply(text);
        this.sentMessages.push(message.message_id);
    }

    public static async sendKeyboardMessage(context: Context, text: string, keyboard: Markup.Markup<any>) {
        const message = await context.reply(text, keyboard);
        this.sentMessages.push(message.message_id);
    }

    public static async sendCategoriesTypesKeyboard(context: Context) {
        const message = await context.reply("Please, choose an income category:\n", Markup.inlineKeyboard(
            COMMANDS_OPTIONS.map(
                option =>
                    [Markup.button.callback(option.text, option.callback_data)]
            ),
        ));
        this.sentMessages.push(message.message_id);
    }

    public static async sendIncomesCategoriesKeyboard(context: Context) {
        const message = await context.reply("Please, choose an income category:\n", Markup.inlineKeyboard(
            INCOME_CATEGORIES.map(
                category =>
                    [Markup.button.callback(category.name + " " + category.emoji, category.name)]
            ),
        ));
        this.sentMessages.push(message.message_id);
    }

    public static async sendExpensesCategoriesKeyboard(context: Context) {
        const message = await context.reply("Please, choose an expense category:\n", Markup.inlineKeyboard(
            EXPENSE_CATEGORIES.map(
                category =>
                    [Markup.button.callback(category.name + " " + category.emoji, category.name)]
            ),
        ));
        this.sentMessages.push(message.message_id);
    }

    public static async clearMessages(context: Context) {
        for (const messageId of this.sentMessages) {
            try {
                await context.telegram.deleteMessage(context!.chat!.id, messageId);
            } catch (error) {
                console.log('Failed to delete message:', error);
            }
        }
        this.sentMessages = [];
    }
}

export default MessagesHandler;