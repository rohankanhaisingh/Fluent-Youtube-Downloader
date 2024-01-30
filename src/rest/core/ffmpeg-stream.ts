import fs from "fs";
import ffmpeg, { FfmpegCommand, FfprobeData } from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import path from "path";
import electron from "electron";
import { Readable } from "stream";

import { StreamConversionProgress, StreamConvesionEvents } from "../../typings";
import { AUDIO_FILE_EXTENSIONS, MAX_FILE_SIZE } from "../../constants";

import abort from "./abort";
import { getCacheDirectory } from "../../appdata";
import { mainWindow } from "../../app";
import { logError, logInfo, logWarning } from "../../utils";

ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffmpegPath.path);

export function probeFfmpeg(filePath: string): Promise<FfprobeData> {

	return new Promise(function (resolve, reject) {

		ffmpeg.ffprobe(filePath, function (err: Error, data: FfprobeData) {

			if (err) return reject(err.message);

			return resolve(data);
		});
	});
}

export function checkMediaParts(fileName: string): string[] {

	const cacheDirectory: string | null = getCacheDirectory();

	if (cacheDirectory === null) return [];

	const files: string[] = fs.readdirSync(cacheDirectory);

	const matchedFiles: string[] = [];

	for (let file of files)
		if (file.startsWith(fileName)) matchedFiles.push(path.join(cacheDirectory, file));

	return matchedFiles;
}

export function moveMediaFile(mediaPartPath: string, fileOutputPath: string): boolean | Error {

	if (!fs.existsSync(mediaPartPath))
		return new Error("Could not move media part since given media part does not exist. Path: " + mediaPartPath);

	if (fs.existsSync(fileOutputPath))
		return new Error("Could not move media part since the given output path is already in use. Path: " + fileOutputPath);
		
	logInfo(`Attempting to copy ${mediaPartPath} into ${fileOutputPath}.`, "ffmpeg-stream.ts");

	try {
		const mediaPartFileData: Buffer = fs.readFileSync(mediaPartPath);
		fs.writeFileSync(fileOutputPath, mediaPartFileData);
		return true;
	} catch (err) {
		logError((err as Error).message, "ffmpeg-stream");
		return err as Error;
	}
}

export async function mergeMediaFilesSync(fileId: string, fileOutputPath: string): Promise<string | null> {

	return new Promise(function (resolve, reject) {

		const mediaParts: string[] = checkMediaParts(fileId);

		// Some video's might come with just one file.
		// The file must be the complete file.
		if (mediaParts.length === 1) {

			const moveState: Error | boolean = moveMediaFile(mediaParts[0], fileOutputPath);

			if (moveState)
				return resolve(fileOutputPath);

			return reject(moveState);
		}

		if (mediaParts.length !== 2) {

			logError("Failed to merge media files. No files has been found.", "ffmpeg-stream.ts");
			return reject(new Error("Could not find media files to merge."));
		}

		logInfo(`Attempting to merge media files together...`, "ffmpeg-stream.ts");
		logWarning(`The processing of merging media files can take a while.`, "ffmpeg-stream.ts");

		const command: FfmpegCommand = ffmpeg()
			.input(mediaParts[0])
			.input(mediaParts[1])
			.outputOptions('-c:v copy') // Video codec voor MP4
			.outputOptions('-c:a aac')     // Audio codec voor MP4
			.addOption("-speed", "8")
			.save(fileOutputPath);

		command.on("end", function () {
			logInfo(`Succesfully merged media files into ${fileOutputPath}.`, "ffmpeg-stream.ts");
			resolve(fileOutputPath);
		});

		command.on("progress", function (progress: StreamConversionProgress) {

		});

		command.on("error", function (err: Error) {

			electron.dialog.showMessageBox(mainWindow, {
				title: "FFMPEG error",
				message: err.message + "\nRestarting the application could solve the problem.",
				detail: err.stack
			})

			logError(`ffmpeg.exe failed with reason: ${err.message}.`, "ffmpeg-stream.ts");
			reject(err.message);
		});
	});
}

export function changeFileExtension(mediaPart: string, extension: string, fileDestination: string): Promise<boolean> {

	return new Promise(function (resolve, reject) {

		logInfo(`Attempting to convert ${mediaPart} into ${fileDestination} with extension ${extension}.`, "ffmpeg-stream.ts");

		const isAudioExtension: boolean = AUDIO_FILE_EXTENSIONS.includes(extension);

		if (!isAudioExtension) return reject(new Error(`Attempt to convert ${mediaPart} into ${fileDestination} failed because the given extension is not supported.`));

		const command: FfmpegCommand = ffmpeg()
			.input(mediaPart)
			.outputOptions("-q:a 0")
			.outputOptions("-map a")
			.save(fileDestination);

		command.on("end", function () {
			resolve(true);
		});

		command.on("error", function (err: Error) {

			logError(`ffmpeg.exe failed with reason: ${err.message}.`, "ffmpeg-stream");
			reject(new Error(`ffmpeg.exe failed with reason: ${err.message}.`));
		});
	});
}

export default function execute(convertStream: Readable, destinationPath: string, events: StreamConvesionEvents) {

	// Checks if the yt-dlp executable exists.
	const executionPath: string = electron.app.getPath("exe");

	// Get the directory name.
	const directoryName: string = path.dirname(executionPath);

	// Checks if the directory actually exists.
	if (!fs.existsSync(directoryName)) {

		logError(`The directory of where the local executable should be located at, does not exist. ${directoryName}.`, "ffmpeg-stream.ts");
		return null;
	}

	const command: FfmpegCommand = ffmpeg(convertStream)
		.addOption("-preset", "ultrafast")
		.save(destinationPath);

	let hasStoppedProcess: boolean = false;

	command.on("error", async function (err: Error) {
		
		await abort(command, convertStream, destinationPath);

		if (events.onError) events.onError(err, true);
	})

	command.on("progress", async function (progress: StreamConversionProgress) {

		const downloadedBytes: number = progress.targetSize / 1000;

		if (downloadedBytes >= MAX_FILE_SIZE) {

			if (hasStoppedProcess) return;

			hasStoppedProcess = true;

			await abort(command, convertStream, destinationPath);

			logError("File has reached maximum file size.", "ffmpeg-stream.ts");
		}

		if (events.onProgress) events.onProgress(progress);
	});

	command.on("end", function () {

		if (events.onEnd) events.onEnd();
	});

	command.run();

	return command;
}