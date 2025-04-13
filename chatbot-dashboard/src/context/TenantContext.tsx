"use client";

import { createContext, useContext } from "react";

export const TenantContext = createContext<any>(null);

export function useTenant() {
  return useContext(TenantContext);
}
