var path = require('path');

var rules = {
  'quotes' : [
    'warn',
    'single',
    { avoidEscape: true },
  ],
  "require-jsdoc" : ["off"],
  "valid-jsdoc"   : ["off"],
  "indent"        : [
    "error",
    2,
    {
      SwitchCase         : 1,
      VariableDeclarator : {
        "var"   : 2,
        "let"   : 2,
        "const" : 3,
      },
      ignoredNodes : ["ConditionalExpression"],
    },
  ],
  "key-spacing" : [
    "error",
    {
      singleLine : {
        beforeColon : true,
        afterColon  : true,
      },
      multiLine : {
        beforeColon : true,
        afterColon  : true,
        align       : "colon",
      },
    },
  ],
  "keyword-spacing" : [
    "error",
    {
      before : true,
      after  : true,
    },
  ],
  "spaced-comment" : [
    "error",
    "always",
    {
      exceptions : ["-", "+", "=", "*"],
      markers    : ["=", "*/", "/*", "X", "//"],
    },
  ],
  "no-multi-spaces" : [
    1,
    {
      exceptions : {
        VariableDeclarator : true,
      },
    },
  ],
  "no-cond-assign" : [2, "except-parens"],
  // "no-redeclare"   : [
  //   "error",
  //   {
  //     builtinGlobals : true,
  //   },
  // ],
  "no-redeclare": "off",
  "@typescript-eslint/no-redeclare": ["error"],
  "dot-notation" : [
    2,
    {
      allowKeywords : true,
    },
  ],
  "eqeqeq"      : [2, "smart"],
  "no-plusplus" : [
    "warn",
    {
      allowForLoopAfterthoughts : true,
    },
  ],
  "one-var" : [
    "off", // Enable once tests are set up
    "consecutive",
  ],
  "object-curly-spacing" : [
    "error",
    "always",
    {
      objectsInObjects : false,
      arraysInObjects  : false,
    },
  ],
  "quote-props" : [
    "error",
    "consistent-as-needed",
    {
      keywords : true,
    },
  ],
  "camelcase" : ["warn"],
  "max-len"   : ["warn"],
  "new-cap"   : ["warn"],

  "key-spacing" : [
    "error",
    {
      singleLine : {
        beforeColon : true,
        afterColon  : true,
      },
      multiLine : {
        beforeColon : true,
        afterColon  : true,
        align       : "colon",
      },
    },
  ],
  'no-empty-function' : 'off',
  'react/prop-types' : 'off',
  'react/no-unknown-property' : ['error', { ignore : ['css'] }],
  '@typescript-eslint/no-empty-function' : 'off',
  '@typescript-eslint/no-non-null-asserted-nullish-coalescing' : 'warn',
  'no-unused-vars' : 'off',
  '@typescript-eslint/no-unused-vars' : 'warn',
  '@emotion/jsx-import' : 'error',
  '@emotion/no-vanilla' : 'error',
  '@emotion/import-from-emotion' : 'error',
  '@emotion/styled-import' : 'error',
};

module.exports = {
  root      : true,
  "env"   : {
    // "jest/globals" : true,
  },
  "extends" : [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/strict',
    // "plugin:prettier/recommended",
  ],
  "parser"        : "@typescript-eslint/parser",
  "parserOptions" : {
    project : path.join(__dirname, "tsconfig.json"),
  },
  "settings" : {
    react : {
      version : "detect"
    },
    "import/resolver" : {
      typescript : {}
    }
  },
  "rules" : rules,
  overrides : [
    {
      files : ["*.js"],
      rules : rules,
    },
    {
      "files"   : ["spec/**"],
      "plugins" : ["jest", "@emotion"],
      "extends" : ["plugin:jest/recommended", "plugin:jest/style"],
      "rules"   : {
        "jest/prefer-expect-assertions" : "off",
      },
    },
  ],
  rules : rules,
};
