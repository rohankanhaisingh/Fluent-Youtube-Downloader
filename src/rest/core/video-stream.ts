import ytdl, { MoreVideoDetails } from "ytdl-core";
import { Readable } from "stream";

import details from "./video-details";

export default function execute(videoUrl: string, resolvedVideoQuality: string): Promise<Readable> {

	return new Promise(async function (resolve, reject) {
		
		try {

			const stream = ytdl(videoUrl, { filter: "videoandaudio" });

			resolve(stream);
		} catch (err) {

			reject(err);
		}
	});
}