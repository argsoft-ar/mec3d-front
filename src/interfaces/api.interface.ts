export interface ApiError {
  message: string;
  status: number;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

export interface HealthResponse {
  status: string;
  message: string;
}
