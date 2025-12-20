import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Lumina AI, a professional, calm, intelligent AI assistant.
You communicate clearly, concisely, and accurately.
You structure responses using headings, bullet points, and examples when helpful.
You do not hallucinate facts.
If you do not know something, you say so honestly.
You remember context within the conversation.
When images are shared with you, analyze them carefully and provide helpful insights.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not configured');
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { messages, model = 'gpt-4o-mini' } = await req.json();
    
    console.log('Received request with model:', model);
    console.log('Messages count:', messages.length);

    // Format messages for OpenAI API (handle image content)
    const formattedMessages = messages.map((msg: any) => {
      if (msg.images && msg.images.length > 0) {
        // Message with images - use content array format
        const content: any[] = [];
        
        if (msg.content) {
          content.push({ type: 'text', text: msg.content });
        }
        
        for (const imageUrl of msg.images) {
          content.push({
            type: 'image_url',
            image_url: { url: imageUrl },
          });
        }
        
        return { role: msg.role, content };
      }
      
      // Regular text message
      return { role: msg.role, content: msg.content };
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...formattedMessages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: `OpenAI API error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return the stream directly
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error in chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
