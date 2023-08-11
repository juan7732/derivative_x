// singleton observer references
let titleObserver;

// observers

const observeMutations = (selector,callback,stopAfterFirstMatch = true, observeNode = document.body) => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element && node.querySelector(selector)) {
            callback();
            if (stopAfterFirstMatch) observer.disconnect();
          }
        }
      }
    }
  });

  observer.observe(observeNode, {
    childList: true,
    subtree: true,
  });
};

const observeDocumentForTitle = (callback, selector) => {
  titleObserver = new MutationObserver((mutations) => {
    for (const mut of mutations) {
      if (mut.type === "childList") {
        const titleElement = document.querySelector(selector);
        if (titleElement) {
          callback()
        }
      }
    }
  });

  titleObserver.observe(document.head, {
    childList: true,
    subtree: true
  });
};

// Mutators

const mutateTitle = (oldReplace, newReplace) => {
  if (titleObserver) titleObserver.disconnect();
  document.title = document.title.replace(oldReplace, newReplace);

  
  if (titleObserver) {
    titleObserver.observe(document.head, {
      childList: true,
      subtree: true
    });
  }
};

const mutateElementContent = (selector, newValue) => {
  const elem = document.querySelector(selector);
  if (elem) {
    elem.innerHTML = newValue;
  }
};

const mutateElementContentThatMatches = (selector, text, newValue) => {
  const elem = document.querySelectorAll(selector);
  for (const element of elem) {
    if (element.textContent.trim() === text) {
      element.textContent = newValue;
    }
  }
};

const mutateSVG = (sourceSelector, svgURL) => {
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
};

const mutateFavicon = (src) => {
  const link = document.createElement("link");
  const oldLinks = document.querySelectorAll('link[rel*="icon"]');

  oldLinks.forEach((el) => el.parentNode.removeChild(el));

  link.type = "image/x-icon";
  link.rel = "shortcut icon";
  link.href = src;

  document.getElementsByTagName("head")[0].appendChild(link);
};

// priority calls
const newFaviconURL = chrome.runtime.getURL("icons/larry.svg");

mutateFavicon(newFaviconURL);

// observer registration
observeMutations('a[href="/home"] div svg', () => {
  mutateSVG("h1 a div svg", "icons/larry.svg");
});

// For Login
observeMutations('svg[aria-label="Twitter"]', () => {
  mutateSVG('svg[aria-label="Twitter"]', "icons/larry.svg");
});

observeMutations('a[href="/compose/tweet"] div span div div span span', () => {
  mutateElementContent(
    'a[href="/compose/tweet"] div span div div span span',
    "Tweet"
  );
});



observeMutations(
  "span span",
  () => {
    mutateElementContentThatMatches("span", "Post", "Tweet");
  },
  (stopAfterFirstMatch = false)
);

// observes then observes

observeDocumentForTitle(() => {
  console.log('mutateTitle')
  mutateTitle('X', 'Twitter');
}, 'title');


