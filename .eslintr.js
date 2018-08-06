module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: "airbnb",
  plugins: [
    "react",
    "jsx-a11y",
    "import"
  ],
  rules: {
    // 0 = off, 1 = warn, 2 = error
    // FB配置参考：
    // https://github.com/facebook/react-native/blob/8baaad9b0fbda2b02bb1834452aa63cac7910dc5/.eslintrc
    "global-require": 0,
    "no-use-before-define": 0,       // disallow use of variables before they are defined
    "max-len": 0,                    // specify the maximum length of a line in your program (off by default)
    "no-console": 0,                 // disallow use of console (off by default in the node environment)
    "no-undef": 2,                   // disallow use of undeclared variables unless mentioned in a /*global */ block
    "no-unused-vars": 0,
    "block-scoped-var": 0,           // treat var statements as if they were block scoped (off by default)
    "complexity": 0,                 // specify the maximum cyclomatic complexity allowed in a program (off by default)
    "consistent-return": 0,          // require return statements to either always or never specify values
    // allow async-await
    'generator-star-spacing': 0,
    "no-return-assign": 1,           // disallow use of assignment in return statement
    "react/jsx-filename-extension": 0,
    "react/self-closing-comp": 1,
    "react/jsx-closing-bracket-location": 0,
    "react/prop-types": 0, // 避免redux等注入属性的情况
  },
  // 这里设置可能用到的全局变量
  "globals": {
    "window": true,
    "fetch": true,
    "__DEV__": true,
    "__APP__": true,
    "__ANDROID__": true,
    "__IOS__": true
  }
};
