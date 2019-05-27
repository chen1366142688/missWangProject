module.exports = {
  parser: "babel-eslint",
  extends: "airbnb",
  "env": {
    "browser": true,
    "node": true,
    "mocha": true,
    "es6": true
  },
  globals: {
    jsx: true,
  },
  plugins: [    // 使用的插件eslint-plugin-html. 写配置文件的时候，可以省略eslint-plugin-
  'react',
  "import"
  ],
 "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  rules: {
    "max-len": [1, 249, 2, {ignoreComments: true}],
    "linebreak-style": ["error", "windows"],
    "import/extensions": [0],
    "arrow-body-style": [0],
    "no-unneeded-ternary": [0],
    "react/prop-types": [0],
    "object-shorthand": [0],
    "no-restricted-globals": [0],
    "no-param-reassign": [0],
    "no-plusplus": [0],
    "no-multiple-empty-lines": [0],
    "prefer-destructuring": [0],
    "react/no-did-mount-set-state": [0],
    "function-paren-newline": [0],
    "radix": [0],
    "jsx-a11y/click-events-have-key-events": [0],
    "jsx-a11y/no-noninteractive-element-interactions": [0],
  }
}
