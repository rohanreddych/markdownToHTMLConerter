const marked = require("marked");
const path = require("path");
// const remote = require("electron").remote;
const { ipcRenderer, remote, shell } = require("electron");
const mp = remote.require("./main");
const currentWindow = remote.getCurrentWindow();

let filePath = null;
let orginalContent = null;
let isEdited = false;

const markdownView = document.querySelector("#markdown");
const htmlView = document.querySelector("#html");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
const saveMarkdownButton = document.querySelector("#save-markdown");
const revertButton = document.querySelector("#revert");
const saveHtmlButton = document.querySelector("#save-html");
const showFileButton = document.querySelector("#show-file");
const openInDefaultButton = document.querySelector("#open-in-default");

const updateUI = (isEdited) => {
	let title = "Fires Sale";
	if (filePath) {
		title = `${path.basename(filePath)} - ${title}`;
	}
	//console.log({ isEdited });
	if (isEdited) {
		currentWindow.setTitle("*" + title);
	} else {
		currentWindow.setTitle(title);
	}

	saveHtmlButton.disabled = !isEdited;
	saveMarkdownButton.disabled = !isEdited;
	showFileButton.disabled = !filePath;
	openInDefaultButton.disabled = !filePath;

	revertButton.disabled = !isEdited;
};

const renderMarkdownToHtml = (markdown) => {
	htmlView.innerHTML = marked(markdown, { sanitize: true });
};

markdownView.addEventListener("keyup", (event) => {
	const currentContent = event.target.value;
	//isEdited = currentContent !== orginalContent;
	renderMarkdownToHtml(currentContent);
	updateUI(currentContent !== orginalContent);
});

openFileButton.addEventListener("click", () => {
	mp.getFileFromuser();
	shell.showItemInFolder(filePath);
});

showFileButton.addEventListener("click", () => {
	if (!filePath) {
		return alert("NOOOO");
	}
});

ipcRenderer.on("file-opened", (event, file, content) => {
	filePath = file;
	orginalContent = content;

	markdownView.value = content;
	renderMarkdownToHtml(content);
	updateUI();
});

saveMarkdownButton.addEventListener("click", () => {
	mp.saveMarkDown(filePath, markdownView.value);
});

const saveHTMLF = () => {
	mp.saveHtmlFile(htmlView.innerHTML);
};

saveHtmlButton.addEventListener("click", saveHTMLF);

ipcRenderer.on("save-html", saveHTMLF);

document.addEventListener("dragstart", (event) => event.preventDefault());
document.addEventListener("dragover", (event) => event.preventDefault());
document.addEventListener("dragleave", (event) => event.preventDefault());
document.addEventListener("drop", (event) => event.preventDefault());

const getDraggedFile = (event) => event.dataTransfer.items[0];
const getDroppedFile = (event) => event.dataTransfer.files[0];
const fileTypeIsSupported = (file) => {
	return ["text/plain", "text/markdown"].includes(file.type);
};
markdownView.addEventListener("dragover", (event) => {
	const file = getDraggedFile(event);
	if (fileTypeIsSupported(file)) {
		markdownView.classList.add("drag-over");
	} else {
		markdownView.classList.add("drag-error");
	}
});
markdownView.addEventListener("dragleave", () => {
	markdownView.classList.remove("drag-over");
	markdownView.classList.remove("drag-error");
});

markdownView.addEventListener("drop", (event) => {
	const file = getDroppedFile(event);
	markdownView.classList.remove("drag-over");
	markdownView.classList.remove("drag-error");
	if (fileTypeIsSupported(file)) {
		mp.openFile(file.path);
	} else {
		alert("Not supported");
	}
});
