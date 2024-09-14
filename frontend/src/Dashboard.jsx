import { Switch, Route } from "wouter";
import { useAuthInfo } from "@propelauth/react";
import { RESOURCE_MAPPING } from "./resourceMapping";
import { useState, useEffect } from "react";
import { Flex, Box, Card, Avatar, Text, Grid } from "@radix-ui/themes";
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

  useEffect(() => {
    fetch("http://localhost:8067/api/getResources/24060", {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${authInfo.accessToken}`,
      },
    }).then(async (response) => {
      const data = await response.json();
      console.log(data);
      setResources(data);
      setResourcesLoading(false);
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
        <Card asChild>
          <a href="#">
            <Text as="div" size="7" weight="bold">
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
          </a>
        </Card>
      </Box>
    );
  }

  return <div>{...response}</div>;
}
