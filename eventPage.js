const server_address = "http://35.196.233.21:5000"

var contextMenuItem = {
	"id": "CheckPhishing",
	"title": "Report Phisnhing",
	"contexts": ["all"]
};

chrome.contextMenus.removeAll();
chrome.contextMenus.create(contextMenuItem);
// show mess when client click

// chrome.contextMenus.removeAll();
// chrome.contextMenus.create({
//       title: "first",
//       contexts: ["browser_action"],
//       onclick: function() {
//         alert('first');
//       }
// });

// Event when user click
document.addEventListener('DOMContentLoaded', function () {
	chrome.contextMenus.onClicked.addListener(function (clickData) {
		if (clickData.menuItemId == "CheckPhishing") {
			chrome.tabs.getSelected(null, function (tab) {
				var successNoti = {
					type: 'basic',
					iconUrl: 'icon32.png',
					title: 'Send Report',
					message: "Report successfull."
				};
				var failNoti = {
					type: 'basic',
					iconUrl: 'icon32.png',
					title: 'Send Report',
					message: "Report failed."
				};
				// get url of tab. 	
				var tablink = tab.url;
				// request for server
				$.ajax({
					url: server_address + "/api/report",
					type: "POST",
					data: {
						type: "DIRTY",
						url: tablink
					},
					success: function (data) {
						chrome.notifications.create(successNoti);
					},
					error: function (error) {
						chrome.notifications.create(failNoti);
					}
				});
			});
		}
	}, false);
}, false);

var html;
chrome.runtime.onMessage.addListener(function (request, sender) {
	if (request.action == "getSource") {
		html = request.source;
	}
});

chrome.webNavigation.onCompleted.addListener(function (details) {
	//var checkPageButton = document.querySelector('#checkPage');
	chrome.storage.sync.get('enabled', function(data) {
		if (data.enabled) {
			chrome.tabs.getSelected(null, function (tab) {
				var tablink = tab.url;
				// show report of server for clients
				var notifOption1 = {
					type: 'basic',
					iconUrl: 'icon32.png',
					title: 'Report Respose',
					message: "The domain is not safe."
				};
				var notifOption2 = {
					type: 'basic',
					iconUrl: 'icon32.png',
					title: 'Report Respose',
					message: "Many people REPORTED that site is not SAFE."
				};
	
				// request for server
				$.ajax({
					url: server_address + "/api/phishing",
					type: "POST",
					data: {
						type: "url",
						contents: tablink
					},
					success: function (data) {
						if (data.result == "DIRTY") {
							chrome.tabs.update({url: chrome.extension.getURL('blocked.html')});							
						}
						else if (data.result == "SAFE") {
							//chrome.tabs.create({ url: chrome.extension.getURL('blocked.html') });
						}
						else if (data.result == "REPORTED") {
							chrome.tabs.update({url: chrome.extension.getURL('blocked.html')});
						}
						else if (data.result == "NOT FOUND") {
							chrome.tabs.executeScript(null, {
								file: "getPagesSource.js"
							}, function () {
								// If you try and inject into an extensions page or the webstore/NTP you'll get an error
								if (chrome.runtime.lastError) {
	
								} else {
									$.ajax({
										url: server_address + "/api/phishing",
										type: "POST",
										data: {
											type: "html_code",
											contents: html
										},
										success: function (data) {
											if (data.result == "DIRTY") {
												// chrome.notifications.create(notifOption1);
												chrome.tabs.update({url: chrome.extension.getURL('blocked.html')});
												// chrome.tabs.create({ url: chrome.extension.getURL('blocked.html') });
											}
										},
										error: function (error) {
											alert(error)
										}
									});
								}
							});
						}
					},
					error: function (error) {
						alert(error)
					}
				});
			});
		}
	});
	
});

