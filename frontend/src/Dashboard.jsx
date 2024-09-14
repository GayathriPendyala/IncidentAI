import { Switch, Route } from "wouter";
import { useAuthInfo } from "@propelauth/react";
export function Dashboard() {
  const info = useAuthInfo();
  console.log(info);
  return (
    <div>
      <Switch>
        <Route path="/allocateResources">test</Route>
        <Route>Dashboard</Route>
      </Switch>
    </div>
  );
}
