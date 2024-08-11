import {
    translateText
} from '../../utils/request';
console.log('init done');

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == 'install') {
        console.log('This is a first install!');
        chrome.storage.local.set({
            status: false,
            backgroundColor: '#000000',
            backgroundOpacity: 1,
            originFontColor: '#ffffff',
            originFontSize: 22,
            originFontWeight: 700,
            translatedFontSize: 28,
            translatedFontColor: '#ffffff',
            translatedFontWeight: 700,
            apiKey: '',
            baseURL: '',
            prompt: `Translate the following text to {TARGET_LANGUAGE}`,
        });
    } else if (details.reason == 'update') {
        var thisVersion = chrome.runtime.getManifest().version;
        console.log(
            'Updated from ' + details.previousVersion + ' to ' + thisVersion + '!'
        );
    }
});

async function getStorageData(): Promise<any> {
    return new Promise((resolve) => {
        chrome.storage.local.get(null, (result) => {
            resolve(result);
        });
    });
}

async function broadcastStatusChange(status: boolean) {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'STATUS_CHANGED', status });
        }
    }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.status) {
            broadcastStatusChange(changes.status.newValue);
        }
    }
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === 'TRANSLATE_TEXT') {
            const { text, targetLanguage } = request;
            
            getStorageData().then(async ({ status, prompt, selectedModel,ollamaConfig,openaiConfig }) => {
                if (!status) {
                    sendResponse({ type: 'TRANSLATION_ERROR', error: 'Translation is currently disabled' });
                    return;
                }

                if (ollamaConfig?.baseURL === '' || ollamaConfig?.modelName === '' || openaiConfig?.apiKey === '' || openaiConfig?.baseURL === '' || openaiConfig?.modelName === '') {
                    sendResponse({ type: 'TRANSLATION_ERROR', error: 'API Key or BaseURL or ModelName is not set' });
                    return;
                }

                try {
                    const response = await translateText(text, targetLanguage, prompt) as any;
                    console.log('🔥 🔥 Translated text:', response);
                    if(selectedModel === 'openai'){
                        sendResponse({ type: 'TRANSLATED_TEXT', translatedText:response?.content });
                    }else if(selectedModel === 'ollama'){
                        sendResponse({ type: 'TRANSLATED_TEXT', translatedText: response });
                    }
                } catch (error: any) {
                    sendResponse({ type: 'TRANSLATION_ERROR', error: error?.message });
                }
            }).catch(error => {
                sendResponse({ type: 'TRANSLATION_ERROR', error: error.message });
            });

            return true;  // awaiting for sync response
        }
    }
);


