/**
 * Created by Kamdjou on 7/6/2017.
 */

module.exports = {
  staticFileGlobs: [
    'dist/**.html',
    'dist/**.js',
    'dist/**.png',
    'dist/**.css',
    'dist/**.woff',
    'dist/**.woff2',
    'dist/**.ttf',
    'dist/**.eot',
    'dist/assets/*'
  ],
  root: 'dist',
  stripPrefix: 'dist/',
  navigateFallback: '/index.html',
  runtimeCaching: [{
    urlPattern: /node-hnapi\.herokuapp\.com/,
    handler: 'networkFirst'
  }]
};
