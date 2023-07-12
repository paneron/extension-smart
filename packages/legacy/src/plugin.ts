import { makeExtension } from '@riboseinc/paneron-extension-kit';
import datasetInitializer from '@/migrations/initial'
import mainView from '@/Main';

export default makeExtension({
  name                   : 'SMART',
  requiredHostAppVersion : '^2.1.0',
  mainView,
  datasetInitializer,
  datasetMigrations      : {},
});
