import React from 'react';

import MigrationDetail from '../../components/MigrationDetail/MigrationDetail';
import './MigrationDetailPage.css';
import HeaderBar from '../../components/HeaderBar/HeaderBar';

const MigrationDetailPage: React.FC = () => {
  

  return (
    <>
    <HeaderBar title="Harnessify" />
    <div className="migration-detail-page">
      <MigrationDetail />
    </div>
    </>
    
  );
};

export default MigrationDetailPage;
