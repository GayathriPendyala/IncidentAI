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
      <>
        <header style={{ borderBottom: "2px solid #8E4EC6" }}>
          <nav
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <h1 style={{ fontSize: "2rem" }}>
              incident.<span style={{ color: "#8E4EC6" }}>ai</span>
            </h1>
            <ul className="user-info">
              <Button
                color="indigo"
                variant="soft"
                onClick={() => redirectToLoginPage()}
              >
                Login
              </Button>
            </ul>
          </nav>
        </header>
        <main>
          <IncidentReportForm></IncidentReportForm>
        </main>
      </>
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

  return (
    <section>
      <h2 style={{ color: "#8E4EC6", fontWeight: "700" }}>
        What's your emergency ?
      </h2>
      <div style={{ display: "flex", flexShrink: "0", gap: "5rem" }}>
        <Flex direction="column" gap="3" maxWidth="400px" minWidth="400px">
          {!submitted ? (
            <>
              <label style={{ width: "max-content" }}>
                <span style={{ display: "inline-block" }}>
                  Incident Details:&nbsp;
                </span>
              </label>
              <textarea
                type="text"
                placeholder={
                  "Describe the emergency situation here (e.g., 'Car accident on Main St, 2 vehicles involved, smoke visible')"
                }
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
                onChange={(e) =>
                  incidentDetails.append("image", e.target.files[0])
                }
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

                  fetch(
                    "http://localhost:8067/api/creatingIncident",
                    requestOptions
                  )
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
            </>
          ) : (
            <div
              style={{
                fontSize: "2rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                height: "20rem",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "3rem" }}>✅</span>Thanks for reporting.
              Please be safe. We are working on finding a resolution.
            </div>
          )}
        </Flex>
        <div style={{ color: "#8E4EC6", fontSize: "4rem", fontWeight: "700" }}>
          Incident AI helps report emergencies and manage resources in critical
          situations.
        </div>
      </div>
    </section>
  );
}

export default App;
