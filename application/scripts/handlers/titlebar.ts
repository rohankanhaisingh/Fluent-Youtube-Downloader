export function initializeTitleBar() {

	const titlebar: HTMLDivElement | null = document.querySelector(".titlebar");

	if (titlebar === null) return;

	const controlButtons: NodeListOf<HTMLDivElement> = titlebar.querySelectorAll(".titlebar__control-buttons__button");

	controlButtons.forEach(function (button: HTMLDivElement) {

		const dataActionAttribute: string | null = button.getAttribute("data-action");

		if (dataActionAttribute === null) return;

		button.addEventListener("click", function () {

			fetch("/window/control-event", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					action: dataActionAttribute
				})
			});
		});
	});
}