// var html;
// chrome.runtime.onMessage.addListener(function (request, sender) {
// 	if (request.action == "getSource") {
// 		html = request.source;
// 	}
// });

document.addEventListener('DOMContentLoaded', function () {
	var checkPageButton = document.querySelector('#checkPage');
	chrome.storage.sync.get('enabled', function(data) {
		checkPage.checked = data.enabled;
	});
	checkPageButton.addEventListener('change', function () {
		chrome.storage.sync.set({ enabled: checkPage.checked });
	}, false);
}, false);


