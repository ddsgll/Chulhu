var _TABID = 0;

function changeTab(activeInfo) {

	_TABID = activeInfo.tabId;

	chrome.tabs.get(_TABID, showIcon);

};


function showIcon( tab ) {

	console.log("Переключена вкладка");

	if (tab.url.indexOf('https://vk.com') == 0) {
		
		chrome.pageAction.show(_TABID);

		console.log("вк");
	}
	else {
		console.log("не вк");
	}
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onActivated.addListener( changeTab );