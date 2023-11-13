const renderContainer: HTMLDivElement | null = document.querySelector(".content-swappable");

export function formatNewDocument(html: string): Document {

	const parser = new DOMParser();

	return parser.parseFromString(html, "text/html");
}

export function setHeadContent(head: HTMLHeadElement) {

	const oldHeadElements = document.head.getElementsByTagName("*"),
		newHeadElements = head.getElementsByTagName("*");

	for (let oldHeadElement of oldHeadElements) {

		for (let newHeadElement of newHeadElements) {

			if (oldHeadElement.tagName === newHeadElement.tagName) {

				oldHeadElement.replaceWith(newHeadElement);
			}
		}
	}
}

export function replaceChildren(newBodyContents: HTMLElement) {

	if (renderContainer === null) return;

	renderContainer.replaceChildren(newBodyContents);
}

export function swapPageContents(newDoc: Document, response: Response) {

	if (renderContainer === null) return;

	const bodyContent = newDoc.body,
		headContent = newDoc.head;

	setHeadContent(headContent);
	replaceChildren(bodyContent);

	renderContainer.setAttribute("data-url", response.url);
}

export async function requestPage(pageUrl: string) {

	const response = await fetch(pageUrl, { method: "GET", headers: {"Content-Type": "text/html"} });
	const responseText = await response.text();

	const formattedDocument: Document = formatNewDocument(responseText);
	swapPageContents(formattedDocument, response);
}