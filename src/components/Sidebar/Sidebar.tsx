
import React, { useState,useRef, useEffect } from 'react';
import { FaPlus, FaChevronDown, FaChevronRight, FaEllipsisV } from 'react-icons/fa';
import { useMigration } from '../../context/MigrationContext';
import { useEventPolling } from '../../hooks/useEventPolling';
import './Sidebar.css';

interface SidebarProps {
  onNewMigrationClick: () => void;
  onRecentMigrationClick: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewMigrationClick, onRecentMigrationClick }) => {
  const [isRecentExpanded, setIsRecentExpanded] = useState(true);
  const { recentMigrations, selectedMigration, setRecentMigrations } = useMigration();

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleRecent = () => setIsRecentExpanded(prev => !prev);

  // Poll events only for selected migration
  const { events } = useEventPolling(selectedMigration?.id || null);

  // Derive updated status based on events
  const getLatestStatus = (migrationId: string, currentStatus: string): string => {
    if (selectedMigration?.id !== migrationId) return currentStatus;

    if (events.some(e => e.agentStatus === 'failed')) return 'failed';
    if (events.some(e => e.agentStatus === 'completed')) return 'completed';
    if (events.length > 0) return 'in-progress';

    return currentStatus;
  };

  // Handle removal of migration from recent list
  const handleRemoveMigration = (id: string) => {
    setRecentMigrations(recentMigrations.filter(m => m.id !== id));
    setMenuOpenId(null);
  };

   // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Migrations</h2>
      </div>

      <button
        className={`sidebar-button ${!selectedMigration ? 'active' : ''}`}
        onClick={onNewMigrationClick}
      >
        <FaPlus className="icon" /> New Migration
      </button>

      <div className="recent-migrations">
        <button className="sidebar-button toggle-button" onClick={toggleRecent}>
          {isRecentExpanded ? <FaChevronDown className="icon" /> : <FaChevronRight className="icon" />}
          Recent Migrations
        </button>

        <div className={`recent-list ${isRecentExpanded ? 'open' : 'closed'}`}>
          {recentMigrations.length > 0 ? (
            recentMigrations.map((migration) => {
              const isSelected = selectedMigration?.id === migration.id;
              const displayStatus = getLatestStatus(migration.id, migration.status);

              return (
                <div
                  key={migration.id}
                  className={`recent-item ${isSelected ? 'active' : ''}`}
                >
                  <span
                    className="migration-name"
                    onClick={() => onRecentMigrationClick(migration.id)}
                  >
                    {migration.name}
                  </span>
                  <span className={`migration-status status-${displayStatus}`}>
                    {displayStatus}
                  </span>

                  {/* Three dots menu */}
                  <div className="menu-container">
                    <FaEllipsisV
                      className="menu-icon"
                      onClick={() =>
                        setMenuOpenId(menuOpenId === migration.id ? null : migration.id)
                      }
                    />
                    {menuOpenId === migration.id && (
                      <div ref={menuRef} className="menu-dropdown">
                        <button
                          onClick={() => {
                            onRecentMigrationClick(migration.id);
                            setMenuOpenId(null);
                          }}
                        >
                          View Details
                        </button>
                        <button onClick={() => handleRemoveMigration(migration.id)}>
                          Remove from Recent
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-migrations">No recent migrations</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
