import { c } from "tar";

export class OktaiDeBoktai extends HTMLElement{
	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });
		shadowRoot.innerHTML = "<span>Click me</span>";

		shadowRoot.querySelector("span")?.addEventListener("click", function (e) {
			console.log(e);
		});
	}

	static initialize(): void {
		return customElements.define("oktai-de-boktai", OktaiDeBoktai);
	}
}

export class FluentButton extends HTMLElement {
	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });

		const buttonElement = document.createElement("button");
		buttonElement.setAttribute("part", "control");
		buttonElement.innerHTML = "<span part='content'><slot></slot></span>";

		shadowRoot.appendChild(buttonElement);
		
		FluentButton.getCss().then(css => FluentButton.setCss(shadowRoot, css));
	}

	static setCss(shadowRoot: ShadowRoot, css: string) {

		const styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync(css);

		shadowRoot.adoptedStyleSheets.push(styleSheet);
	}

	static getCss(): Promise<string> {
		return new Promise(function (resolve, reject) {
			return fetch("/static/styles/web-components/_fluent-button.css", { method: "GET" })
				.then(function (responseObject) {
					responseObject.text()
						.then(function (cssText: string) {
							resolve(cssText);
						})
						.catch(function (_err: Error) {
							reject(_err);
						});
				})
				.catch(function (err: Error) {
					reject(err);
				});
		});
	}

	static initialize() {
		customElements.define("fluent-button", FluentButton);
	}
}

export class FluentSelect extends HTMLElement {
	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });

		FluentSelect.constructElement(shadowRoot);
		FluentSelect.setEventListeners(shadowRoot, this);
		FluentSelect.getCss().then(css => FluentSelect.setCss(shadowRoot, css));

		const fluentOptionElements: NodeListOf<HTMLElement> = this.querySelectorAll("fluent-option"),
			firstOptionElement: HTMLElement = fluentOptionElements[0];

		const currentValueElement: HTMLDivElement | null = shadowRoot.querySelector("[part=current-value]");

		if (currentValueElement !== null) {

			firstOptionElement.setAttribute("active", "");

			const currentValue: string | null = firstOptionElement.getAttribute("value");

			if (currentValue !== null) {

				(currentValueElement.querySelector("span") as HTMLSpanElement).innerText = currentValue;
				this.setAttribute("value", (currentValueElement.querySelector("span") as HTMLSpanElement).innerText = currentValue);
			}
		}
	}

	static setEventListeners(shadowRoot: ShadowRoot, mainElement: FluentSelect) {

		const currentValueElement: HTMLDivElement | null = shadowRoot.querySelector("[part=current-value]"),
			dropdownElement: HTMLDivElement | null = shadowRoot.querySelector("[part=dropdown]");

		if (currentValueElement === null || dropdownElement === null) return;

		currentValueElement.addEventListener("click", function () {
			if (!mainElement.classList.contains("in-dropdown"))
				mainElement.classList.add("in-dropdown");
		});

		const slotElement: HTMLSlotElement | null = dropdownElement.querySelector("slot");

		if (slotElement === null) return;

		const slottedItems: Element[] = slotElement.assignedElements();

		slottedItems.forEach(function (node: Element) {

			node.addEventListener("click", function () {

				slottedItems.forEach(_node => _node.removeAttribute("active"));

				node.setAttribute("active", "");

				const nodeValue: string | null = node.getAttribute("value");

				(currentValueElement.querySelector("span") as HTMLSpanElement)
					.innerText = nodeValue !== null ? nodeValue : "";

				mainElement.setAttribute("value", nodeValue !== null ? nodeValue : "");

				if (mainElement.classList.contains("in-dropdown"))
					mainElement.classList.remove("in-dropdown");
			});
		});
	}

	static constructElement(shadowRoot: ShadowRoot) {
		const controlElement = document.createElement("div");
		controlElement.setAttribute("part", "control");

		const currentValueElement = document.createElement("div");
		currentValueElement.setAttribute("part", "current-value");
		currentValueElement.innerHTML = "<span></span><img src='/static/media/icons/windows-icon-down.png' alt='Dropdown'/>";

		const dropdownElement = document.createElement("div");
		dropdownElement.setAttribute("part", "dropdown");
		dropdownElement.innerHTML = "<slot></slot>";

		controlElement.appendChild(currentValueElement);
		controlElement.appendChild(dropdownElement);
		shadowRoot.appendChild(controlElement);
	}

	static setCss(shadowRoot: ShadowRoot, css: string) {

		const styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync(css);

		shadowRoot.adoptedStyleSheets.push(styleSheet);
	}

	static getCss(): Promise<string> {
		return new Promise(function (resolve, reject) {
			fetch("/static/styles/web-components/_fluent-select.css", { method: "GET" })
				.then(function (response) {
					response.text()
						.then(function (css: string) {
							resolve(css);
						})
						.catch(function (_err: Error) {
							reject(_err);
						});
				})
				.catch(function (err: Error) {
					reject(err);
				});
			return null;
		});
	}

	static initialize() {
		customElements.define("fluent-select", FluentSelect);
	}
}

export function initializeFluentDesignSystem() {

	FluentButton.initialize();
	FluentSelect.initialize();
	OktaiDeBoktai.initialize();
}