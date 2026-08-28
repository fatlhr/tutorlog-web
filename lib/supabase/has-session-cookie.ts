import { useSyncExternalStore } from "react";

const AUTH_COOKIE = /^sb-.+-auth-token(\.\d+)?=/;

function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  return document.cookie.split("; ").some((entry) => AUTH_COOKIE.test(entry));
}

function getServerSnapshot(): boolean {
  return false;
}

export function useHasSupabaseSession(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
