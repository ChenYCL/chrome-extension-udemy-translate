import { ChatOpenAI } from "@langchain/openai";
import Ollama from 'openai'

interface TranslateResponse {
    translatedText: string;
}

/**
 * create openai api
 * @param apiKey 
 * @param baseURL 
 * @param modelName 
 * @returns 
 */
export const createOpenAIApi = (apiKey: string, baseURL: string, modelName: string = "gpt-3.5-turbo"): ChatOpenAI => {
    return new ChatOpenAI({
        openAIApiKey: apiKey,
        configuration: {
            baseURL: baseURL,
        },
        modelName,
        temperature: 0.7,
    });
};

/**
 * translate text
 * @param text 
 * @param targetLanguage 
 * @param prompt 
 * @returns 
 */
export const translateText = async (
    text: string,
    targetLanguage: string,
    prompt: string
): Promise<TranslateResponse> => {
    try {
        let instance;

        const { selectedModel, baseURL, ollamaConfig, openaiConfig } = await getStorageData();

        console.log('Selected model:', selectedModel, baseURL, ollamaConfig, openaiConfig);

        switch (selectedModel) {
            case 'openai':
                instance = createOpenAIApi(openaiConfig?.apiKey, baseURL, openaiConfig?.modelName) as any;
                break;
            case 'ollama':
                instance =  new Ollama({
                    baseURL: ollamaConfig?.baseURL,
                    apiKey: 'ollama',
                  })
                break;
            default:
                throw new Error('Unsupported model selected');
        }


        let result;
        if (selectedModel === 'openai') {
            result = await instance.invoke([
                ["system", prompt],
                ["human", text]
            ]);

        } else if (selectedModel === 'ollama') {
            const response = await fetch(`${ollamaConfig?.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: ollamaConfig?.modelName,
                  messages: [
                    {
                      role: "system",
                      content: `${prompt}`
                    },
                    { role: 'user', content: text }
                  ],
                }),
              });
            
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
            
              const msg = await response.json();
              console.log('🔥 🔥 Translated text:', msg)
              result = msg.choices[0].message?.content;
        }

        return result;
    } catch (error) {
        console.error('Error translating text:', error);
        throw new Error('Translation failed');
    }
};

/**
 * Get storage data
 * @returns 
 */
async function getStorageData(): Promise<any> {
    return new Promise((resolve) => {
        chrome.storage.local.get(['selectedModel', 'baseURL', 'ollamaConfig', 'openaiConfig'], (result) => {
            resolve(result);
        });
    });
}