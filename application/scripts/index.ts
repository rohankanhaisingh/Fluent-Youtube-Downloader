import { initializeTitleBar } from "./handlers/titlebar";
import { initializeSideMenu } from "./handlers/side-menu";

import { renderToggles } from "./handlers/dom-generator";
import { requestPage } from "./handlers/spa-handler";

const navigationButtons: NodeListOf<HTMLElement> = document.querySelectorAll(".navigation-button");
const appLoader = document.querySelector(".app-loader") as HTMLDivElement;

navigationButtons.forEach(function (button: HTMLElement) {

	const requestUrl: string | null = button.getAttribute("data-href");

	if (requestUrl === null) return;

	button.addEventListener("click", function (event) {

		requestPage(requestUrl);
	});
});

window.addEventListener("load", function () {

	requestPage("/tabs/convert");

	renderToggles();
	initializeTitleBar();
	initializeSideMenu();

	this.setTimeout(function () {

		appLoader.classList.add("fadeout");
	}, 500);
});