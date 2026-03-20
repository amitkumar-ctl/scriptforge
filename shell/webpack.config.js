const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');

const deps = require('./package.json').dependencies;

module.exports = {
  entry: './src/index.jsx',
  output: {
    publicPath: 'http://localhost:4001/',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        // Each MFE is loaded at runtime from its dev server
        mfePlatform:  'mfePlatform@http://localhost:4002/remoteEntry.js',
        mfeConfig:    'mfeConfig@http://localhost:4003/remoteEntry.js',
        mfeOutput:    'mfeOutput@http://localhost:4004/remoteEntry.js',
        mfeHistory:   'mfeHistory@http://localhost:4005/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
        'react-redux': { singleton: true, requiredVersion: deps['react-redux'] },
        '@reduxjs/toolkit': { singleton: true, requiredVersion: deps['@reduxjs/toolkit'] },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'ScriptForge AI Script Generator',
    }),
  ],
  devServer: {
    port: 4001,
    historyApiFallback: true,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
};
