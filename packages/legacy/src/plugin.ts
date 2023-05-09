import { makeExtension } from '@riboseinc/paneron-extension-kit';
import 'electron';

export default makeExtension({
  mainView               : () => import('./Main'),
  name                   : 'SMART',
  requiredHostAppVersion : '^2.0.5',
  datasetMigrations      : {},
  datasetInitializer     : () => import('./migrations/initial'),
});
