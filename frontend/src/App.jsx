import { useLocation } from "wouter";
import { Dashboard } from "./Dashboard";
import {
  withAuthInfo,
  useRedirectFunctions,
  useLogoutFunction,
} from "@propelauth/react";
import "./App.css";

const App = withAuthInfo((props) => {
  const logoutFunction = useLogoutFunction();
  const { redirectToLoginPage, redirectToSignupPage, redirectToAccountPage } =
    useRedirectFunctions();

  if (props.isLoggedIn) {
    const [location, navigate] = useLocation();

    return (
      <>
        <header>
          <nav>
            <ul className="user-info">
              <li>Welcome {props.user.email}</li>
              <li>
                <button onClick={() => logoutFunction(true)}>Logout</button>
              </li>
            </ul>
          </nav>
        </header>
        <main>
          <Dashboard />
        </main>
      </>
    );
  } else {
    return (
      <div>
        <p>You are not logged in</p>
        <button onClick={() => redirectToLoginPage()}>Login</button>
        <button onClick={() => redirectToSignupPage()}>Signup</button>
      </div>
    );
  }
});

export default App;
