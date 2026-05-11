import supabase from './supabaseClient'

export async function getApiAuthHeaders() {
  if (typeof supabase.auth?.getSession !== 'function') return {}

  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch(input, init = {}) {
  const authHeaders = await getApiAuthHeaders()

  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...(init.headers || {}),
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('API Error:', errorText)
    throw new Error(errorText || 'Request failed')
  }

  return response
}

export async function apiJson(input, init = {}) {
  return apiFetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
}
