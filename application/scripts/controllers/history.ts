import { FluentButton, FluentInput } from "../handlers/fluent-renderer";
import { get, getClient, post } from "../handlers/socket";

export interface HistoryItem {
    readonly videoUrl: string;
    readonly requestId: string;
    readonly fileName: string;
    readonly fileSize: number;
    readonly fileLocation: string;
    readonly timestamp: number;
    readonly thumbnailUrl: string;
}

const historyContainer: HTMLDivElement | null = document.querySelector(".history-container"),
    searchInputField: FluentInput | null = document.querySelector("#search-input-field"),
    clearHistoryButton: FluentButton | null = document.querySelector("#clear-history-button");

function parseDateText(timestamp: number): string {

    const now = Date.now();
    const date = timestamp;

    const timeDifference = now - date;
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} day(s) ago`;
    } else if (hours > 0) {
        return `${hours} hour(s) ago`;
    } else if (minutes > 0) {
        return `${minutes} minute(s) ago`;
    } else {
        return `${seconds} second(s) ago`;
    }
}

function createHistoryDomElement(fileName: string, timestamp: string, physicalPath: string, fileSize: number, videoUrl: string, requestId: string, thumbnailUrl: string) {

	if (historyContainer === null) return;

	const historyItem = document.createElement("div");
	historyItem.className = "history-item";

    historyItem.innerHTML = `
        <div class="history-item__thumbnail">
            <img src="${thumbnailUrl}" alt="${fileName}" />
        </div>
		<div class="history-item__content">
            <div class="history-item__filename">${fileName}</div>
            <div class="history-item__timestamp">Downloaded ${timestamp}.</div>
            <div class="history-item__hl"></div>
            <div class="history-item__detail">Downloaded in: ${physicalPath}</div>
            <div class="history-item__detail">File size: ${fileSize}</div>
            <div class="history-item__detail">Video URL: ${videoUrl}</div>
            <div class="history-item__detail">Request ID: ${requestId}</div>
        </div>
        <div class="history-item__buttons">
            <fluent-button id="download-button">Download</fluent-button>
            <fluent-button id="open-button">Open</fluent-button>
            <fluent-button id="delete-button">Delete file</fluent-button>
        </div>
	`;

    historyContainer.appendChild(historyItem);

    const downloadButton = historyItem.querySelector("#download-button") as HTMLDivElement,
        openButton = historyItem.querySelector("#open-button") as HTMLDivElement,
        deleteButton = historyItem.querySelector("#delete-button") as HTMLDivElement;

    openButton.addEventListener("click", function () {

        post("app/open-file", { fileName, requestId, physicalPath });
    });

    deleteButton.addEventListener("click", function () {

        post("app/delete-file", { fileName, requestId, physicalPath });
    });

    downloadButton.addEventListener("click", function () {

        window.requestPage("/tabs/convert");
    });
}

function handleSearch() {

    if (searchInputField === null) return;

    searchInputField.addEventListener("input", function () {

        const value: string | null = searchInputField.getAttribute("value");

        if (value === null) return;

        const historyItems: NodeListOf<HTMLDivElement> = document.querySelectorAll(".history-item");

        historyItems.forEach(function (item: HTMLDivElement) {

            const itemFileName: HTMLDivElement | null = item.querySelector(".history-item__filename");

            if (itemFileName === null) return;

            if (!itemFileName.innerText.toLocaleLowerCase().includes(value.toLocaleLowerCase()))
                return item.classList.add("hidden");

            item.classList.remove("hidden");
        });
    });
}

function handleClearHistoryButton() {

    if (clearHistoryButton === null) return;

    clearHistoryButton.addEventListener("click", function () {

        const historyItems: NodeListOf<HTMLDivElement> = document.querySelectorAll(".history-item");

        historyItems.forEach(function (item: HTMLDivElement) {

            item.remove();
        });

        post("/appdata/clear-history", null);
    });
}

async function loadController() {

    const history: HistoryItem[] = await get("/appdata/history");

    if (typeof history.reverse !== "function") return;

    history.reverse().forEach(function (historyItem: HistoryItem) {

        if (historyItem.timestamp === null) return;
        
        createHistoryDomElement(historyItem.fileName, parseDateText(historyItem.timestamp), historyItem.fileLocation, historyItem.fileSize, historyItem.videoUrl, historyItem.requestId, historyItem.thumbnailUrl);
    });

    handleSearch();
    handleClearHistoryButton();
}

loadController();