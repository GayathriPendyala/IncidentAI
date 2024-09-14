import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import {
  AuthProvider,
  RequiredAuthProvider,
  RedirectToLogin,
} from "@propelauth/react";
import "./index.css";

const REACT_APP_AUTH_URL = "https://8445988.propelauthtest.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider authUrl={REACT_APP_AUTH_URL}>
      <App />
    </AuthProvider>
    {/* <RequiredAuthProvider
        authUrl={process.env.REACT_APP_AUTH_URL}
        displayWhileLoading={<Loading />}
        displayIfLoggedOut={<RedirectToLogin />}
    >
        <App />
    </RequiredAuthProvider> */}
  </StrictMode>
);
