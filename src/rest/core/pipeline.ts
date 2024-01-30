import fs from "fs";
import { Readable } from "stream";
import { MoreVideoDetails } from "ytdl-core";
import path from "path";
import { ChildProcess } from "child_process";

import { createHistoryItem, readSettingsFile } from "../../appdata";
import { ApplicationSettings, ConversionPipeline, ConvertQuality, ResolvedVideoInfo, StreamConversionProgress, StreamOutputExtractionEvent, YTDLPInitializationFailReason } from "../../typings";
import { logError, logInfo, logWarning, resolveVideoQuality } from "../../utils";

import stream from "./video-stream";
import details from "./video-details";
import command, { changeFileExtension, mergeMediaFilesSync } from "./ffmpeg-stream";

import { emit } from "../../socket";
import { createYtdlpStream, extractStreamOutput, getCompleteCacheFile, initializeYtdlp, promptInstallation } from "./ytdlp";

function checkSettingsProperties(settings: ApplicationSettings): ConversionPipeline | string {

	if (settings.path.downloadPath === null) return {
		state: "failed",
		reason: `NullReferenceError: Download path is set to null. Path: ${settings.path.downloadPath}. Configure the download path in the settings.`
	}

	if (!fs.existsSync(settings.path.downloadPath)) return {
		state: "failed",
		reason: `FileSystemError: Given download path does not exist. Path: ${settings.path.downloadPath}`
	};

	// Check if the download destination is an actual directory.
	if (!fs.lstatSync(settings.path.downloadPath).isDirectory()) return {
		state: "failed",
		reason: `FileSystemError: Given download path is not a directory. Path: ${settings.path.downloadPath}`
	};

	return settings.path.downloadPath;
}

async function resolveVideoInfo(url: string): Promise<ResolvedVideoInfo> {

	const videoDetails: MoreVideoDetails = (await details(url)).videoDetails;

	let videoTitle: string = videoDetails.title;

	// Make sure the delete special characters from the title.
	const specialCharacters: RegExp = /["\\:*?<>|]/;

	for (let character of videoTitle) {
		if (specialCharacters.test(character))
			videoTitle = videoTitle.replace(character, " ");
	}

	return {
		videoTitle,
		videoThumbnail: videoDetails.thumbnails[0].url
	}

}

async function preInitializeYtdlp(): Promise<ConversionPipeline> {

	// Initialize ytdlp
	const ytdlpInitializationState: boolean | YTDLPInitializationFailReason = initializeYtdlp();

	// Return error state if ytdlp failed initting you dunno!
	if (!ytdlpInitializationState) {
		logError(`Failed initializing yt-dlp due to an unknown reason.`, "pipeline.ts");
		return { state: "failed", reason: "Could not initialize yt-dlp due to a unknown reason." }
	}

	// If the reason why the init failed is because the executable is not found,
	// ask the user to install it.
	if (ytdlpInitializationState === "executable-not-found") {

		const isInstalled: boolean | Error = await promptInstallation();

		if (isInstalled instanceof Error) {

			logError(`Failed installing yt-dlp.exe. Reason: ${isInstalled.message}.`, "pipeline.ts");
			return { state: "failed", reason: isInstalled.message }
		}

		if (!isInstalled) return {
			state: "failed",
			reason: "Fluent YouTube Downloader may not work if the dependency has not been installed. You can either install it within this application or manually install the dependency from GitHub."
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

	return {
		state: "ok"
	}
}

export default async function execute(url: string, qualityString: ConvertQuality, extension: string, requestId: string): Promise<ConversionPipeline> {

	logInfo(`Starting conversion pipeline using the following arguments: url: ${url}, qualityString: ${qualityString}, requestId: ${requestId}, extension: ${extension}`, "pipeline.ts");
	
	const settings = readSettingsFile();

	if (settings.status !== "ok") return {
		state: "failed",
		reason: "ApplicationSettings: Application failed reading settings."
	}

	// Check for settings properties, to make sure everything is set up correctly.
	// When the check passed, the variable will eventually be a string referring to the download path.
	const settingsCheck: ConversionPipeline | string = checkSettingsProperties(settings as ApplicationSettings);

	if (typeof settingsCheck !== "string") return settingsCheck;
	
	const videoInfo: ResolvedVideoInfo = await resolveVideoInfo(url);
	
	let physicalFileDestinationPath = path.join(settingsCheck, videoInfo.videoTitle + "." + extension);
	
	if (fs.existsSync(physicalFileDestinationPath)) return {
		reason: `FileSystemError: Reserved file path is already in use. Path: ${physicalFileDestinationPath}`,
		state: "failed"
	};

	const preInitializedYtdlp = await preInitializeYtdlp();

	if (preInitializedYtdlp.state !== "ok") return preInitializedYtdlp;
	
	logInfo(`Found yt-dlp executable in application's root file.`, "pipeline.ts");

	// Will convert the video to mp4 anyways.
	const convertStream: ChildProcess | null = createYtdlpStream(url, qualityString, extension, requestId);

	return new Promise(function (resolve, reject) {

		if (convertStream === null || convertStream.stdout === null)
			return reject(new Error("NullReferenceError: 'convertStream' has defined as null"));

		convertStream.stderr?.on("data", function (chunk: Buffer) {

			const errorText: string = chunk.toString();

			logError(errorText, "pipeline.ts");
			reject(new Error(errorText));
		});

		extractStreamOutput(convertStream.stdout, async function (event: StreamOutputExtractionEvent) {

			if (event.isDone) {

				if (event.fileDestinations && extension === "mp4") {

					emit("app/yt-dlp/download-video", { percentage: "Merging media files together. This can take a little bit.", requestId });

					const mergeState: string | null = await mergeMediaFilesSync(requestId, physicalFileDestinationPath);

					if (mergeState === null)
						return reject(new Error("NullReferenceError: Something went wrong during the process of merging media files."));
				} else {

					const cacheFile: string | null = getCompleteCacheFile(requestId);

					if (cacheFile === null)
						return reject(new Error("NullReferenceError: Could not change media file into something else because the cache file could not be found."));

					emit("app/yt-dlp/download-video", { percentage: "Post processing media files. This can take a while.", requestId });

					try {
						await changeFileExtension(cacheFile, extension, physicalFileDestinationPath);
					} catch (err: unknown) {
						return reject(new Error((err as Error).message));
					}
				}

				logInfo(`Succesfully downloaded ${url}.`, "pipeline.ts");

				createHistoryItem({
					fileLocation: physicalFileDestinationPath,
					fileName: path.basename(physicalFileDestinationPath),
					requestId: requestId,
					timestamp: Date.now(),
					fileSize: null,
					videoUrl: url,
					thumbnailUrl: videoInfo.videoThumbnail
				});

				return resolve({ state: "ok" });
			}

			// Emit the progress of the download to the client.
			emit("app/yt-dlp/download-video", { percentage: event.percentage + "%", requestId });
		});

	});
}