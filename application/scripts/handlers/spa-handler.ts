declare global {
	interface Window {
		requestPage: (pageUrl: string) => void;
	}
}

const renderContainer: HTMLDivElement | null = document.querySelector(".content-swappable");

async function waitFor(ms: number): Promise<void> {
	return new Promise(function (resolve) {
		setTimeout(resolve, ms);
	});
}

/**
 * Function that replaces the current title with a new one.
 * @param config A '<spa-config>' configuration list element
 * @returns {HTMLTitleElement | null}
 */
export function setTitle(config: HTMLElement | null): HTMLTitleElement | null {

	if (config === null) return null;

	// Get the SPA title element from the configuration.
	const spaTitle: HTMLElement | null = config.querySelector("spa-title");

	// Get the current document title.
	const oldTitle: HTMLTitleElement | null = document.head.querySelector("title");

	if (spaTitle === null || oldTitle === null) return null;

	// Creates a new DOM title element and appends the text from the SPA title to it.
	const newTitle: HTMLTitleElement = document.createElement("title");
	newTitle.textContent = spaTitle.innerText;

	// Replace the old document title with the new one.
	oldTitle.replaceWith(newTitle);

	return newTitle;
}

export function removeCurrentSpaStylesheets() {

	const currentStylesheets: NodeListOf<HTMLLinkElement> = document.querySelectorAll("link");

	for (let stylesheet of currentStylesheets) {

		const spaAttribute: string | null = stylesheet.getAttribute("spa-element-type");

		if (spaAttribute === "spa-stylesheet")
			stylesheet.remove();
	}
}

export function removeCurrentSpaScripts() {

	const currentScripts: NodeListOf<HTMLScriptElement> = document.querySelectorAll("script");

	for (let stylesheet of currentScripts) {

		const spaAttribute: string | null = stylesheet.getAttribute("spa-element-type");

		if (spaAttribute === "spa-script")
			stylesheet.remove();
	}
}

export function setStylesheets(config: HTMLElement | null) {

	if (config === null) return;

	const spaStylesheetList: HTMLElement | null = config.querySelector("spa-stylesheets");

	if (spaStylesheetList === null) return;

	removeCurrentSpaStylesheets();

	const spaStylesheets: NodeListOf<HTMLElement> = spaStylesheetList.querySelectorAll("spa-stylesheet");

	for (let spaStylesheet of spaStylesheets) {

		const attributeNames: string[] = spaStylesheet.getAttributeNames();

		const stylesheetLink: HTMLLinkElement = document.createElement("link");

		stylesheetLink.setAttribute("spa-element-type", "spa-stylesheet");
		stylesheetLink.setAttribute("spa-element-id", crypto.randomUUID());

		for (let attributeName of attributeNames) {

			const spaStylesheetAttribute: string | null = spaStylesheet.getAttribute(attributeName);

			if (spaStylesheetAttribute !== null)
				stylesheetLink.setAttribute(attributeName, spaStylesheetAttribute);
		}

		document.head.appendChild(stylesheetLink);
	}
}

export function setScripts(config: HTMLElement | null) {

	if (config === null) return;

	const spaScriptsList: HTMLElement | null = config.querySelector("spa-scripts");

	if (spaScriptsList === null) return;

	removeCurrentSpaScripts();

	const spaScripts: NodeListOf<HTMLElement> = spaScriptsList.querySelectorAll("spa-script");

	for (let spaScript of spaScripts) {

		const attributeNames = spaScript.getAttributeNames();

		const scriptElement: HTMLScriptElement = document.createElement("script");

		scriptElement.setAttribute("spa-element-type", "spa-script");
		scriptElement.setAttribute("spa-element-id", crypto.randomUUID());

		for (let attributeName of attributeNames) {

			const spaStylesheetAttribute: string | null = spaScript.getAttribute(attributeName);

			if (spaStylesheetAttribute !== null)
				scriptElement.setAttribute(attributeName, spaStylesheetAttribute);
		}

		document.body.appendChild(scriptElement);
	}
}

export function replaceChildren(contents: HTMLElement | null) {

	if (renderContainer === null || contents === null) return;

	renderContainer.replaceChildren(...contents.childNodes);
}

export async function swapPageContents(newDoc: Document, response: Response) {

	if (renderContainer === null) return;

	renderContainer.classList.remove("fadein");

	await waitFor(100);

	const documentBody: HTMLElement = newDoc.body,
		documentConfig: HTMLElement | null = documentBody.querySelector("spa-config"),
		documentContent: HTMLElement | null = documentBody.querySelector("spa-dom-content");

	setTitle(documentConfig);
	setStylesheets(documentConfig);
	setScripts(documentConfig);

	replaceChildren(documentContent);

	renderContainer.classList.add("fadein");
	renderContainer.setAttribute("data-url", response.url);
}


export function formatNewDocument(html: string): Document {

	const parser = new DOMParser();

	return parser.parseFromString(html, "text/html");
}

export async function requestPage(pageUrl: string) {

	fetch(pageUrl, { method: "GET", headers: { "Content-Type": "text/html" } })
		.then(function (response: Response) {

			response.text()
				.then(function (responseText: string) {

					// if (window.history)
						// window.history.pushState({ switched: true }, location.href, pageUrl);

					const formattedDocument: Document = formatNewDocument(responseText);

					return swapPageContents(formattedDocument, response);
				}).catch(function (err) {

					console.log(err.message);
				});

		}).catch(function (err: Error) {

			console.log(err.message);
		});
}

window.requestPage = requestPage;