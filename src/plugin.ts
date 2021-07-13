import { makeExtension } from '@riboseinc/paneron-extension-kit';
import 'electron';

export default makeExtension({
  mainView: () => import('./RepoView'),
  name: "HLS",
  requiredHostAppVersion: '^1.0.0-beta2',
  datasetMigrations: {},
  datasetInitializer: () => import('./migrations/initial'),
});
