function changeFavicon(src) {
  const link = document.createElement('link');
  const oldLinks = document.querySelectorAll('link[rel*="icon"]');

  oldLinks.forEach(el => el.parentNode.removeChild(el));

  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = src;

  document.getElementsByTagName('head')[0].appendChild(link);
}

function observeMutations(selector, callback, stopAfterFirstMatch = true) {
  const observer = new MutationObserver(function (mutations) {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) {
        if (node instanceof Element && node.querySelector(selector)) {
          callback();
          if (stopAfterFirstMatch) observer.disconnect();
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function replaceElementContent(selector, newValue) {
  const elem = document.querySelector(selector);
  if (elem) {
    elem.innerHTML = newValue;
  }
}

function replaceElementContentThatMatches(selector, text, newValue) {
  const elem = document.querySelectorAll(selector);
  for (const element of elem) {
    if (element.textContent.trim() === text) {
      element.textContent = newValue;
    }
  }
}

function replaceSVGWithNew(sourceSelector, svgURL) {
  const element = document.querySelector(sourceSelector);
  if (!element) return;

  fetch(chrome.runtime.getURL(svgURL))
    .then((response) => response.text())
    .then((data) => {
      const parser = new DOMParser();
      const newSVG = parser
        .parseFromString(data, "image/svg+xml")
        .querySelector("svg");

      for (let attr of newSVG.attributes) {
        element.setAttribute(attr.name, attr.value);
      }

      while (element.firstChild) {
        element.firstChild.remove();
      }
      while (newSVG.firstChild) {
        element.appendChild(newSVG.firstChild);
      }
    });
}

const newFaviconURL = chrome.runtime.getURL("icons/larry.svg");

changeFavicon(newFaviconURL);

observeMutations('a[href="/home"] div svg', () => {
  replaceSVGWithNew("h1 a div svg", "icons/larry.svg");
});

observeMutations('a[href="/compose/tweet"] div span div div span span', () => {
  replaceElementContent(
    'a[href="/compose/tweet"] div span div div span span',
    "Tweet"
  );
});

observeMutations(
  "span span",
  () => {
    replaceElementContentThatMatches("span", "Post", "Tweet");
  },
  (stopAfterFirstMatch = false)
);

