// import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure';
const { setHeadlessWhen, setCommonPlugins } = require('@codeceptjs/configure');
const { bootstrap } = require('./codeceptjs_presettings.ts');

// turn on headless mode when running with HEADLESS=true environment variable
// HEADLESS=true npx codecept run
setHeadlessWhen(process.env.HEADLESS);

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

export const config = {
  tests   : './*_test.ts',
  output  : './test_outputs',
  helpers : {
    Playwright : {
      url     : 'http://localhost',
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
