import React, { createContext, useState, useEffect } from "react";

export const ColorsContext = createContext();

export const ColorsContextProvider = ({ children }) => {
  const [colors, setColors] = useState("");
  const saveColors = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await localStorage.setItem("@colors-", jsonValue);
    } catch (err) {
      console.log("Error Storing", err);
    }
  };

  const loadColors = async () => {
    try {
      const value = await localStorage.getItem("@colors-");
      if (value !== null) {
        setColors(JSON.parse(value));
      }
    } catch (err) {
      console.log("Error Loading", err);
    }
  };

  const change = (color) => {
    setColors(color);
  };

  useEffect(() => {
    loadColors();
  }, []);

  useEffect(() => {
    saveColors(colors);
  }, [colors]);

  return (
    <ColorsContext.Provider
      value={{
        colors,
        changeColors: change,
      }}
    >
      {children}
    </ColorsContext.Provider>
  );
};
