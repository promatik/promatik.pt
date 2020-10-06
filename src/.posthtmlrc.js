module.exports = {
  plugins: [
    require("posthtml-include")({
      root: __dirname
    }),
    require("posthtml-expressions")({
      root: __dirname
    })
  ]
};
