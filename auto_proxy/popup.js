var tab_urls = [];

/*

tab_url like this {integer tab_id, string url}

*/

function newGooglePage(event) {
	var proxied_url = getProxyUrl('https://www.google.com/ncr');
	chrome.tabs.query(
		{active: true, currentWindow: true},
		function(tabs) {
			if (tabs.length < 1) {
				console.log('No active tabs');
				return;
			}
			
			if (tabs[0].url == 'chrome://newtab/') {
				chrome.tabs.update(tabs[0].id, {
					url: proxied_url
				});
			} else {
				chrome.tabs.create({
					windowId: tabs[0].windowId,
					url: proxied_url
				});
			}
		});
}

function autoProxy() {
	chrome.tabs.query(
		{active: true, currentWindow: true},
		function(tabs) {
			if (tabs.length < 1) {
				console.log(console.warn, 'No active tabs');
				return;
			}
			
			if (tabs.length > 1) {
				console.log(console.warn, 'Too many active tabs');
			}
			
			tab = tabs[0];
			var proxied_url = getProxyUrl(tab.url);
			if (tab.url.length == 0) {
				return;
			}

			var host = tab.url.match(/^https?:\/\/([^\/]+)\/.*/i);
			if (!host) {
				console.log('Not a valid URL:' + tab.url);
				return;
			}

			if (host[1].indexOf('awebproxy.com') > 0) {
				console.log('The URL is a proxied one :' + tab.url);
				return;
			}

			tab_urls.push({tab_id: tab.id, url: tab.url});
			chrome.tabs.update(tab.id, {
					url: proxied_url
				});
		});
}

function refreshProxy() {
	chrome.tabs.query(
		{active: true, currentWindow: true},
		function(tabs) {
			if (tabs.length < 1)
				console.log(console.warn, 'No active tabs');
				return;
			
			if (tabs.length > 1) {
				console.log(console.warn, 'Too many active tabs');
			}
			
			tab = tabs[0];
			tab_urls.some(function(tab_url) {
				if (tab_url.tab_id != tab.id) {
					return false;
				}

				chrome.tabs.update(tab.id, {
					url: getProxyUrl(tab_url.url)
				});
				return true;
			});
		});
}

function copyRawURL() {

}

function getProxyUrl(url) {
	return "https://www.awebproxy.com/browse.php?u=" + encodeURI(url);
}

(function() {
	document.getElementById('new_google').onclick = newGooglePage;
	document.getElementById('auto_proxy').onclick = autoProxy;
	document.getElementById('refresh_proxy').onclick = refreshProxy;
	document.getElementById('copy_raw').onclick = copyRawURL;

	chrome.tabs.onRemoved.addListener(function(tab_id, remove_info) {
		tab_urls.some(function(tab_url, id, the_array) {
			if (tab_url.tab_id != tab_id) {
				return false;
			}

			var last = the_array.pop();
			the_array[id] = last;
			return true;
		});
	});
})();