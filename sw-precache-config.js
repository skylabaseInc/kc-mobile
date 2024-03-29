'use strict';

module.exports = {
  staticFileGlobs: [
    'dist/index.html',
    'dist/**.js',
    'dist/**.png',
    'dist/**.css',
    'dist/**.woff',
    'dist/**.woff2',
    'dist/**.ttf',
    'dist/**.eot',
    'dist/**.json'
  ],
  root: 'dist',
  stripPrefix: 'dist/',
  navigateFallback: '/index.html',

 runtimeCaching: [{
    urlPattern: /https\:\/\/pilot\.kuelap\.io/,
    handler: 'networkFirst'
  }]
};
