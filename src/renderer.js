const rblxReqBtn = document.getElementById('sw-require-rblx-client');
			
rblxReqBtn.addEventListener('click', () => {
    window.electronAPI.requireRblxClientToggle(rblxReqBtn.checked);
})