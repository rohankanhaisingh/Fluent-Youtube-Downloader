import fs from "fs";
import { Readable } from "stream";
import { MoreVideoDetails } from "ytdl-core";
import path from "path";
import { FfmpegCommand } from "fluent-ffmpeg";


import { readSettingsFile } from "../../appdata";
import { ApplicationSettings, ConversionPipeline, ConvertQuality, StreamConversionProgress, YTDLPInitializationFailReason } from "../../typings";
import { resolveVideoQuality } from "../../utils";

import stream from "./video-stream";
import details from "./video-details";
import command from "./ffmpeg-stream";

import { createYtdlpStream, initializeYtdlp, promptInstallation } from "./ytdlp";

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
		reason: `NullReferenceError: Download path is set to null. Path: ${casting.path.downloadPath}. Configure the download path in the settings.`
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

	// Initialize ytdlp
	const ytdlpInitializationState: boolean | YTDLPInitializationFailReason = initializeYtdlp();

	// Return error state if ytdlp failed initting you dunno!
	if (!ytdlpInitializationState) return {
		state: "failed",
		reason: "Could not initialize yt-dlp due to a unknown reason."
	}

	// If the reason why the init failed is because the executable is not found,
	// ask the user to install it.
	if (ytdlpInitializationState === "executable-not-found") {

		const isInstalled: boolean | Error = await promptInstallation();

		if (isInstalled instanceof Error) return {
			state: "failed",
			reason: isInstalled.message
		}

		if (!isInstalled) return {
			state: "failed",
			reason: "User denied the prompt"
		}

		return {
			state: "installation-succeed",
			reason: "Succesfully installed yt-dlp. You need to restart the application."
		}
	}

	if (ytdlpInitializationState === "execution-directory-not-found") return {
		state: "failed",
		reason: "Execution directory could not be found."
	}

	// The code down below will only run IF
	// yt-dlp has succesfully initialized.

	console.log("Found yt-dlp executable.");

	const convertStream: Readable | null = createYtdlpStream(url, qualityString, physicalFileDestinationPath);

	if (convertStream === null)
		throw new Error("NullReferenceError: 'convertStream' has defined as null");

	// Create the youtube converting stream.
	// const convertStream: Readable = await stream(url, resolvedQuality);

	return new Promise(async function (resolve, reject) {

		const convertStream: Readable = await stream(url, resolvedQuality);

		const start: number = Date.now();

		const ffmpegStream: FfmpegCommand = await command(convertStream, physicalFileDestinationPath, {
			onEnd: function () {

				const end = Date.now();

				const difference = end - start;

				console.log(difference / 1000 + "seconds");

				resolve({ state: "ok" })
			},
			onError: function (err: Error) { reject(err) },
			onProgress: function (progress: StreamConversionProgress) {
				// console.log(progress.targetSize);
			}
		});
	});
}