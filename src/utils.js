const { Keys, alphabet, commands } = require('./constants');

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
