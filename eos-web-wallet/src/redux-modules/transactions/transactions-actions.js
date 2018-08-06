export const TRY_GET_TRANSACTIONS = "TRY_GET_TRANSACTIONS";
export const FAIL_GET_TRANSACTIONS = "FAIL_GET_TRANSACTIONS";
export const SUCCESS_GET_TRANSACTIONS = "SUCCESS_GET_TRANSACTIONS";

export function failGetTransactions(error) {
  return {
    type: FAIL_GET_TRANSACTIONS,
    error
  };
}

export function succeedGetTransactions(transactions, eosAccount) {
  return {
    type: SUCCESS_GET_TRANSACTIONS,
    transactions,
    eosAccount
  };
}

export function tryGetTransactions(eosAccount) {
  return {
    type: TRY_GET_TRANSACTIONS,
    eosAccount
  };
}
