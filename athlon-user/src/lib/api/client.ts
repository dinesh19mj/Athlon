export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const fetchClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
  const url = `${baseUrl}${endpoint}`;

  // Here you can inject tokens from localStorage/sessionStorage if available
  // e.g. const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      const textData = await response.text();
      try {
        errorData = textData ? JSON.parse(textData) : null;
      } catch (e) {
        errorData = textData;
      }
      throw new ApiError(response.status, response.statusText, errorData);
    }

    // Some APIs might return empty responses for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or other fetch errors
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    fetchClient<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data: any, options?: RequestInit) => 
    fetchClient<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    
  put: <T>(endpoint: string, data: any, options?: RequestInit) => 
    fetchClient<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
    
  patch: <T>(endpoint: string, data: any, options?: RequestInit) => 
    fetchClient<T>(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
    
  delete: <T>(endpoint: string, options?: RequestInit) => 
    fetchClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
