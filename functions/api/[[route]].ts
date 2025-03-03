import {
  PluginErrorType,
  createErrorResponse,
  getPluginSettingsFromRequest
} from '@lobehub/chat-plugin-sdk';

import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages';

const app = new Hono();

app.post('/api/v1', async (c) => {
  const settings = getPluginSettingsFromRequest(c.req.raw)
  if (!settings) {
    return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
      message: 'Invalid plugin settings'
    });
  }

  const apiKey = settings?.JINA_API_KEY;
  const { url } = await c.req.json();

  const response = await fetch(`https://r.jina.ai/${url}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    }
  });

  const json: any = await response.json();
  return c.json(json);
});

app.post('/api/v2/multiWebReader', async (c) => {
  const settings = getPluginSettingsFromRequest(c.req.raw)
  if (!settings) {
    return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
      message: 'Invalid plugin settings'
    });
  }

  const apiKey = settings?.JINA_API_KEY;
  const { urls } = await c.req.json();

  const result = await Promise.all(urls.map(async (url: string) => {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      }
    });

    const json: any = await response.json();
    return json;
  }));

  return c.json(result);
});

export const onRequest = handle(app);