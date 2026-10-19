"use client";

import { useState, useEffect } from "react";

type ConsentState = "pending" | "given" | "denied";

function getInitialConsent(): ConsentState {
  // Check server-side cookie from middleware
  if (typeof window === "undefined") return "pending";

  const given = document.cookie.includes("cookie_consent_given=true");
  const denied = document.cookie.includes("cookie_consent_denied=true");

  if (denied) return "denied";
  if (given) return "given";
  return "pending";
}

export function CookieConsentBanner() {
  const [state, setState] = useState<ConsentState>(getInitialConsent);

  // Sync with server-side state on mount
  useEffect(() => {
    const checkConsent = (): ConsentState => {
      console.log({
        cookieVal:
          document.cookie.includes("cookie_consent_given=true") ||
          document.cookie.includes("cookie_consent_denied=true"),
      });
      if (
        !document.cookie.includes("cookie_consent_given=true") &&
        !document.cookie.includes("cookie_consent_denied=true")
      ) {
        return "pending";
      }
      if (document.cookie.includes("cookie_consent_denied=true")) return "denied";
      if (document.cookie.includes("cookie_consent_given=true")) return "given";
      return "pending";
    };

    const newState = checkConsent();
    if (newState !== state) setState(newState);
  }, []);

  if (state === "given") return null;
  if (state === "denied") return null;

  return (
    <div className="bg-background/95 border-border fixed right-0 bottom-0 left-0 z-50 border-y backdrop-blur-sm">
      <div className="text-foreground mx-auto max-w-7xl px-6 py-4 text-center text-sm font-medium">
        <span className="font-medium">
          Havenly uses anonymous visitor tracking cookies to understand how visitors interact with
          our site.
        </span>
      </div>
      <div className="mx-auto flex max-w-7xl justify-center gap-3 px-6 py-3">
        <button
          onClick={() => {
            document.cookie = "cookie_consent_given=true; path=/; max-age=31536000; SameSite=Lax";
            setState("given");
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-[12px] px-6 py-2 font-medium transition-colors"
        >
          Accept
        </button>
        <button
          onClick={() => {
            document.cookie = "cookie_consent_denied=true; path=/; max-age=31536000; SameSite=Lax";
            setState("denied");
          }}
          className="bg-muted text-muted-foreground hover:bg-muted/90 rounded-[12px] px-6 py-2 font-medium transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
