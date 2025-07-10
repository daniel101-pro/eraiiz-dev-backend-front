import OpenAI from 'openai';

const systemPrompt = `You are an AI shopping assistant focused exclusively on sustainability and eco-friendly products. Your role is to:

1. Help users find sustainable and eco-friendly products
2. Educate users about environmental impact of products
3. Provide information about recycling and sustainable practices
4. Recommend alternatives to non-sustainable products
5. Explain sustainability certifications and ratings

Key behaviors:
- Only answer questions related to sustainability, environmental impact, and eco-friendly products
- If a question is not related to sustainability, politely redirect the conversation to environmental topics
- Use factual, scientific information when discussing environmental impact
- Be encouraging and positive about sustainable choices
- Highlight products' sustainability features (recyclable, eco-friendly, carbon footprint)

Format responses to be concise and informative, always relating back to environmental impact.`;

async function makeOpenAIRequest(message: string, apiKey: string) {
  console.log('[DEBUG] Starting OpenAI request...');
  
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log('[DEBUG] Initialized OpenAI client');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('[DEBUG] Received OpenAI response');
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('[DEBUG] OpenAI request failed:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  console.log('[DEBUG] Received request to /api/ai/chat');
  
  try {
    // Verify API key
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('[DEBUG] API key present:', !!apiKey);
    console.log('[DEBUG] API key length:', apiKey?.length || 0);
    console.log('[DEBUG] API key prefix:', apiKey?.substring(0, 7));
    
    if (!apiKey) {
      console.error('[DEBUG] OpenAI API key is missing');
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key not configured',
          details: 'Please configure a valid OpenAI API key in your environment variables. Visit https://platform.openai.com/api-keys to get one.'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Parse request body
    let body;
    try {
      const rawBody = await req.text();
      console.log('[DEBUG] Raw request body:', rawBody);
      
      body = JSON.parse(rawBody);
      console.log('[DEBUG] Parsed request body:', body);
    } catch (parseError) {
      console.error('[DEBUG] Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({
          error: 'Invalid request format',
          details: 'Failed to parse request body'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const { message } = body;
    console.log('[DEBUG] Extracted message:', message);

    if (!message) {
      console.error('[DEBUG] Message is missing from request');
      return new Response(
        JSON.stringify({
          error: 'Message is required',
          details: 'Message field is missing or empty'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Handle initial message
    if (message === '__INIT__') {
      console.log('[DEBUG] Handling initial message');
      const response = {
        message: "Hello! 👋 I'm your sustainable shopping assistant. I'm here to help you find eco-friendly products and answer questions about sustainability. I can help you:\n\n" +
                "🌱 Find sustainable products\n" +
                "♻️ Learn about product recycling\n" +
                "🌍 Understand environmental impact\n" +
                "💚 Make eco-friendly choices\n\n" +
                "How can I help you make more sustainable choices today?"
      };
      console.log('[DEBUG] Sending initial response:', response);
      return new Response(
        JSON.stringify(response),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    try {
      console.log('[DEBUG] Making OpenAI API request for message:', message);
      const aiMessage = await makeOpenAIRequest(message, apiKey);
      console.log('[DEBUG] Received AI message:', aiMessage);

      if (!aiMessage) {
        console.error('[DEBUG] AI message is null or undefined');
        return new Response(
          JSON.stringify({
            error: 'No response from AI',
            details: 'The AI service returned an empty response'
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }

      const response = { message: aiMessage };
      console.log('[DEBUG] Sending successful response:', response);
      return new Response(
        JSON.stringify(response),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    } catch (error: unknown) {
      console.error('[DEBUG] OpenAI API error:', error);
      
      // Check for specific OpenAI error types
      if (error instanceof Error) {
        console.error('[DEBUG] Error message:', error.message);
        console.error('[DEBUG] Error stack:', error.stack);
        
        if (error.message.includes('API key')) {
          return new Response(
            JSON.stringify({
              error: 'Invalid OpenAI API key',
              details: 'Please check your OpenAI API key configuration. Visit https://platform.openai.com/api-keys to get a valid key.'
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
        }
        
        if (error.message.includes('Rate limit')) {
          return new Response(
            JSON.stringify({
              error: 'Rate limit exceeded',
              details: 'The OpenAI API rate limit has been exceeded. Please try again in a moment.'
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
        }
      }

      return new Response(
        JSON.stringify({
          error: 'Failed to get AI response',
          details: error instanceof Error ? error.message : 'Unknown OpenAI API error'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  } catch (error: unknown) {
    console.error('[DEBUG] General error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 