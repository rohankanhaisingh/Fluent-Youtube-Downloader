import electron from "electron";
import fs from "fs";
import path from "path";
import tar, { c } from "tar";
import axios from "axios";
import cp from "child_process";
import stream, { Readable } from "stream";

import { YTDLP_EXECUTABLE_FILENAME } from "../../constants";
import { StreamOutputExtractionEvent, YTDLPInitializationFailReason, YTDLPInitializationResponse, YTDLPInstallationPromptButton } from "../../typings";
import { emit } from "../../socket";
import { mainWindow } from "../../app";
import { getCacheDirectory } from "../../appdata";
import { logError, logInfo } from "../../utils";

export function parseVideoIdFromUrl(videoUrl: string): string {

	const regExp: RegExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;

	const match = videoUrl.match(regExp);

	return (match && match[7].length == 11) ? match[7] : videoUrl;
}

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

		const url: string = "https://github.com/yt-dlp/yt-dlp/releases/download/2023.11.16/yt-dlp.exe";

		const response = await axios({ method: "GET", responseType: "stream", url });

		const fileSize = parseInt(response.headers["content-length"]);

		// This path will end with '.exe' so the directory must be parsed.
		const executionPath: string = electron.app.getPath("exe");
		
		// Get the directory name,
		const directoryName: string = path.dirname(executionPath);

		// Check if the directory exist.
		if (!fs.existsSync(directoryName))
			reject(new Error(`Directory ${directoryName} does not exit.`));

		// Let the client know that the download has started.
		emit("app/yt-dlp/download-started", { fileSize, directoryName });

		let downloadedSize: number = 0;

		response.data.on("data", function (chunk: Buffer) {

			downloadedSize += chunk.length;

			const percentage = 100 / fileSize * downloadedSize;

			// The client also has to know at what percentage the download currently is.
			emit("app/yt-dlp/download-progress", percentage);

			// Epic windows progress bar
			mainWindow.setProgressBar(1 / 100 * percentage);
		});

		// Construct the file path.
		const filePath: string = path.join(directoryName, YTDLP_EXECUTABLE_FILENAME);

		// Creating write stream to, you know do some epic file thingeis and shit.
		const fileStream = fs.createWriteStream(filePath);

		response.data.pipe(fileStream);

		fileStream.on("finish", function () {

			resolve(true);
		});

		fileStream.on('error', function (err: Error) {
			
			reject(err);
		});
	});
}

export function extractStreamOutput(stream: stream.Readable, callback: (event: StreamOutputExtractionEvent) => void) {

	// yt-dlp will download two files, the audio and video files.
	let completedDownload: number = 0;

	const fileDestinations: string[] = [];

	stream.on("data", function (chunk: Buffer) {

		const chunkText = chunk.toString().toLowerCase();

		const words: string[] = chunkText.split(" ");

		const notEmptyWords: string[] = words.filter(word => word.length !== 0);
		
		logInfo(chunkText, "downloading video");

		// Check if the first string has '[download]'
		if (notEmptyWords[0].trim() !== "[download]") return;

		// If yt-dlp determines the physical location of the media files.
		//if (notEmptyWords[1].includes("destination")) {

		//	logInfo(`File part destination reserved at: ${notEmptyWords[2].trim()}`, "ytdlp.ts");
		//	fileDestinations.push(notEmptyWords[2].trim());
		//}
		
		if (!notEmptyWords[1].trim().includes("%") ||
			!notEmptyWords[3].trim().includes("ib") ||
			!notEmptyWords[5].trim().includes("ib/s")) return;

		// Percentage of the download.
		const percentage: number = parseFloat(notEmptyWords[1].trim().replace("%", ""));
	
		// Chunk size in KiB.
		const chunkSize: number = parseFloat(notEmptyWords[3].trim());

		// Download speed in MiB/s
		const downloadSpeed: number = parseFloat(notEmptyWords[5].trim());

		// If any of the download is complete.
		if (percentage === 100)
			completedDownload += 1;

		callback({ isDone: false, percentage, downloadSpeed });
	});


	stream.on("end", function () {

		logInfo(`Executable stream ended.`, "ytdlp.ts");
		return callback({ isDone: true, percentage: 100, downloadSpeed: -1, fileDestinations });
	});
}

/**
 * Gets the chache file based on the given file id.
 * @param fileId
 * @returns
 */
export function getCompleteCacheFile(fileId: string): string | null {

	const cacheDirectory: string | null = getCacheDirectory();

	if (cacheDirectory === null) return null;

	const files: string[] = fs.readdirSync(cacheDirectory);

	const foundFiles: string[] = files.filter(fileName => fileName.startsWith(fileId));

	return path.join(cacheDirectory, foundFiles[0]);
}

export function createYtdlpStream(videoUrl: string, videoQuality: string, extension: string, fileId: string): null | cp.ChildProcess {

	// Checks if the yt-dlp executable exists.
	const executionPath: string = electron.app.getPath("exe");

	// Get the directory name.
	const directoryName: string = path.dirname(executionPath);

	// Checks if the directory actually exists.
	if (!fs.existsSync(directoryName)) {

		console.log("Directory name does not exist.");
		return null;
	}

	// And now it finally checks if the file exists.
	const physicalFilePath: string = path.join(directoryName, YTDLP_EXECUTABLE_FILENAME);

	if (!fs.existsSync(physicalFilePath)) {
		logError(`Cannot start executable since it does not exist at ${physicalFilePath}.`, "ytdlp.ts");
		return null;
	}

	const cacheDirectory: string | null = getCacheDirectory();

	if (cacheDirectory === null)
		return null;

	const parsedVideoId: string = parseVideoIdFromUrl(videoUrl),
		commandString: string = `${physicalFilePath} ${videoUrl} -f ${videoQuality} -o ${cacheDirectory}/${fileId}`

	logInfo(`Starting yt-dlp executable located in ${physicalFilePath}.`, "ytdlp.ts");
	logInfo(commandString, "ytdlp.ts");

	const process = cp.exec(commandString);

	process.stderr?.on("data", function (chunk: Buffer) {

		const text = chunk.toString();

		logError(text, "ytdlp.ts");
	});

	return process;
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