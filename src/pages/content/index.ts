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

const CONFIG = {
  DEFAULT_BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.75)',
  DEFAULT_OPACITY: '0.8',
  DEFAULT_ORIGIN_FONT_COLOR: 'white',
  DEFAULT_TRANSLATED_FONT_COLOR: 'yellow',
  DEFAULT_FONT_WEIGHT: 'normal',
  DEFAULT_FONT_SIZE: '16',
  INTERVAL_CHECK_TIME: 5000,
};

class TranslationManager {
  private isActive: boolean = true;
  private observer: MutationObserver | null = null;
  private intervalId: number | null = null;

  private readonly MutationObserverConfig = {
    childList: true,
    subtree: true,
    characterData: true
  };

  constructor() {}

  public async start() {
    console.log('TranslationManager starting...');
    await this.initialize();
    this.registerEventListeners();
    console.log('TranslationManager started');
  }

  private registerEventListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'STATUS_CHANGED') {
        this.handleStatusChange(message.status);
      }
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        this.handleStorageChange(changes);
      }
    });

    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
  }

  private async initialize() {
    try {
      const { status, domConfigs } = await this.getStorageData();
      if (status && this.isDomainAllowed(domConfigs)) {
        console.log('Initial setup: Starting listener');
        this.startListening(domConfigs);
        this.addVideoEventListeners(domConfigs);
      } else {
        console.log('Initial setup: Translation not enabled or domain not allowed');
      }
    } catch (error) {
      console.error('Initial setup error:', error);
    }
  }

  private async getStorageData(): Promise<StorageData> {
    return new Promise((resolve, reject) => {
      if (!chrome.runtime?.id) {
        reject(new Error("Extension context invalidated"));
        return;
      }
      chrome.storage.local.get(null, (result) => {
        chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve(result as StorageData);
      });
    });
  }

  private isDomainAllowed(domConfigs: DomConfig[]): DomConfig | undefined {
    const currentDomain = window.location.origin;
    return domConfigs?.find(config => currentDomain === config.domain);
  }

  private translateElements = debounce(async () => {
    if (!this.isActive) {
      console.log('Translation is not active');
      return;
    }

    try {
      const { status, domConfigs } = await this.getStorageData();

      if (!status) {
        console.log('Translation is currently disabled');
        return;
      }

      const matchedConfig = this.isDomainAllowed(domConfigs);

      if (matchedConfig) {
        const rootElements = document.querySelectorAll(matchedConfig.selector);
        rootElements.forEach((rootElement) => {
          const textNodes = this.getTextNodes(rootElement);
          if (textNodes.length > 0) {
            const combinedText = textNodes.map(node => node.textContent?.trim()).filter(Boolean).join(' ');
            this.translateCombinedText(combinedText, textNodes, matchedConfig.selector);
          }
        });
      } else {
        console.log('Current domain is not in the allowed list');
      }
    } catch (error) {
      console.error('Error in translateElements:', error);
    }
  }, 0);

  private getTextNodes(element: Element): Text[] {
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

  private async translateCombinedText(combinedText: string, textNodes: Text[], selector: string) {
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
          this.distributeTranslation(combinedText, translatedText || 'Oops, translation failed', textNodes, selector);
        } else if (response && response.type === 'TRANSLATION_ERROR') {
          console.error('Translation failed:', response.error);
        }
      });
    } catch (error) {
      console.error('Error sending translation request:', error);
    }
  }

  private distributeTranslation(originalText: string, translatedText: string, textNodes: Text[], selector: string) {
    console.log('🔥translation:', originalText, '->', translatedText);

    const targetElement = document.querySelector(selector);

    if (!targetElement || !targetElement.parentElement) {
      console.error('Cannot find target element for subtitle insertion');
      return;
    }

    this.getStorageData().then((items: StorageData) => {
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
        background: ${items.backgroundColor || CONFIG.DEFAULT_BACKGROUND_COLOR};
        opacity: ${items.backgroundOpacity || CONFIG.DEFAULT_OPACITY};
      `;

      const originalSubtitle = document.createElement('div');
      originalSubtitle.className = 'originalSubtitle';
      originalSubtitle.style.cssText = `
        color: ${items.originFontColor || CONFIG.DEFAULT_ORIGIN_FONT_COLOR} !important;
        font-weight: ${items.originFontWeight || CONFIG.DEFAULT_FONT_WEIGHT} !important;
        font-size: ${items.originFontSize || CONFIG.DEFAULT_FONT_SIZE}px !important;
      `;
      originalSubtitle.textContent = originalText;

      const translatedSubtitle = document.createElement('div');
      translatedSubtitle.className = 'translatedSubtitle';
      translatedSubtitle.style.cssText = `
        color: ${items.translatedFontColor || CONFIG.DEFAULT_TRANSLATED_FONT_COLOR} !important;
        font-weight: ${items.translatedFontWeight || CONFIG.DEFAULT_FONT_WEIGHT} !important;
        font-size: ${items.translatedFontSize || CONFIG.DEFAULT_FONT_SIZE}px !important;
      `;
      translatedSubtitle.textContent = translatedText;

      subtitleElement.appendChild(originalSubtitle);
      subtitleElement.appendChild(translatedSubtitle);

      const existingSubtitle = targetElement?.parentElement?.querySelector('.translated-wrapper');
      if (existingSubtitle) {
        existingSubtitle.remove();
      }

      targetElement?.parentElement?.appendChild(subtitleElement);
    }).catch(error => {
      console.error('Error getting storage data:', error);
    });
  }

  private createGlobalStyle(selector: string) {
    const styleId = 'auto-translate-style';
    let style = document.getElementById(styleId) as HTMLStyleElement | null;

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

  private startPeriodicCheck() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
    this.intervalId = window.setInterval(() => this.checkAndRestartListener(), CONFIG.INTERVAL_CHECK_TIME);
  }

  private stopPeriodicCheck() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkAndRestartListener() {
    try {
      const { status, domConfigs } = await this.getStorageData();
      if (status && this.isDomainAllowed(domConfigs)) {
        console.log('Checking and restarting listener');
        this.startListening(domConfigs);
      } else {
        console.log('Translation not enabled or domain not allowed');
        this.stopListening();
        this.stopPeriodicCheck();
      }
    } catch (error) {
      console.error('Error in checkAndRestartListener:', error);
      this.stopPeriodicCheck();
    }
  }

  private addVideoEventListeners(domConfigs: DomConfig[]) {
    const matchedConfig = this.isDomainAllowed(domConfigs);
    if (matchedConfig) {
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        video.addEventListener('play', () => this.onVideoPlay(matchedConfig));
      });
    }
  }

  private onVideoPlay(config: DomConfig) {
    console.log('Video started playing, triggering translation');
    this.startListening([config]);
    this.translateElements();
  }

  public startListening(domConfigs: DomConfig[]) {
    if (this.observer) {
      console.log('Disconnecting existing observer');
      this.observer.disconnect();
    }

    const matchedConfig = this.isDomainAllowed(domConfigs);
    if (matchedConfig) {
      const targetElement = document.querySelector(matchedConfig.selector);
      if (targetElement) {
        console.log('Starting observer');
        this.createGlobalStyle(matchedConfig.selector);
        this.observer = new MutationObserver(() => this.translateElements());
        this.observer.observe(targetElement, this.MutationObserverConfig);

        // Trigger initial translation
        this.translateElements();

        this.startPeriodicCheck();
      }
    }
  }

  public stopListening() {
    if (this.observer) {
      console.log('Stopping observer');
      this.observer.disconnect();
      this.observer = null;

      this.getStorageData().then(({ domConfigs }) => {
        const matchedConfig = this.isDomainAllowed(domConfigs);
        if (matchedConfig) {
          const targetElement = document.querySelector(matchedConfig.selector);
          if (targetElement instanceof HTMLVideoElement) {
            this.removeVideoListeners(targetElement);
          }
        }
      }).catch(error => {
        console.error('Error in stopListening:', error);
      });
    }

    this.stopPeriodicCheck();
  }

  private removeVideoListeners(videoElement: HTMLVideoElement) {
    videoElement.removeEventListener('play', () => this.checkAndRestartListener());
    videoElement.removeEventListener('pause', () => this.checkAndRestartListener());
    videoElement.removeEventListener('ended', () => this.checkAndRestartListener());
  }

  public handleStatusChange(status: boolean) {
    console.log('Status changed:', status);
    if (status) {
      this.getStorageData().then(({ domConfigs }) => {
        if (this.isDomainAllowed(domConfigs)) {
          console.log('Status changed to active, starting listener');
          this.startListening(domConfigs);
        } else {
          console.log('Status changed to active, but domain not allowed');
        }
      }).catch(error => {
        console.error('Error in STATUS_CHANGED:', error);
      });
    } else {
      console.log('Status changed to inactive, stopping listener');
      this.stopListening();
    }
  }

  public handleStorageChange(changes: { [key: string]: chrome.storage.StorageChange }) {
    console.log('Storage changed:', changes);
    if (changes.status || changes.domConfigs) {
      this.getStorageData().then(({ status, domConfigs }) => {
        if (status && this.isDomainAllowed(domConfigs)) {
          console.log('Status or domConfigs changed, starting listener');
          this.startListening(domConfigs);
        } else {
          console.log('Status or domConfigs changed, stopping listener');
          this.stopListening();
        }
      }).catch(error => {
        console.error('Error in storage change:', error);
      });
    }
    if (changes.apiKey || changes.baseURL || changes.prompt) {
      this.getStorageData().then(({ domConfigs }) => {
        if (this.isDomainAllowed(domConfigs)) {
          console.log('API settings changed, triggering translation');
          this.translateElements();
        } else {
          console.log('API settings changed, but domain not allowed');
        }
      }).catch(error => {
        console.error('Error in storage change:', error);
      });
    }
  }

  public handleVisibilityChange() {
    this.isActive = !document.hidden;
    console.log('Visibility changed, isActive:', this.isActive);
    if (this.isActive) {
      this.getStorageData().then(({ status, domConfigs }) => {
        if (status && this.isDomainAllowed(domConfigs)) {
          console.log('Page became visible, starting listener');
          this.startListening(domConfigs);
        } else {
          console.log('Page became visible, but translation not enabled or domain not allowed');
        }
      }).catch(error => {
        console.error('Error in visibility change:', error);
      });
    } else {
      console.log('Page became hidden, stopping listener');
      this.stopListening();
    }
  }
}

const translationManager = new TranslationManager();

// Start the translation manager when the content script loads
translationManager.start();

// Also start the translation manager when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  translationManager.start();
});