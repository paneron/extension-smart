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
  '@typescript-eslint/no-empty-function' : 'off',
  '@typescript-eslint/no-non-null-asserted-nullish-coalescing' : 'warn',
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
    project : "./tsconfig.json",
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
      "plugins" : ["jest"],
      "extends" : ["plugin:jest/recommended", "plugin:jest/style"],
      "rules"   : {
        "jest/prefer-expect-assertions" : "off",
      },
    },
  ],
  rules : rules,
};
