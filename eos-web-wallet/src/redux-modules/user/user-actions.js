//@flow

export const TRY_LOGIN = "TRY_LOGIN";
export const SUCCEED_LOGIN = "SUCCEED_LOGIN";
export const FAIL_LOGIN = "FAIL_LOGIN";
export const LOGOUT = "LOGOUT";

type LoginTryAction = {
  type: "TRY_LOGIN",
  email: string,
  password: string
};

type LoginSuccessAction = {
  type: "SUCCEED_LOGIN",
  email: string,
  password: string
};

type LoginFailureType = {
  type: "FAIL_LOGIN",
  error: any
};

type LogoutAction = {
  type: "LOGOUT"
};

export type LoginActions =
  | LoginTryAction
  | LoginSuccessAction
  | LoginFailureType
  | LogoutAction;

export const tryPostLogin = (
  email: string,
  password: string
): LoginTryAction => ({
  type: TRY_LOGIN,
  email,
  password
});

export const succeedPostLogin = (
  email: string,
  password: string
): LoginSuccessAction => ({
  type: SUCCEED_LOGIN,
  email,
  password
});

export const failPostLogin = (error: string) => ({
  type: FAIL_LOGIN,
  form: "login", // see: middleware/api
  error
});

export const logout = (): LogoutAction => ({
  type: LOGOUT
});
