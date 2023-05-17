const {
	app,
	BrowserWindow,
	dialog,
	shell,
	globalShortcut,
	autoUpdater,
	clipboard,
} = require('electron');
if (require('electron-squirrel-startup')) app.quit();
const { GlobalKeyboardListener } = require('node-global-key-listener');
const {
	getCharFromKey,
	validateInput,
	getClientUrl,
	clearLogs,
	openLogsFile,
	getVersion,
	isRobloxClientFocused,
} = require('./utils');
const Input = require('./input');
const path = require('path');
require('./updater');
const { DOCS_PAGE } = require('./constants');
const Store = require('electron-store');
const log = require('electron-log');
const mouseEvents = require('global-mouse-events');

// override console logging functions with electron based logging
Object.assign(console, log.functions);

const store = new Store();

const CLIENT_URL = getClientUrl();

let win;
const input = new Input();
let v;

/**
 * @param {string} input
 */
input.onInputChange = input => {
	if (input.length > 0) {
		win.webContents.executeJavaScript(
			`document.querySelector('.listening').classList.add('hidden'); document.querySelector('.command').classList.remove('hidden'); document.getElementById('command-value').innerText = '${input}';`
		);
	} else {
		win.webContents.executeJavaScript(
			`document.querySelector('.listening').classList.remove('hidden'); document.querySelector('.command').classList.add('hidden');`
		);
	}
};

const done = async () => {
	const valid = validateInput(input.value);
	if (!valid) {
		return;
	}

	if (input.value.startsWith('/panel')) {
		shell.openExternal(`${CLIENT_URL}/panel`);
		return;
	}

	// delay to avoid preventing chat from being sent
	await new Promise(resolve => {
		setTimeout(async () => {
			const newWin = new BrowserWindow({
				width: 600,
				height: 600,
				webPreferences: {
					nativeWindowOpen: true,
				},
				autoHideMenuBar: true,
				backgroundColor: '#101113',
				icon: 'https://melonly.xyz/brand/logo.png',
				modal: true,
			});
			newWin.setAlwaysOnTop(true, 'screen-saver');
			await newWin.loadURL(`${CLIENT_URL}/command?command=${input.value}`);
			resolve();
		}, 100);
	});
};

const createWindow = () => {
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nativeWindowOpen: true,
		},
		autoHideMenuBar: true,
		backgroundColor: '#101113',
		icon: 'https://melonly.xyz/brand/logo.png',
	});

	// open links in default browser window
	win.webContents.setWindowOpenHandler(e => {
		shell.openExternal(e.url);
	});

	win.loadFile(path.join(__dirname, 'index.html'));

	mouseEvents.on('mousedown', () => {
		input.reset();
	});

	v = new GlobalKeyboardListener();
	v.addListener(async (e, down) => {
		if (e.state === 'UP') return;

		if (e.name === 'CAPS LOCK') {
			input.capsLocked = !input.capsLocked;
			return;
		}

		if (!isRobloxClientFocused()) {
			input.reset();
			return;
		}

		const ctrl = down['LEFT CTRL'] || down['RIGHT CTRL'];
		const shift = down['LEFT SHIFT'] || down['RIGHT SHIFT'];

		if (e.name === 'FORWARD SLASH' && !input.isFocused) {
			input.focus();
			return;
		}

		if (
			input.isFocused &&
			(e.name === 'RETURN' || e.name === 'NUMPAD RETURN')
		) {
			await done();
			input.reset();
			return;
		}

		if (input.isFocused && ctrl && down.A) {
			input.selectAll();
			return;
		}

		if (
			e.name === 'LEFT ARROW' ||
			(e.name === 'RIGHT ARROW' && input.isFocused)
		) {
			const direction = e.name === 'LEFT ARROW' ? -1 : 1;
			if (ctrl) {
				input.bulkSelect(direction, !shift);
				return;
			}

			input.sideArrow(direction, shift);
			return;
		}

		if (input.isFocused && (e.name === 'UP ARROW' || e.name === 'DOWN ARROW')) {
			const direction = e.name === 'UP ARROW' ? -1 : 1;
			input.arrowJump(direction, shift);
			return;
		}

		if (input.isFocused && e.name === 'BACKSPACE') {
			input.delete();
			return;
		}

		if (input.isFocused && ctrl && down.V) {
			input.insert(clipboard.readText('clipboard'));
			return;
		}

		if (input.isFocused && (!ctrl || e.name === 'W' || e.name === 'I')) {
			const ch = getCharFromKey(e, down, input.capsLocked);
			if (!ch) return;
			input.insert(ch);
			return;
		}
	});
};

const showPrivacyDialog = async () => {
	if (store.get('accepted-privacy') === true)
		return console.log('Privacy already accepted');

	const { response } = await dialog.showMessageBox(win, {
		title: 'Privacy & Security Statement',
		message:
			'This application uses keystrokes to know when you run a command. No keystrokes or data is stored or sent to Melonly. Click LEARN MORE to see our docs and how we protect your privacy.',
		buttons: ['OK', 'LEARN MORE'],
		icon: path.join(__dirname, '..', 'images', 'logo.png'),
	});

	console.log('Accepted privacy dialog');
	store.set('accepted-privacy', true);

	if (response === 1) {
		shell.openExternal(DOCS_PAGE);
	}
};

const registerShortcuts = () => {
	const success = globalShortcut.register('CommandOrControl+F6', async () => {
		const { response } = await dialog.showMessageBox(win, {
			message: `Would you like to open the logs file?\nRunning version: ${getVersion()}`,
			buttons: ['NO', 'YES'],
			icon: path.join(__dirname, '..', 'images', 'logo.png'),
		});

		if (response === 1) {
			console.log('Opening logs file');
			openLogsFile();
		}
	});

	console.log(
		success
			? 'Registered logs file shortcut'
			: 'Failed to register logs file shortcut'
	);
};

app.whenReady().then(() => {
	// clear logs
	clearLogs();

	console.log('Ready');
	console.log(`Running version : ${getVersion()}`);

	registerShortcuts();

	createWindow();

	if (app.isPackaged) {
		console.log('Checking for updates on startup');
		autoUpdater.checkForUpdates();
	}

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});

	showPrivacyDialog();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
	v?.kill();
});
