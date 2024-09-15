import { Dashboard } from "./Dashboard";
import {
  withAuthInfo,
  useRedirectFunctions,
  useLogoutFunction,
} from "@propelauth/react";
import { useState } from "react";
import {
  Flex,
  Box,
  Card,
  Avatar,
  Text,
  Grid,
  Heading,
  Button,
  Badge,
} from "@radix-ui/themes";
import "./App.css";

const App = withAuthInfo((props) => {
  const logoutFunction = useLogoutFunction();
  const { redirectToLoginPage, redirectToSignupPage } = useRedirectFunctions();

  if (props.isLoggedIn) {
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
        <div>
          <p>You are not logged in</p>
          <button onClick={() => redirectToLoginPage()}>Login</button>
          <button onClick={() => redirectToSignupPage()}>Signup</button>
        </div>
        <div>
          <IncidentReportForm></IncidentReportForm>
        </div>
      </div>
    );
  }
});

function IncidentReportForm() {
  const [submitted, setSubmitted] = useState(false);
  const incidentDetails = new FormData();
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  function success(pos) {
    console.log("got location info");
    const crd = pos.coords;
    incidentDetails.delete("lat");
    incidentDetails.delete("lng");

    incidentDetails.append("lat", crd.latitude);
    incidentDetails.append("lng", crd.longitude);

    console.log(crd.latitude);
    console.log(crd.longitude);
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
  navigator.permissions
    .query({
      name: "geolocation",
    })
    .then((permission) => {
      // is geolocation granted?
      permission.state === "granted"
        ? navigator.geolocation.getCurrentPosition((pos) => success(pos))
        : resolve(null);
    });

  if (submitted) {
    return <Flex>Thanks for reporting.</Flex>;
  }
  return (
    <Flex
      direction="column"
      gap="3"
      maxWidth="250px"
      style={{ margin: "1rem" }}
    >
      <label style={{ width: "max-content" }}>
        <span style={{ display: "inline-block" }}>Incident Details:&nbsp;</span>
      </label>
      <textarea
        type="text"
        placeholder={"Describe the incident as much as you can"}
        onChange={(e) => {
          incidentDetails.delete("incidentText");
          incidentDetails.append("incidentText", e.target.value);
        }}
        columns={30}
        rows={10}
      ></textarea>
      <label style={{ width: "max-content" }}>
        <span style={{ display: "inline-block" }}>Name:&nbsp;</span>
      </label>
      <input
        type="text"
        onChange={(e) => {
          incidentDetails.delete("name");
          incidentDetails.append("name", e.target.value);
        }}
      />
      <label style={{ width: "max-content" }}>
        <span style={{ display: "inline-block" }}>Phone:&nbsp;</span>
      </label>
      <input
        type="number"
        onChange={(e) => {
          incidentDetails.delete("phoneNumber");
          incidentDetails.append("phoneNumber", e.target.value);
        }}
      />
      <label style={{ width: "max-content" }}>
        <span style={{ display: "inline-block" }}>Image:&nbsp;</span>
      </label>
      <input
        type="file"
        id="input"
        onChange={(e) => incidentDetails.append("image", e.target.files[0])}
      />

      <Button
        color="indigo"
        variant="soft"
        onClick={() => {
          console.log(incidentDetails);
          const requestOptions = {
            method: "POST",
            body: incidentDetails,
            redirect: "follow",
          };

          fetch("http://localhost:8067/api/creatingIncident", requestOptions)
            .then((response) => {
              response.text();
              setSubmitted(true);
            })
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
        }}
      >
        Submit
      </Button>
    </Flex>
  );
}

export default App;
