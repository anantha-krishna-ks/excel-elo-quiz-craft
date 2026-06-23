import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const BASE_URLS: Record<string, string> = {
  'check-user': 'https://ai.excelsoftcorp.com/aiapps/AIToolKit/UnitPlanGen/check-user',
  'get_classes': 'https://ai.excelsoftcorp.com/aiapps/EXAMPREP/get_classes',
  'get_subject': 'https://ai.excelsoftcorp.com/aiapps/EXAMPREP/get_subject',
  'get_chapters': 'https://ai.excelsoftcorp.com/aiapps/EXAMPREP/get_chapters',
  'get-elo-details': 'https://ai.excelsoftcorp.com/aiapps/EXAMPREP/get-elo-details',
  'generate-questions': 'https://ai.excelsoftcorp.com/ExcelAIQuizGen/generate-questions',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { endpoint, method = 'GET', payload, query } = await req.json();

    const base = BASE_URLS[endpoint];
    if (!base) {
      return new Response(JSON.stringify({ error: `Unknown endpoint: ${endpoint}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let url = base;
    if (query && typeof query === 'object') {
      const params = new URLSearchParams(query as Record<string, string>);
      url += `?${params.toString()}`;
    }

    const init: RequestInit = { method };
    if (payload !== undefined) {
      init.headers = { 'Content-Type': 'application/json' };
      init.body = JSON.stringify(payload);
    }

    const upstream = await fetch(url, init);
    const text = await upstream.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('excelsoft-proxy error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});