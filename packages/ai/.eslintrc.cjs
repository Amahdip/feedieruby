module.exports = {
  extends: ["@salamruby/eslint-config/library.js"],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
