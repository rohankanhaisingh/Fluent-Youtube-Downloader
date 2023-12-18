
export class FluentButton extends HTMLElement {
	constructor() {
		super();

		this.attachShadow({ mode: "open" });

		const shadowRoot = this.shadowRoot;

		if (shadowRoot === null) return;

		shadowRoot.innerHTML = FluentButton.constructElement();

		FluentButton.getCss().then(function (text: string) {
			shadowRoot.innerHTML += `<style>${text}</style>`;
		});
	}

	static constructElement(): string {
		return `
			<button part="control">
				<span part="content">
					<slot></slot>
				</span>
			</button>
		`;
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

		const fluentOptionElements: NodeListOf<HTMLElement> = this.querySelectorAll("fluent-option"),
			firstOptionElement: HTMLElement = fluentOptionElements[0];

		shadowRoot.innerHTML += FluentSelect.constructElement();

		const currentValueElement: HTMLDivElement | null = shadowRoot.querySelector("[part=current-value]"),
			dropdownElement: HTMLDivElement | null = shadowRoot.querySelector("[part=dropdown]");

		if (currentValueElement !== null) {

			firstOptionElement.classList.add("active");

			(currentValueElement.querySelector("span") as HTMLSpanElement)
				.innerText = firstOptionElement.innerText;
		}

		FluentSelect.setEventListeners(shadowRoot);
		FluentSelect.getCss().then(function (css: string) {
			shadowRoot.innerHTML += `<style>${css}</style>`;
		});
	}

	static setEventListeners(shadowRoot: ShadowRoot) {

		console.log(shadowRoot.querySelector("[part=dropdown]"));

		console.log(shadowRoot);

	}

	static constructElement(): string {
		return `
			<div part="control">
				<div part="current-value">
					<span></span>
					<img src="/static/media/icons/windows-icon-down.png" alt="Dropdown"/>
				</div>
				<div part="dropdown">
					<slot></slot>
				</div>
			</div>
		`;
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
}