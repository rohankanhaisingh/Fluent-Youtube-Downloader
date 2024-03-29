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

/** Defines the AppData file and directory structure. */
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
		"Settings.json": JSON.stringify({
			"behavior": {
				"autoStart": false,
				"systemTray": false,
				"startOptions": null
			},
			"window": {
				"resolution": {
					"width": 600,
					"height": 750
				},
				"display": {
					"theme": "windows_fluent_light",
					"darkMode": false,
				}
			},
			"path": {
				"appDataPath": null,
				"downloadPath": null,
				"ffmpegPath": null
			},
			"server": {
				"port": 8000,
				"extensionPassword": null
			}
		}),
		"History.json": "[]"
	}
};

/** The file name of the yt-dlp executable. */
export const YTDLP_EXECUTABLE_FILENAME: string = "yt-dlp.exe";

/** The maximum size in megabytes the file can have. */
export const MAX_FILE_SIZE: number = 1024; // In MB

export const TAR_FILE_NAME: string = "yt-dlp.tar.gz";

// How long it should take to send the authentication request.
export const EXTENSION_CONNECTION_INTERVAL: number = 1000;

export const AUDIO_FILE_EXTENSIONS: string[] = ["mp3", "ogg", "wav", "okt3"];

