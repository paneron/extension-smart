module.exports = {
  "env": {
    "jest/globals": true
  },
  "extends": "./node_modules/gts/",
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "overrides": [
    {
      "files": [
        "spec/**"
      ],
      "plugins": [
        "jest"
      ],
      "extends": [
        "plugin:jest/recommended",
        "plugin:jest/style"
      ],
      "rules": {
        "jest/prefer-expect-assertions": "off"
      }
    }
  ],
  "rules": {
    "curly": "error",
    "quotes": "off", // handled by prettier
    "require-jsdoc": [
      "off"
    ],
    "valid-jsdoc": [
      "off"
    ],
    "indent": [
      "off", // handled by prettier
      2,
      {
        "SwitchCase": 1,
        "VariableDeclarator": {
          "var": 2,
          "let": 2,
          "const": 3
        },
        "ignoredNodes": [
          "ConditionalExpression"
        ]
      }
    ],
    "key-spacing": [
      "error",
      {
        "singleLine": {
          "beforeColon": false,
          "afterColon": true
        },
        "multiLine": {
          "beforeColon": true,
          "afterColon": true,
          "align": "colon"
        }
      }
    ],
    "keyword-spacing": [
      "error",
      {
        "before": true,
        "after": true
      }
    ],
    "spaced-comment": [
      "error",
      "always",
      {
        "exceptions": [
          "-",
          "+",
          "=",
          "*"
        ],
        "markers": [
          "=",
          "*/",
          "/*",
          "X",
          "//"
        ]
      }
    ],
    "no-multi-spaces": [
      1,
      {
        "exceptions": {
          "VariableDeclarator": true
        }
      }
    ],
    "no-cond-assign": [
      2,
      "except-parens"
    ],
    "no-redeclare": [
      "error",
      {
        "builtinGlobals": true
      }
    ],
    "dot-notation": [
      2,
      {
        "allowKeywords": true
      }
    ],
    "eqeqeq": [
      2,
      "smart"
    ],
    "no-plusplus": [
      "warn",
      {
        "allowForLoopAfterthoughts": true
      }
    ],
    "one-var": [
      "off", // Enable once tests are set up
      "consecutive"
    ],
    "object-curly-spacing": [
      "error",
      "always",
      {
        "objectsInObjects": false,
        "arraysInObjects": false
      }
    ],
    "quote-props": [
      "error",
      "consistent-as-needed",
      {
        "keywords": true
      }
    ],
    "camelcase": [
      "warn"
    ],
    "max-len": [
      "warn"
    ],
    "new-cap": [
      "warn"
    ]
  }
}
