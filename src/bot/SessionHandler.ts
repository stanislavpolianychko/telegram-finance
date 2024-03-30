import {ALLOWED_TG_USER_ID} from "../config/config";
import SessionState from "../enums/SessionState";

class UserSession {
    public currentState: SessionState = SessionState.Idle;
    public chosenCategoryType?: string;
    public chosenCategory?: string;
    public enteredDetails?: string;

    constructor(userId: number) {
        if (userId !== ALLOWED_TG_USER_ID) {
            throw Error(`Unauthorized user ID: ${userId}. Session not created.`);
        }
    }
}

export default UserSession;
