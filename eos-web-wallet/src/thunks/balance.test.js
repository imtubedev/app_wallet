import configureMockStore from "redux-mock-store";
import middlewares from "middleware";
import { getBalance } from "thunks/balance";
import {
  tryGetBalance,
  succeedGetBalance
} from "redux-modules/eos-balances/balance-actions";
import type { AccountBalanceResponse } from "./balance";
import { unsetNotification } from "../redux-modules/notifications/notifications-actions";

const mockStore = configureMockStore(middlewares);

describe("getBalance", () => {
  it("on successful network call, dispatches succeedGetBalance action", async () => {
    const store = mockStore({
      balance: [],
      user: {
        isAuthenticated: true
      },
      eosAccount: {
        account: {
          accountName: "testeos"
        }
      }
    });

    const accountName = "inita";
    const response: AccountBalanceResponse = {
      eos_balance: "999995.5819 EOS",
      staked_balance: "999995.0000 EOS",
      unstaking_balance: "0.5819 EOS"
    };
    fetch.mockResponse(JSON.stringify(response));

    const expectedActions = [
      tryGetBalance(accountName),
      succeedGetBalance({
        account: accountName,
        total: response.eos_balance,
        staked: response.staked_balance,
        unstaked: response.unstaking_balance
      })
    ];

    await store.dispatch(getBalance(accountName));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
