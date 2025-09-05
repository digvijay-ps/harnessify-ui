import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthHeaders {
  Authorization: string;
  'x-client-id': string;
  'x-project-id': string;
  'x-workspace-id': string;
}

interface AuthContextType {
  headers: AuthHeaders | null;
  setHeaders: (headers: AuthHeaders) => void;
  clearHeaders: () => void;
  isAuthenticated: boolean;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [headers, setHeadersState] = useState<AuthHeaders | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load auth headers from localStorage
    const storedHeaders = localStorage.getItem('authHeaders');
    if (storedHeaders) {
      try {
        setHeadersState(JSON.parse(storedHeaders));
      } catch {
        console.error('Invalid authHeaders in localStorage');
      }
    }

    

    setIsReady(true);
  }, []);

  const setHeaders = (newHeaders: AuthHeaders) => {
    setHeadersState(newHeaders);
    localStorage.setItem('authHeaders', JSON.stringify(newHeaders));
  };

  const clearHeaders = () => {
    setHeadersState(null);
    localStorage.removeItem('authHeaders');
  };

  const isAuthenticated = Boolean(
    headers?.Authorization &&
    headers.Authorization.startsWith('Bearer ') &&
    headers.Authorization.length > 10
  );

  

  return (
    <AuthContext.Provider
      value={{
        headers,
        setHeaders,
        clearHeaders,
        isAuthenticated,
        isReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
