import { createContext } from "react";

// The auth context object lives in its own module so both the provider
// (AuthContext.jsx) and the useAuth hook can import it. Keeping it out of the
// .jsx file lets that file export only components, which is what react-refresh
// (Vite's Fast Refresh) wants for reliable hot reloading.
export const AuthContext = createContext(null);
