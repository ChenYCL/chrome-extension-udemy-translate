import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

interface TranslateResponse {
    translatedText: string;
}

export const createOpenAIApi = (apiKey: string, baseURL: string): OpenAI => {
    return new OpenAI({
        openAIApiKey: apiKey,
        configuration: {
            baseURL: baseURL,
        },
        modelName: "gpt-4o", // 使用 GPT-4 模型
        temperature: 0.7,
    });
};

export const translateText = async (
    openAI: OpenAI,
    text: string,
    targetLanguage: string,
    promptTemplate: string
): Promise<TranslateResponse> => {
    try {
        // 创建提示模板
        const prompt = PromptTemplate.fromTemplate(promptTemplate);

        // 创建 LLM 链
        const chain = new LLMChain({
            llm: openAI,
            prompt: prompt,
        });

        // 运行链
        const result = await chain.call({
            SOURCE_TEXT: text,
            TARGET_LANGUAGE: targetLanguage,
        });

        const translatedText = result.text.trim();
        console.log('🔥 🔥 Translated text:', translatedText);
        return { translatedText };
    } catch (error) {
        console.error('Error translating text:', error);
        throw new Error('Translation failed');
    }
};