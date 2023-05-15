import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure';

/**
 * Turn on headless mode when running with HEADLESS=true environment variable
 *   $ HEADLESS=true npx codecept run
 */
setHeadlessWhen(process.env.HEADLESS);

/**
 * Enable all common plugins:
 * https://github.com/codeceptjs/configure#setcommonplugins
 */
setCommonPlugins();

export const config: CodeceptJS.MainConfig = {
  // tests   : './*_test.ts',
  // tests   : '**/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x)',
  tests   : './e2e_tests/**/*_test.[tj]s?(x)',
  // output  : './output',
  output  : './test_outputs',
  helpers : {
    Playwright : {
      url     : './paneron/dist/main/main.js',
      // url     : 'http://localhost',
      show    : true,
      browser : 'electron'
    }
  },
  include : {
    I : './steps_file'
  },
  name : 'legacy'
}
