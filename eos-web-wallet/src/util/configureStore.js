import { createStore, compose, combineReducers, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import { reducer as form } from "redux-form";
import { routerMiddleware } from "react-router-redux";
import { routerReducer } from "react-router-redux";
import app from "redux-modules/app";
import user from "redux-modules/user";
import usersList from "redux-modules/users-list";
import eosBalances from "redux-modules/eos-balances";
import notification from "redux-modules/notifications";
import transactions from "redux-modules/transactions";
import profile from "redux-modules/profile";
import { createMemoryHistory } from "history";
import middlewares from "middleware";
import sessionStorage from "redux-persist/lib/storage/session";
import { rehydrateAccounts } from "../middleware/account-persist/account-persist-actions";
import { selectWalletUserAuthenticated } from "../redux-modules/user/user-selectors";

let store;
let persistor;

const reducers = {
  app,
  form: persistReducer(
    {
      key: "forms",
      storage: sessionStorage
    },
    form
  ),
  user,
  usersList,
  eosBalances,
  notification,
  profile,
  transactions,
  routing: routerReducer
};

export const configureStore = (
  preloadState,
  history = createMemoryHistory()
) => {
  /* eslint-disable-next-line no-underscore-dangle */
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const enhancers = composeEnhancers(
    applyMiddleware(...middlewares, routerMiddleware(history))
  );

  store = createStore(combineReducers(reducers), preloadState, enhancers);
  store.reducers = reducers;
  persistor = persistStore(store, undefined, () => {
    if (selectWalletUserAuthenticated(store.getState())) {
      store.dispatch(rehydrateAccounts());
    }
  });

  return { store, persistor };
};

export const addReducers = reducers => {
  let added = false;
  reducers.forEach(({ name, reducer }) => {
    if (!store.reducers[name]) {
      store.reducers = {
        ...store.reducers,
        [name]: reducer
      };
      added = true;
    }
  });

  if (added) {
    console.log(JSON.stringify(store.reducers));
    store.replaceReducer(combineReducers(store.reducers));
    persistor.persist();
  }
};

export const removeReducers = reducerNames => {
  let removed = false;
  reducerNames.forEach(reducerName => {
    if (store.reducers[reducerName]) {
      Reflect.deleteProperty(store.reducers, reducerName);
      removed = true;
    }
  });

  if (removed) {
    console.log(JSON.stringify(store.reducers));
    store.replaceReducer(combineReducers(store.reducers));
  }
};
