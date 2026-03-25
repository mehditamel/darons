"use client";

export function CookieResetButton() {
  function handleReset() {
    localStorage.removeItem("cp_cookie_consent");
    window.dispatchEvent(new Event("cookie-consent-reset"));
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      className="hover:text-foreground transition-colors"
    >
      Gerer les cookies
    </button>
  );
}
