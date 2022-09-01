// import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure';
const { setHeadlessWhen, setCommonPlugins } = require('@codeceptjs/configure');
const { bootstrap } = require('./codeceptjs_presettings.ts');

// turn on headless mode when running with HEADLESS=true environment variable
// HEADLESS=true npx codecept run
setHeadlessWhen(process.env.HEADLESS);

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

export const config = {
  // tests   : '**/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x)',
  tests   : './e2e_tests/**/*_test.[tj]s?(x)',
  output  : './test_outputs',
  helpers : {
    Playwright : {
      url     : './paneron/dist/main/main.js',
      show    : true,
      browser : 'electron'
    }
  },
  bootstrap,
  include : {},
  name    : 'extension-hls',
  plugins : {
    retryFailedStep : {
      enabled : true
    },
    screenshotOnFail : {
      enabled : true
    }
  }
}
