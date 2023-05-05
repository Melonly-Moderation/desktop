const { app, BrowserWindow } = require('electron');
const { GlobalKeyboardListener } = require('node-global-key-listener');
const { getCharFromKey, validateInput } = require('./utils');
const Input = require('./input');
const path = require('path');

let win;
const input = new Input();

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
		mod.default('http://localhost:3000/panel');
		return;
	}

	const newWin = new BrowserWindow({
		width: 600,
		height: 600,
		webPreferences: {
			nativeWindowOpen: true,
		},
		autoHideMenuBar: true,
		backgroundColor: '#101113',
	});
	newWin.focus();
	newWin.moveTop();
	await newWin.loadURL(`http://localhost:3000/command?command=${input.value}`);
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
	});

	win.loadFile(path.join(__dirname, 'index.html'));

	const v = new GlobalKeyboardListener();
	v.addListener((e, down) => {
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
			done();
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
