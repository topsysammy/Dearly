"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "@/lib/server/auth";

type Ctx = { user: User; setUser: (u: User) => void };
const UserContext = createContext<Ctx | null>(null);

export function UserProvider({ user: initial, children }: { user: User; children: ReactNode }) {
  const [user, setUser] = useState(initial);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}
