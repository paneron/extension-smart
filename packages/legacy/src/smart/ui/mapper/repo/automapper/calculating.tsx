import React from 'react';
import { LoadingContainer } from '../../../common/Loading';

const AutoMapLoading: React.FC<{
  isLoading: boolean;
  result: string;
}> = function ({ isLoading, result }) {
  return isLoading ? (
    <LoadingContainer label="Calculating" />
  ) : (
    <div
      style={{
        flex           : 1,
        display        : 'flex',
        flexDirection  : 'column',
        justifyContent : 'center',
        alignItems     : 'center',
      }}
    >
      <h3> Caulcation completed. </h3>
      <h3>{result}</h3>
    </div>
  );
};

export default AutoMapLoading;
