const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');

const deps = require('./package.json').dependencies;
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:4004';


module.exports = {
  entry: './src/index.jsx',
  output: {
    publicPath: `${PUBLIC_URL}`,
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: { extensions: ['.js', '.jsx'] },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env', '@babel/preset-react'] } },
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfeOutput',
      filename: 'remoteEntry.js',
      exposes: {
        './OutputViewer': './src/OutputViewer.jsx',
      },
      shared: {
        react:            { singleton: true, requiredVersion: deps.react },
        'react-dom':      { singleton: true, requiredVersion: deps['react-dom'] },
        'react-redux':    { singleton: true, requiredVersion: deps['react-redux'] },
        '@reduxjs/toolkit': { singleton: true, requiredVersion: deps['@reduxjs/toolkit'] },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
  devServer: {
    port: 4004,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
};
