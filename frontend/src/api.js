// thin fetch wrapper. credentials: 'include' is what carries the session cookie.
// every helper throws an Error with .status + .body for the caller to render.

async function request(path, { method = "GET", body, params } = {}) {
  const url = new URL(path, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, v);
      }
    }
  }
  const init = {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url.pathname + url.search, init);
  let payload = null;
  // bodies are always json, but be defensive about empties (DELETE responses, 204s)
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!res.ok) {
    const err = new Error(
      (payload && payload.error) || `Request failed (${res.status})`
    );
    err.status = res.status;
    err.body = payload;
    throw err;
  }
  return payload;
}

export const api = {
  get: (path, params) => request(path, { params }),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export const auth = {
  me: () => api.get("/api/auth/me"),
  signup: (data) => api.post("/api/auth/signup", data),
  login: (data) => api.post("/api/auth/login", data),
  logout: () => api.post("/api/auth/logout"),
};

export const companies = {
  list: (params) => api.get("/api/companies", params),
  get: (id) => api.get(`/api/companies/${id}`),
  create: (data) => api.post("/api/companies", data),
  update: (id, data) => api.patch(`/api/companies/${id}`, data),
  remove: (id) => api.delete(`/api/companies/${id}`),
};

export const applications = {
  list: (params) => api.get("/api/applications", params),
  get: (id) => api.get(`/api/applications/${id}`),
  create: (data) => api.post("/api/applications", data),
  update: (id, data) => api.patch(`/api/applications/${id}`, data),
  remove: (id) => api.delete(`/api/applications/${id}`),
};

export const interviews = {
  listForApplication: (appId) =>
    api.get(`/api/applications/${appId}/interviews`),
  create: (appId, data) =>
    api.post(`/api/applications/${appId}/interviews`, data),
  update: (id, data) => api.patch(`/api/interviews/${id}`, data),
  remove: (id) => api.delete(`/api/interviews/${id}`),
};

export const contacts = {
  list: (params) => api.get("/api/contacts", params),
  get: (id) => api.get(`/api/contacts/${id}`),
  create: (data) => api.post("/api/contacts", data),
  update: (id, data) => api.patch(`/api/contacts/${id}`, data),
  remove: (id) => api.delete(`/api/contacts/${id}`),
};

export const stats = {
  dashboard: () => api.get("/api/stats"),
};

export const APPLICATION_STATUSES = [
  "Applied",
  "Contacted",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];
