// server/app.js
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const https = require('https');
const axios = require('axios');
const app = express();
const cors = require('cors');
const cronJobs = require('./cron.js');

require('dotenv').config();

const axiosTextAnalysisAPI = axios.create({
    baseURL: 'https://westus.api.cognitive.microsoft.com',
    headers: { 'Ocp-Apim-Subscription-Key': process.env.AZURE_TEXT_KEY_1 },
});
const axiosMlAPI = axios.create({
    baseURL: 'https://ussouthcentral.services.azureml.net/workspaces/c7388f7ba8d44cdea621167d7842481f/services/99e6accc206b4d5bb2725fc950e4ac08/execute?api-version=2.0&details=true',
    headers: { 'Authorization': 'Bearer ' + process.env.AZURE_ML_KEY },
});
app.use(cors());

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

// Register cron jobs
cronJobs.crawlNewsSource();
cronJobs.crawlSocialSource();
cronJobs.predict();
setInterval(cronJobs.crawlNewsSource, 60*60*24*1000);
setInterval(cronJobs.crawlSocialSource, 60*60*1000);

const spawn = require('child_process').spawn;
const axiosRSSAPI = axios.create({
    baseURL: "https://api.rss2json.com/v1/api.json?rss_url=http://feed.informer.com/digests/I2GGLAVR70/feeder.rss",
    headers: {"Access-Control-Allow-Origin":'http://localhost:3000', "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept"}
});

app.get('/api/predict', (req, res) => {
    axiosRSSAPI.get("")
        .then((response) => {
            var data = response.data.items;
            var titles = [];
            for (var i = 0; i < data.length; i++) {
                titles = titles.concat(data[i].title.split(" ").join(","));
            }
            var predict_ps = spawn('python3', ['../prediction/predict.py', titles.join("|")]);

            predict_ps.stdout.on('data', (data) => {
                var pred = data.toString().split(",");
                var response = [];
                for (var i = 0; i < pred.length; i++) {
                    response = response.concat({
                        index: -(i + 1),
                        time: 0,
                        high: parseFloat(pred[i]),
                        low: pred[i] * Math.pow(0.987, i + 1)
                    });
                }
                console.log(`stdout: ${data}`);
                res.send({ res: response });
            });

            predict_ps.stderr.on('data', (data) => {
                console.log(`stderr: ${data}`);
            });

            predict_ps.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
            });

        });
});

app.get('/api/azure', (req, res) => {
    axiosMlAPI.post("", data)
        .then((response) => {
            res.send({
                res: response.data,
            });
        }).catch(function(error) {
            console.error(error);
        });
});

app.get('/api/sentiment', (req, res) => {
    const textApiPath = '/text/analytics/v2.0/sentiment';

    axiosTextAnalysisAPI.post(textApiPath, documents)
        .then((response) => {
            res.send({
                data: documents,
                res: response.data,
            });
        }).catch(function(error) {
            console.error(error)
        });
});

app.get('/api/keyphrases', (req, res) => {
    const kpApiPath = '/text/analytics/v2.0/keyPhrases';

    axiosTextAnalysisAPI.post(kpApiPath, documents)
        .then((response) => {
            res.send({
                data: documents,
                res: response.data,
            });
        }).catch(function(error) {
            console.error(error)
        });
});

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
    res.send({ res: 'Welcome to CoinFlip backend!' });
});

module.exports = app;
