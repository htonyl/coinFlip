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

module.exports = cron;
