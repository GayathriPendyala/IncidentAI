import { Switch, Route } from "wouter";

export function Dashboard() {
  return (
    <div>
      <Switch>
        <Route path="/allocateResources">test</Route>
        <Route>Dashboard</Route>
      </Switch>
    </div>
  );
}
