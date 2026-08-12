// Frontend Application Configuration
// Simply edit BACKEND_URL below to configure your Go backend service endpoint.
export const config = {
  BACKEND_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
};
