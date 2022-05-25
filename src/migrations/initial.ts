import { DatasetMigrationFunction } from '@riboseinc/paneron-extension-kit/types/migrations';

/**
 * Probably the setting of the extension. I (Wai Kit) am not sure what the effect is.
 * Ignored so far.
 */

const initializeDataset: DatasetMigrationFunction = async () => {
  return {
    versionAfter    : '1.0.0-dev6',
    bufferChangeset : {},
  };
};

export default initializeDataset;
