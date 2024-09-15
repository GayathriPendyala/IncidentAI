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
} from "@radix-ui/themes";

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
      setIncidents(data);
      setIncidentsLoading(false);
    });
  }, []);

  const response = [];

  if (!isResourcesLoading) {
    const resourceElements = [];

    Object.entries(resources).forEach((resourceCount) => {
      resourceElements.push(
        <Flex gap="3" justify="center">
          <Box width="350px">
            <Card size="1">
              <Flex gap="3" align="center">
                <Avatar
                  size="3"
                  radius="full"
                  fallback={RESOURCE_MAPPING[resourceCount[0]]?.["avatar"]}
                  color="indigo"
                />
                <Box>
                  <Text as="div" size="2" weight="bold">
                    {RESOURCE_MAPPING[resourceCount[0]]?.["name"] ?? "General"}
                  </Text>
                  <Text as="div" size="2" color="gray">
                    {resourceCount[1]}
                  </Text>
                </Box>
              </Flex>
            </Card>
          </Box>
        </Flex>
      );
    });

    response.push(
      <Box maxWidth="100%">
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
          <Heading as="h1" weight="bold" style={{ margin: "2rem" }}>
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
  console.log(data);
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
      <Heading
        as="h5"
        size="4"
        style={{ marginTop: "2rem", marginBottom: "0.75rem" }}
      >
        AI Dispatch recommendation
      </Heading>
      <Text>{data?.aiResult ?? "Recommendation not available"}</Text>
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
