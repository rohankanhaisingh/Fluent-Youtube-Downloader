import "./handlers/theme";

import { requestPage } from "./handlers/spa-handler";

const navigationButtons: NodeListOf<HTMLElement> = document.querySelectorAll(".navigation-button");

navigationButtons.forEach(function (button: HTMLElement) {

	const requestUrl: string | null = button.getAttribute("data-href");

	if (requestUrl === null) return;

	button.addEventListener("click", function (event) {

		requestPage(requestUrl);
	});
});