const APP_ID = '69434f0485c24a1edd4db09b';
const DEFAULT_API_KEY = '9b955c20a06e491595c3604a1a0e5b4f';

function getApiKey() {
  if (typeof window !== 'undefined' && window.__BASE44_API_KEY__) return window.__BASE44_API_KEY__;
  return DEFAULT_API_KEY;
}

async function request(path, options = {}) {
  const apiKey = getApiKey();
  const url = `https://app.base44.com/api/apps/${APP_ID}${path}`;
  const headers = Object.assign({ 'api_key': apiKey, 'Content-Type': 'application/json' }, options.headers || {});
  const init = Object.assign({}, options, { headers });

  const res = await fetch(url, init);
  if (!res.ok) {
    let text;
    try {
      text = await res.text();
    } catch (e) {
      text = `<failed to read body: ${e.message}>`;
    }
    let parsed;
    try { parsed = JSON.parse(text); } catch (_) { parsed = null; }
    const message = parsed && parsed.message ? parsed.message : text || res.statusText;
    const err = new Error(`Request failed ${res.status}: ${message}`);
    err.status = res.status;
    err.body = parsed || text;
    console.error('Base44 request error', { url, status: res.status, body: err.body });
    throw err;
  }
  return res.json();
}

// Convenience functions matching your examples
export async function fetchCodeSnippetEntities() {
  return request('/entities/CodeSnippet', { method: 'GET' });
}

export async function updateCodeSnippetEntity(entityId, updateData) {
  return request(`/entities/CodeSnippet/${entityId}`, { method: 'PUT', body: JSON.stringify(updateData) });
}

export const base44 = {
  auth: {
    me: async () => {
      try {
        return await request('/auth/me', { method: 'GET' });
      } catch (e) {
        if (e.status === 404) return null; // some apps don't expose auth/me
        console.warn('base44.auth.me failed', e);
        return null;
      }
    },
    logout: () => {
      console.log('Logout clicked');
    },
    redirectToLogin: () => {
      console.log('Login clicked');
    }
  },
  entities: {
    CodeSnippet: {
      create: async (data) => {
        try {
          return await request('/entities/CodeSnippet', { method: 'POST', body: JSON.stringify(data) });
        } catch (e) {
          console.warn('create CodeSnippet failed', e);
          return { error: e.message };
        }
      },
      list: async (queryString = '') => {
        try {
          const path = `/entities/CodeSnippet${queryString ? `?${queryString}` : ''}`;
          return await request(path, { method: 'GET' });
        } catch (e) {
          console.warn('list CodeSnippet failed', e);
          return [];
        }
      },
      update: async (id, updateData) => {
        try {
          return await request(`/entities/CodeSnippet/${id}`, { method: 'PUT', body: JSON.stringify(updateData) });
        } catch (e) {
          console.warn('update CodeSnippet failed', e);
          return { error: e.message };
        }
      }
    }
  },
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt, add_context_from_internet }) => {
        const body = { prompt, add_context_from_internet };
        try {
          return await request('/integrations/Core/InvokeLLM', { method: 'POST', body: JSON.stringify(body) });
        } catch (e) {
          // If server rejects POST (405), try GET as a fallback (some deployments expose GET)
          if (e.status === 405) {
            try {
              const qs = `?prompt=${encodeURIComponent(prompt || '')}&add_context_from_internet=${add_context_from_internet ? '1' : '0'}`;
              return await request(`/integrations/Core/InvokeLLM${qs}`, { method: 'GET' });
            } catch (e2) {
              console.error('InvokeLLM GET fallback failed', e2);
            }
          }
          console.warn('InvokeLLM failed, falling back to simulation', e);
          return 'Code execution simulation - Replace with actual Base44 API';
        }
      }
    }
  }
};
