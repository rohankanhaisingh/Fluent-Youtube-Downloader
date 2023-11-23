import fs from "fs";
import path from "path";
import electron, { app } from "electron";

import { APPDATA_PATH, APPDATA_DIRECTORY_NAME, APPDATA_DIRECTORY_STRUCTURE } from "./constants";
import { mainWindow } from "./app";
import { ApplicationSettings, ReadSettingsFail } from "./typings";
import { Request, Response, Router } from "express";
import { requireLogin } from "./router";

/**
 * Constructs the folder based on a structure map.
 * @param structureMap Structure map
 * @param currentPath Path of where the folders should be located.
 */
export function createFolderStructure(structureMap: { [K: string]: any }, currentPath: string) {

	// Create the directory if it does not exist.
	if (!fs.existsSync(currentPath))
		fs.mkdirSync(currentPath);

	Object.entries(structureMap).forEach(([item, contents]) => {

		const itemPath = path.join(currentPath, item);

		if (typeof contents === 'object' && Object.keys(contents).length > 0) {

			if (!fs.existsSync(itemPath))
				fs.mkdirSync(itemPath);

			createFolderStructure(contents, itemPath);
		} else {

			if(!fs.existsSync(itemPath))
				fs.writeFileSync(itemPath, JSON.stringify(contents));
		}
	});
}

/**
 * Checks the folder structure based on a structure map.
 * @param structureMap Structure map
 * @param currentPath Map of where the folders should be.
 * @returns { string[] | null }
 */
export function checkFolderStructure(structureMap: { [K: string]: any }, currentPath: string): string[] | null {

	// Return null if the given work directory is null.
	if (!fs.existsSync(currentPath)) return null;

	// Empty variable that will contain missing physical file paths.
	const missingPhysicalFilePaths: string[] = [];

	function loopThroughFiles(structureMap: { [K: string]: any }, currentPath: string) {

		// Read the root directory of the cwd.
		const items = fs.readdirSync(currentPath);

		for (const [item, content] of Object.entries(structureMap)) {

			const itemPath = path.join(currentPath, item);

			if (items.includes(item)) {

				if (typeof content === 'object' && Object.keys(content).length > 0) {

					loopThroughFiles(content, itemPath);
				} else {

					if (!fs.existsSync(itemPath))
						missingPhysicalFilePaths.push(itemPath);
				}
			} else {

				missingPhysicalFilePaths.push(itemPath);
			}
		}
	}

	// Start the loop.
	loopThroughFiles(structureMap, currentPath);

	// Empty array that will contain missing file names without their physical path.
	const missingFileNames: string[] = [];

	for (let physicalPath of missingPhysicalFilePaths) 
		missingFileNames.push(path.basename(physicalPath));

	return missingFileNames;
}

export function initializeAppData() {

	if (!APPDATA_PATH) {

		electron.dialog.showMessageBoxSync(mainWindow, {
			title: "Fluent Youtube Converter - Application Data",
			message: `Cannot initialize the application since the 'AppData' folder does not exist.`,
			type: "error"
		}); 

		return app.exit();
	};

	const physicalPath: string = path.join(APPDATA_PATH, APPDATA_DIRECTORY_NAME);

	// Checks if the physical path exist on first run.
	// If the path does not exist, the program will then construct 
	// the files and directories recursively.
	if (!fs.existsSync(physicalPath))
		createFolderStructure(APPDATA_DIRECTORY_STRUCTURE, path.join(APPDATA_PATH, APPDATA_DIRECTORY_NAME));

	// Checks if physical path is not missing any files or
	// directories that the application will use later.
	const missingFiles: string[] | null = checkFolderStructure(APPDATA_DIRECTORY_STRUCTURE, path.join(APPDATA_PATH, APPDATA_DIRECTORY_NAME));

	// If checkFolderStructure returned null, exit the 
	// program and show a dialog box with the occurred error.
	if (missingFiles === null) {

		const errorStack = new TypeError("Failed to check folder structure since the given path might not exist.");

		electron.dialog.showMessageBoxSync(mainWindow, {
			title: "Fluent Youtube Converter - NullReferenceError",
			message: `Received 'null' as return value while calling 'checkFolderStructure()'.`,
			detail: errorStack.stack,
			type: "error"
		});

		// Exit the application.
		return app.exit();
	}

	// If there are any missing files, re-create the folder structure on the second run.
	if (missingFiles.length > 0) 
		createFolderStructure(APPDATA_DIRECTORY_STRUCTURE, path.join(APPDATA_PATH, APPDATA_DIRECTORY_NAME));

	return true;
}

export function readSettingsFile(): ReadSettingsFail | ApplicationSettings {

	// Recursively checks if the entire path exists or not.

	if (!APPDATA_PATH) return {
		reason: "Cannot read the application settings file since the 'AppData' folder does not exist.",
		error: new Error("Cannot initialize the application since the 'AppData' folder does not exist.")
	} as ReadSettingsFail;

	if (!fs.existsSync(path.join(APPDATA_PATH, APPDATA_DIRECTORY_NAME))) return {
		reason: `Cannot read the application's settings file since the '${APPDATA_DIRECTORY_NAME}' folder does not exist.`,
		error: new Error(`Cannot read the application's settings file since the '${APPDATA_DIRECTORY_NAME}' folder does not exist.`)
	} as ReadSettingsFail;

	if (!fs.existsSync(path.join(APPDATA_PATH, APPDATA_DIRECTORY_NAME, "Application"))) return {
		reason: `Cannot read the application settings file since the 'Application' folder in ${APPDATA_DIRECTORY_NAME} does not exist.`,
		error: new Error(`Cannot read the application settings file since the 'Application' folder in ${APPDATA_DIRECTORY_NAME} does not exist.`)
	} as ReadSettingsFail;

	if (!fs.existsSync(path.join(APPDATA_PATH, APPDATA_DIRECTORY_NAME, "Application", "Settings.json"))) return {
		reason: `Cannot read the application's settings file since the settings file (Settings.json) does not exist in ${APPDATA_DIRECTORY_NAME}/Application`,
		error: new Error(`Cannot read the application's settings file since the settings file (Settings.json) does not exist in ${APPDATA_DIRECTORY_NAME}/Application`)
	} as ReadSettingsFail;

	// Finally, it's done checking...

	const fileContent: string = fs.readFileSync(path.join(APPDATA_PATH, APPDATA_DIRECTORY_NAME, "Application", "Settings.json"), "utf-8");
	const parsedFileContent = JSON.parse(fileContent);

	return JSON.parse(parsedFileContent);
} // nice 69

export function route(router: Router) {

	router.get("/appdata/settings", requireLogin, function (req: Request, res: Response) {

		const settingsFile = readSettingsFile();

		res.status(200).json(settingsFile);
	});

}