import { Ease } from "@babahgee/easings";
import { v4 } from "uuid";
import { Socket } from "socket.io-client";

import { renderSelects } from "../handlers/dom-generator";
import { getClient } from "../handlers/socket";

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
	age_restricted: boolean;
	availableCountries: string[];
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

declare global {
	interface Window {
		activeDownloads: { [RequestID: string]: ActiveDownload };
	}
}

const urlInputField: HTMLDivElement | null = document.querySelector("#input-url"),
	urlSubmitButton: HTMLButtonElement | null = document.querySelector("#button-enter"),
	resultsContainer: HTMLDivElement | null = document.querySelector("#convert-results"),
	videoInfoContainer: HTMLDivElement | null = document.querySelector("#video-info"),
	convertPage: HTMLDivElement | null = document.querySelector(".page-convert");

renderSelects();

window.activeDownloads = {};

class ActiveDownload {
	declare public requestId: string;
	declare public domElement: HTMLElement;

	constructor(requestId: string, domElement: HTMLElement) {

		this.requestId = requestId;
		this.domElement = domElement;
	}

	public setProgress(downloadedBytes: string) {

		if (this.domElement === null) return;

		const downloadText: HTMLDivElement | null = this.domElement.querySelector(".convert-results__result__info__progression__text");

		if (downloadText === null) return;

		downloadText.innerText = `Downloaded ${downloadedBytes}.`;
	}
	public setFinishState() {

		if (this.domElement === null) return;

		if (this.domElement.classList.contains("downloading"))
			this.domElement.classList.remove("downloading");
	}
}


async function submitVideoRequest(url: string) {

	if (url.length === 0) return;

	if (!(url.startsWith("http") || url.startsWith("https"))) return;

	clearInputField();

	const skeletonElement = createSkeletonDom();

	if (skeletonElement === null) return;

	const response = await fetch("/rest/video-details", {
		body: JSON.stringify({ url }),
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		}
	});

	const json = await response.json();

	if (response.status === 200) {

		if (json.videoDetails)
			createResultDom(json.videoDetails as VideoDetails, skeletonElement);
	} else {
		skeletonElement.remove();
	} 
}

function createSkeletonDom() {

	if (resultsContainer === null) return null;

	const mainElement = document.createElement("div");
	mainElement.className = "convert-results__result skeleton";

	mainElement.innerHTML = `
		<div class="convert-results__result__thumbnail">
            <svg class="spinner">
                <circle>
                    <animateTransform attributeName="transform" type="rotate" values="-90;810" keyTimes="0;1" dur="2s" repeatCount="indefinite"></animateTransform>
                    <animate attributeName="stroke-dashoffset" values="0%;0%;-157.080%" calcMode="spline" keySplines="0.61, 1, 0.88, 1; 0.12, 0, 0.39, 0" keyTimes="0;0.5;1" dur="2s" repeatCount="indefinite"></animate>
                    <animate attributeName="stroke-dasharray" values="0% 314.159%;157.080% 157.080%;0% 314.159%" calcMode="spline" keySplines="0.61, 1, 0.88, 1; 0.12, 0, 0.39, 0" keyTimes="0;0.5;1" dur="2s" repeatCount="indefinite"></animate>
                </circle>
            </svg>
        </div>
        <div class="convert-results__result__info">
            <div class="convert-results__result__info__title"></div>
            <div class="convert-results__result__info__author"></div>
            <div class="convert-results__result__info__description"></div>
            <div class="convert-results__result__info__button"></div>
            <div class="convert-results__result__info__button"></div>
            <div class="convert-results__result__info__button"></div>
        </div>
	`;

	resultsContainer.appendChild(mainElement);

	const scrollHeight = resultsContainer.scrollHeight,
		currentScroll = resultsContainer.scrollTop;

	Ease(currentScroll, scrollHeight, "easeOutExpo", 1000, function (scroll: number) {

		resultsContainer.scrollTop = scroll;
	});

	return mainElement;
}

function displayVideoInfo(videoDetails: VideoDetails) {

	if (videoInfoContainer === null || convertPage === null) return;

	if (!convertPage.classList.contains("in-video-info"))
		convertPage.classList.add("in-video-info");

	const outputDom = `

        <div class="video-info__thumbnail">
            <img class="video-info__thumbnail__image" src="${videoDetails.thumbnails.pop()?.url}" alt="Alternate Text" />
            <div class="video-info__thumbnail__author">
                <img class="video-info__thumbnail__author__image" src="${videoDetails.author.thumbnails.pop()?.url}" alt="Alternate Text" />
                <div class="video-info__thumbnail__author__text" alt="Alternate Text">${videoDetails.author.name}</div>
            </div>
        </div>

        <div class="video-info__title">${videoDetails.title}</div>

        <div class="video-info__hl"></div>

        <div class="video-info__items">
            <div class="video-info__item">
                <img class="video-info__item__icon" src="/static/media/icons/windows-icon-batch_assign.png" alt="Subscribers" />
                <div class="video-info__item__text">Author has <b>${videoDetails.author.subscriber_count}</b> subscribers.</div>
            </div>
            <div class="video-info__item">
                <img class="video-info__item__icon" src="/static/media/icons/windows-icon-verified_account.png" alt="Verified" />
                <div class="video-info__item__text">Author <b>${videoDetails.author.verified ? "is" : "is not"}</b> verified.</div>
            </div>
            <div class="video-info__item">
                <img class="video-info__item__icon" src="/static/media/icons/windows-icon-name.png" alt="Original name" />
                <div class="video-info__item__text">The channel name is <b>${videoDetails.author.name}</b>.</div>
            </div>
            <div class="video-info__item">
                <img class="video-info__item__icon" src="/static/media/icons/windows-icon-18-plus.png" alt="Age restricted" />
                <div class="video-info__item__text">Video <b>${videoDetails.age_restricted ? "is" : "is not"}</b> age restricted.</div>
            </div>
            <div class="video-info__item">
                <img class="video-info__item__icon" src="/static/media/icons/windows-icon-language.png" alt="Language" />
                <div class="video-info__item__text">Supported in <b>${videoDetails.availableCountries.length}</b> countries.</div>
            </div>
            <div class="video-info__item">
                <img class="video-info__item__icon" src="/static/media/icons/windows-icon-countdown_clock.png" alt="Duration" />
                <div class="video-info__item__text">Video is <b>${videoDetails.lengthSeconds}</b> seconds long.</div>
            </div>
            <div class="video-info__item">
                <img class="video-info__item__icon" src="/static/media/icons/windows-icon-eye.png" alt="Views" />
                <div class="video-info__item__text">Video has <b>${videoDetails.viewCount}</b> views.</div>
            </div>
        </div>

        <div class="video-info__hl"></div>

        <div class="video-info__description">${videoDetails.description}</div>
	`;

	const contentElement = document.createElement("div");
	contentElement.className = "video-info__content";

	contentElement.innerHTML = outputDom;

	videoInfoContainer.replaceChildren(contentElement);
}

async function downloadVideo(url: string, quality: string, resultDomElement: HTMLDivElement) {

	const requestId: string = v4();

	const words: string[] = quality.toLocaleLowerCase().split(" ");
	const constructedWord = words.join("-");

	if (!resultDomElement.classList.contains("downloading"))
		resultDomElement.classList.add("downloading");

	window.activeDownloads[requestId] = new ActiveDownload(requestId, resultDomElement);

	// Should start the download async.
	await fetch("/rest/download", {
		body: JSON.stringify({ url, requestId, quality: constructedWord }),
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		}
	});

	// Will change the dom element anyway.
	resultDomElement.classList.remove("downloading");

	// Remove the request id.
	if (typeof window.activeDownloads[requestId] !== "undefined")
		delete window.activeDownloads[requestId];
}

function createResultDom(videoDetails: VideoDetails, skeletonDomElement: HTMLDivElement) {

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
			<div class="convert-results__result__info__button-container">
				<div class="convert-results__result__info__button" id="button-convert">Convert</div>
				<option-select class="convert-results__result__info__select" id="select-quality">
					<option active="true">bestvideo+bestaudio</option>
					<option>Best</option>
					<option>Worst</option>
					<option>Bestvideo</option>
					<option>Bestaudio</option>
				</option-select>
				<div class="convert-results__result__info__button" id="button-info">Info</div>
			</div>
			<div class="convert-results__result__info__progression">
				<svg class="convert-results__result__info__progression__spinner spinner">
					<circle>
						<animateTransform attributeName="transform" type="rotate" values="-90;810" keyTimes="0;1" dur="2s" repeatCount="indefinite"></animateTransform>
						<animate attributeName="stroke-dashoffset" values="0%;0%;-157.080%" calcMode="spline" keySplines="0.61, 1, 0.88, 1; 0.12, 0, 0.39, 0" keyTimes="0;0.5;1" dur="2s" repeatCount="indefinite"></animate>
						<animate attributeName="stroke-dasharray" values="0% 314.159%;157.080% 157.080%;0% 314.159%" calcMode="spline" keySplines="0.61, 1, 0.88, 1; 0.12, 0, 0.39, 0" keyTimes="0;0.5;1" dur="2s" repeatCount="indefinite"></animate>
					</circle>
				</svg>
				<div class="convert-results__result__info__progression__text">Preparing the download...</div>
			</div>
		</div>
	`;

	const convertButton = mainElement.querySelector("#button-convert") as HTMLDivElement;
	const infoButton = mainElement.querySelector("#button-info") as HTMLDivElement;

	convertButton.addEventListener("click", function () {

		const qualityButton = mainElement.querySelector("#select-quality") as HTMLDivElement; 
		const qualityValue: string | null = qualityButton.getAttribute("value");

		if (qualityValue === null) return;

		downloadVideo(videoDetails.video_url, qualityValue, mainElement);
	});

	infoButton.addEventListener("click", function () {

		displayVideoInfo(videoDetails);
	});

	skeletonDomElement.replaceWith(mainElement);

	renderSelects();

	return mainElement;
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