require('dotenv').config();
const path = require('path');
const { getEnv } = require('./src/utils');

const env = getEnv();

module.exports = {
	packagerConfig: {
		icon: path.join(__dirname, 'images', 'logo'),
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				iconUrl: path.join(__dirname, 'images', 'logo.ico'),
				setupIcon: path.join(__dirname, 'images', 'logo.ico'),
			},
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin'],
		},
	],
	publishers: [
		{
			name: '@electron-forge/publisher-github',
			config: {
				authToken: process.env.GITHUB_TOKEN,
				repository: {
					owner: 'Melonly-Moderation',
					name: env === 'beta' ? 'desktop-beta' : 'desktop',
				},
			},
		},
	],
};
