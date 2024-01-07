import { FluentButton } from "./fluent-renderer";

const dialogContainer: HTMLDivElement | null = document.querySelector(".app-dialogs");

const activeDialogs: HTMLDivElement[] = [];



function constructBaseDomElement() {

	const dialogElement = document.createElement("div");
	dialogElement.className = "dialog";

	dialogElement.innerHTML = `
		<div class="dialog__container container">
            <div class="dialog__modal">
                <div class="dialog__modal__titlebar">
                    <div class="dialog__modal__titlebar__container">
                        <div class="dialog__modal__titlebar__text"></div>
                        <img class="dialog__modal__titlebar__icon" src="/static/media/icons/windows-icon-close.png" alt="Close dialog" />
                    </div>
                </div>
                <div class="dialog__modal__content">
                    <div class="dialog__modal__content__container">
                        <div class="dialog__modal__content__icon"></div>
                        <div class="dialog__modal__content__text"></div>
                    </div>
                </div>
            </div>
        </div>
	`;

    return dialogElement;
}

function setTitle(mainElement: HTMLDivElement, title: string) {

    const titlebarTextElement: HTMLDivElement | null = mainElement.querySelector(".dialog__modal__titlebar__text");

    if (titlebarTextElement === null) return;

    titlebarTextElement.innerText = title;
}

function setMessage(mainElement: HTMLDivElement, message: string | string[]) {

    const contentTextElement: HTMLDivElement | null = mainElement.querySelector(".dialog__modal__content__text");

    if (contentTextElement === null) return;

    const spanElement = document.createElement("span");

    spanElement.innerHTML = Array.isArray(message) ? message.join("<br /><br />") : message;

    contentTextElement.appendChild(spanElement);
   
}

function setIcon(mainElement: HTMLDivElement, iconType: DialogIcon) {

    const contentIconElement = mainElement.querySelector(".dialog__modal__content__icon");

    if (contentIconElement === null) return;

    let iconHref: string = "/static/media/icons/windows-color-icon-info.png";

    switch (iconType) {
        case "error":
            iconHref = "/static/media/icons/windows-color-icon-error.png"
            break;
        case "warning":
            iconHref = "/static/media/icons/windows-color-icon-warning.png";
            break;
        case "info":
            iconHref = "/static/media/icons/windows-color-icon-info.png";
            break;
        default:
            iconHref = "/static/media/icons/windows-color-icon-info.png";
            break;
    }

    const imageElement = document.createElement("img");
    imageElement.src = iconHref;
    imageElement.alt = "Dialog";

    contentIconElement.appendChild(imageElement);
}

function setButtons(mainElement: HTMLDivElement, buttons: DialogButton[]) {

    const contentTextElement: HTMLDivElement | null = mainElement.querySelector(".dialog__modal__content__text");

    if (contentTextElement === null) return;

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "dialog__modal__content__text__buttons";

    buttons.forEach(function (button: DialogButton) {

        const buttonElement: string = `<fluent-button>${button.label}</fluent-button>`;

        buttonContainer.innerHTML += buttonElement;
    });

    contentTextElement.appendChild(buttonContainer);
}

declare global {
    interface Window {
        showDialog: (title: string, message: string | string[], icon: DialogIcon, buttons: DialogButton[]) => void;
    }
}

export interface DialogButton {
	label: string;
	onClick: () => void;
}

export type DialogIcon = "info" | "warning" | "error";

export function showDialog(title: string, message: string | string[], icon: DialogIcon, buttons: DialogButton[]) {

    if (dialogContainer === null) return;

    if (activeDialogs.length >= 1) return;

    const baseElement = constructBaseDomElement();

    setTitle(baseElement, title);
    setMessage(baseElement, message);
    setIcon(baseElement, icon);
    setButtons(baseElement, buttons);

    dialogContainer.appendChild(baseElement);

    activeDialogs.push(dialogContainer);
}

export function initializeDialogUsage() {

    window.showDialog = showDialog;
}