import { config } from "../../config";
import type { ApiResponse } from "../types";

const API_BASE_URL = config.BACKEND_URL;

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn(
      `[API Client] Go Backend API unreachable at ${API_BASE_URL}${endpoint}. Please ensure backend is running using 'go run main.go'.`,
    );
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Backend API server offline at ${API_BASE_URL}. Start Go backend with 'go run main.go'.`,
      },
    };
  }
}
