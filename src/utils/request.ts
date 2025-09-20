import Ollama from 'openai'

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
  selectedModel: string
  baseURL: string
  ollamaConfig: ModelConfig
  openaiConfig: ModelConfig
}

type TranslationModel = 'openai' | 'ollama' | 'thirdparty'

const createOllamaApi = (config: ModelConfig): Ollama => {
  return new Ollama({
    baseURL: config.baseURL,
    apiKey: 'ollama',
  })
}

const translateWithOpenAICompatible = async (
  config: ModelConfig,
  text: string,
  prompt: string,
): Promise<string> => {
  try {
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.modelName,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.message) {
          errorMessage = errorData.error.message
        }
      } catch (e) {
        // 如果不是 JSON 格式，使用原始错误文本
        errorMessage = errorText || errorMessage
      }

      throw new Error(`OpenAI API 错误: ${errorMessage}`)
    }

    const data = await response.json()
    console.log('🔥 OpenAI API 响应:', data)

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('OpenAI API 返回格式错误：缺少 choices 或 message')
    }

    return data.choices[0].message.content || ''
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`OpenAI API 请求失败: ${error}`)
  }
}

const translateWithOllama = async (
  instance: Ollama,
  text: string,
  prompt: string,
  modelName: string,
): Promise<string> => {
  try {
    const response = await fetch(`${instance.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch (e) {
        errorMessage = errorText || errorMessage
      }

      // 提供更友好的错误信息
      if (response.status === 404) {
        errorMessage = `模型 "${modelName}" 未找到。请确保已安装该模型：ollama pull ${modelName}`
      } else if (response.status === 500) {
        errorMessage = `Ollama 服务器错误。请检查 Ollama 是否正常运行：ollama serve`
      }

      throw new Error(`Ollama API 错误: ${errorMessage}`)
    }

    const data = await response.json()
    console.log('🔥 Ollama API 响应:', data)

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Ollama API 返回格式错误：缺少 choices 或 message')
    }

    return data.choices[0].message.content || ''
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Ollama API 请求失败: ${error}`)
  }
}

const getStorageData = (): Promise<StorageData> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ['selectedModel', 'baseURL', 'ollamaConfig', 'openaiConfig'],
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
    const { selectedModel, ollamaConfig, openaiConfig } = await getStorageData()

    // console.log('Selected model:', selectedModel, ollamaConfig, openaiConfig);

    let result: string

    switch (selectedModel as TranslationModel) {
      case 'openai':
        result = await translateWithOpenAICompatible(openaiConfig, text, prompt)
        break
      case 'ollama':
        const ollamaInstance = createOllamaApi(ollamaConfig)
        result = await translateWithOllama(
          ollamaInstance,
          text,
          prompt,
          ollamaConfig.modelName,
        )
        break
      // case 'thirdparty':
      //     //TODO: Implement third-party API translation here
      //     break;
      default:
        throw new Error('Unsupported model selected')
    }

    return result
  } catch (error) {
    console.error('Error translating text:', error)
    throw new Error('Translation failed')
  }
}

export { translateText }
