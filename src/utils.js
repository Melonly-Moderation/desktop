const { app } = require('electron');
const { Keys, alphabet, commands } = require('./constants');
const fs = require('fs');
const path = require('path');

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
