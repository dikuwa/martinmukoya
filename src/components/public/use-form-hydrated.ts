"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useFormHydrated() {
  // Keep native submit disabled until React can intercept it.
  return useSyncExternalStore(subscribe, () => true, () => false);
}
