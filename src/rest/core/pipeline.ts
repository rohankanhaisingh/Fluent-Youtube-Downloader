import fs from "fs";
import { Readable } from "stream";
import { MoreVideoDetails } from "ytdl-core";
import path from "path";
import { FfmpegCommand } from "fluent-ffmpeg";


import { readSettingsFile } from "../../appdata";
import { ApplicationSettings, ConversionPipeline, ConvertQuality, StreamConversionProgress } from "../../typings";
import { resolveVideoQuality } from "../../utils";

import stream from "./video-stream";
import details from "./video-details";
import command from "./ffmpeg-stream";

export default async function execute(url: string, qualityString: ConvertQuality, requestId: string): Promise<ConversionPipeline> {

	// Settings must be read before running the entire pipeline.
	const settings = readSettingsFile();

	if (settings.status !== "ok") return {
		state: "failed",
		reason: "ApplicationSettings: Application failed reading settings."
	}

	const casting = settings as ApplicationSettings;

	// Check if the download destination path exist.
	if (casting.path.downloadPath === null) return {
		state: "failed",
		reason: `NullReferenceError: Download path is set to null. Path: ${casting.path.downloadPath}`
	}

	if (!fs.existsSync(casting.path.downloadPath)) return {
		state: "failed",
		reason: `FileSystemError: Given download path does not exist. Path: ${casting.path.downloadPath}`
	};

	// Check if the download destination is an actual directory.
	if (!fs.lstatSync(casting.path.downloadPath).isDirectory()) return {
		state: "failed",
		reason: `FileSystemError: Given download path is not a directory. Path: ${casting.path.downloadPath}`
	};

	// Resolve the video quality.
	const resolvedQuality: string = resolveVideoQuality(qualityString);

	// Need to fetch the video details to grab it's title.
	const videoDetails: MoreVideoDetails = (await details(url)).videoDetails;

	// Try to reserve the file location.
	const physicalFileDestinationPath = path.join(casting.path.downloadPath, videoDetails.title + ".mp4");

	// Make sure that the file does not exist already.
	// Should the file be rewritten if it already exists??????
	if (fs.existsSync(physicalFileDestinationPath)) return {
		reason: `FileSystemError: Reserved file path is already in use. Path: ${physicalFileDestinationPath}`,
		state: "failed"
	};

	console.log("Started video stream.");

	return new Promise(async function (resolve, reject) {

		const convertStream: Readable = await stream(url, resolvedQuality);

		const ffmpegStream: FfmpegCommand = await command(convertStream, physicalFileDestinationPath, {
			onEnd: function () { resolve({state: "ok"}) },
			onError: function (err: Error) { reject(err) },
			onProgress: function (progress: StreamConversionProgress) { console.log(progress.targetSize); }
		});
	});
}