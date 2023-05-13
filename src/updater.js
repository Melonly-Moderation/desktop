const { app, dialog, autoUpdater } = require('electron');
const { getEnv } = require('./utils');

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
	const dialogOpts = {
		type: 'info',
		buttons: ['Restart', 'Later'],
		title: 'Application Update',
		message: process.platform === 'win32' ? releaseNotes : releaseName,
		detail:
			'A new version has been downloaded. Restart the application to apply the updates.',
	};

	dialog.showMessageBox(dialogOpts).then(returnValue => {
		if (returnValue.response === 0) autoUpdater.quitAndInstall();
	});
});

autoUpdater.on('error', message => {
	console.error('There was a problem updating the application');
	console.error(message);
});

if (app.isPackaged) {
	const env = getEnv();
	const server =
		env === 'beta'
			? 'https://dev-updater.melonly.xyz'
			: 'https://updater.melonly.xyz';
	const url = `${server}/update/${process.platform}/${app.getVersion()}`;
	autoUpdater.setFeedURL({ url });

	setInterval(() => {
		autoUpdater.checkForUpdates();
	}, 60000);
}
