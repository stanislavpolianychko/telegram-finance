import Category from "../models/Caterogy";
import * as dotenv from "dotenv";
import categoriesData from "./categories/categories.json"

export const COMMANDS_OPTIONS = [
    { text: 'Expense', callback_data: 'expense' },
    { text: 'Income', callback_data: 'income' }
];

export const INCOME_CATEGORIES: Category[] = [];
export const EXPENSE_CATEGORIES: Category[] = [];
export let TG_BOT_TOKEN: string;
export let ALLOWED_TG_USER_ID: number;


function loadDotenvConfig(): void {
    dotenv.config();

    // load TG_BOT_TOKEN
    const botToken = process.env.TG_BOT_TOKEN;
    if (botToken == undefined) {
        process.exit(0);
    }

    TG_BOT_TOKEN = botToken;

    // load TG_BOT_TOKEN
    const allowedUserId = process.env.ALLOWED_TG_USER_ID;
    if (allowedUserId == undefined) {
        process.exit(0);
    }

    ALLOWED_TG_USER_ID = parseInt(allowedUserId);

    console.log(".env config loaded successfully")
}

function loadCategoriesConfig(): void {
    // Process income categories
    Object.entries(categoriesData.income).forEach(([_, details]) => {
        INCOME_CATEGORIES.push(details as Category);
    });

    // Process expense categories
    Object.entries(categoriesData.expense).forEach(([_, details]) => {
        EXPENSE_CATEGORIES.push(details as Category);
    });

    // Safety check (Optional)
    if (EXPENSE_CATEGORIES.length === 0 || INCOME_CATEGORIES.length === 0) {
        console.error("Failed to load categories config.");
        process.exit(1);
    }

    console.log("Categories config loaded successfully.");
    console.log(`Loaded ${EXPENSE_CATEGORIES.length} expense categories.`);
    console.log(`Loaded ${INCOME_CATEGORIES.length} income categories.`);
}


function loadConfig(): void {
    loadDotenvConfig();
    loadCategoriesConfig();
}

export default loadConfig;