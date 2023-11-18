interface Thumbnail {
	url: string;
	width: number;
	height: number;
}

interface VideoAuthor {
	channel_url: string
	external_channel_url: string;
	id: string;
	name: string;
	subscriber_count: string;
	thumbnails: Thumbnail[];
	user: string;
	user_url: string;
	verified: boolean;
}

interface VideoDetails {
	videoId: string;
	title: string;
	shortDescription: string;
	description: string;
	lengthSeconds: string;
	keywords?: string[];
	channelId: string;
	isOwnerViewing: boolean;
	isCrawlable: boolean;
	thumbnails: Thumbnail[];
	averageRating: number;
	allowRatings: boolean;
	viewCount: string;
	author: VideoAuthor;
	isPrivate: boolean;
	isUnpluggedCorpus: boolean;
	isLiveContent: boolean;
	uploadDate: string;
	ownerChannelName: string;
	publishDate: string;
	video_url: string;
}

interface DownloadResponse {
	readonly fileName: string;
	readonly fileSize: number;
	readonly endPoint: string;
}

const urlInputField: HTMLDivElement | null = document.querySelector("#input-url"),
	urlSubmitButton: HTMLButtonElement | null = document.querySelector("#button-enter"),
	resultsContainer: HTMLDivElement | null = document.querySelector("#convert-results");

async function submitVideoRequest(url: string) {

	if (url.length === 0) return;

	if (!(url.startsWith("http") || url.startsWith("https"))) return;

	clearInputField();

	const response = await fetch("/rest/video-details", {
		body: JSON.stringify({ url }),
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		}
	});

	const json = await response.json();

	if (!json.videoDetails) return;

	createResultDom(json.videoDetails as VideoDetails);
}

function createResultDom(videoDetails: VideoDetails) {

	if (resultsContainer === null) return;

	const mainElement = document.createElement("div");
	mainElement.className = "convert-results__result";

	mainElement.innerHTML = `
		<div class="convert-results__result__thumbnail">
			<img src="${videoDetails.thumbnails.pop()?.url}" alt="${videoDetails?.title}" />
		</div>
		<div class="convert-results__result__info">
			<div class="convert-results__result__info__title">${videoDetails.title}</div>
			<div class="convert-results__result__info__author"><img src="${videoDetails.author.thumbnails.pop()?.url}" alt="Author" />${videoDetails.author.user} - ${videoDetails.author.subscriber_count} subscribers</div>
			<div class="convert-results__result__info__description">${videoDetails.description}</div>
			<div class="convert-results__result__info__button">Convert</div>
			<div class="convert-results__result__info__button">Info</div>
		</div>
	`;

	resultsContainer.appendChild(mainElement);
}

function clearInputField() {

	if (urlInputField === null) return;

	return urlInputField.innerText = "";
}

function handleInputField(event: KeyboardEvent) {

	if (urlInputField === null) return;

	const inputContent: string = urlInputField.innerText;

	if (event.keyCode === 13) {

		submitVideoRequest(inputContent);
		event.preventDefault();
	}

}

function disableDivEditing(event: ClipboardEvent) {

	event.preventDefault();

	if (event.clipboardData === null) return;

	const clipbardData: DataTransfer = event.clipboardData;

	var text = event.clipboardData.getData('text/plain');

	document.execCommand('insertText', false, text);
}

urlSubmitButton?.addEventListener("click", function () {

	if (urlInputField === null) return;

	submitVideoRequest(urlInputField.innerText);
});

urlInputField?.addEventListener("keydown", handleInputField);
urlInputField?.addEventListener("paste", disableDivEditing);