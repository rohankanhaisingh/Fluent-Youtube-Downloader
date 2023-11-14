export function renderToggles() {

	const toggleElements: NodeListOf<HTMLDivElement> = document.querySelectorAll("toggle");

	for (let toggleElement of toggleElements) {

		const toggleClassNames: string | null = toggleElement.getAttribute("class");
		const toggleForAttribute: string | null = toggleElement.getAttribute("for");

		const newToggle = document.createElement("div");
		newToggle.className = "styled-toggle";

		const newToggleContainer = document.createElement("div");
		newToggleContainer.className = "container";
		newToggle.appendChild(newToggleContainer);

		const newToggleThumb = document.createElement("div");
		newToggleThumb.className = "styled-toggle__thumb";
		newToggleContainer.appendChild(newToggleThumb);

		newToggle.addEventListener("click", function () {

			const activeAttribute: string | null = newToggle.getAttribute("active");

			if (activeAttribute === null)
				return newToggle.setAttribute("active", "true");

			if (activeAttribute === "false") {
				newToggle.setAttribute("active", "true");
			} else {
				newToggle.setAttribute("active", "false");
			}


			if (toggleForAttribute) {

				const toggleActiveTextAttribute: string | null = toggleElement.getAttribute("active-text");
				const toggleInActiveTextAttribute: string | null = toggleElement.getAttribute("inactive-text");

				if (toggleActiveTextAttribute !== null && toggleInActiveTextAttribute !== null) {

					const toggleForElement: HTMLElement | null = document.querySelector(toggleForAttribute);
					const currentActiveState: string | null = newToggle.getAttribute("active");

					if (currentActiveState && toggleForElement) {

						toggleForElement.innerText = (currentActiveState === "true") ? toggleActiveTextAttribute : toggleInActiveTextAttribute;
					}
				}
			}

		});

		newToggle.addEventListener("click", function () {

			if (newToggle.classList.contains("active")) {

				newToggle.classList.remove("active");
			} else {

				newToggle.classList.add("active");
			}
		});

		if (toggleClassNames)
			newToggle.classList.add(toggleClassNames);

		toggleElement.replaceWith(newToggle);
	}
}