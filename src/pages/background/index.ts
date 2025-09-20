import { translateText } from '../../utils/request'

console.log('Background script initialized')

const DEFAULT_SETTINGS = {
  status: false,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backgroundOpacity: '0.8',
  originFontColor: '#ffffff',
  originFontSize: '16',
  originFontWeight: 'normal',
  translatedFontSize: '16',
  translatedFontColor: '#ffff00',
  translatedFontWeight: 'normal',
  domConfigs: [
    {
      domain: 'https://www.netflix.com',
      selector: '.player-timedtext-text-container',
    },
    { domain: '', selector: '' },
  ],
  prompt:
    'Translate the following English text into Chinese and separate the translations with @@@',
  // 新增浮动字幕默认配置
  subtitlePosition: 'bottom',
  subtitleWidth: 600,
  subtitleHeight: 120,
  isDraggable: true,
  // 添加模型配置
  selectedModel: 'openai',
  openaiConfig: {
    apiKey: '',
    baseURL: 'https://api.openai.com/v1',
    modelName: 'gpt-3.5-turbo',
  },
  ollamaConfig: {
    apiKey: 'ollama',
    baseURL: 'https://localhost:11435/v1',
    modelName: 'qwen2:0.5b',
  },
}

chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  if (reason === 'install') {
    console.log('First install')
    chrome.storage.local.set(DEFAULT_SETTINGS)
  } else if (reason === 'update') {
    const currentVersion = chrome.runtime.getManifest().version
    console.log(`Updated from ${previousVersion} to ${currentVersion}`)
  }
})

const getStorageData = (): Promise<any> =>
  new Promise((resolve) => chrome.storage.local.get(null, resolve))

const broadcastStatusChange = async (status: boolean): Promise<void> => {
  try {
    const tabs = await chrome.tabs.query({})
    const promises = tabs.map(async (tab) => {
      if (tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'STATUS_CHANGED',
            status,
          })
        } catch (error) {
          // 忽略无法连接的标签页（如 chrome:// 页面）
          console.log(`Could not send message to tab ${tab.id}:`, error)
        }
      }
    })
    await Promise.allSettled(promises)
  } catch (error) {
    console.error('Error in broadcastStatusChange:', error)
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.status) {
    broadcastStatusChange(changes.status.newValue)
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TRANSLATE_TEXT') {
    handleTranslationRequest(request, sendResponse)
    return true // Indicates an asynchronous response
  }
})

const handleTranslationRequest = async (
  request: any,
  sendResponse: (response: any) => void,
) => {
  const { text, targetLanguage } = request

  try {
    const storageData = await getStorageData()
    const { status, prompt, selectedModel, ollamaConfig, openaiConfig } =
      storageData

    if (!status) {
      throw new Error('Translation is currently disabled')
    }

    if (!isConfigValid(selectedModel, ollamaConfig, openaiConfig)) {
      const modelType = selectedModel === 'openai' ? 'OpenAI' : 'Ollama'
      throw new Error(
        `${modelType} 配置不完整。请检查 API Key、Base URL 和模型名称是否正确设置。`,
      )
    }

    const response = await translateText(text, targetLanguage, prompt)
    console.log('Translation response:', response)
    sendResponse({ type: 'TRANSLATED_TEXT', translatedText: response })
  } catch (error: any) {
    sendResponse({ type: 'TRANSLATION_ERROR', error: error.message })
  }
}

const isConfigValid = (
  selectedModel: string,
  ollamaConfig: any,
  openaiConfig: any,
): boolean => {
  if (selectedModel === 'openai') {
    return !!(
      openaiConfig?.apiKey &&
      openaiConfig?.baseURL &&
      openaiConfig?.modelName &&
      openaiConfig.apiKey.trim() !== '' &&
      openaiConfig.baseURL.trim() !== '' &&
      openaiConfig.modelName.trim() !== ''
    )
  } else if (selectedModel === 'ollama') {
    return !!(
      ollamaConfig?.baseURL &&
      ollamaConfig?.modelName &&
      ollamaConfig.baseURL.trim() !== '' &&
      ollamaConfig.modelName.trim() !== ''
    )
  }
  return false
}
