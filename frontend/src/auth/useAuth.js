import { useContext } from "react";
import { AuthContext } from "./context";

// Convenience hook for reading the auth context. Throws if used outside the
// provider so the mistake surfaces immediately instead of as a null deref.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
