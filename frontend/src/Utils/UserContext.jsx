import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    return storedUser && storedToken
      ? { ...JSON.parse(storedUser), token: storedToken }
      : null;
  });

  const updateUser = (newUser) => {
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      if (newUser.token) {
        localStorage.setItem("token", newUser.token);
      }
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    setUser(newUser);
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
