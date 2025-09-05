import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import MigrationForm from '../../components/MigrationForm/MigrationForm';
import MigrationDetail from '../../components/MigrationDetail/MigrationDetail';
import { useMigration } from '../../context/MigrationContext';
import HeaderBar from '../../components/HeaderBar/HeaderBar'; 
import './Home.css';

const Home: React.FC = () => {
  const { selectedMigration, setSelectedMigration } = useMigration();
  const navigate = useNavigate();

  const handleNewMigrationClick = () => {
    setSelectedMigration(null);
  };

  const handleRecentMigrationClick = (id: string) => {
    navigate(`/migration/${id}`);
  };

 return (
  <>
    <HeaderBar title="Harnessify" /> {/* Full-width header */}
    <div className="home-page">
      <Sidebar 
        onNewMigrationClick={handleNewMigrationClick}
        onRecentMigrationClick={handleRecentMigrationClick}
      />
      <main className="main-content">
        {selectedMigration ? <MigrationDetail /> : <MigrationForm />}
      </main>
    </div>
  </>
);

};

export default Home;
