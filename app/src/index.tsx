import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./Redux/store";
// @ts-ignore
import { TrackingProvider } from "vaalgtir_sdk_webanalytics";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <React.Fragment>
      <Router>
        <TrackingProvider
          appId="0c65110c-9062-4695-a4b7-e4bbb2e2cfa2"
          withTrackingSession={false}
          withTrackingMouse={false}
        >
          <App />
        </TrackingProvider>
      </Router>
    </React.Fragment>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
