import electron from "electron";
import fs from "fs";
import path from "path";
import tar from "tar";
import axios from "axios";

import { TAR_FILE_NAME, YTDLP_EXECUTABLE_FILENAME } from "../../constants";
import { PromptResult, YTDLPInitializationFailReason, YTDLPInitializationResponse, YTDLPInstallationPromptButton } from "../../typings";

export function checkForInstallation(): YTDLPInitializationResponse {

	// Will end with '.exe'.
	const executionPath: string = electron.app.getPath("exe");

	// Extract the directory name.
	const directoryName: string = path.dirname(executionPath);

	// Check if the execution path exists.
	if (!fs.existsSync(directoryName)) return {
		state: "failed",
		message: `The path '${executionPath}' does not exist.`,
		reason: "execution-directory-not-found"
	}

	const physicalFileLocation: string = path.join(directoryName, YTDLP_EXECUTABLE_FILENAME);

	if (!fs.existsSync(physicalFileLocation)) return {
		state: "failed",
		message: `The exectable '${YTDLP_EXECUTABLE_FILENAME}' in '${executionPath}' has not been found`,
		reason: "executable-not-found"
	}

	return { state: "ok" }
} 

/**
 * Extracts the tar file.
 * This function should NOT be called because the file 
 * should be a .exe file/
 * @param directoryName
 * @param tarFileName
 * @returns
 */
export function extractTarFile(directoryName: string, tarFileName: string): boolean {

	const filePath: string = path.join(directoryName, tarFileName);

	// Check if the file exists.
	if (!fs.existsSync(filePath)) return false;

	// Extract the file using sync mode.
	tar.extract({
		cwd: directoryName,
		file: filePath,
		sync: true,
	});

	return true;
}

export function downloadYtdlp(): Promise<boolean> {

	return new Promise(async function (resolve, reject) {

		const { dialog } = electron;

		const url: string = "https://github.com/yt-dlp/yt-dlp/releases/download/2023.11.16/yt-dlp.exe";

		const response = await axios({ method: "GET", responseType: "stream", url });

		// This path will end with '.exe' so the directory must be parsed.
		const executionPath: string = electron.app.getPath("exe");

		// Get the directory name,
		const directoryName: string = path.dirname(executionPath);

		// Check if the directory exist.
		if (!fs.existsSync(directoryName)) reject(new Error(`Directory ${directoryName} does not exit.`));

		// TODO: Implement a progress thingy.
		// response.data.on('data', function (chunk: Buffer) { });

		// Construct the file path.
		const filePath: string = path.join(directoryName, YTDLP_EXECUTABLE_FILENAME);

		// Creating write stream to, you know do some epic file thingeis and shit.
		const fileStream = fs.createWriteStream(filePath);

		response.data.pipe(fileStream);

		fileStream.on("finish", function () {

			console.log(`Release downloaded to: ${directoryName}.`);
			resolve(true);
		});

		fileStream.on('error', function (err: Error) {
			
			reject(err);
		});
	});
}

/**
 * Prompts the user if yt-dlp should
 * be downloaded and installed.
 * @returns
 */
export async function promptInstallation(): Promise<boolean | Error> {

	const { dialog } = electron;

	const executionPath: string = electron.app.getPath("exe");

	const pressedButton: YTDLPInstallationPromptButton = dialog.showMessageBoxSync({
		title: "yt-dlp executable not found",
		message: `The exectable '${YTDLP_EXECUTABLE_FILENAME}' in '${executionPath}' has not been found`,
		type: "question",
		detail: `Fluent Youtube Download needs access to a yt-dlp executable to convert YouTube video's into any media format. Would you like to download the latest release from Github? (https://github.com/yt-dlp/yt-dlp).\nYoutube Fluent Downloader will restart after the installation.`,
		buttons: ["Yes", "No"]
	});

	// If the user accepted the installation, then 
	// the latest version of yt-dlp will be installed.
	if (pressedButton === YTDLPInstallationPromptButton.Yes) {

		try {

			// The promise will reject if any
			// error occurred while downloading and
			// installing yt-dlp from github.
			await downloadYtdlp();

			// Returns true if everything went okay.
			// so if the user accepted it and the download
			// succeed.
			return true;

		} catch (err) {

			// Returns the error if any obviously
			// occurred while downloading.
			return err as Error;
		};
	}

	// Returns false if the user denied the
	// yt-dlp installation prompt.
	return false;
}

export function initializeYtdlp(): boolean | YTDLPInitializationFailReason {

	const installationCheck: YTDLPInitializationResponse = checkForInstallation();

	// If the installation check succeed.
	if (installationCheck.state === "ok") return true;

	// If there is no valid reason or a detailed messate of why the initialization failed.
	if (!installationCheck.reason || !installationCheck.message) return false;

	// Return the reason why the initialization failed.
	return installationCheck.reason;
}