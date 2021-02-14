# node-reverse-proxy

This package allows multiple web servers to run on the same server by mapping internal ports to external domain/subdomain (see below axample in routes),  
🔒 it also allows all internal servers to have ssl without extra config for each server (note ssl only works for 1 domain and its sub domains) 

👉 To install this package run `npm i ShawnCockburn/node-reverse-proxy`

👉 1. Create the 'config.json' file in the root directory  
Example route object:
```
{
    "routes":{
        "shawncockburn_co_uk": {
            "host": "shawncockburn.co.uk",
            "target": "http://localhost:8000"
        },
        "blog_shawncockburn_co_uk": {
            "host": "blog.shawncockburn.co.uk",
            "target": "http://localhost:4001"
        }
    }
}
```

👉 2. create your SSL directory '/ssl/' and put your ssl certificates in there (WARNING: make sure this is not in a public repository!!😱)
It should look somehting like this:  
![image off ssl folder](https://i.imgur.com/5KpyxOy.png)


👉 3. Create your server file:  
```

const config = require("./config.json");
const fs = require('fs');
const nodeReverseProxyServer = require("node-reverse-proxy");

const key = fs.readFileSync('./ssl/private_key.key', 'utf8');
const cert = fs.readFileSync('./ssl/ssl_certificate.cer', 'utf8');
const ca = fs.readFileSync('./ssl/ssl_intermediate_certificate.cer', 'utf8');

const serverObject = nodeReverseProxyServer({
    routes: Object.values(config.routes),
    sslConfig: {
        key: key,
        cert: cert,
        ca: ca
    },
    forceSSL: true
});

//hide express
serverObject.app.disable('x-powered-by');

nodeReverseProxyServer.Server(serverObject);
```

👉 Finally run `sudo node index.js`


Feel free to drop a PR if you have any improvements/features
