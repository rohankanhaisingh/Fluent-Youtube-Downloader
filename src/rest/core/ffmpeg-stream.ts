import fs from "fs";
import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { Readable } from "stream";

import { StreamConversionProgress, StreamConvesionEvents } from "../../typings";
import { MAX_FILE_SIZE } from "../../constants";

import abort from "./abort";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export default function execute(convertStream: Readable, destinationPath: string, events: StreamConvesionEvents) {

	const command: FfmpegCommand = ffmpeg(convertStream)
		.audioCodec('aac')
		.audioBitrate(128)
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