// Import dependencies
import React from "react";

// Reach Router imports
import { Router, Link } from "@reach/router";

// Import route components
import DashRouter from "./routes/DashRouter";
import PrivateRoute from "./routes/PrivateRoute";

// Import page components
import EventsCalendar from "./pages/EventsCalendar";
import UserProfile from "./pages/UserProfile";
import MyEvents from "./pages/MyEvents";
import ActivityList from "./pages/ActivitiesList";
import MyEventDetails from "./pages/MyEventDetails";
import ManageEvents from "./pages/ManageEvents";
import Accessibility from "./pages/Landing/Legal/Accessibility";
import PrivacyPolicy from "./pages/Landing/Legal/PrivacyPolicy";
import ManageUsers from "./pages/ManageUsers";
import ChatFeature from "./pages/Chat/index";

// Import apollo server
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { setContext } from "apollo-link-context";
import { ApolloLink, Observable } from "apollo-link";

// Google Analytics Imports
import ReactGA from "react-ga";

// Auth0 imports
import { useAuth0 } from "./config/react-auth0-spa";
import "./styles.css";

const trackingId = "UA-159556430-1";
(function initializeReactGA() {
  ReactGA.initialize(trackingId, { testMode: true });
  ReactGA.pageview("/");
})();
function App() {
  const { getIdTokenClaims } = useAuth0();

  const request = async operation => {
    const token = await getIdTokenClaims();
    operation.setContext(context => ({
      headers: {
        ...context.headers,
        Authorization: token.__raw,
      },
    }));
  };
  const requestLink = new ApolloLink(
    (operation, forward) =>
      new Observable(observer => {
        let handle;
        Promise.resolve(operation)
          .then(oper => request(oper))
          .then(() => {
            handle = forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            });
          })
          .catch(observer.error.bind(observer));
        return () => {
          if (handle) handle.unsubscribe();
        };
      })
  );
  const client = new ApolloClient({
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
          );
        if (networkError) console.log(`[Network error]: ${networkError}`);
      }),
      requestLink,
      new HttpLink({
        uri: process.env.REACT_APP_API_URL,
        credentials: "same-origin",
      }),
    ]),
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <Router>
          <Accessibility path="/accessibility" />
          <PrivacyPolicy path="/privacy-policy" />
          <PrivateRoute path="/" component={DashRouter}>
            <UserProfile path="/" />
            <EventsCalendar path="calendar" />
            <ActivityList path="calendar/:eventId" />
            <MyEvents path="myevents" />
            <MyEventDetails path="myevents/:eventId" />
            <ManageEvents path="manage" />
            <ManageUsers path="users" />
            <ChatFeature path="chats" />
          </PrivateRoute>
        </Router>
      </div>
    </ApolloProvider>
  );
}
export default App;
