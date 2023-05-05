module.exports.Keys = {
	0: '0',
	1: '1',
	2: '2',
	3: '3',
	4: '4',
	5: '5',
	6: '6',
	7: '7',
	8: '8',
	9: '9',
	A: 'a',
	B: 'b',
	C: 'c',
	D: 'd',
	E: 'e',
	F: 'f',
	G: 'g',
	H: 'h',
	I: 'i',
	J: 'j',
	K: 'k',
	L: 'l',
	M: 'm',
	N: 'n',
	O: 'o',
	P: 'p',
	Q: 'q',
	R: 'r',
	S: 's',
	T: 't',
	U: 'u',
	V: 'v',
	W: 'w',
	X: 'x',
	Y: 'y',
	Z: 'z',
	'NUMPAD 0': '0',
	'NUMPAD 1': '1',
	'NUMPAD 2': '2',
	'NUMPAD 3': '3',
	'NUMPAD 4': '4',
	'NUMPAD 5': '5',
	'NUMPAD 6': '6',
	'NUMPAD 7': '7',
	'NUMPAD 8': '8',
	'NUMPAD 9': '9',
	'NUMPAD EQUALS': '=',
	'NUMPAD DIVIDE': '/',
	'NUMPAD MULTIPLY': '*',
	'NUMPAD MINUS': '-',
	'NUMPAD PLUS': '+',
	'NUMPAD DOT': '.',
	EQUALS: '=',
	MINUS: '-',
	'SQUARE BRACKET OPEN': '[',
	'SQUARE BRACKET CLOSE': ']',
	SEMICOLON: ';',
	'Shift+;': ':',
	QUOTE: "'",
	BACKSLASH: '\\',
	COMMA: ',',
	DOT: '.',
	'FORWARD SLASH': '/',
	SPACE: ' ',
	BACKTICK: '`',
	'Shift+1': '!',
	'Shift+2': '@',
	'Shift+3': '#',
	'Shift+4': '$',
	'Shift+5': '%',
	'Shift+6': '^',
	'Shift+7': '&',
	'Shift+8': '*',
	'Shift+9': '(',
	'Shift+0': ')',
	'Shift+-': '_',
	'Shift+=': '+',
	'Shift+\\': '|',
	'Shift+[': '{',
	'Shift+]': '}',
	'Shift+/': '?',
	'Shift+.': '>',
	'Shift+,': '<',
	'Shift+`': '~',
};

const validLogTypes = ['warn', 'kick', 'ban', 'bolo', 'note'];
module.exports.validLogTypes = validLogTypes;

module.exports.commands = [
	{
		name: '/log',
		minArgs: 3,
		validateArgs: args => {
			return validLogTypes.includes(args[1]);
		},
	},
	{
		name: '/shift',
		minArgs: 0,
	},
	{
		name: '/panel',
		minArgs: 0,
	},
	{
		name: ':warn',
		minArgs: 2,
	},
	{
		name: ':kick',
		minArgs: 2,
	},
	{
		name: ':ban',
		minArgs: 2,
	},
	{
		name: ':bolo',
		minArgs: 2,
	},
	{
		name: ':note',
		minArgs: 2,
	},
];

module.exports.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWSYZ';
