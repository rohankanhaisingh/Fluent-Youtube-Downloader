import fs from "fs";
import { Readable } from "stream";
import { MoreVideoDetails } from "ytdl-core";
import path from "path";
import { ChildProcess } from "child_process";

import { createHistoryItem, readSettingsFile } from "../../appdata";
import { ApplicationSettings, ConversionPipeline, ConvertQuality, StreamConversionProgress, StreamOutputExtractionEvent, YTDLPInitializationFailReason } from "../../typings";
import { resolveVideoQuality } from "../../utils";

import stream from "./video-stream";
import details from "./video-details";
import command, { mergeMediaFilesSync } from "./ffmpeg-stream";

import { emit } from "../../socket";
import { createYtdlpStream, extractStreamOutput, initializeYtdlp, promptInstallation } from "./ytdlp";


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

	let videoTitle: string = videoDetails.title;

	// Make sure the delete special characters from the title.
	const specialCharacters: RegExp = /["\\:*?<>|]/;

	for (let character of videoTitle) {
		if (specialCharacters.test(character))
			videoTitle = videoTitle.replace(character, " ");
	}

	// Try to reserve the file location.
	let physicalFileDestinationPath = path.join(casting.path.downloadPath, videoTitle + ".mp4");

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
	console.log("Info: Found yt-dlp executable.".gray);

	// Will create a ChildProcess steam.
	const convertStream: ChildProcess | null = createYtdlpStream(url, qualityString, requestId);

	return new Promise(function (resolve, reject) {

		if (convertStream === null || convertStream.stdout === null)
			return reject(new Error("NullReferenceError: 'convertStream' has defined as null"));

		extractStreamOutput(convertStream.stdout, async function (event: StreamOutputExtractionEvent) {

			if (event.isDone) {

				if (event.fileDestinations) {

					emit("app/yt-dlp/download-video", { percentage: "100% - Merging media files together. This can take a little bit.", requestId });

					const mergeState: string | null = await mergeMediaFilesSync(requestId, physicalFileDestinationPath);

					if (mergeState === null)
						reject(new Error("NullReferenceError: Something went wrong during the process of merging media files."));
				}

				createHistoryItem({
					fileLocation: physicalFileDestinationPath,
					fileName: path.basename(physicalFileDestinationPath),
					requestId: requestId,
					timestamp: Date.now(),
					fileSize: null,
					videoUrl: url,
					thumbnailUrl: videoDetails.thumbnails[0].url
				});

				return resolve({ state: "ok" });
			}

			// Emit the progress of the download to the client.
			emit("app/yt-dlp/download-video", { percentage: event.percentage + "%", requestId });
		});

	});
}