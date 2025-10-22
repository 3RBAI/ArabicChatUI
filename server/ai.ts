import OpenAI from 'openai';
import axios from 'axios';

// Reference to javascript_openai blueprint integration
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

let openai: OpenAI | null = null;

function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required. Please set OPENAI_API_KEY environment variable.');
    }
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
  }
  return openai;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function sendToOpenAI(
  messages: ChatMessage[],
  model: string = 'gpt-5'
): Promise<AIResponse> {
  try {
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model,
      messages,
      max_completion_tokens: 8192,
    });

    return {
      content: response.choices[0].message.content || '',
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    throw new Error(`OpenAI Error: ${error.message}`);
  }
}

export async function sendToDeepSeek(
  messages: ChatMessage[],
  model: string = 'deepseek-chat'
): Promise<AIResponse> {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model,
        messages,
        max_tokens: 8192,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      }
    );

    return {
      content: response.data.choices[0].message.content || '',
      model: response.data.model,
      usage: {
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0,
        totalTokens: response.data.usage?.total_tokens || 0,
      },
    };
  } catch (error: any) {
    console.error('DeepSeek API Error:', error);
    throw new Error(`DeepSeek Error: ${error.response?.data?.error?.message || error.message}`);
  }
}

export async function sendMessage(
  messages: ChatMessage[],
  model: string
): Promise<AIResponse> {
  // Determine provider based on model
  if (model.startsWith('gpt-') || model.startsWith('o1-')) {
    return sendToOpenAI(messages, model);
  } else if (model.startsWith('deepseek-')) {
    return sendToDeepSeek(messages, model);
  } else {
    throw new Error(`Unknown model: ${model}`);
  }
}
