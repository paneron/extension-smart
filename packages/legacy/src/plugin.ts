import { makeExtension } from '@riboseinc/paneron-extension-kit';
import 'electron';

export default makeExtension({
  mainView               : () => import('./Main'),
  name                   : 'SMART',
  requiredHostAppVersion : '^1.0.0-beta18',
  datasetMigrations      : {},
  datasetInitializer     : () => import('./migrations/initial'),
});
