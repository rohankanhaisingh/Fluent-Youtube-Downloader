import path from "path";
import fs from "fs";

/** Root directory of the project's source code. */
export const ROOT_PATH: string = path.join(__dirname, "../");

/** Directory of the application's source code. */
export const APPLICATION_PATH: string = path.join(ROOT_PATH, "application");

/** Directory of where the views pages are located. */
export const VIEWS_PATH: string = path.join(APPLICATION_PATH, "views");

/** Directory of where the scripts are located. */
export const SCRIPTS_PATH: string = path.join(APPLICATION_PATH, "scripts");

/** Array of entry script files. */
export const ENTRY_SCRIPT_FILES: string[] = fs.readdirSync(SCRIPTS_PATH, "utf-8");

/** Determines the server port. Standard port is 8000. */
export const SERVER_PORT: number = 8000;

/** Private .env file. */
export const DOTENV_FILE: string = path.join(ROOT_PATH, ".env");