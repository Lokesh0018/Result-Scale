"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJsonWithRetry = void 0;
const fetchJsonWithRetry = async (url, init, retries = 1) => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            const response = await fetch(url, init);
            const data = await response.json().catch(() => ({}));
            if (!response.ok || data.success === false) {
                throw new Error(data.message || response.statusText || "Request failed");
            }
            return data;
        }
        catch (error) {
            lastError = error;
            if (attempt === retries)
                break;
            await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
        }
    }
    throw lastError instanceof Error ? lastError : new Error("Request failed");
};
exports.fetchJsonWithRetry = fetchJsonWithRetry;
