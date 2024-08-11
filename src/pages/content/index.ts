import debounce from 'lodash/debounce';

interface StorageData {
  status: boolean;
  apiKey: string;
  baseURL: string;
  prompt: string;
  domConfigs: DomConfig[];
  backgroundColor?: string;
  backgroundOpacity?: string;
  originFontColor?: string;
  originFontWeight?: string;
  originFontSize?: string;
  translatedFontColor?: string;
  translatedFontWeight?: string;
  translatedFontSize?: string;
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
      const textNodes = getTextNodes(rootElement);
      if (textNodes.length > 0) {
        const combinedText = textNodes.map(node => node.textContent?.trim()).filter(Boolean).join(' ');
        translateCombinedText(combinedText, textNodes, matchedConfig.selector)
      }
    });
  } else {
    console.log('Current domain is not in the allowed list');
  }
}, 0);

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

async function translateCombinedText(combinedText: string, textNodes: Text[], selector: string) {
  if (!combinedText.trim()) return;

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
        const parts = response?.translatedText.split('@@@');
        let translatedText = parts[0].trim();
        if (translatedText.includes('\n')) {
          translatedText = translatedText.split('\n')[0];
        }
        translatedText = translatedText.replace(/\n/g, ' ').replace(/@/g, ' ').trim();
        distributeTranslation(combinedText, translatedText ? translatedText : 'Oops, translation failed', textNodes, selector);
      } else if (response && response.type === 'TRANSLATION_ERROR') {
        console.error('Translation failed:', response.error);
      }
    });
  } catch (error) {
    console.error('Error sending translation request:', error);
  }
}

function distributeTranslation(originalText: string, translatedText: string, textNodes: Text[], selector: string) {
  console.log('🔥translation:', originalText, '->', translatedText);

  const targetElement = document.querySelector(selector);

  if (!targetElement || !targetElement.parentElement) {
    console.error('Cannot find target element for subtitle insertion');
    return;
  }

  chrome.storage.local.get(null, (items: StorageData | any) => {
    const subtitleElement = document.createElement('div');
    subtitleElement.className = 'translated-wrapper';
    subtitleElement.style.cssText = `
      position: absolute;
      bottom: 30px;
      width: 100%;
      text-align: center;
      margin: 0 .5em 1em;
      padding: 20px 8px;
      white-space: pre-line;
      writing-mode: horizontal-tb;
      unicode-bidi: plaintext;
      direction: ltr;
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
      background: ${items.backgroundColor || 'rgba(0, 0, 0, 0.75)'};
      opacity: ${items.backgroundOpacity || '0.8'};
    `;

    const originalSubtitle = document.createElement('div');
    originalSubtitle.className = 'originalSubtitle';
    originalSubtitle.style.cssText = `
      color: ${items.originFontColor || 'white'} !important;
      font-weight: ${items.originFontWeight || 'normal'} !important;
      font-size: ${items.originFontSize || '16'}px !important;
    `;
    originalSubtitle.textContent = originalText;

    const translatedSubtitle = document.createElement('div');
    translatedSubtitle.className = 'translatedSubtitle';
    translatedSubtitle.style.cssText = `
      color: ${items.translatedFontColor || 'yellow'} !important;
      font-weight: ${items.translatedFontWeight || 'normal'} !important;
      font-size: ${items.translatedFontSize || '16'}px !important;
    `;
    translatedSubtitle.textContent = translatedText;

    subtitleElement.appendChild(originalSubtitle);
    subtitleElement.appendChild(translatedSubtitle);

    const existingSubtitle = targetElement?.parentElement?.querySelector('.translated-wrapper');
    if (existingSubtitle) {
      existingSubtitle.remove();
    }

    targetElement?.parentElement?.appendChild(subtitleElement);
  });
}

function createGlobalStyle(selector: string) {
  const styleId = 'auto-translate-style';
  let style = document.getElementById(styleId);

  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }

  style.textContent = `
    ${selector} {
      display: none !important;
    }
  `;
}

function checkAndRestartListener() {
  getStorageData().then(({ status, domConfigs }) => {
    if (status && isDomainAllowed(domConfigs)) {
      console.log('Checking and restarting listener');
      startListening(domConfigs);
    } else {
      console.log('Translation not enabled or domain not allowed');
    }
  }).catch(error => {
    console.log('Error in checkAndRestartListener:', error)
  });
}

function startListening(domConfigs: DomConfig[]) {
  if (observer) {
    console.log('Disconnecting existing observer');
    observer.disconnect();
  }

  const matchedConfig = isDomainAllowed(domConfigs);
  if (matchedConfig) {
    const targetElement = document.querySelector(matchedConfig.selector);
    if (targetElement) {
      console.log('Starting observer');
      createGlobalStyle(matchedConfig.selector);
      observer = new MutationObserver(translateElements);
      observer.observe(targetElement, MutationObserverConfig);

      // Add video playback state listeners
      if (targetElement instanceof HTMLVideoElement) {
        targetElement.addEventListener('play', checkAndRestartListener);
        targetElement.addEventListener('pause', checkAndRestartListener);
        targetElement.addEventListener('ended', checkAndRestartListener);
      }
    }
  }
}

function stopListening() {
  if (observer) {
    console.log('Stopping observer');
    observer.disconnect();
    observer = null;

    // Remove video playback state listeners
    getStorageData().then(({ domConfigs }) => {
      const matchedConfig = isDomainAllowed(domConfigs);
      if (matchedConfig) {
        const targetElement = document.querySelector(matchedConfig.selector);
        if (targetElement instanceof HTMLVideoElement) {
          targetElement.removeEventListener('play', checkAndRestartListener);
          targetElement.removeEventListener('pause', checkAndRestartListener);
          targetElement.removeEventListener('ended', checkAndRestartListener);
        }
      }
    }).catch(error => {
      console.log('Error in stopListening:', error)
    });
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
      })
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

// Add periodic check mechanism
setInterval(checkAndRestartListener, 5000);  // Check every 5 seconds