const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ApiError {
  message: string;
  status: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = {
      message: `HTTP error ${response.status}`,
      status: response.status,
    };
    throw error;
  }

  return response.json() as Promise<T>;
}

export const authService = {
  login: (email: string, password: string) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  logout: () => {
    localStorage.removeItem("auth_token");
  },
};

export const productService = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return request<unknown[]>(`/products${query}`);
  },

  getById: (id: string) => request<unknown>(`/products/${id}`),
};
