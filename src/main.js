require('dotenv').config();
const { app, BrowserWindow } = require('electron');
if (require('electron-squirrel-startup')) app.quit();
const { GlobalKeyboardListener } = require('node-global-key-listener');
const { getCharFromKey, validateInput, getClientUrl } = require('./utils');
const Input = require('./input');
const path = require('path');
require('./updater');
const mouseEvents = require('global-mouse-events');

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
	console.log('command:', input.value);

	const valid = validateInput(input.value);
	if (!valid) {
		console.log('Command is invalid');
		return;
	}

	if (input.value.startsWith('/panel')) {
		const mod = await import('open');
		mod.default(`${CLIENT_URL}/panel`);
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
			});
			newWin.focus();
			newWin.moveTop();
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

	win.loadFile(path.join(__dirname, 'index.html'));

	mouseEvents.on('mousedown', () => {
		console.log('mouse down, resetting input');
		input.reset();
	});

	v = new GlobalKeyboardListener();
	v.addListener(async (e, down) => {
		if (e.state === 'UP') return;

		if (e.name === 'CAPS LOCK') {
			input.capsLocked = !input.capsLocked;
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

		if (e.name === 'LEFT ARROW' || e.name === 'RIGHT ARROW') {
			const direction = e.name === 'LEFT ARROW' ? -1 : 1;
			if (shift && ctrl) {
				input.bulkSelect(direction);
				return;
			}

			input.sideArrow(direction, shift === true);
			return;
		}

		if (input.isFocused && e.name === 'BACKSPACE') {
			input.delete();
			return;
		}

		if (input.isFocused) {
			const ch = getCharFromKey(e, down, input.capsLocked);
			if (!ch) return;
			input.insert(ch);
			return;
		}
	});
};

app.whenReady().then(() => {
	console.log('Ready');
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
	v?.kill();
});
