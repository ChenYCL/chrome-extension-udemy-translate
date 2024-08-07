import React, { useEffect, useState, useCallback } from 'react';
import './index.scss';
import { Card, message, Input, Button, Tooltip } from 'antd';
import { GithubFilled, InfoCircleOutlined } from '@ant-design/icons';

interface DomConfig {
  domain: string;
  selector: string;
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
    "Translate the following text to {TARGET_LANGUAGE}. Maintain the original meaning and tone as closely as possible:\n\n{SOURCE_TEXT}"
  );
  const [domConfigs, setDomConfigs] = useState<DomConfig[]>([{ domain: '', selector: '' }]);
  const [apiKey, setApiKey] = useState<string>('');
  const [baseURL, setBaseURL] = useState<string>('https://api.openai.com/v1');

  useEffect(() => {
    const init = async () => {
      const [storedPrompt, storedDomConfigs, storedApiKey, storedBaseURL] = await Promise.all([
        getItem('prompt'),
        getItem('domConfigs'),
        getItem('apiKey'),
        getItem('baseURL'),
      ]);

      if (storedPrompt) setPrompt(storedPrompt);
      if (storedDomConfigs) setDomConfigs(storedDomConfigs);
      if (storedApiKey) setApiKey(storedApiKey);
      if (storedBaseURL) setBaseURL(storedBaseURL);
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

  const handleApiKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    setItem('apiKey', newApiKey);
  }, []);

  const handleBaseURLChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newBaseURL = e.target.value;
    setBaseURL(newBaseURL);
    setItem('baseURL', newBaseURL);
  }, []);

  return (
    <div className="OptionsContainer">
      <Card className="Card" title="API 配置" extra={<Tooltip title="请谨慎保管您的API密钥"><InfoCircleOutlined /></Tooltip>} bordered={false}>
        <p>API Key</p>
        <Input
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder="输入您的 API Key"
          type="password"
        />
        <p style={{ marginTop: '10px' }}>Base URL</p>
        <Input
          value={baseURL}
          onChange={handleBaseURLChange}
          placeholder="输入 Base URL（可选）"
        />
      </Card>

      <Card className="Card" title="Subtitle/字幕" bordered={false}>
        <p>Translation Prompt Template</p>
        <Input.TextArea
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Enter your translation prompt template. Use {TARGET_LANGUAGE} for the target language and {SOURCE_TEXT} for the source text."
          autoSize={{ minRows: 3, maxRows: 5 }}
        />
        <p style={{ marginTop: '10px' }}>{`Example: Translate the following text to {TARGET_LANGUAGE}. Maintain the original meaning and tone as closely as possible:\n\n{SOURCE_TEXT}`}</p>
      </Card>

      <Card className="Card" title="DOM 配置" bordered={false}>
        {domConfigs.map((config, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <Input
              placeholder="域名 (例如: www.example.com)"
              value={config.domain}
              onChange={(e:any) => handleConfigChange(index, 'domain', e.target.value)}
              style={{ marginBottom: '5px' }}
            />
            <Input
              placeholder="CSS 选择器"
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