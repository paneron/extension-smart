import { DatasetMigrationFunction } from '@riboseinc/paneron-extension-kit/types/migrations';

/**
 * Initialize data for the plugin.
 * Used by Paneron plugin.
 */

const initializeDataset: DatasetMigrationFunction = async () => {
  return {
    versionAfter    : '1.0.0-dev6',
    bufferChangeset : {},
  };
};

export default initializeDataset;
