export type MessageContentText = {
  type: 'text'
  text: string
}

export type MessageContentImageUrl = {
  type: 'image_url'
  image_url: { url: string }
}

export type MessageContentComplex =
  | MessageContentText
  | MessageContentImageUrl
  | (Record<string, any> & {
      type?: 'text' | 'image_url' | string
    })

export type MessageContent =
  | string
  | MessageContentComplex
  | MessageContentComplex[]

export interface FunctionCall {
  arguments: string
  name: string
}

interface ModelConfig {
  baseURL: string
  apiKey: string
  modelName: string
}

interface StorageData {
  selectedProvider?: string
  providerConfig?: ModelConfig
  // Legacy support
  selectedModel?: string
  ollamaConfig?: ModelConfig
  openaiConfig?: ModelConfig
}

type ProviderType = 'openai-compatible' | 'ollama'

// 统一的 OpenAI-compatible API 翻译函数
const translateWithOpenAICompatible = async (
  config: ModelConfig,
  text: string,
  prompt: string,
  provider: ProviderType,
): Promise<string> => {
  const providerName =
    provider === 'ollama' ? 'Ollama' : 'OpenAI-Compatible API'

  try {
    console.log(`🚀 ${providerName} API 请求配置:`, {
      provider,
      baseURL: config.baseURL,
      modelName: config.modelName,
      hasApiKey: !!config.apiKey,
      textLength: text.length,
    })

    const requestBody = {
      model: config.modelName,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      stream: false, // 明确禁用流式响应
    }

    console.log(
      `📤 ${providerName} 请求体:`,
      JSON.stringify(requestBody, null, 2),
    )

    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Ollama 不需要 API Key，其他 provider 需要
    if (provider !== 'ollama' && config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`
    }

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    console.log(
      `📥 ${providerName} 响应状态:`,
      response.status,
      response.statusText,
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ ${providerName} API 错误响应:`, errorText)

      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.message) {
          errorMessage = errorData.error.message
        } else if (errorData.error) {
          errorMessage =
            typeof errorData.error === 'string'
              ? errorData.error
              : JSON.stringify(errorData.error)
        }
      } catch (e) {
        // 如果不是 JSON 格式，使用原始错误文本
        errorMessage = errorText || errorMessage
      }

      // 提供特定 provider 的错误提示
      if (provider === 'ollama') {
        if (response.status === 404) {
          errorMessage = `模型 "${config.modelName}" 未找到。请确保已安装该模型：ollama pull ${config.modelName}`
        } else if (response.status === 500) {
          errorMessage = `Ollama 服务器错误。请检查 Ollama 是否正常运行：ollama serve`
        }
      }

      throw new Error(`${providerName} API 错误: ${errorMessage}`)
    }

    const data = await response.json()
    console.log(`✅ ${providerName} API 响应成功:`, data)

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error(`❌ ${providerName} API 返回格式错误:`, data)
      throw new Error(
        `${providerName} API 返回格式错误：缺少 choices 或 message`,
      )
    }

    const result = data.choices[0].message.content || ''
    console.log('📝 翻译结果:', result.substring(0, 100) + '...')

    return result
  } catch (error) {
    console.error(`❌ ${providerName} API 请求异常:`, error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`${providerName} API 请求失败: ${error}`)
  }
}

const getStorageData = (): Promise<StorageData> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      [
        'selectedProvider',
        'providerConfig',
        // Legacy keys
        'selectedModel',
        'ollamaConfig',
        'openaiConfig',
      ],
      (result) => {
        resolve(result as StorageData)
      },
    )
  })
}

const translateText = async (
  text: string,
  targetLanguage: string,
  prompt: string,
): Promise<string> => {
  try {
    const storageData = await getStorageData()

    // 获取 provider 和配置（支持新旧格式）
    let provider: ProviderType
    let config: ModelConfig

    if (storageData.selectedProvider && storageData.providerConfig) {
      // 新格式
      let rawProvider = storageData.selectedProvider as string

      // 迁移旧的 provider 类型
      if (rawProvider === 'openai' || rawProvider === 'zhipu') {
        provider = 'openai-compatible'
      } else {
        provider = rawProvider as ProviderType
      }

      config = storageData.providerConfig
    } else {
      // 兼容旧格式
      const selectedModel = storageData.selectedModel || 'openai'

      // 迁移旧的 model 类型
      if (selectedModel === 'openai' || selectedModel === 'zhipu') {
        provider = 'openai-compatible'
      } else {
        provider = selectedModel as ProviderType
      }

      if (selectedModel === 'ollama' && storageData.ollamaConfig) {
        config = storageData.ollamaConfig
      } else if (storageData.openaiConfig) {
        // openai 和 zhipu 都使用 openaiConfig
        config = storageData.openaiConfig
      } else {
        throw new Error('No valid configuration found')
      }
    }

    console.log('🔧 使用 Provider:', provider, config)

    // 使用统一的翻译函数
    const result = await translateWithOpenAICompatible(
      config,
      text,
      prompt,
      provider,
    )

    return result
  } catch (error) {
    console.error('Error translating text:', error)
    throw new Error('Translation failed')
  }
}

export { translateText }
