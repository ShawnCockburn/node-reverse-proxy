"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
const httpProxy = require("http-proxy");
const apiProxy = httpProxy.createProxyServer();
const nodeProxy = config => {
    const { routes, 
    /*
    routes array:
    [{host:"example.com",target:"http://localhost:3000"},{host:"api.example.com",target:"http://localhost:4000"}]
    */
    forceSSL = false, 
    /*
   forceSSL:
   forces all http requests to redirect to https requests.
   default = false.
   (HIGHLY RECOMMEND THIS IS SET TO TRUE)
   */
    sslConfig
    /*
  sslConfig:
  {
      key: privateKey,
      cert: certificate,
      ca: intermediateCertificate
  }
  */
     } = config;
    if (routes === undefined || routes.length == 0)
        throw "Routes must be configured.";
    if (sslConfig === undefined)
        throw "SSL must be configured.";
    // force ssl
    if (forceSSL) {
        app.use((req, res, next) => {
            //@ts-ignore
            if (req.connection.encrypted)
                return next();
            res.redirect(301, 'https://' + req.headers.host + req.url);
            return;
        });
    }
    // proxies
    app.all("*", function (req, res) {
        const host = req.headers.host;
        const requestedRoute = routes.find(route => route.host === host || ("www." + route.host) === host);
        if (!requestedRoute)
            return res.status(404);
        try {
            apiProxy.web(req, res, { target: requestedRoute.target });
            apiProxy.on('error', (err) => {
                res.status(500).send('Something went wrong.');
                return;
            });
        }
        catch (error) {
            res.status(500);
            return;
        }
    });
    return { app: app, sslConfig: sslConfig };
};
const Server = (serverObject) => {
    const { app, sslConfig } = serverObject;
    if (app === undefined)
        throw "Express Proxy Server Required!";
    if (sslConfig === undefined)
        throw "SSL must be configurated.";
    // Starting http server
    const httpServer = http.createServer(app);
    const httpport = 80;
    httpServer.listen(httpport, () => {
        console.log('HTTP Server running');
    });
    // Starting https server
    const httpsServer = https.createServer(sslConfig, app);
    const httpsport = 443;
    httpsServer.listen(httpsport, () => {
        console.log('HTTPS Server running');
    });
};
module.exports = nodeProxy;
module.exports.Server = Server;
