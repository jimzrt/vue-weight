const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

module.exports = {
  transpileDependencies: ["vue-echarts", "resize-detector"],
  configureWebpack: {
    plugins: [new BundleAnalyzerPlugin()]
  }
};
