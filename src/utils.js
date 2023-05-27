const { app, shell } = require('electron');
const { Keys, alphabet, commands } = require('./constants');
const fs = require('fs');
const path = require('path');
const { windowManager } = require('node-window-manager');
const Store = require("electron-store");

const store = new Store();

module.exports.getCharFromKey = (e, down, capsLocked) => {
	let upperCase = capsLocked;

	const shift = down['LEFT SHIFT'] || down['RIGHT SHIFT'];

	if (shift) upperCase = !upperCase;

	let ch;
	if (shift && alphabet.indexOf(e.name) === -1) {
		ch = Keys[`Shift+${Keys[e.name]}`];
	} else {
		ch = Keys[e.name];
	}

	if (upperCase && ch) {
		ch = ch.toUpperCase();
	}

	return ch;
};

module.exports.validateInput = input => {
	const parts = input.split(' ');
	const commandName = parts[0];
	if (!commandName) return false;

	const command = commands.find(({ name }) => name === commandName);
	if (!command) return false;

	const args = parts.splice(1);
	if (args.length < command.minArgs) return false;

	if (command.validateArgs) {
		if (!command.validateArgs(args)) return false;
	}

	return true;
};

const getEnv = () => {
	return fs.readFileSync(path.join(__dirname, 'environment.txt'), {
		encoding: 'utf-8',
	});
};
module.exports.getEnv = getEnv;

module.exports.getClientUrl = () => {
	switch (getEnv()) {
		case 'production':
			return 'https://melonly.xyz';
		case 'beta':
			return 'https://dev.melonly.xyz';
		case 'development':
			return 'http://localhost:3000';
		default:
			throw new Error('Invalid env');
	}
};

module.exports.clearLogs = () => {
	fs.rmSync(path.join(app.getPath('userData'), 'logs'), {
		recursive: true,
		force: true,
	});
	console.log('Cleared previous logs file');
};

module.exports.openLogsFile = () => {
	shell.openExternal(path.join(app.getPath('userData'), 'logs', 'main.log'));
};

module.exports.getVersion = () => {
	return require('../package.json').version;
};

const getStore = (k) => {
	return store.get(k);
};
module.exports.getStore = getStore;

const setStore = (k, v) => {
	store.set(k, v);
};
module.exports.setStore = setStore;

module.exports.getActiveWindow = windowManager.getActiveWindow;

module.exports.isRobloxClientOpen = () => {
	 if (getStore('requireRblxClient') === false)
		 return true;

	const windows = windowManager.getWindows();
	let window = windows.find(window => window.path.toLowerCase().includes("robloxplayer"));

	if (window != undefined)
		return true;

	return false;
}

module.exports.isRobloxClientFocused = () => {
	if (getStore('requireRblxClient') === false)
		return true;
	
	const window = windowManager.getActiveWindow();
	return window.path.toLowerCase().includes('robloxplayer');
};
