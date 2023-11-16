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

/** Directory of %appdata%, which might be undefined. */
export const APPDATA_PATH: string | undefined = process.env.APPDATA;

/** Name of the directory where the application data will be stored. */
export const APPDATA_DIRECTORY_NAME: string = "fluent-youtube-downloader";

export const APPDATA_DIRECTORY_STRUCTURE: { [K: string]: any } = {
	"blob_storage": {},
	"Cache": {
		"Cache_Data": {
			"f0933i": "<entry> index.ejs"
		}
	},
	"Code Cache": {
		"js": {},
		"wasm": {}
	},
	"DawnCache": {},
	"GPUCache": {},
	"Local Storage": {
		"levldb": {}
	},
	"Network": {},
	"Session Storage": {},
	"Application": {
		"Settings.json": JSON.stringify({"window":{"resolution":{"width":600,"height":750},"display":{"theme":"fluent-light-purple"}},"path":{"appDataPath":null,"downloadPath":null,"ffmpegPath":null},"server":{"port":8000}}),
		"History.json": "[]"
	}
};