import axios from 'axios';

const OPENAI_API = 'https://api.openai.com/v1/chat/completions';

export class OpenAIAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateIssueTitle(context: {
    url: string;
    errorMessage?: string;
    networkRequests?: string[];
  }): Promise<string> {
    const prompt = `Generate a concise, clear GitHub issue title based on this context:
    
URL: ${context.url}
${context.errorMessage ? `Error: ${context.errorMessage}` : ''}
${context.networkRequests?.length ? `Failed requests: ${context.networkRequests.join(', ')}` : ''}

Rules:
- Maximum 80 characters
- Start with a prefix like "Bug:", "Error:", or "Issue:"
- Be specific and actionable
- Include the main error or problem

Return ONLY the title, nothing else.`;

    try {
      const response = await axios.post(
        OPENAI_API,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that generates clear, concise GitHub issue titles.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 50,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate title with AI');
    }
  }
}

