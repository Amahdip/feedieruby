module.exports = {
  extends: ["@salamruby/eslint-config/next.js"],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    "no-console": "off",
  },
};
