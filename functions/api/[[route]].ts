import {
  PluginErrorType,
  createErrorResponse,
  getPluginSettingsFromRequest
} from '@lobehub/chat-plugin-sdk';

import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages';

const app = new Hono();

app.post('/api/v1', async (c) => {
  const headers: HeadersInit = {}

  const settings = getPluginSettingsFromRequest(c.req.raw)
  const apiKey = settings?.JINA_API_KEY;
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  const { url } = await c.req.json();
  const response = await fetch(`https://r.jina.ai/${url}`, {
    method: 'GET',
    headers
  })

  if (!response.ok) {
    if (response.status === 429 && !apiKey) {
      return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
        message: 'Rate limit exceeded. Please provide your API key.'
      });
    } else {
      return createErrorResponse(PluginErrorType.PluginServerError, {
        message: `Failed to fetch data from Jina AI: ${response.statusText}`
      });
    }
  }

  const text = await response.text();
  return c.text(text)
});

export const onRequest = handle(app);