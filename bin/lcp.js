#!/usr/bin/env node

var lcp = require('../lib/index.js');
var commandLineArgs = require('command-line-args');

var optionDefinitions = [
  { name: 'port', alias: 'p', type: Number, defaultValue: 8010 },
  {
    name: 'proxyPartial',
    type: String,
    defaultValue: '/proxy'
  },
  {
    name: 'proxy2Partial',
    type: String,
    defaultValue: '/'
  },
  { name: 'proxyUrl', type: String },
  { name: 'proxy2Url', type: String },
  { name: 'credentials', type: Boolean, defaultValue: false },
  { name: 'origin', type: String, defaultValue: '*' }
];

try {
  var options = commandLineArgs(optionDefinitions);
  if (!options.proxyUrl) {
    throw new Error('--proxyUrl is required');
  }
  lcp.startProxy(options.port, options.proxyUrl, options.proxy2Url, options.proxyPartial, options.proxy2Partial, options.credentials, options.origin);
} catch (error) {
  console.error(error);
}
