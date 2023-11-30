var ignoredDomains = ['monitor.ppcprotect.com', 'www.googleadservices.com', 'www.google.com.ua', 'google.ua', 'www.google.com', 'chat.openai.com', 'openai.com', 'ekcgnbmbhmloopndogkngihikgoknnip'];

chrome.webRequest.onBeforeRequest.addListener(function(details) {
  if (details.type == 'main_frame') {
    var url = new URL(details.url);
    var domain = url.hostname;

    if (ignoredDomains.includes(domain)) {
      return;
    } else {
      var endpoint = 'http://ip-api.com/json/' + domain + '?fields=countryCode,status,message';

      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          var response = JSON.parse(this.responseText);
          if (response.status !== 'success') {
            console.error('query failed: ' + response.message);
            return;
          }
          if (response.countryCode === 'RU') {
            chrome.tabs.get(details.tabId, function(tab) {
              if (chrome.runtime.lastError || !tab) {
                return;
              }
              chrome.tabs.update(tab.id, { url: 'index.html' }, function() {});
            });
            return { cancel: true };
          } else {
            checkAdditionalResources(details.tabId, url);
          }
        }
      };
      xhr.open('GET', endpoint, true);
      xhr.send();

      if (
        url.hostname.includes('ru.') ||
        url.hostname.includes('.ru') ||
        url.pathname.includes('/ru-ru/') ||
        url.href.includes('russia') ||
        url.pathname.includes('/ru/')
      ) {
        chrome.tabs.get(details.tabId, function(tab) {
          if (chrome.runtime.lastError || !tab) {
            return;
          }
          chrome.tabs.update(tab.id, { url: 'index.html' }, function() {});
        });
        return { cancel: true };
      }
    }
  }
}, { urls: ['<all_urls>'] }, ['blocking']);

function getResourcesFromPage(html) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(html, 'text/html');

  var resourceElements = doc.querySelectorAll('script[src]');
  var resources = [...resourceElements].map(function(element) {
    return element.getAttribute('src');
  });

  return resources;
}

function checkAdditionalResources(tabId, url) {
  function checkResource(resourceUrl) {
    var isSearchPage =
      url.href.includes('.google.') ||
      url.href.includes('/search') ||
      url.href.includes('.bing.') ||
      url.href.includes('.yahoo.') ||
      url.href.includes('.duckduckgo.') ||
      url.href.includes('.baidu.') ||
      url.href.includes('.aol.') ||
      url.href.includes('.ask.') ||
      url.href.includes('.wolframalpha.') ||
      url.href.includes('.yippy.') ||
      url.href.includes('.startpage.') ||
      url.href.includes('.wow.') ||
      url.href.includes('.webcrawler.') ||
      url.href.includes('.dogpile.') ||
      url.href.includes('.metacrawler.') ||
      url.href.includes('.infospace.') ||
      url.href.includes('.ixquick.') ||
      url.href.includes('.excite.') ||
      url.href.includes('.alhea.') ||
      url.href.includes('.teoma.') ||
      url.href.includes('.mywebsearch.') ||
      url.href.includes('.lycos.') ||
      url.href.includes('.alts.');

    if (!isSearchPage) {
      var blockedKeywords = /(\.ru|\/ru-ru\/|russia|vk\.com|ok\.ru)/;
      if (blockedKeywords.test(resourceUrl)) {
        chrome.tabs.get(tabId, function(tab) {
          if (chrome.runtime.lastError || !tab) {
            return;
          }
          chrome.tabs.update(tab.id, { url: 'index.html' }, function() {});
        });
        return { cancel: true };
      }
    }
  }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url.href, true);
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var resources = getResourcesFromPage(this.responseText);
      resources.forEach(function(resource) {
        checkResource(resource);
      });
    }
  };
  xhr.send();
}

chrome.webNavigation.onDOMContentLoaded.addListener(
  function(details) {
    if (details.url.includes("google.com/search")) {
      filterSearchResults(details.tabId);
    }
  },
  {urls: ["<all_urls>"]}
);

function filterSearchResults(tabId) {
  chrome.tabs.executeScript(tabId, {file: "content.js"});
}


  