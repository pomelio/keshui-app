import { createContext } from "react";

export const AppContext = createContext({
  dispatch: undefined,
  session: undefined,
});