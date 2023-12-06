import fs from "fs";
import ffmpeg, { FfmpegCommand, FfprobeData } from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import path from "path";
import electron from "electron";
import { Readable } from "stream";

import { StreamConversionProgress, StreamConvesionEvents } from "../../typings";
import { MAX_FILE_SIZE } from "../../constants";

import abort from "./abort";

ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffmpegPath.path);

export function probeFfmpeg(filePath: string): Promise<FfprobeData> {

	return new Promise(function (resolve, reject) {

		ffmpeg.ffprobe(filePath, function (err: Error, data: FfprobeData) {

			console.log(`Error: ${err.message}`.red);

			if (err) return reject(err.message);

			return resolve(data);
		});
	});
}

export async function mergeMediaFilesSync(mediaFile1: string, mediaFile2: string, filePath: string): Promise<string | null> {

	// Checks if the yt-dlp executable exists.
	const executionPath: string = electron.app.getPath("exe");

	// Get the directory name.
	const directoryName: string = path.dirname(executionPath);

	// Checks if the directory actually exists.
	if (!fs.existsSync(directoryName)) {

		console.log("Directory name does not exist.");
		return null;
	}

	console.log(`Info: Mergin media files into ${filePath}`);

	// Check if the media files exist.
	if (!fs.existsSync(mediaFile1) || !fs.existsSync(mediaFile2))
		return null;

	console.log("Started merge command.");

	//// Probe media files before attempting to merge.
	//const probe1 = await probeFfmpeg(mediaFile1);
	//const probe2 = await probeFfmpeg(mediaFile2);

	// Alright, fuck probing it then lmaooo
	// this shit doesn't even work because 'show_streams' is
	// an unrecognized option...

	const command: FfmpegCommand = ffmpeg()
		.input(mediaFile2)
		.input(mediaFile1)
		.outputOptions('-c:v libx264') // Video codec voor MP4
		.outputOptions('-c:a aac')     // Audio codec voor MP4
		.save(filePath);

	return new Promise(function (resolve, reject) {

		command.on("end", function () {

			resolve(filePath);
		});
	

		command.on("error", function (err: Error) {

			console.log(`Error: ${err.message}`.red);

			reject(err.message);
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

		console.log("Directory name does not exist.");
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

			console.log("Reached max file size");
		}

		if (events.onProgress) events.onProgress(progress);
	});

	command.on("end", function () {

		if (events.onEnd) events.onEnd();
	});

	command.run();

	return command;
}