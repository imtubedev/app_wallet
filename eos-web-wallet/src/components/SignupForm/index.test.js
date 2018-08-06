import * as React from "react";
import ReactDOM from "react-dom";
import { StaticRouter } from "react-router";
import { Provider } from "react-redux";
import { configureStore } from "util/configureStore";
import SignupForm from "./index";

describe("<SignupForm />", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    const staticContext = {};
    const { store } = configureStore();

    ReactDOM.render(
      <StaticRouter location="/" context={staticContext}>
        <Provider store={store}>
          <SignupForm />
        </Provider>
      </StaticRouter>,
      div
    );
  });
});
