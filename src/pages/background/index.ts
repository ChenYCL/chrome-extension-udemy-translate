import { translateText } from '../../utils/request';

console.log('Background script initialized');

const DEFAULT_SETTINGS = {
  status: false,
  backgroundColor: '#000000',
  backgroundOpacity: 1,
  originFontColor: '#ffffff',
  originFontSize: 22,
  originFontWeight: 700,
  translatedFontSize: 28,
  translatedFontColor: '#ffffff',
  translatedFontWeight: 700,
  domConfigs: [{ domain: '', selector: '' }, { domain: '', selector: '' }],
  prompt: 'Translate the following English text into Chinese and separate the translations with @@@',
};

chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  if (reason === 'install') {
    console.log('First install');
    chrome.storage.local.set(DEFAULT_SETTINGS);
  } else if (reason === 'update') {
    const currentVersion = chrome.runtime.getManifest().version;
    console.log(`Updated from ${previousVersion} to ${currentVersion}`);
  }
});

const getStorageData = (): Promise<any> =>
  new Promise(resolve => chrome.storage.local.get(null, resolve));

const broadcastStatusChange = async (status: boolean): Promise<void> => {
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'STATUS_CHANGED', status });
    }
  });
};

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.status) {
    broadcastStatusChange(changes.status.newValue);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TRANSLATE_TEXT') {
    handleTranslationRequest(request, sendResponse);
    return true; // Indicates an asynchronous response
  }
});

const handleTranslationRequest = async (request: any, sendResponse: (response: any) => void) => {
  const { text, targetLanguage } = request;
  
  try {
    const storageData = await getStorageData();
    const { status, prompt, selectedModel, ollamaConfig, openaiConfig } = storageData;

    if (!status) {
      throw new Error('Translation is currently disabled');
    }

    if (!isConfigValid(ollamaConfig, openaiConfig)) {
      throw new Error('API Key, BaseURL, or ModelName is not set');
    }

    const response = await translateText(text, targetLanguage, prompt);
    console.log('Translation response:', response);

    const translatedText = selectedModel === 'openai' ? (response as {content?:string})?.content : response;
    sendResponse({ type: 'TRANSLATED_TEXT', translatedText });
  } catch (error: any) {
    sendResponse({ type: 'TRANSLATION_ERROR', error: error.message });
  }
};

const isConfigValid = (ollamaConfig: any, openaiConfig: any): boolean => {
  return !(
    ollamaConfig?.baseURL === '' ||
    ollamaConfig?.modelName === '' ||
    openaiConfig?.apiKey === '' ||
    openaiConfig?.baseURL === '' ||
    openaiConfig?.modelName === ''
  );
};