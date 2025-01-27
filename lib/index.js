var express = require('express');
var https = require("https");
var request = require('request');
var cors = require('cors');
var chalk = require('chalk');
var fs = require('fs');
var proxy = express();

var startProxy = function(port, proxyUrl, proxy2Url, proxyPartial, proxy2Partial, credentials, origin) {
  proxy.use(cors({credentials: credentials, origin: origin}));
  proxy.options('*', cors({credentials: credentials, origin: origin}));

  // remove trailing slash
  var cleanProxyUrl = proxyUrl.replace(/\/$/, '');
  // remove all forward slashes
  var cleanProxyPartial = proxyPartial.replace(/\//g, '');

  // remove trailing slash
  var cleanProxy2Url = proxy2Url.replace(/\/$/, '');
  // remove all forward slashes
  var cleanProxy2Partial = proxy2Partial.replace(/\//g, '');

  proxy.use('/' + cleanProxyPartial, function(req, res) {
    try {
      console.log(chalk.green('Request Proxied ('+ '/' + cleanProxyPartial +') -> ' + req.url));
    } catch (e) {}
    req.pipe(
      request(cleanProxyUrl + req.url)
      .on('response', response => {
        // In order to avoid https://github.com/expressjs/cors/issues/134
        const accessControlAllowOriginHeader = response.headers['access-control-allow-origin']
        if(accessControlAllowOriginHeader && accessControlAllowOriginHeader !== origin ){
          console.log(chalk.blue('Override access-control-allow-origin header from proxified URL : ' + chalk.green(accessControlAllowOriginHeader) + '\n'));
          response.headers['access-control-allow-origin'] = origin;
        }
      })
    ).pipe(res);
  });

  proxy.use('/' + cleanProxy2Partial, function(req, res) {
    try {
      console.log(chalk.green('Request Proxied ('+ '/' + cleanProxy2Partial +') -> ' + req.url));
    } catch (e) {}
    req.pipe(
      request(cleanProxy2Url + req.url)
      .on('response', response => {
        // In order to avoid https://github.com/expressjs/cors/issues/134
        const accessControlAllowOriginHeader = response.headers['access-control-allow-origin']
        if(accessControlAllowOriginHeader && accessControlAllowOriginHeader !== origin ){
          console.log(chalk.blue('Override access-control-allow-origin header from proxified URL : ' + chalk.green(accessControlAllowOriginHeader) + '\n'));
          response.headers['access-control-allow-origin'] = origin;
        }
      })
    ).pipe(res);
  });

  https
  .createServer(
    { //SSL Server cert for 'metastorm.cloudns.ph'
      key: fs.readFileSync("cert/private.key"),
      cert: fs.readFileSync("cert/certificate.crt"),
      ca: fs.readFileSync("cert/ca_bundle.crt")
    },
    proxy)
  .listen(port, ()=>{
    console.log(chalk.bgGreen.black.bold.underline('\n Proxy Active \n'));
    console.log(chalk.blue('Proxy Url: ' + chalk.green(cleanProxyUrl)));
    console.log(chalk.blue('Proxy2 Url: ' + chalk.green(cleanProxy2Url)));
    console.log(chalk.blue('Proxy Partial: ' + chalk.green(cleanProxyPartial)));
    console.log(chalk.blue('Proxy2 Partial: ' + chalk.green(cleanProxy2Partial)));
    console.log(chalk.blue('PORT: ' + chalk.green(port)));
    console.log(chalk.blue('Credentials: ' + chalk.green(credentials)));
    console.log(chalk.blue('Origin: ' + chalk.green(origin) + '\n'));
    console.log(
      chalk.cyan(
        'To start using the proxy simply replace the proxied part of your url with: ' +
          chalk.bold('http://localhost:' + port + '/' + cleanProxyPartial + '\n'+ 'or...\n') +
          chalk.bold('http://localhost:' + port + '/' + cleanProxy2Partial + '\n')
      )
    );
  });

  //proxy.listen(port);

  // Welcome Message
  
};

exports.startProxy = startProxy;
