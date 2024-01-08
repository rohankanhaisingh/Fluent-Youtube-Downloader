

export function collapseSideMenu() {

	const sideMenu: HTMLDivElement | null = document.querySelector(".app-side-menu"),
		app: HTMLDivElement | null = document.querySelector(".app");

	if (sideMenu === null || app === null) return;

	if (!sideMenu.classList.contains("collapsed"))
		sideMenu.classList.add("collapsed");

	if (!app.classList.contains("side-menu-collapsed"))
		app.classList.add("side-menu-collapsed");
}

export function expandSideMenu() {

	const sideMenu: HTMLDivElement | null = document.querySelector(".app-side-menu"),
		app: HTMLDivElement | null = document.querySelector(".app");

	if (sideMenu === null || app === null) return;

	if (sideMenu.classList.contains("collapsed"))
		sideMenu.classList.remove("collapsed");

	if (app.classList.contains("side-menu-collapsed"))
		app.classList.remove("side-menu-collapsed");
}

export function initializeSideMenu() {

	const sideMenu: HTMLDivElement | null = document.querySelector(".app-side-menu");

	if (sideMenu === null) return;

	const menuButtons: NodeListOf<HTMLDivElement> = sideMenu.querySelectorAll(".side-menu__button");
	const menuExpandButton: HTMLDivElement | null = sideMenu.querySelector(".expand-button");

	menuExpandButton?.addEventListener("click", function () {

		if (sideMenu.classList.contains("collapsed")) {
			expandSideMenu();
		} else {
			collapseSideMenu();
		}
	});

	// Adds functionality for page navigations.
	menuButtons.forEach(function (button: HTMLDivElement) {

		const hasChangableClassName: boolean = button.classList.contains("changable");

		if (!hasChangableClassName) return;

		button.addEventListener("click", function () {

			menuButtons.forEach(btn => btn.classList.remove("active"));

			button.classList.add("active");

		});
	});

	let isHoveringOverMenu: boolean = false;
	let activeTimeout: number | null = null;

	sideMenu.addEventListener("mouseenter", function () {

		isHoveringOverMenu = true;
	});

	sideMenu.addEventListener("mouseleave", function () {

		isHoveringOverMenu = false;

		if (activeTimeout !== null) window.clearTimeout(activeTimeout);
		activeTimeout = null;
	});

	sideMenu.addEventListener("mousemove", function () {

		if (activeTimeout !== null) return;

		activeTimeout = window.setTimeout(function () {

			if (sideMenu.classList.contains("collapsed"))
				expandSideMenu();
		}, 1000);
	});
}