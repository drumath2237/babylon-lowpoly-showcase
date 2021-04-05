// const path = require('path');
import * as path from 'path';
import * as webpack from 'webpack';
import 'webpack-dev-server';

const config: webpack.Configuration[] = [
  {
    name: 'local_dev',
    mode: 'development',
    entry: './src/index.ts',
    devtool: 'source-map',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
        },
        {
          test: /\.(sa|sc|c)ss$/,
          exclude: /node_modules/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {url: false},
            },
            'sass-loader',
          ],
        },
      ],
    },
    devServer: {
      open: false,
      openPage: 'index.html',
      contentBase: path.resolve(__dirname, 'dist'),
      watchContentBase: true,
      port: 8080,
      publicPath: '/',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: ['node_modules'],
    },
  },
];

export default config;
