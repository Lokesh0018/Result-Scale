/**
 * Central API utility.
 * 
 * Uses a single API URL (VITE_RENDER_API_URL) for all requests.
 * The old dual-server load balancing via convertLastChar was buggy:
 * it could route the OTP send to server A and OTP verify to server B
 * (different process memory), causing "Invalid OTP" errors.
 * 
 * If horizontal scaling is needed, use a sticky session load balancer
 * or move OTP state to Redis/DB (OTP is already persisted in MongoDB,
 * so actually both servers would work — but the inconsistency was confusing).
 */

const BASE_URL = (import.meta as any).env.VITE_RENDER_API_URL as string;

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    auth?: boolean; // attach Authorization header from localStorage
};

export async function apiFetch<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, auth = false } = options;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (auth) {
        const token = localStorage.getItem("authToken");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data as T;
}
