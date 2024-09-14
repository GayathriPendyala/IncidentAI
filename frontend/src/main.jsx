import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Theme } from "@radix-ui/themes";
import { AuthProvider } from "@propelauth/react";
import "@radix-ui/themes/styles.css";
import "./index.css";

const REACT_APP_AUTH_URL = "https://8445988.propelauthtest.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider authUrl={REACT_APP_AUTH_URL}>
      <Theme accentColor="crimson" grayColor="sand" radius="large">
        <App />
      </Theme>
    </AuthProvider>
  </StrictMode>
);
