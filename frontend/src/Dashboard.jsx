import { Switch, Route } from "wouter";
import { useAuthInfo } from "@propelauth/react";
import { RESOURCE_MAPPING } from "./resourceMapping";
import { useState, useEffect } from "react";
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
  Separator,
} from "@radix-ui/themes";
import ReactHtmlParser from "react-html-parser";

export function Dashboard() {
  return (
    <div>
      <Switch>
        <Route path="/allocateResources">test</Route>
        <Route>
          <DashboardHome />
        </Route>
      </Switch>
    </div>
  );
}

function DashboardHome() {
  const [isResourcesLoading, setResourcesLoading] = useState(true);
  const [isIncidentsLoading, setIncidentsLoading] = useState(true);
  const authInfo = useAuthInfo();

  const [resources, setResources] = useState([]);
  const [incidents, setIncidents] = useState([]);

  const allocateResource = async (resourcesToAllocate, zipcode, incId) => {
    const response = await fetch("http://localhost:8067/api/assignResources", {
      method: "POST",
      body: JSON.stringify({
        resources: resourcesToAllocate,
        zipcode: zipcode,
        incidentID: incId,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${authInfo.accessToken}`,
      },
    });

    window.location.reload();
  };

  useEffect(() => {
    fetch("http://localhost:8067/api/getResources/24060", {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${authInfo.accessToken}`,
      },
    }).then(async (response) => {
      const data = await response.json();
      setResources(data);
      setResourcesLoading(false);
    });

    fetch("http://localhost:8067/api/listIncidents", {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${authInfo.accessToken}`,
      },
    }).then(async (response) => {
      const data = await response.json();
      console.log(data);
      setIncidents(data.reverse());
      setIncidentsLoading(false);
    });
  }, []);

  const response = [];

  if (!isResourcesLoading) {
    const resourceElements = [];

    Object.keys(RESOURCE_MAPPING).forEach((resourceId) => {
      let resourceCount = 0;
      if (resourceId in resources) resourceCount = resources[resourceId];

      let backgroundColor = "#EC5D5E";
      if (resourceCount < 5 && resourceCount > 0) backgroundColor = "#FFFF57";
      if (resourceCount >= 5) backgroundColor = "#71D083";

      resourceElements.push(
        <Flex gap="3" justify="center">
          <Box width="350px">
            <Card size="1" style={{ backgroundColor: backgroundColor }}>
              <Flex gap="3" align="center">
                <Avatar
                  size="4"
                  radius="full"
                  fallback={RESOURCE_MAPPING[resourceId]?.["avatar"]}
                  color="indigo"
                />
                <Box>
                  <Text as="div" size="2" weight="bold">
                    {RESOURCE_MAPPING[resourceId]?.["name"] ?? "General"}
                  </Text>
                  <Text as="div" size="2" color="gray">
                    {resourceCount}
                  </Text>
                </Box>
              </Flex>
            </Card>
          </Box>
        </Flex>
      );
    });

    response.push(
      <Box maxWidth="100%" style={{ marginTop: "3rem" }}>
        <Card>
          <Text as="div" size="7" weight="bold" style={{ margin: "2rem" }}>
            Resources available for you at Blacksburg
          </Text>
          <Grid
            columns="3"
            gap="3"
            justify="center"
            style={{ marginTop: "2rem", marginBottom: "2rem" }}
          >
            {...resourceElements}
          </Grid>
        </Card>
      </Box>
    );
  }

  if (!isResourcesLoading && !isIncidentsLoading) {
    const incidentElements = [];
    incidents.forEach((incident) => {
      const incidentElement = (
        <GetIncElement
          data={incident}
          resources={resources}
          allocateResource={allocateResource}
        ></GetIncElement>
      );
      incidentElements.push(incidentElement);
    });

    response.push(
      <Box maxWidth="100%" style={{ marginTop: "5rem" }}>
        <Card>
          <Heading size="7" weight="bold" style={{ margin: "2rem" }}>
            Ongoing Incidents
          </Heading>
          <Flex direction="column" style={{ margin: "2rem" }}>
            {...incidentElements}
          </Flex>
        </Card>
      </Box>
    );
  }

  return <div>{...response}</div>;
}

function GetIncElement({ data, resources, allocateResource }) {
  const eventTime = new Date(data.datetime).toString();
  const [allocateResources, setAllocateResource] = useState(false);

  let aiResult = "Recommendation not available";
  if ("aiResult" in data) {
    aiResult = data?.aiResult.replace(/\*{2}(.*?)\*{2}/g, "<b>$1</b>");
    aiResult = <div>{ReactHtmlParser(aiResult)}</div>;
  }

  let imagePath = null;
  if (data.imagePath !== null) {
    let slash = "/";

    if (data.imagePath.indexOf("/") == -1) {
      slash = "\\";
    }

    imagePath = data.imagePath.split(slash + "uploads")[1];
    imagePath = imagePath.replaceAll("\\", "");
    imagePath = imagePath.replaceAll("/", "");

    imagePath = "/uploads/" + imagePath;

    console.log(imagePath);
  }

  return (
    <div style={{ marginBottom: "3rem" }}>
      <Heading as="h2" weight="bold">
        Incident at {data.streetAddress}
      </Heading>
      <Text
        as="div"
        size="1"
        style={{ marginTop: "0.5rem", marginBottom: "2rem" }}
      >
        {eventTime}
      </Text>
      <Text>{data.incidentText}</Text>
      <div>
        {imagePath !== null && (
          <img
            style={{ margin: "1rem 0", height: "20rem" }}
            src={"http://localhost:8067" + imagePath}
          />
        )}
      </div>

      <Heading
        as="h5"
        size="4"
        style={{ marginTop: "2rem", marginBottom: "0.75rem" }}
      >
        AI Dispatch recommendation
      </Heading>
      <Text
        as="div"
        style={{
          backgroundColor: "#ECD9FA",
          padding: "1rem",
          borderRadius: "0.5rem",
        }}
      >
        {aiResult}
      </Text>
      <Heading
        as="h5"
        size="4"
        style={{ marginTop: "2rem", marginBottom: "0.75rem" }}
      >
        Reporter details
      </Heading>
      <Text as="div">
        <Text weight="bold">Name:&nbsp;</Text>
        {data.name ? data.name : "Not Available"}
      </Text>
      <Text as="div" style={{ marginBottom: "1rem" }}>
        <Text weight="bold">Phone:&nbsp;</Text>
        {data.phoneNumber ? data.phoneNumber : "Not Available"}
      </Text>

      {data?.allocated ? (
        <Button color="cyan" variant="soft">
          Allocated
        </Button>
      ) : (
        <Button
          color="crimson"
          variant="soft"
          onClick={() => setAllocateResource(true)}
        >
          Allocate Resource Now
        </Button>
      )}

      {allocateResources && (
        <DisplayResourceAllocateForm
          resources={resources}
          allocateResource={allocateResource}
          incId={data["_id"]}
        ></DisplayResourceAllocateForm>
      )}
      <Separator style={{ marginTop: "3rem" }} size="4" />
    </div>
  );
}

function DisplayResourceAllocateForm({ resources, allocateResource, incId }) {
  console.log(resources);

  const allocate = {};
  const formElements = Object.keys(RESOURCE_MAPPING).map((resourceId) => {
    return (
      <>
        <label style={{ width: "max-content" }}>
          <span style={{ minWidth: "17rem", display: "inline-block" }}>
            {RESOURCE_MAPPING[resourceId]["name"]}:&nbsp;
          </span>
          <input
            type="number"
            radius="none"
            placeholder={RESOURCE_MAPPING[resourceId]["name"]}
            disabled={resources[resourceId] === 0}
            onChange={(e) => (allocate[resourceId] = e.target.value)}
            style={{
              display: "inline-block",
              padding: "0.5rem",
              width: "15rem",
            }}
          />
          &nbsp;&nbsp;/&nbsp;&nbsp;
          <Badge color="indigo" style={{ fontSize: "1rem" }}>
            {resources[resourceId] ?? 0}
          </Badge>
        </label>
      </>
    );
  });

  return (
    <Flex
      direction="column"
      gap="3"
      maxWidth="250px"
      style={{ margin: "1rem" }}
    >
      {...formElements}
      <Button
        color="indigo"
        variant="soft"
        onClick={() => allocateResource(allocate, "24060", incId)}
      >
        Allocate
      </Button>
    </Flex>
  );
}
