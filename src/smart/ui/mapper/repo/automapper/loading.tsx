import React from 'react';
import { LoadingContainer } from '../../../common/Loading';

const RepoLoading: React.FC<{
  isLoading: boolean;
  isDoable: boolean;
}> = function ({ isLoading, isDoable }) {
  return isLoading ? (
    <LoadingContainer label="Loading map information" />
  ) : (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h3> Loading completed. </h3>
      {isDoable ? (
        <h3>Click Next to continue</h3>
      ) : (
        <h3 style={{ color: 'red' }}>But no mapping can be explored</h3>
      )}
    </div>
  );
};

export default RepoLoading;
