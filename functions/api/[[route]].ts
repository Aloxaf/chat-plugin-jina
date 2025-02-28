import {
  PluginErrorType,
  createErrorResponse,
  getPluginSettingsFromRequest
} from '@lobehub/chat-plugin-sdk';

import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages';

const app = new Hono();

app.get('/api/v1', async (c) => {
  const settings = getPluginSettingsFromRequest(c.req.raw)
  const apiKey = settings?.apikey;
  if (!apiKey) {
    return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
      message: 'API key is required'
    });
  }

  const url = c.req.json();
  const response = await fetch(`https://r.jina.ai/${url}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })
  const text = await response.text();

  return c.text(text)
});

export const onRequest = handle(app);