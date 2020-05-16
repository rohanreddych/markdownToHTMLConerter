const electron = require("electron");
const fs = require("fs");
const { BrowserWindow, app, dialog, Menu } = require("electron");
//const app = electron.app;
var mainWindow = null;
app.on("ready", () => {
	mainWindow = new BrowserWindow({ show: false });
	mainWindow.loadFile(`${__dirname}/index.html`);
	Menu.setApplicationMenu(applicationMenu);
	mainWindow.once("ready-to-show", () => {
		mainWindow.show();
	});
});

exports.getFileFromuser = () => {
	const files = dialog.showOpenDialog({
		properties: ["openFile"],
		buttonLabel: "rohan",
		filters: [{ name: "Text Files ", extensions: ["txt", "md"] }],
	});

	if (!files) return;

	const file = files[0];
	openFile(file);
};

exports.saveMarkDown = (file, content) => {
	if (!file) {
		file = dialog.showSaveDialog({
			title: "Save MarkDown",
			defaultPath: app.getPath("home"),
			filters: [
				{ name: "MarkDown Files", extensions: ["md", "markdown", "mdown"] },
			],
		});
	}

	if (!file) return;
	fs.writeFileSync(file, content);
	openFile(file);
};

exports.saveHtmlFile = (content) => {
	file = dialog.showSaveDialog({
		title: "Save HTML",
		filters: [{ name: "HTML Files", extensions: ["html"] }],
	});
	if (!file) return;
	fs.writeFileSync(file, content);
};

const openFile = (exports.openFile = (file) => {
	const contents = fs.readFileSync(file).toString();
	app.addRecentDocument(file);
	mainWindow.webContents.send("file-opened", file, contents);
});

const template = [
	{
		label: "File",
		submenu: [
			{
				label: "Open File",
				click() {
					console.log("Open File");
				},
			},
			{
				label: "Quit",
				role: "quit",
			},
			{
				label: "Save HTML",
				click() {
					mainWindow.webContents.send("save-html");
				},
			},
		],
	},
];

const applicationMenu = Menu.buildFromTemplate(template);
