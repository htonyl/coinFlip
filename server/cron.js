const firebase = require('firebase');
const htmlparser = require('htmlparser2');
const axios = require('axios');

require('dotenv').config();

function parseLongest(doc) {
  let parsed = '';
  const parser = new htmlparser.Parser({
  	ontext: function(text){
      if (text.length > parsed.length)
        parsed = text;
  	},
  }, { decodeEntities: true });
  parser.write(doc);
  return parsed;
}

function rss2jsonHandler(url, callback) {
  return axios.get(url)
    .then(res => res.data.items)
    .then(callback)
    .catch((e) => {
      console.error(e);
    });
}

const firebaseApp = firebase.initializeApp({
    apiKey: process.env.FIREBASE_KEY,
    authDomain: "bidcoin-server.firebaseapp.com",
    databaseURL: "https://bidcoin-server.firebaseio.com",
    projectId: "bidcoin-server",
    storageBucket: "bidcoin-server.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
});

/**
  * Default singleton implementation.
  */
function cron() {
  if (cron._instance) {
      return ajax._instance;
  }
  cron._instance = this;
};

cron.crawlNewsSource = () => {
  let pms = [];
  let news = [];

  const cryptocurrencynewsRssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fcryptocurrencynews.com%2Ffeed%2F';
  pms.push(rss2jsonHandler(cryptocurrencynewsRssUrl, (json) => {
    let res = json.map((elem)=>{
      let desc = parseLongest(elem.description);
      return {
        title: elem.title,
        time: elem.pubDate,
        url: elem.guid,
        author: elem.author,
        description: desc,
        source: 'cryptocurrencynews'
      };
    });
    news = news.concat(res);
  }));

  Promise.all(pms)
  .then((v)=>{
    console.log('Cron: Firebase scoredNews/ update disabled!');
    // news.forEach((elem) => {
      // firebaseApp.database().ref('scoredNews').push().set({
      //   title: elem.title,
      //   time: elem.time,
      //   url: elem.url,
      //   author: elem.author,
      //   description: elem.description,
      //   source: elem.source,
      //   score: -1
      // });
    // });
  });
  return news;
};

cron.crawlSocialSource = () => {
  let pms = [];
  let posts = [];
  const redditbitcoinRssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.reddit.com%2Fr%2Fbitcoin%2F.rss';
  pms.push(rss2jsonHandler(redditbitcoinRssUrl, (json) => {
    let res = json.map((elem)=>{
      return {
        title: elem.title,
        time: elem.pubDate,
        url: elem.link,
        author: elem.author,
        source: "reddit-bitcoin"
      };
    });
    posts = posts.concat(res);
    return res;
  }));

  const redditcryptocurrencyRssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.reddit.com%2Fr%2Fcryptocurrency%2F.rss';
  pms.push(rss2jsonHandler(redditcryptocurrencyRssUrl, (json) => {
    let res = json.map((elem)=>{
      return {
        title: elem.title,
        time: elem.pubDate,
        url: elem.link,
        author: elem.author,
        source: "reddit-cryptocurrency"
      };
    });
    posts = posts.concat(res);
    return res;
  }));

  Promise.all(pms)
  .then((v)=>{
    console.log('Cron: Firebase scoredPosts/ update disabled!');
    // posts.forEach((elem) => {
    //   firebaseApp.database().ref('scoredPosts').push().set({
    //     title: elem.title,
    //     time: elem.time,
    //     url: elem.url,
    //     author: elem.author,
    //     source: elem.source,
    //     score: -1
    //   });
    // });
  });
  return posts;
};

const spawn = require('child_process').spawn;
cron.predictEach = (refName) => {
  firebase.database().ref(refName).once('value', function(snap){
    let ref = firebase.database().ref(refName);
    let keys = Object.keys(snap.val());
    let titles = keys.map((elem)=>{
      let v = snap.val()[elem];
      let x = v.title.concat(v.description);
      return x.split(" ").join(",");
    });
    let p = [0.7149973,0.71972513,0.82163894,0.9212881,0.6626796,0.88491166,0.8252516,1.0542636,0.94811213,0.87587315, 0.84287417,0.86606103,0.75775564,0.93446267,0.85360765,0.9223426,1.027064];
    let predict_ps = spawn('python3', ['../prediction/predict.py', titles.join("|")]);
    predict_ps.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    // for (var i = 0; i < keys.length; i++){
    //   ref.child(keys[i]).update({ score: p[i] });
    // }
  });
};

cron.predict = () => {
  firebase.database().ref('scoredNews').once('value', function(snap){
    let keys = Object.keys(snap.val());
    let titlesN = keys.map((elem)=>{
      let v = snap.val()[elem];
      // let x = v.title.concat(v.description);
      let x = v.title;
      return x.split(" ").join(",");
    });
    let scores = keys.map((elem)=>snap.val()[elem].score);
    firebase.database().ref('scoredNews').once('value', function(snap){
      let keys = Object.keys(snap.val());
      let titlesP = keys.map((elem)=>{
        let v = snap.val()[elem];
        let x = v.title;
        return x.split(" ").join(",");
      });
      scores = scores.concat(keys.map((elem)=>snap.val()[elem].score));
      console.log(scores, scores.join(","));
      let titles = titlesN.concat(titlesP);
      console.log(titles.length);
      let predict_ps = spawn('python3', ['../prediction/predict.py', titles.join("|")]);
      predict_ps.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
      });
    });
  });
  // firebaseApp.database().ref('predictions').push().set({
  //   timestamp: Date.now(),
  //   type: 'daily',
  //   value:
  // });
}
module.exports = cron;
