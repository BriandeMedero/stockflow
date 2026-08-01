export function getUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
}

export function isAdmin() {
    const user = getUser();
    return user?.role === "ADMIN";
}