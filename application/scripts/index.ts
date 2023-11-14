import { initializeTitleBar } from "./handlers/titlebar";
import { initializeSideMenu } from "./handlers/side-menu";

import { renderToggles } from "./handlers/dom-generator";

import { requestPage } from "./handlers/spa-handler";

const navigationButtons: NodeListOf<HTMLElement> = document.querySelectorAll(".navigation-button");

navigationButtons.forEach(function (button: HTMLElement) {

	const requestUrl: string | null = button.getAttribute("data-href");

	if (requestUrl === null) return;

	button.addEventListener("click", function (event) {

		requestPage(requestUrl);
	});
});

window.addEventListener("load", function () {

	requestPage("/tabs/home");

	renderToggles();
	initializeTitleBar();
	initializeSideMenu();
});