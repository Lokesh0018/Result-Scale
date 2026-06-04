/**
 * Auth guard utilities for protecting routes.
 */

export function isLoggedIn(role: "admin" | "client"): boolean {
    const userRole = localStorage.getItem("userRole");
    const token = localStorage.getItem("authToken");
    return !!token && userRole === role;
}

export function logout(redirectTo = "/"): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("clientId");
    window.location.href = redirectTo;
}
