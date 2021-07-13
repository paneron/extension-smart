import { DatasetMigrationFunction } from '@riboseinc/paneron-extension-kit/types/migrations';


const initializeDataset: DatasetMigrationFunction = async (opts) => {
  return {
    versionAfter: '1.0.0-dev6',
    bufferChangeset: {},
  };
};

export default initializeDataset;
