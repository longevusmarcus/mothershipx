import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { fetchTikTokDataSchema, validateInput, validationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const APIFY_API_TOKEN = Deno.env.get('APIFY_API_TOKEN');
    
    if (!APIFY_API_TOKEN) {
      throw new Error('APIFY_API_TOKEN not configured');
    }

    const rawBody = await req.json().catch(() => ({}));
    
    // Validate input with Zod
    const validation = validateInput(fetchTikTokDataSchema, rawBody);
    if (!validation.success) {
      return validationErrorResponse(validation, corsHeaders);
    }
    
    const { endpoint } = validation.data!;
    
    let url: string;
    
    switch (endpoint) {
      case 'input':
        // Get run input
        url = `https://api.apify.com/v2/key-value-stores/FbtxkRvH4WOAjhKbS/records/INPUT?token=${APIFY_API_TOKEN}`;
        break;
      case 'dataset':
        // Get dataset items (TikTok data)
        url = `https://api.apify.com/v2/datasets/ZkuHf2i8lHalEdzD8/items?token=${APIFY_API_TOKEN}`;
        break;
      case 'queue':
        // Get request queue head
        url = `https://api.apify.com/v2/request-queues/Vi3xFxKc5o5GeAZ15/head?token=${APIFY_API_TOKEN}`;
        break;
      case 'log':
        // Get run log
        url = `https://api.apify.com/v2/logs/76HEZMzYBDQcAXPUc?token=${APIFY_API_TOKEN}`;
        break;
      case 'run':
        // Get run details
        url = `https://api.apify.com/v2/actor-runs/76HEZMzYBDQcAXPUc?token=${APIFY_API_TOKEN}`;
        break;
      default:
        url = `https://api.apify.com/v2/datasets/ZkuHf2i8lHalEdzD8/items?token=${APIFY_API_TOKEN}`;
    }

    console.log(`Fetching TikTok data from endpoint: ${endpoint}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apify API error:', errorText);
      throw new Error(`Apify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`Successfully fetched ${Array.isArray(data) ? data.length : 1} items from TikTok API`);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching TikTok data:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
