import { ChatOpenAI } from "@langchain/openai";
import Ollama from 'openai';

// 类型定义
export type MessageContentText = {
    type: "text";
    text: string;
};

export type MessageContentImageUrl = {
    type: "image_url";
    image_url: { url: string };
};

export type MessageContentComplex = 
    | MessageContentText 
    | MessageContentImageUrl 
    | (Record<string, any> & {
        type?: "text" | "image_url" | string;
      });

export type MessageContent = string | MessageContentComplex | MessageContentComplex[];

export interface FunctionCall {
    arguments: string;
    name: string;
}

interface ModelConfig {
    baseURL: string;
    apiKey: string;
    modelName: string;
}

interface StorageData {
    selectedModel: string;
    baseURL: string;
    ollamaConfig: ModelConfig;
    openaiConfig: ModelConfig;
}

type TranslationModel = 'openai' | 'ollama' | 'thirdparty';

type OpenAIResponse = {
    content: MessageContent;
};

const createOpenAIApi = (config: ModelConfig): ChatOpenAI => {
    return new ChatOpenAI({
        openAIApiKey: config.apiKey,
        configuration: {
            baseURL: config.baseURL,
        },
        modelName: config.modelName,
        temperature: 0.7,
    });
};

const createOllamaApi = (config: ModelConfig): Ollama => {
    return new Ollama({
        baseURL: config.baseURL,
        apiKey: 'ollama',
    });
};

const extractTextContent = (content: MessageContent): string => {
    if (typeof content === 'string') {
        return content;
    } else if (Array.isArray(content)) {
        return content.map(item => extractTextContent(item)).join(' ');
    } else if (typeof content === 'object') {
        if ('type' in content) {
            switch (content.type) {
                case 'text':
                    return content.text;
                case 'image_url':
                    return '[Image URL]';
                default:
                    if ('text' in content && typeof content.text === 'string') {
                        return content.text;
                    }
            }
        } else if ('text' in content && typeof content.text === 'string') {
            return content.text;
        }
    }
    return JSON.stringify(content);
};

const translateWithOpenAI = async (instance: ChatOpenAI, text: string, prompt: string): Promise<string> => {
    const result = await instance.invoke([
        ["system", prompt],
        ["human", text]
    ]) as OpenAIResponse;

    return extractTextContent(result.content);
};

const translateWithOllama = async (instance: Ollama, text: string, prompt: string, modelName: string): Promise<string> => {
    const response = await fetch(`${instance.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: modelName,
            messages: [
                { role: "system", content: prompt },
                { role: 'user', content: text }
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const msg = await response.json();
    console.log('🔥 🔥 Translated text:', msg);
    return msg.choices[0].message?.content || '';
};

const getStorageData = (): Promise<StorageData> => {
    return new Promise((resolve) => {
        chrome.storage.local.get(['selectedModel', 'baseURL', 'ollamaConfig', 'openaiConfig'], (result) => {
            resolve(result as StorageData);
        });
    });
};

const translateText = async (
    text: string,
    targetLanguage: string,
    prompt: string
): Promise< string | {content?:string}> => {
    try {
        const { selectedModel, ollamaConfig, openaiConfig } = await getStorageData();

        console.log('Selected model:', selectedModel, ollamaConfig, openaiConfig);

        let result: string;

        switch (selectedModel as TranslationModel) {
            case 'openai':
                const openaiInstance = createOpenAIApi(openaiConfig);
                result = await translateWithOpenAI(openaiInstance, text, prompt);
                break;
            case 'ollama':
                const ollamaInstance = createOllamaApi(ollamaConfig);
                result = await translateWithOllama(ollamaInstance, text, prompt, ollamaConfig.modelName);
                break;
            // case 'thirdparty':
            //     //TODO: Implement third-party API translation here
            //     break;
            default:
                throw new Error('Unsupported model selected');
        }

        return result;
    } catch (error) {
        console.error('Error translating text:', error);
        throw new Error('Translation failed');
    }
};

export { translateText };