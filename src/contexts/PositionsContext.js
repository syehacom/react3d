import React, { createContext, useState, useEffect } from "react";

export const PositionsContext = createContext();

export const PositionsContextProvider = ({ children }) => {
  const [positions, setPositions] = useState("");
  const savePositions = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await localStorage.setItem("@positions-", jsonValue);
    } catch (err) {
      console.log("Error Storing", err);
    }
  };

  const loadPositions = async () => {
    try {
      const value = await localStorage.getItem("@positions-");
      if (value !== null) {
        setPositions(JSON.parse(value));
      }
    } catch (err) {
      console.log("Error Loading", err);
    }
  };

  const change = (position) => {
    setPositions(position);
  };

  useEffect(() => {
    loadPositions();
  }, []);

  useEffect(() => {
    savePositions(positions);
  }, [positions]);

  return (
    <PositionsContext.Provider
      value={{
        positions,
        changePositions: change,
      }}
    >
      {children}
    </PositionsContext.Provider>
  );
};
