const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const { getLinkedinId, postShare, registerImage, uploadImage } = require('./linkedinConnection');
const { _request } = require('./globaldata');
const dt = require('./globaldata.js').data;
require('dotenv').config();

const app = express();
const router = express.Router();

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(cors());
app.use(cors({
    origin: 'https://linke-st.herokuapp.com'
}));

router.get('/', cors(), async (req, res) => {
    res.json('This is working');
    
});

router.get('/home', cors(), async(req, res) => {
    const pathUrl = dt.auth_url(dt.response_type, dt.client_id, dt.redirect_uri,dt.state, dt.scope);
    res.send(pathUrl);
})
router.options('/image', cors());
router.post('/image', cors(), async (req, res) => {
    const {img, certType, level} = req.body;
    const textValue = (level) => {
        let text;
        switch (level) {
        case '1':
            text = 'Compartilho com vocês o meu "start" de processos criativos e colaboração. Com STRATEEGIA vi as minhas ideias saírem do zero para dar os primeiros passos rumo ao futuro. Faça como eu e comece agora mesmo.'
            break;
        case '2': 
            text = 'Compartilho com vocês o meu desenvolvimento em processos criativos e colaboração incrível. Com STRATEEGIA consegui superar etapas e desenvolver novas ideias. Quer idealizar um novo projeto ou construir uma ideia do zero? Use STRATEEGIA. Faça como eu e comece agora mesmo.'
            break;
        case '3':
            text = 'UHUUU! Consegui destravar minhas habilidades estratégicas. Compartilho com vocês o meu desenvolvimento em processos criativos e colaboração incrível. STRATEEGIA, onde a sua ideia sai do ZERO. O que você pode começar hoje?'
            break;
        default: '';
            break;
        }
    
        return text;
    }

    global.data = {img, text: textValue(level)};
})

router.options('/token', cors());
router.post('/token', cors(), async (req, res) => {
    const {code, state} = req.body;
    const pathQ = dt.path_query(code, dt.client_id, dt.redirect_uri, dt.client_secret);
    const body = '';
    _request(dt.method, dt.hostname, dt.path(pathQ), dt.headers, body)
        .then(r => {
            if(r.status == 200){
                const access_token = (JSON.parse(r.body).access_token);
                getLinkedinId(access_token).then(ownerId => {
                    registerImage(access_token, ownerId).then(r => {
                        const uploadUrl = JSON.parse(r.body).value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
                        const asset = JSON.parse(r.body).value.asset;
                        const img = global.data.img;
                        const txt = global.data.text;
                        uploadImage(access_token, img, uploadUrl).then(r => {
                            console.log(r);
                            postShare(access_token, ownerId, txt, asset).then(res => {
                                postResp(res.status)
                            })
                            .catch(e => console.log(e))
                        })
                    }).catch(e => console.log(e));
                }).catch(e => console.log(e));
            }
            else {
                console.log('ERROR - ' + r.status + JSON.stringify(r.body))
                res.writeHead(r.status, {'content-type': 'text/html'});
                res.write(r.status + ' Internal Server Error');
                res.end();
            }
        });
    
})
const postResp = (response) => router.get('/token', cors(), async (req, res) => {
    let wasPosted;
    response === 201 ? wasPosted = true : wasPosted = false;
    res.send(wasPosted);
})

app.use('/.netlify/functions/app', router);

module.exports.handler = serverless(app);
