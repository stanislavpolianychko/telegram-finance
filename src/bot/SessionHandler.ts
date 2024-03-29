import {ALLOWED_TG_USER_ID} from "../config/config";
import SessionState from "../enums/SessionState";
import {Context} from "telegraf";

class UserSession {
    public currentState: SessionState = SessionState.Idle;
    public chosenCategoryType?: string;
    public chosenCategory?: string;
    public enteredDetails?: string;
    public sessionBotMessages: number[] = [];

    public async clearBotSessionMessages(context: Context) {
        for (const messageId of this.sessionBotMessages) {
            try {
                await context.telegram.deleteMessage(context!.chat!.id, messageId);
            } catch (error) {
                console.log('Failed to delete message:', error);
            }
        }
        this.sessionBotMessages = [];
    }

    public saveBotSentMessage(messageId: number) {
        this.sessionBotMessages.push(messageId);
    }

    constructor(userId: number) {
        if (userId !== ALLOWED_TG_USER_ID) {
            throw Error(`Unauthorized user ID: ${userId}. Session not created.`);
        }
    }
}

export default UserSession;
