import { ChatOpenAI } from "@langchain/openai";

console.log('This is the background page.');
console.log('Put the background scripts here.');
console.log('init done');

// 初始化存储
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
            prompt: `Translate the following text from English to {TARGET_LANGUAGE}: {SOURCE_TEXT}`,
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

// 向所有标签页广播状态变化
async function broadcastStatusChange(status: boolean) {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'STATUS_CHANGED', status });
        }
    }
}

// 监听存储变化
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.status) {
            broadcastStatusChange(changes.status.newValue);
        }
    }
});

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === 'TRANSLATE_TEXT') {
            const { text, targetLanguage } = request;
            
            getStorageData().then(async ({ status, apiKey, baseURL, prompt }) => {
                if (!status) {
                    sendResponse({ type: 'TRANSLATION_ERROR', error: 'Translation is currently disabled' });
                    return;
                }

                if (!apiKey) {
                    sendResponse({ type: 'TRANSLATION_ERROR', error: 'API Key is not set' });
                    return;
                }

                try {
                    const chatModel = new ChatOpenAI({
                        modelName: "gpt-4o",
                        temperature: 0,
                        openAIApiKey: apiKey,
                        configuration: {
                            baseURL: baseURL || undefined,
                        },
                    });

                    const formattedPrompt = prompt
                        .replace('{TARGET_LANGUAGE}', targetLanguage)
                        .replace('{SOURCE_TEXT}', text);

                    const response = await chatModel.invoke([
                        ["system", formattedPrompt],
                        ["human", text]
                    ]);
                    console.log('🔥 🔥 Translated text:', response.content);
                    sendResponse({ type: 'TRANSLATED_TEXT', translatedText: response.content });
                } catch (error: any) {
                    sendResponse({ type: 'TRANSLATION_ERROR', error: error?.message });
                }
            }).catch(error => {
                sendResponse({ type: 'TRANSLATION_ERROR', error: error.message });
            });

            return true;  // 保持消息通道开放以进行异步响应
        }
    }
);

// 添加右键菜单项来快速切换翻译状态
chrome.contextMenus.create({
    id: 'd1f89029-0c5d-4e8f-983c-16479a441319',
    title: 'Toggle Udemy Translation',
    contexts: ['all'],
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'd1f89029-0c5d-4e8f-983c-16479a441319') {
        const { status } = await getStorageData();
        const newStatus = !status;
        await chrome.storage.local.set({ status: newStatus });
        console.log(`Translation ${newStatus ? 'enabled' : 'disabled'}`);
        broadcastStatusChange(newStatus);
    }
});