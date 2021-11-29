import React, { createContext } from "react";

export const BridgeContext = createContext()

export const BridgeContextProvider = ({ value, children }) => {
  return (
    <BridgeContext.Provider value={{ ...value }}>
      {children}
    </BridgeContext.Provider>
  );
};
