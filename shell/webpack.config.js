const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const webpack = require('webpack');
const path = require('path');

const deps = require('./package.json').dependencies;

const SHELL_URL    = process.env.SHELL_URL         || 'http://localhost:4001';
const PLATFORM_URL = process.env.MFE_PLATFORM_URL  || 'http://localhost:4002';
const CONFIG_URL   = process.env.MFE_CONFIG_URL    || 'http://localhost:4003';
const OUTPUT_URL   = process.env.MFE_OUTPUT_URL    || 'http://localhost:4004';
const HISTORY_URL  = process.env.MFE_HISTORY_URL   || 'http://localhost:4005';
const API_URL      = process.env.REACT_APP_API_URL || 'http://localhost:4000';

module.exports = {
  entry: './src/index.jsx',
  output: {
    publicPath: `${SHELL_URL}/`,
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
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
        mfePlatform: `mfePlatform@${PLATFORM_URL}/remoteEntry.js`,
        mfeConfig:   `mfeConfig@${CONFIG_URL}/remoteEntry.js`,
        mfeOutput:   `mfeOutput@${OUTPUT_URL}/remoteEntry.js`,
        mfeHistory:  `mfeHistory@${HISTORY_URL}/remoteEntry.js`,
      },
      shared: {
        react:              { singleton: true, requiredVersion: deps.react },
        'react-dom':        { singleton: true, requiredVersion: deps['react-dom'] },
        'react-redux':      { singleton: true, requiredVersion: deps['react-redux'] },
        '@reduxjs/toolkit': { singleton: true, requiredVersion: deps['@reduxjs/toolkit'] },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'ScriptForge – AI Script Generator',
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(API_URL),
    }),
  ],
  devServer: {
    port: 4001,
    historyApiFallback: true,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    ],
  },
};