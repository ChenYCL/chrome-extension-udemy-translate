import React, { useEffect, useState, useCallback } from 'react'
import './index.scss'
import { Card, message, Input, Button, Tooltip } from 'antd'
import { GithubFilled, InfoCircleOutlined } from '@ant-design/icons'

interface DomConfig {
  domain: string
  selector: string
}

interface ModelConfig {
  apiKey: string
  baseURL: string
  modelName: string
}

// Provider types: OpenAI-compatible  or Ollama
type ProviderType = 'openai-compatible' | 'ollama'

interface ProviderPreset {
  name: string
  baseURL: string
  defaultModel: string
  requiresApiKey: boolean
  description: string
  examples?: Array<{
    name: string
    baseURL: string
    model: string
    description?: string
    signupUrl?: string
    promoText?: string
  }>
}

// Provider presets configuration
const PROVIDER_PRESETS: Record<ProviderType, ProviderPreset> = {
  'openai-compatible': {
    name: 'OpenAI-Compatible API',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    requiresApiKey: true,
    description: 'Any OpenAI-compatible API (OpenAI, 智谱 AI, DeepSeek, etc.)',
    examples: [
      {
        name: 'OpenAI',
        baseURL: 'https://api.openai.com/v1',
        model: 'gpt-4o',
        description: 'Official OpenAI API',
      },
      {
        name: '智谱 AI (GLM) 🎁',
        baseURL: 'https://open.bigmodel.cn/api/paas/v4',
        model: 'glm-4-flash',
        description:
          '免费模型 glm-4-flash，支持 Claude Code、Cline 等 10+ 编程工具',
        signupUrl: 'https://www.bigmodel.cn/claude-code?ic=HTKMARY5TE',
        promoText:
          '🚀 速来拼好模，智谱 GLM Coding 超值订阅，邀你一起薅羊毛！Claude Code、Cline 等 10+ 大编程工具无缝支持，"码力"全开，越拼越爽！立即开拼，享限时惊喜价！',
      },
      {
        name: 'DeepSeek',
        baseURL: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat',
        description: 'DeepSeek AI API',
      },
    ],
  },
  ollama: {
    name: 'Ollama (Local)',
    baseURL: 'https://localhost:11435/v1',
    defaultModel: 'qwen2:0.5b',
    requiresApiKey: false,
    description: 'Local Ollama server',
  },
}

const setItem = async (key: string, value: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

const getItem = async (key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve(result[key])
      }
    })
  })
}

message.config({
  top: 50,
  duration: 2,
  maxCount: 1,
})

const Options: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(
    `Translate the following English text into Chinese and separate the translations with @@@`,
  )
  const [domConfigs, setDomConfigs] = useState<DomConfig[]>([
    { domain: '', selector: '' },
  ])
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderType>('openai-compatible')
  const [providerConfig, setProviderConfig] = useState<ModelConfig>({
    apiKey: '',
    baseURL: PROVIDER_PRESETS['openai-compatible'].baseURL,
    modelName: PROVIDER_PRESETS['openai-compatible'].defaultModel,
  })
  const [testing, setTesting] = useState<boolean>(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    const init = async () => {
      const [
        storedPrompt,
        storedDomConfigs,
        storedSelectedProvider,
        storedProviderConfig,
        // Legacy support
        storedSelectedModel,
        storedOpenaiConfig,
        storedOllamaConfig,
      ] = await Promise.all([
        getItem('prompt'),
        getItem('domConfigs'),
        getItem('selectedProvider'),
        getItem('providerConfig'),
        // Legacy keys
        getItem('selectedModel'),
        getItem('openaiConfig'),
        getItem('ollamaConfig'),
      ])

      if (storedPrompt) setPrompt(storedPrompt)
      if (storedDomConfigs) setDomConfigs(storedDomConfigs)

      // Migrate from legacy config
      if (storedSelectedProvider) {
        // 迁移旧的 provider 类型到新的类型
        if (
          storedSelectedProvider === 'openai' ||
          storedSelectedProvider === 'zhipu'
        ) {
          setSelectedProvider('openai-compatible')
          await setItem('selectedProvider', 'openai-compatible')
        } else {
          setSelectedProvider(storedSelectedProvider)
        }
      } else if (storedSelectedModel) {
        // Migrate old selectedModel to selectedProvider
        if (
          storedSelectedModel === 'openai' ||
          storedSelectedModel === 'zhipu'
        ) {
          setSelectedProvider('openai-compatible')
          await setItem('selectedProvider', 'openai-compatible')
        } else {
          setSelectedProvider(storedSelectedModel as ProviderType)
          await setItem('selectedProvider', storedSelectedModel)
        }
      }

      if (storedProviderConfig) {
        setProviderConfig(storedProviderConfig)
      } else {
        // Migrate from legacy configs
        if (storedSelectedModel === 'openai' && storedOpenaiConfig) {
          setProviderConfig(storedOpenaiConfig)
          await setItem('providerConfig', storedOpenaiConfig)
        } else if (storedSelectedModel === 'zhipu' && storedOpenaiConfig) {
          // 智谱 AI 也使用 openaiConfig
          setProviderConfig(storedOpenaiConfig)
          await setItem('providerConfig', storedOpenaiConfig)
        } else if (storedSelectedModel === 'ollama' && storedOllamaConfig) {
          setProviderConfig(storedOllamaConfig)
          await setItem('providerConfig', storedOllamaConfig)
        }
      }
    }
    init()
  }, [])

  const handleAddConfig = useCallback(() => {
    setDomConfigs((prevConfigs) => [
      ...prevConfigs,
      { domain: '', selector: '' },
    ])
  }, [])

  const handleRemoveConfig = useCallback((index: number) => {
    setDomConfigs((prevConfigs) => {
      const newConfigs = prevConfigs.filter((_, i) => i !== index)
      setItem('domConfigs', newConfigs)
      return newConfigs
    })
  }, [])

  const handleConfigChange = useCallback(
    (index: number, field: keyof DomConfig, value: string) => {
      setDomConfigs((prevConfigs) => {
        const newConfigs = prevConfigs.map((config, i) =>
          i === index ? { ...config, [field]: value } : config,
        )
        setItem('domConfigs', newConfigs)
        return newConfigs
      })
    },
    [],
  )

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newPrompt = e.target.value
      setPrompt(newPrompt)
      setItem('prompt', newPrompt)
    },
    [],
  )

  const handleProviderChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newProvider = e.target.value as ProviderType
      setSelectedProvider(newProvider)
      setItem('selectedProvider', newProvider)

      // Update config with provider preset
      const preset = PROVIDER_PRESETS[newProvider]
      const newConfig: ModelConfig = {
        apiKey: providerConfig.apiKey, // Keep existing API key
        baseURL: preset.baseURL,
        modelName: preset.defaultModel,
      }
      setProviderConfig(newConfig)
      setItem('providerConfig', newConfig)
    },
    [providerConfig.apiKey],
  )

  const handleConfigUpdate = useCallback(
    (field: keyof ModelConfig, value: string) => {
      setProviderConfig((prev) => {
        const newConfig = { ...prev, [field]: value }
        setItem('providerConfig', newConfig)
        return newConfig
      })
    },
    [],
  )

  // 统一的 API 测试函数
  const testProviderConfig = useCallback(async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const preset = PROVIDER_PRESETS[selectedProvider]
      console.log(`🧪 开始测试 ${preset.name} 配置:`, {
        provider: selectedProvider,
        baseURL: providerConfig.baseURL,
        modelName: providerConfig.modelName,
        hasApiKey: !!providerConfig.apiKey,
      })

      // Ollama 需要先进行健康检查
      if (selectedProvider === 'ollama') {
        const healthUrl = providerConfig.baseURL.replace('/v1', '') + '/health'
        console.log('🏥 检查 Ollama 健康状态:', healthUrl)

        const healthResponse = await fetch(healthUrl, { method: 'GET' })
        console.log(
          '📥 健康检查响应:',
          healthResponse.status,
          healthResponse.statusText,
        )

        if (!healthResponse.ok) {
          setTestResult({
            success: false,
            message: `Ollama 服务不可用 (${healthResponse.status})。请确保：
1. Ollama 正在运行（ollama serve）
2. HTTPS 代理已启动（https://localhost:11435）
3. 证书已信任`,
          })
          return
        }
        console.log('✅ Ollama 健康检查通过')
      }

      // 构建请求体
      const requestBody = {
        model: providerConfig.modelName,
        messages: [
          {
            role: 'system',
            content:
              'Translate the following English text into Chinese and separate the translations with @@@',
          },
          {
            role: 'user',
            content: 'Hello, how are you?',
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
        stream: false,
      }

      console.log('📤 发送测试请求:', requestBody)

      // 构建请求头
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      // 只有需要 API Key 的 provider 才添加 Authorization 头
      if (preset.requiresApiKey && providerConfig.apiKey) {
        headers['Authorization'] = `Bearer ${providerConfig.apiKey}`
      }

      const response = await fetch(
        `${providerConfig.baseURL}/chat/completions`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        },
      )

      console.log('📥 收到响应:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API 错误响应:', errorText)

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
          errorMessage = errorText || errorMessage
        }

        // 提供特定 provider 的错误提示
        if (selectedProvider === 'ollama' && response.status === 404) {
          errorMessage = `模型 "${providerConfig.modelName}" 未找到。请运行：ollama pull ${providerConfig.modelName}`
        }

        setTestResult({
          success: false,
          message: `API 请求失败: ${errorMessage}`,
        })
        return
      }

      const data = await response.json()
      console.log('✅ API 响应成功:', data)

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const translatedText = data.choices[0].message.content
        setTestResult({
          success: true,
          message: `✅ ${preset.name} 测试成功！
原文: "Hello, how are you?"
译文: "${translatedText}"`,
        })
      } else {
        console.error('❌ 响应格式错误:', data)
        setTestResult({
          success: false,
          message: 'API 响应格式错误：缺少 choices 或 message',
        })
      }
    } catch (error: any) {
      console.error('❌ 测试异常:', error)

      let errorMessage = error.message || '未知错误'

      if (error.message.includes('Failed to fetch')) {
        if (selectedProvider === 'ollama') {
          errorMessage = `无法连接到 Ollama 服务。请检查：
1. Ollama 是否正在运行（ollama serve）
2. HTTPS 代理是否已启动
3. Base URL 是否正确：${providerConfig.baseURL}
4. 浏览器是否信任 HTTPS 证书`
        } else {
          errorMessage = `无法连接到 API 服务。请检查：
1. Base URL 是否正确：${providerConfig.baseURL}
2. 网络连接是否正常
3. API Key 是否有效`
        }
      }

      setTestResult({
        success: false,
        message: `测试失败: ${errorMessage}`,
      })
    } finally {
      setTesting(false)
    }
  }, [selectedProvider, providerConfig])

  return (
    <div className="OptionsContainer">
      <Card
        className="Card"
        title="API 配置 / API Configuration"
        extra={
          <Tooltip title="请谨慎保管您的API密钥 / Please keep your API key safe">
            <InfoCircleOutlined />
          </Tooltip>
        }
        bordered={false}
      >
        <p>选择 Provider / Select Provider</p>
        <select value={selectedProvider} onChange={handleProviderChange}>
          <option value="openai-compatible">
            OpenAI-Compatible API (OpenAI, 智谱 AI, DeepSeek, etc.)
          </option>
          <option value="ollama">Ollama (Local)</option>
        </select>

        <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          {PROVIDER_PRESETS[selectedProvider].description}
        </p>

        {/* 显示示例配置 */}
        {PROVIDER_PRESETS[selectedProvider].examples && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
              常用配置示例 / Common Examples:
            </p>
            {PROVIDER_PRESETS[selectedProvider].examples?.map(
              (example, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: '8px',
                    padding: '8px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: example.promoText
                      ? '2px solid #ff6b6b'
                      : '1px solid #e8e8e8',
                  }}
                >
                  <div
                    style={{
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setProviderConfig({
                        ...providerConfig,
                        baseURL: example.baseURL,
                        modelName: example.model,
                      })
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {example.name}
                    </div>
                    {example.description && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '4px',
                        }}
                      >
                        {example.description}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Base URL: {example.baseURL}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Model: {example.model}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#1890ff',
                        marginTop: '4px',
                      }}
                    >
                      点击使用此配置 / Click to use this config
                    </div>
                  </div>

                  {/* 推广信息 */}
                  {example.promoText && example.signupUrl && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '8px',
                        backgroundColor: '#fff7e6',
                        borderRadius: '4px',
                        border: '1px solid #ffd591',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#d46b08',
                          marginBottom: '6px',
                          lineHeight: '1.5',
                        }}
                      >
                        {example.promoText}
                      </div>
                      <a
                        href={example.signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          fontSize: '12px',
                          color: '#1890ff',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        🎁 立即注册获取 API Key →
                      </a>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        )}

        <p style={{ marginTop: '10px' }}>模型名称 / Model Name</p>
        <Input
          value={providerConfig.modelName}
          onChange={(e) => handleConfigUpdate('modelName', e.target.value)}
          placeholder={`输入模型名称 / Enter model name (e.g., ${PROVIDER_PRESETS[selectedProvider].defaultModel})`}
        />

        {PROVIDER_PRESETS[selectedProvider].requiresApiKey && (
          <>
            <p style={{ marginTop: '10px' }}>API 密钥 / API Key</p>
            <Input
              value={providerConfig.apiKey}
              onChange={(e) => handleConfigUpdate('apiKey', e.target.value)}
              placeholder="输入您的 API 密钥 / Enter your API Key"
              type="password"
            />
          </>
        )}

        <p style={{ marginTop: '10px' }}>基础 URL / Base URL</p>
        <Input
          value={providerConfig.baseURL}
          onChange={(e) => handleConfigUpdate('baseURL', e.target.value)}
          placeholder={PROVIDER_PRESETS[selectedProvider].baseURL}
        />

        <div style={{ marginTop: '15px' }}>
          <Button
            onClick={testProviderConfig}
            type="default"
            loading={testing}
            disabled={
              !providerConfig.baseURL ||
              !providerConfig.modelName ||
              (PROVIDER_PRESETS[selectedProvider].requiresApiKey &&
                !providerConfig.apiKey)
            }
          >
            🧪 测试 {PROVIDER_PRESETS[selectedProvider].name} 配置
          </Button>
          {testResult && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px',
                borderRadius: '4px',
                backgroundColor: testResult.success ? '#f6ffed' : '#fff2f0',
                border: `1px solid ${
                  testResult.success ? '#b7eb8f' : '#ffccc7'
                }`,
              }}
            >
              <div
                style={{
                  color: testResult.success ? '#52c41a' : '#ff4d4f',
                  fontWeight: 'bold',
                }}
              >
                {testResult.success ? '✅ 测试成功' : '❌ 测试失败'}
              </div>
              <div
                style={{
                  marginTop: '5px',
                  fontSize: '12px',
                  color: '#666',
                  whiteSpace: 'pre-line',
                }}
              >
                {testResult.message}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="Card" title="字幕 / Subtitle" bordered={false}>
        <p>翻译提示模板 / Translation Prompt Template</p>
        <Input.TextArea
          value={prompt}
          onChange={handlePromptChange}
          placeholder="将以下<英文>文本翻译成<中文>，并用@@@分隔翻译（请使用英文） / Translate the following <English> text into <Chinese> and separate the translations with @@@"
          autoSize={{ minRows: 3, maxRows: 5 }}
        />
        <p style={{ marginTop: '10px' }}>
          例子 / Example：
          {`Translate the following <English> text into <Chinese> and separate the translations with @@@`}
        </p>
      </Card>

      <Card
        className="Card"
        title="DOM 配置 / DOM Configuration"
        bordered={false}
      >
        {domConfigs.map((config, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <Input
              placeholder="域名 (例如: https://www.udemy.com) / Domain (e.g., https://www.udemy.com)"
              value={config.domain}
              onChange={(e: any) =>
                handleConfigChange(index, 'domain', e.target.value)
              }
              style={{ marginBottom: '5px' }}
            />
            <Input
              placeholder="CSS 选择器 (例如: .player-timedtext-text-container-text-container) / CSS Selector (e.g., .player-timedtext-text-container-text-container)"
              value={config.selector}
              onChange={(e: any) =>
                handleConfigChange(index, 'selector', e.target.value)
              }
              style={{ marginBottom: '5px' }}
            />
            <Button onClick={() => handleRemoveConfig(index)}>
              删除 / Delete
            </Button>
          </div>
        ))}
        <Button onClick={handleAddConfig}>添加配置 / Add Configuration</Button>
      </Card>

      <Card
        className="Card"
        title="字幕下载 / Subtitle Download"
        bordered={false}
      >
        <p>实验功能 / Experimental Feature</p>
      </Card>

      <Card className="Card" title="关于 / About" bordered={false}>
        <p>
          如果觉得不错，请给个 star / If you like it, please give a star{' '}
          <a
            href="https://github.com/ChenYCL/chrome-extension-udemy-translate"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubFilled style={{ fontSize: '28px', color: '#08c' }} />
          </a>{' '}
          您的 star 是我维护的动力，谢谢！/ Your star is my motivation to
          maintain this project, thank you!
        </p>
      </Card>
    </div>
  )
}

export default Options
