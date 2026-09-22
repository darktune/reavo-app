import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('reavo_userName') || '';
  });

  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
    return localStorage.getItem('reavo_hasSeenIntro') === 'true';
  });

  const [skippedIntro, setSkippedIntro] = useState(() => {
    return localStorage.getItem('reavo_skippedIntro') === 'true';
  });

  const [userSchool, setUserSchool] = useState(() => {
    return localStorage.getItem('reavo_userSchool') || '';
  });

  const [userLocation, setUserLocation] = useState(() => {
    return localStorage.getItem('reavo_userLocation') || '';
  });

  const [pageVisitCount, setPageVisitCount] = useState(() => {
    return parseInt(localStorage.getItem('reavo_pageVisits') || '0', 10);
  });

  // Controls whether the WelcomePrompt overlay is visible
  const [showWelcomePrompt, setShowWelcomePrompt] = useState(false);

  // Persist all state to localStorage
  useEffect(() => {
    localStorage.setItem('reavo_userName', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('reavo_hasSeenIntro', hasSeenIntro);
  }, [hasSeenIntro]);

  useEffect(() => {
    localStorage.setItem('reavo_skippedIntro', skippedIntro);
  }, [skippedIntro]);

  useEffect(() => {
    localStorage.setItem('reavo_userSchool', userSchool);
  }, [userSchool]);

  useEffect(() => {
    localStorage.setItem('reavo_userLocation', userLocation);
  }, [userLocation]);

  useEffect(() => {
    localStorage.setItem('reavo_pageVisits', String(pageVisitCount));
  }, [pageVisitCount]);

  // Track page navigation — called on every route change
  const trackPageVisit = useCallback(() => {
    if (skippedIntro && !userName) {
      setPageVisitCount(prev => prev + 1);
    }
  }, [skippedIntro, userName]);

  // User filled in the prompt and clicked Continue
  const completeIntro = (name, school, location) => {
    if (name) setUserName(name);
    if (school) setUserSchool(school);
    if (location) setUserLocation(location);
    setHasSeenIntro(true);
    setSkippedIntro(false);
    setShowWelcomePrompt(false);
  };

  // User clicked Skip
  const skipIntro = () => {
    setHasSeenIntro(true);
    setSkippedIntro(true);
    setShowWelcomePrompt(false);
  };

  // Open the WelcomePrompt manually (from the "stranger" link)
  const openWelcomePrompt = () => {
    setShowWelcomePrompt(true);
  };

  const resetUser = () => {
    setUserName('');
    setUserSchool('');
    setUserLocation('');
    setHasSeenIntro(false);
    setSkippedIntro(false);
    setPageVisitCount(0);
    setShowWelcomePrompt(false);
  };

  return (
    <UserContext.Provider value={{
      userName, setUserName,
      userSchool, setUserSchool,
      userLocation, setUserLocation,
      hasSeenIntro,
      skippedIntro,
      pageVisitCount,
      trackPageVisit,
      completeIntro,
      skipIntro,
      resetUser,
      showWelcomePrompt,
      openWelcomePrompt,
      setShowWelcomePrompt,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
