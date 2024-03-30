import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import credentials from "../../google-config.json";

import {GOOGLE_SPREAD_SHEET_ID, GOOGLE_SPREAD_SHEET_NAME} from "../config/config";

class GoogleSheetsManager {
    private readonly authClient: JWT;

    constructor() {
        this.authClient = new google.auth.JWT(
            credentials.client_email,
            undefined,
            credentials.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
    }

    async appendRow(data: string[]): Promise<void> {
        this.authClient.authorize(function(err) {
            if (err) {
                console.log(err);
                return;
            } else {
                console.log("Successfully connected!");
            }
        });
        const sheets = google.sheets({ version: 'v4', auth: this.authClient });

        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SPREAD_SHEET_ID,
            range: GOOGLE_SPREAD_SHEET_NAME, // Change to your sheet name
            valueInputOption: 'RAW',
            requestBody: {
                values: [data],
            },
        });
    }
}

export default GoogleSheetsManager;