
const https = require('https');
require('dotenv').config();

exports.data = {
    auth_base_url: process.env.AUTH_BASE_URL,
    client_id: process.env.CLIENT_ID, //client
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: process.env.REDIRECT_URI, //redURI
    response_type: 'code', //resp
    state: Math.random(), // WARNING: using weak random value for testing ONLY
    scope: 'r_liteprofile r_emailaddress w_member_social',
    
    auth_url: (resp, client, redURI, state, scope) => 'https://linkedin.com/oauth/v2/authorization?response_type=' + resp + '&client_id=' + client + '&redirect_uri=' + encodeURIComponent(redURI) + '&state=' + state + '&scope=' + encodeURIComponent(scope),

    path_query: (code, client, redURI, secret,) => "grant_type=authorization_code&" + "code=" + code + "&" +"redirect_uri=" + encodeURIComponent(redURI) + "&" + "client_id=" + client + "&" + "client_secret=" + secret,
    method: 'POST',
    hostname: 'www.linkedin.com',
    path: (qr_path) => '/oauth/v2/accessToken?' + qr_path,
    headers: {
        "Content-Type": "x-www-form-urlencoded"
    },

}

exports._request = (method, hostname, path, headers, body) => {
    return new Promise((resolve, reject) => {
        let reqOpts = {
            method,
            hostname,
            path,
            headers,
            "rejectUnauthorized": false // WARNING: accepting unauthorised end points for testing ONLY
        };
        let resBody = "";
        let req = https.request(reqOpts, res => {
            res.on('data', data => {
                resBody += data.toString('utf8');
            });
            res.on('end', () => {
                resolve({
                    "status": res.statusCode,
                    "headers": res.headers,
                    "body": resBody
                })
            });
        });
        req.on('error', e => {
            reject(e);
        });
        if (method !== 'GET') {
            req.write(body);
        }
        req.end();
    })
}


// exports.data = data;