import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('reavo_userName') || '';
  });

  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
    return localStorage.getItem('reavo_hasSeenIntro') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('reavo_userName', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('reavo_hasSeenIntro', hasSeenIntro);
  }, [hasSeenIntro]);

  const completeIntro = (name) => {
    if (name) setUserName(name);
    setHasSeenIntro(true);
  };

  const resetUser = () => {
    setUserName('');
    setHasSeenIntro(false);
  };

  return (
    <UserContext.Provider value={{ userName, setUserName, hasSeenIntro, completeIntro, resetUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
