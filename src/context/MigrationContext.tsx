import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Migration } from '../types';

interface MigrationContextType {
  recentMigrations: Migration[];
  selectedMigration: Migration | null;
  addMigration: (migration: Migration) => void;
  getMigrationById: (id: string) => Migration | undefined;
  setSelectedMigration: (migration: Migration | null) => void;
  setRecentMigrations: React.Dispatch<React.SetStateAction<Migration[]>>;
}

const MigrationContext = createContext<MigrationContextType | undefined>(undefined);

export const MigrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recentMigrations, setRecentMigrations] = useState<Migration[]>(() => {
    const saved = localStorage.getItem('recentMigrations');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedMigration, setSelectedMigration] = useState<Migration | null>(null);

  // Save migrations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recentMigrations', JSON.stringify(recentMigrations));
  }, [recentMigrations]);

  const addMigration = (migration: Migration) => {
    setRecentMigrations(prev => {
      // Check if migration already exists
      const existingIndex = prev.findIndex(m => m.id === migration.id);
      
      if (existingIndex >= 0) {
        // Update existing migration
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...migration
        };
        return updated;
      } else {
        // Add new migration to the beginning of the array
        return [migration, ...prev].slice(0, 10); // Keep only the 10 most recent
      }
    });
  };

  const getMigrationById = (id: string): Migration | undefined => {
    return recentMigrations.find(migration => migration.id === id);
  };

  return (
    <MigrationContext.Provider value={{
      recentMigrations,
      selectedMigration,
      addMigration,
      getMigrationById,
      setSelectedMigration,
      setRecentMigrations 
    }}>
      {children}
    </MigrationContext.Provider>
  );
};

export const useMigration = (): MigrationContextType => {
  const context = useContext(MigrationContext);
  if (context === undefined) {
    throw new Error('useMigration must be used within a MigrationProvider');
  }
  return context;
};
