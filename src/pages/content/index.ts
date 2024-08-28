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
  CHECK_INTERVAL: 500, // 0.5 秒
};

class TranslationManager {
  private isActive: boolean = true;
  private intervalId: number | null = null;
  private lastSubtitleContent: string = '';
  private translationCache: Map<string, string> = new Map();
  private videoWrapper: HTMLElement | null = null;
  private subtitleTimeout: number | null = null;

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
        console.log('Initial setup: Starting translation');
        this.startTranslation();
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

  private startTranslation() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
    this.getStorageData().then(({ domConfigs }) => {
      const matchedConfig = this.isDomainAllowed(domConfigs);
      if (matchedConfig) {
        this.createHideOriginalSubtitleStyle(matchedConfig.selector);
      }
    }).catch(error => {
      console.error('Error in startTranslation:', error);
    });
    this.intervalId = window.setInterval(() => this.checkAndTranslate(), CONFIG.CHECK_INTERVAL);
  }

  private stopTranslation() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.cleanupSubtitles();
    this.showOriginalSubtitle();
  }

  private checkAndTranslate = debounce(async () => {
    if (!this.isActive) {
      return;
    }

    try {
      const { status, domConfigs } = await this.getStorageData();

      if (!status) {
        return;
      }

      const matchedConfig = this.isDomainAllowed(domConfigs);

      if (matchedConfig) {
        const rootElements = document.querySelectorAll(matchedConfig.selector);
        rootElements.forEach((rootElement) => {
          const textContent = rootElement.textContent?.trim();
          if (textContent && textContent !== this.lastSubtitleContent) {
            this.lastSubtitleContent = textContent;
            this.translateText(textContent, matchedConfig.selector);
          }
        });
      }
    } catch (error) {
      console.error('Error in checkAndTranslate:', error);
    }
  }, 200);

  private async translateText(text: string, selector: string) {
    if (!text.trim()) return;

    if (this.translationCache.has(text)) {
      const translatedText = this.translationCache.get(text)!;
      this.updateSubtitle(text, translatedText);
      return;
    }

    try {
      chrome.runtime.sendMessage({
        type: 'TRANSLATE_TEXT',
        text: text,
        targetLanguage: 'Chinese'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error in sendMessage:', chrome.runtime.lastError);
          return;
        }

        if (response && response.type === 'TRANSLATED_TEXT') {
          let translatedText = response.translatedText.split('@@@')[0].trim();
          translatedText = translatedText.replace(/\n/g, ' ').replace(/@/g, ' ').trim();
          
          this.translationCache.set(text, translatedText);
          this.updateSubtitle(text, translatedText);
        } else if (response && response.type === 'TRANSLATION_ERROR') {
          console.error('Translation failed:', response.error);
        }
      });
    } catch (error) {
      console.error('Error sending translation request:', error);
    }
  }

  private createHideOriginalSubtitleStyle(selector: string) {
    const styleId = 'hide-original-subtitle-style';
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

  private showOriginalSubtitle() {
    const styleElement = document.getElementById('hide-original-subtitle-style');
    if (styleElement) {
      styleElement.remove();
    }
  }

  private updateSubtitle(originalText: string, translatedText: string) {
    console.log('🔥translation:', originalText, '->', translatedText);
  
    const videoElement = document.querySelector('video');
    if (!videoElement) {
      console.error('Cannot find video element for subtitle insertion');
      return;
    }
  
    this.getStorageData().then((items: StorageData) => {
      if (!this.videoWrapper) {
        this.videoWrapper = document.createElement('div');
        this.videoWrapper.className = 'video-subtitle-wrapper';
        this.videoWrapper.style.cssText = `
          position: relative;
          display: inline-block;
          width: ${videoElement.offsetWidth}px;
          height: ${videoElement.offsetHeight}px;
        `;
        videoElement.parentNode?.insertBefore(this.videoWrapper, videoElement);
        this.videoWrapper.appendChild(videoElement);
      }
  
      let subtitleElement = this.videoWrapper.querySelector('.translated-wrapper') as HTMLElement;
      if (!subtitleElement) {
        subtitleElement = document.createElement('div');
        subtitleElement.className = 'translated-wrapper';
        this.videoWrapper.appendChild(subtitleElement);
      }
  
      const backgroundColor = items.backgroundColor || CONFIG.DEFAULT_BACKGROUND_COLOR;
      const opacity = items.backgroundOpacity || CONFIG.DEFAULT_OPACITY;
  
      subtitleElement.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 0;
        right: 0;
        text-align: center;
        z-index: 2147483647;
        pointer-events: none;
        background-color: ${backgroundColor};
        opacity: ${opacity};
        padding: 10px;
      `;
  
      subtitleElement.innerHTML = '';

      const originalSubtitle = document.createElement('div');
      originalSubtitle.className = 'originalSubtitle';
      originalSubtitle.style.cssText = `
        color: ${items.originFontColor || CONFIG.DEFAULT_ORIGIN_FONT_COLOR};
        font-weight: ${items.originFontWeight || CONFIG.DEFAULT_FONT_WEIGHT};
        font-size: ${items.originFontSize || CONFIG.DEFAULT_FONT_SIZE}px;
        text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
      `;
      originalSubtitle.textContent = originalText;

      const translatedSubtitle = document.createElement('div');
      translatedSubtitle.className = 'translatedSubtitle';
      translatedSubtitle.style.cssText = `
        color: ${items.translatedFontColor || CONFIG.DEFAULT_TRANSLATED_FONT_COLOR};
        font-weight: ${items.translatedFontWeight || CONFIG.DEFAULT_FONT_WEIGHT};
        font-size: ${items.translatedFontSize || CONFIG.DEFAULT_FONT_SIZE}px;
        text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
      `;
      translatedSubtitle.textContent = translatedText;

      subtitleElement.appendChild(originalSubtitle);
      subtitleElement.appendChild(translatedSubtitle);

      if (this.subtitleTimeout !== null) {
        clearTimeout(this.subtitleTimeout);
      }

      this.subtitleTimeout = window.setTimeout(() => {
        if (subtitleElement) {
          subtitleElement.remove()
        }
        this.subtitleTimeout = null;
      }, 3000);

    }).catch(error => {
      console.error('Error getting storage data:', error);
    });
  }

  private cleanupSubtitles() {
    if (this.videoWrapper) {
      const subtitleElement = this.videoWrapper.querySelector('.translated-wrapper');
      if (subtitleElement) {
        subtitleElement.remove();
      }
    }
    if (this.subtitleTimeout !== null) {
      clearTimeout(this.subtitleTimeout);
      this.subtitleTimeout = null;
    }
  }

  public handleStatusChange(status: boolean) {
    console.log('Status changed:', status);
    if (status) {
      this.getStorageData().then(({ domConfigs }) => {
        if (this.isDomainAllowed(domConfigs)) {
          console.log('Status changed to active, starting translation');
          this.startTranslation();
        } else {
          console.log('Status changed to active, but domain not allowed');
        }
      }).catch(error => {
        console.error('Error in STATUS_CHANGED:', error);
      });
    } else {
      console.log('Status changed to inactive, stopping translation');
      this.stopTranslation();
    }
  }

  public handleStorageChange(changes: { [key: string]: chrome.storage.StorageChange }) {
    console.log('Storage changed:', changes);
    if (changes.status || changes.domConfigs) {
      this.getStorageData().then(({ status, domConfigs }) => {
        if (status && this.isDomainAllowed(domConfigs)) {
          console.log('Status or domConfigs changed, starting translation');
          this.startTranslation();
        } else {
          console.log('Status or domConfigs changed, stopping translation');
          this.stopTranslation();
        }
      }).catch(error => {
        console.error('Error in storage change:', error);
      });
    }
    if (changes.apiKey || changes.baseURL || changes.prompt) {
      this.getStorageData().then(({ domConfigs }) => {
        if (this.isDomainAllowed(domConfigs)) {
          console.log('API settings changed, triggering translation');
          this.checkAndTranslate();
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
          console.log('Page became visible, starting translation');
          this.startTranslation();
        } else {
          console.log('Page became visible, but translation not enabled or domain not allowed');
        }
      }).catch(error => {
        console.error('Error in visibility change:', error);
      });
    } else {
      console.log('Page became hidden, stopping translation');
      this.stopTranslation();
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