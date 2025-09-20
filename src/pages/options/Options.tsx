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
  const [selectedModel, setSelectedModel] = useState<string>('openai')
  const [openaiConfig, setOpenaiConfig] = useState<ModelConfig>({
    apiKey: '',
    baseURL: 'https://api.openai.com/v1',
    modelName: 'gpt-4o',
  })
  const [ollamaConfig, setOllamaConfig] = useState<ModelConfig>({
    apiKey: '',
    baseURL: 'https://localhost:11435/v1',
    modelName: 'qwen2:0.5b',
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
        storedSelectedModel,
        storedOpenaiConfig,
        storedOllamaConfig,
      ] = await Promise.all([
        getItem('prompt'),
        getItem('domConfigs'),
        getItem('selectedModel'),
        getItem('openaiConfig'),
        getItem('ollamaConfig'),
      ])

      if (storedPrompt) setPrompt(storedPrompt)
      if (storedDomConfigs) setDomConfigs(storedDomConfigs)
      if (storedSelectedModel) setSelectedModel(storedSelectedModel)
      if (storedOpenaiConfig) setOpenaiConfig(storedOpenaiConfig)
      if (storedOllamaConfig) setOllamaConfig(storedOllamaConfig)
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

  const handleModelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newModel = e.target.value
      setSelectedModel(newModel)
      setItem('selectedModel', newModel)
    },
    [],
  )

  const handleConfigUpdate = useCallback(
    (configKey: string, field: keyof ModelConfig, value: string) => {
      if (configKey === 'openaiConfig') {
        setOpenaiConfig((prev) => {
          const newConfig = { ...prev, [field]: value }
          setItem(configKey, newConfig)
          return newConfig
        })
      } else if (configKey === 'ollamaConfig') {
        setOllamaConfig((prev) => {
          const newConfig = { ...prev, [field]: value }
          setItem(configKey, newConfig)
          return newConfig
        })
      }
    },
    [],
  )

  const testOpenAIConfig = useCallback(async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch(`${openaiConfig.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: openaiConfig.modelName,
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
          // 如果不是JSON格式，使用原始错误文本
        }

        setTestResult({
          success: false,
          message: `API 请求失败: ${errorMessage}`,
        })
        return
      }

      const data = await response.json()

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const translatedText = data.choices[0].message.content
        setTestResult({
          success: true,
          message: `翻译测试成功！原文: "Hello, how are you?" 译文: "${translatedText}"`,
        })
      } else {
        setTestResult({
          success: false,
          message: 'API 响应格式错误：缺少 choices 或 message',
        })
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `测试失败: ${error.message}`,
      })
    } finally {
      setTesting(false)
    }
  }, [openaiConfig])

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
        <p>选择模型 / Select Model</p>
        <select value={selectedModel} onChange={handleModelChange}>
          <option value="openai">OpenAI</option>
          <option value="ollama">Ollama</option>
        </select>
        {selectedModel === 'openai' && (
          <>
            <p style={{ marginTop: '10px' }}>
              OpenAI 模型名称 / OpenAI Model Name
            </p>
            <Input
              value={openaiConfig.modelName}
              onChange={(e) =>
                handleConfigUpdate('openaiConfig', 'modelName', e.target.value)
              }
              placeholder="输入 OpenAI 模型名称 / Enter OpenAI model name"
            />
            <p style={{ marginTop: '10px' }}>API 密钥 / API Key</p>
            <Input
              value={openaiConfig.apiKey}
              onChange={(e) =>
                handleConfigUpdate('openaiConfig', 'apiKey', e.target.value)
              }
              placeholder="输入您的 API 密钥 / Enter your API Key"
              type="password"
            />
            <p style={{ marginTop: '10px' }}>基础 URL / Base URL</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <Button
                onClick={() =>
                  handleConfigUpdate(
                    'openaiConfig',
                    'baseURL',
                    'https://api.openai.com/v1',
                  )
                }
                size="small"
                type={
                  openaiConfig.baseURL === 'https://api.openai.com/v1'
                    ? 'primary'
                    : 'default'
                }
              >
                OpenAI 官方
              </Button>
              <Button
                onClick={() =>
                  handleConfigUpdate(
                    'openaiConfig',
                    'baseURL',
                    'https://api.oaipro.com/v1',
                  )
                }
                size="small"
                type={
                  openaiConfig.baseURL === 'https://api.oaipro.com/v1'
                    ? 'primary'
                    : 'default'
                }
              >
                OAIPro
              </Button>
              <Button
                onClick={() =>
                  handleConfigUpdate(
                    'openaiConfig',
                    'baseURL',
                    'https://api.useaihub.com/v1',
                  )
                }
                size="small"
                type={
                  openaiConfig.baseURL === 'https://api.useaihub.com/v1'
                    ? 'primary'
                    : 'default'
                }
              >
                UseAIHub
              </Button>
            </div>
            <Input
              value={openaiConfig.baseURL}
              onChange={(e) =>
                handleConfigUpdate('openaiConfig', 'baseURL', e.target.value)
              }
              placeholder="输入基础 URL（可选）/ Enter Base URL (optional)"
            />
            <div style={{ marginTop: '15px' }}>
              <Button
                onClick={testOpenAIConfig}
                type="default"
                loading={testing}
                disabled={
                  !openaiConfig.apiKey ||
                  !openaiConfig.baseURL ||
                  !openaiConfig.modelName
                }
              >
                🧪 测试 API 配置
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
                    }}
                  >
                    {testResult.message}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {selectedModel === 'ollama' && (
          <>
            <p style={{ marginTop: '10px' }}>
              Ollama 模型名称 / Ollama Model Name
            </p>
            <Input
              value={ollamaConfig.modelName}
              onChange={(e) =>
                handleConfigUpdate('ollamaConfig', 'modelName', e.target.value)
              }
              placeholder="输入 Ollama 模型名称 / Enter Ollama model name"
            />
            <p style={{ marginTop: '10px' }}>API 密钥 / API Key</p>
            <Input
              value={ollamaConfig.apiKey}
              onChange={(e) =>
                handleConfigUpdate('ollamaConfig', 'apiKey', e.target.value)
              }
              placeholder="输入您的 API 密钥（随便填）/ Enter your API Key (any value)"
              type="password"
            />
            <p style={{ marginTop: '10px' }}>基础 URL / Base URL</p>
            <Input
              value={ollamaConfig.baseURL}
              onChange={(e) =>
                handleConfigUpdate('ollamaConfig', 'baseURL', e.target.value)
              }
              placeholder="https://localhost:11435/v1"
            />
          </>
        )}
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
