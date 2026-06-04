export function logout(redirectTo = "/"): void {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("clientId");
    window.location.href = redirectTo;
}
