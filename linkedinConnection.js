'use-strict'

const _request = require('./globaldata')._request;
require('isomorphic-fetch');


exports.getLinkedinId = (accessToken) => {
    return new Promise((res, rej) => {
        let hostname = 'api.linkedin.com';
        let path = '/v2/me';
        let method = 'GET';
        let headers = {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'X-Restli-Protocol-Version': '2.0.0'
        };
        let body = ''
        _request(method, hostname, path, headers, body).then(r => {
            res(JSON.parse(r.body).id)
        }).catch(e => rej(e))
    })
}

exports.postShare = (accessToken, ownerId, text, asset) => {
    return new Promise((res, rej) => {
        let hostname = 'api.linkedin.com';
        let path = '/v2/ugcPosts';
        let method = 'POST';
        let body = {
            "author": `urn:li:person:${ownerId}`,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": text
                    },
                    "shareMediaCategory": "IMAGE",
                    "media": [
                        {
                            "status": "READY",
                            "description": {
                                "text": "Center stage!"
                            },
                            "media": `${asset}`,
                            "title": {
                                "text": "LinkedIn Talent Connect 2021"
                            }
                        }
                    ]
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        let headers = {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
            'x-li-format': 'json',
            'Content-Length': Buffer.byteLength(JSON.stringify(body))
        };
        _request(method, hostname, path, headers, JSON.stringify(body)).then(r => {
            res(r);
        }).catch(e => rej(e))
    })
    
}

exports.registerImage = (accessToken, ownerId) => {
    return new Promise((res, rej) => {
        const hostname = 'api.linkedin.com';
        const path = '/v2/assets?action=registerUpload';
        const method = 'POST';
        const body = {
            "registerUploadRequest": {
                "recipes": [
                    "urn:li:digitalmediaRecipe:feedshare-image"
                ],
                "owner": `urn:li:person:${ownerId}`,
                "serviceRelationships": [
                    {
                        "relationshipType": "OWNER",
                        "identifier": "urn:li:userGeneratedContent"
                    }
                ],
                supportedUploadMechanism: ['SYNCHRONOUS_UPLOAD'],
            }
        }
        const headers = {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
            'x-li-format': 'json',
            'Content-Length': Buffer.byteLength(JSON.stringify(body))
        };
        _request(method, hostname, path, headers, JSON.stringify(body)).then(r => {
            res(r);
        }).catch(e => rej(e))
    })
}

exports.uploadImage = async (accessToken, bodyCont, pathw) => {
        try {

            const img = Buffer.from(bodyCont.split(";base64,").pop(),"base64")
            console.log(img)
            
            var requestOptions = {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'cache-control': 'no-cache',
                    'X-Restli-Protocol-Version': '2.0.0',
                    'Content-Type': 'application/octet-stream',
                    'x-li-format': 'json',
                    'Content-Length': Buffer.byteLength(JSON.stringify(bodyCont))
                },
                body: img,
                redirect: 'follow'
            };

            return await fetch(pathw,requestOptions)
            .then(function(uploadResponse){
                console.log(uploadResponse)
                return JSON.parse(`{"size":${uploadResponse.size},"timeout":${uploadResponse.timeout}}`)
            })
            .catch(error => console.log(`Image upload error fetch: ${error}`))
        } catch (error) {
            console.log(`Image upload error: ${error}`)
        }
        
  

}