import React, { useEffect, useState, useCallback } from 'react';
import './index.scss';
import { Card, message, Input, Button, Tooltip } from 'antd';
import { GithubFilled, InfoCircleOutlined } from '@ant-design/icons';

interface DomConfig {
  domain: string;
  selector: string;
}

interface ModelConfig {
  apiKey: string;
  baseURL: string;
  modelName: string;
}

const setItem = async (key: string, value: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

const getItem = async (key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
};

message.config({
  top: 50,
  duration: 2,
  maxCount: 1,
});

const Options: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(
    `Translate the following English text into Chinese and separate the translations with @@@`
  );
  const [domConfigs, setDomConfigs] = useState<DomConfig[]>([{ domain: '', selector: '' }]);
  const [selectedModel, setSelectedModel] = useState<string>('openai');
  const [openaiConfig, setOpenaiConfig] = useState<ModelConfig>({ apiKey: '', baseURL: 'https://api.openai.com/v1', modelName: 'gpt-4o' });
  const [ollamaConfig, setOllamaConfig] = useState<ModelConfig>({ apiKey: '', baseURL: 'https://localhost:11434/v1', modelName: 'ollama' });

  useEffect(() => {
    const init = async () => {
      const [storedPrompt, storedDomConfigs, storedSelectedModel, storedOpenaiConfig, storedOllamaConfig] = await Promise.all([
        getItem('prompt'),
        getItem('domConfigs'),
        getItem('selectedModel'),
        getItem('openaiConfig'),
        getItem('ollamaConfig'),
      ]);

      if (storedPrompt) setPrompt(storedPrompt);
      if (storedDomConfigs) setDomConfigs(storedDomConfigs);
      if (storedSelectedModel) setSelectedModel(storedSelectedModel);
      if (storedOpenaiConfig) setOpenaiConfig(storedOpenaiConfig);
      if (storedOllamaConfig) setOllamaConfig(storedOllamaConfig);
    };
    init();
  }, []);

  const handleAddConfig = useCallback(() => {
    setDomConfigs(prevConfigs => [...prevConfigs, { domain: '', selector: '' }]);
  }, []);

  const handleRemoveConfig = useCallback((index: number) => {
    setDomConfigs(prevConfigs => {
      const newConfigs = prevConfigs.filter((_, i) => i !== index);
      setItem('domConfigs', newConfigs);
      return newConfigs;
    });
  }, []);

  const handleConfigChange = useCallback((index: number, field: keyof DomConfig, value: string) => {
    setDomConfigs(prevConfigs => {
      const newConfigs = prevConfigs.map((config, i) =>
        i === index ? { ...config, [field]: value } : config
      );
      setItem('domConfigs', newConfigs);
      return newConfigs;
    });
  }, []);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    setItem('prompt', newPrompt);
  }, []);

  const handleModelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    setItem('selectedModel', newModel);
  }, []);

  const handleConfigUpdate = useCallback((configKey: string, field: keyof ModelConfig, value: string) => {
    if (configKey === 'openaiConfig') {
      setOpenaiConfig(prev => {
        const newConfig = { ...prev, [field]: value };
        setItem(configKey, newConfig);
        return newConfig;
      });
    } else if (configKey === 'ollamaConfig') {
      setOllamaConfig(prev => {
        const newConfig = { ...prev, [field]: value };
        setItem(configKey, newConfig);
        return newConfig;
      });
    }
  }, []);

  return (
    <div className="OptionsContainer">
      <Card className="Card" title="API 配置" extra={<Tooltip title="请谨慎保管您的API密钥"><InfoCircleOutlined /></Tooltip>} bordered={false}>
        <p>选择模型</p>
        <select value={selectedModel} onChange={handleModelChange}>
          <option value="openai">OpenAI</option>
          <option value="ollama">Ollama</option>
        </select>
        {selectedModel === 'openai' && (
          <>
            <p style={{ marginTop: '10px' }}>OpenAI Model Name</p>
            <Input
              value={openaiConfig.modelName}
              onChange={e => handleConfigUpdate('openaiConfig', 'modelName', e.target.value)}
              placeholder="输入 OpenAI 模型名称"
            />
            <p style={{ marginTop: '10px' }}>API Key</p>
            <Input
              value={openaiConfig.apiKey}
              onChange={e => handleConfigUpdate('openaiConfig', 'apiKey', e.target.value)}
              placeholder="输入您的 API Key"
              type="password"
            />
            <p style={{ marginTop: '10px' }}>Base URL</p>
            <Input
              value={openaiConfig.baseURL}
              onChange={e => handleConfigUpdate('openaiConfig', 'baseURL', e.target.value)}
              placeholder="输入 Base URL（可选）"
            />
          </>
        )}
        {selectedModel === 'ollama' && (
          <>
            <p style={{ marginTop: '10px' }}>Ollama Model Name</p>
            <Input
              value={ollamaConfig.modelName}
              onChange={e => handleConfigUpdate('ollamaConfig', 'modelName', e.target.value)}
              placeholder="输入 Ollama 模型名称"
            />
            <p style={{ marginTop: '10px' }}>API Key</p>
            <Input
              value={ollamaConfig.apiKey}
              onChange={e => handleConfigUpdate('ollamaConfig', 'apiKey', e.target.value)}
              placeholder="输入您的 API Key（随便填）"
              type="password"
            />
            <p style={{ marginTop: '10px' }}>Base URL</p>
            <Input
              value={ollamaConfig.baseURL}
              onChange={e => handleConfigUpdate('ollamaConfig', 'baseURL', e.target.value)}
              placeholder="https://localhost:11434/v1"
            />
          </>
        )}
      </Card>

      <Card className="Card" title="Subtitle/字幕" bordered={false}>
        <p>Translation Prompt Template</p>
        <Input.TextArea
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Translate the following <English> text into <Chinese> and separate the translations with @@@"
          autoSize={{ minRows: 3, maxRows: 5 }}
        />
        <p style={{ marginTop: '10px' }}>{`Translate the following English text into Chinese and separate the translations with @@@`}</p>
      </Card>

      <Card className="Card" title="DOM 配置" bordered={false}>
        {domConfigs.map((config, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <Input
              placeholder="域名 (例如: https://www.udemy.com)"
              value={config.domain}
              onChange={(e:any) => handleConfigChange(index, 'domain', e.target.value)}
              style={{ marginBottom: '5px' }}
            />
            <Input
              placeholder="CSS 选择器: (例如: .captions-display--captions-container--PqdGQ) 简单参考：https://juejin.cn/post/7278918966214705163"
              value={config.selector}
              onChange={(e:any) => handleConfigChange(index, 'selector', e.target.value)}
              style={{ marginBottom: '5px' }}
            />
            <Button onClick={() => handleRemoveConfig(index)}>删除</Button>
          </div>
        ))}
        <Button onClick={handleAddConfig}>添加配置</Button>
      </Card>

      <Card className="Card" title="字幕下载/Subtile Download" bordered={false}>
        <p>实验功能</p>
      </Card>

      <Card className="Card" title="关于" bordered={false}>
        <p>
          如果觉得不错，👏star{' '}
          <a
            href="https://github.com/ChenYCL/chrome-extension-udemy-translate"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubFilled style={{ fontSize: '28px', color: '#08c' }} />
          </a>{' '}
          ，您的star是我维护的动力，哈哈
        </p>
      </Card>
    </div>
  );
};

export default Options;