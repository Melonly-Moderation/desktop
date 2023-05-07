const { app, dialog, autoUpdater } = require('electron');

if (app.isPackaged) {
	const server = 'https://updater.melonly.xyz';
	const url = `${server}/update/${process.platform}/${app.getVersion()}`;
	autoUpdater.setFeedURL({ url });

	setInterval(() => {
		autoUpdater.checkForUpdates();
	}, 60000);

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
}
