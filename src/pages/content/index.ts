import debounce from 'lodash/debounce';

interface StorageData {
  status: boolean;
  apiKey: string;
  baseURL: string;
  prompt: string;
  domConfigs: DomConfig[];
}

interface DomConfig {
  domain: string;
  selector: string;
}

let isActive: boolean = true;
let observer: MutationObserver | null = null;

const getStorageData = (): Promise<StorageData> => {
  return new Promise((resolve, reject) => {
    if (!chrome.runtime.id) {
      reject(new Error("Extension context invalidated"));
      return;
    }
    try {
      chrome.storage.local.get(null, function (result) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result as StorageData);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const MutationObserverConfig = {
  childList: true,
  subtree: true,
  characterData: true
};

function isDomainAllowed(domConfigs: DomConfig[]): DomConfig | undefined {
  const currentDomain = window.location.origin;
  return domConfigs && Array.isArray(domConfigs) ? domConfigs.find(config => currentDomain == config.domain) : undefined;
}

const translateElements = debounce(async () => {

  if (!isActive) {
    console.log('Translation is not active');
    return;
  }

  const { status, domConfigs } = await getStorageData();

  if (!status) {
    console.log('Translation is currently disabled');
    return;
  }

  const matchedConfig = isDomainAllowed(domConfigs);

  if (matchedConfig) {
    const rootElements = document.querySelectorAll(matchedConfig.selector);

    rootElements.forEach((rootElement, index) => {
      // if (!rootElement.hasAttribute('data-translated')) {
      const textNodes = getTextNodes(rootElement);
      if (textNodes.length > 0) {
        const combinedText = textNodes.map(node => node.textContent?.trim()).filter(Boolean).join(' ');
        translateCombinedText(combinedText, textNodes);
      }
      // rootElement.setAttribute('data-translated', 'true');
      // }
    });
  } else {
    console.log('Current domain is not in the allowed list');
  }
}, 300);

function getTextNodes(element: Element): Text[] {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  let node;
  while (node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      textNodes.push(node as Text);
    }
  }

  return textNodes;
}

async function translateCombinedText(combinedText: string, textNodes: Text[]) {
  if (!combinedText.trim()) return;

  console.log('Translating combined text:', combinedText);

  try {
    chrome.runtime.sendMessage({
      type: 'TRANSLATE_TEXT',
      text: combinedText,
      targetLanguage: 'Chinese'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error in sendMessage:', chrome.runtime.lastError);
        return;
      }

      if (response && response.type === 'TRANSLATED_TEXT') {
        const translatedText = response.translatedText;
        distributeTranslation(translatedText, textNodes);
      } else if (response && response.type === 'TRANSLATION_ERROR') {
        console.error('Translation failed:', response.error);
      }
    });
  } catch (error) {
    console.error('Error sending translation request:', error);
  }
}

function distributeTranslation(translatedText: string, textNodes: Text[]) {
  let translatedWords = translatedText.split(' ');
  let currentWordIndex = 0;
  console.log('Distributing translation:', translatedWords);

  textNodes.forEach((textNode) => {
    const originalText = textNode.textContent?.trim() || '';
    const originalWords = originalText.split(' ');
    const translatedSegment = [];

    for (let i = 0; i < originalWords.length; i++) {
      if (currentWordIndex < translatedWords.length) {
        translatedSegment.push(translatedWords[currentWordIndex]);
        currentWordIndex++;
      }
    }

    const translatedNodeText = translatedSegment.join(' ');

    const translatedSpan = document.createElement('span');
    translatedSpan.textContent = translatedNodeText;
    translatedSpan.style.color = 'green';

    const originalSpan = document.createElement('span');
    originalSpan.textContent = originalText;

    const container = document.createElement('span');
    container.appendChild(originalSpan);
    container.appendChild(document.createElement('br'));
    container.appendChild(translatedSpan);

    textNode.parentNode?.replaceChild(container, textNode);
  });
}

function startListening(domConfigs: DomConfig[]) {
  if (observer) {
    console.log('Disconnecting existing observer');
    observer.disconnect();
  }

  domConfigs.forEach(domConfig => {
    observer = new MutationObserver(translateElements);
    const matchedConfig = isDomainAllowed(domConfigs);
    if (matchedConfig && document.querySelector(matchedConfig?.selector)) {
      console.log('Starting observer');
      observer.observe(document.querySelector(matchedConfig?.selector)!, MutationObserverConfig);
    }
  });
}

function stopListening() {
  if (observer) {
    console.log('Stopping observer');
    observer.disconnect();
    observer = null;
  }
}

// Initial setup
getStorageData().then(({ status, domConfigs }) => {
  if (status && isDomainAllowed(domConfigs)) {
    console.log('Initial setup: Starting listener');
    startListening(domConfigs);
  } else {
    console.log('Initial setup: Translation not enabled or domain not allowed');
  }
}).catch(error => {
  console.log('Initial setup error:', error)
})

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STATUS_CHANGED') {
    console.log('Status changed:', message.status);
    if (message.status) {
      getStorageData().then(({ domConfigs }) => {
        if (isDomainAllowed(domConfigs)) {
          console.log('Status changed to active, starting listener');
          startListening(domConfigs);
        } else {
          console.log('Status changed to active, but domain not allowed');
        }
      }).catch(error => {
        console.log('Error in STATUS_CHANGED:', error)
      })
    } else {
      console.log('Status changed to inactive, stopping listener');
      stopListening();
    }
  }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    console.log('Storage changed:', changes);
    if (changes.status || changes.domConfigs) {
      getStorageData().then(({ status, domConfigs }) => {
        if (status && isDomainAllowed(domConfigs)) {
          console.log('Status or domConfigs changed, starting listener');
          startListening(domConfigs);
        } else {
          console.log('Status or domConfigs changed, stopping listener');
          stopListening();
        }
      }).catch(error => {
        console.log('Error in storage change:', error)
      });
    }
    if (changes.apiKey || changes.baseURL || changes.prompt) {
      getStorageData().then(({ domConfigs }) => {
        if (isDomainAllowed(domConfigs)) {
          console.log('API settings changed, triggering translation');
          translateElements();
        } else {
          console.log('API settings changed, but domain not allowed');
        }
      }).catch(error => {
        console.log('Error in storage change:', error)
      }
      )
    }
  }
});

// Listen for visibility changes
document.addEventListener('visibilitychange', () => {
  isActive = !document.hidden;
  console.log('Visibility changed, isActive:', isActive);
  if (isActive) {
    getStorageData().then(({ status, domConfigs }) => {
      if (status && isDomainAllowed(domConfigs)) {
        console.log('Page became visible, starting listener');
        startListening(domConfigs);
      } else {
        console.log('Page became visible, but translation not enabled or domain not allowed');
      }
    }).catch(error => {
      console.log('Error in visibility change:', error)
    })
  } else {
    console.log('Page became hidden, stopping listener');
    stopListening();
  }
});