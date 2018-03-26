import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Link } from 'react-router-dom'
import { Route } from 'react-router-dom'
import FirstPage from './components/firstPage'
import { Popup, Button, Transition, Menu, Label } from 'semantic-ui-react'
import AboutUs from './components/aboutUs'
import firebase from 'firebase'
import config from './key/keys.js'

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      current_price: null,
      changing: false
    }

    this.firebase = firebase.initializeApp(config);
    var bitcoinUrl = 'https://api.coindesk.com/v1/bpi/currentprice.json';
    let that = this;
    fetch(bitcoinUrl)
        .then(res => res.json())
        .then((out) => {
          that.setState({
            current_price: out,
            changing: !that.state.changing
          })
          console.log(out)
        })
        .catch(err => { throw err });
    var newsUrl = 'https://api.rss2json.com/v1/api.json?rss_url=http://feed.informer.com/digests/I2GGLAVR70/feeder.rss'
    fetch(newsUrl)
        .then(res => res.json())
        .then((out) => {
          var current = out.items[0];
          that.setState({
            news: out,
            newsIndex:0,
            currentNews: current
          })
          console.log(out);
        })
  }
  componentDidMount() {
    var intervalId = setInterval(this.timer.bind(this), 10000);
    this.setState({intervalId: intervalId});
    var intervalIdNews = setInterval(this.newsTimer.bind(this), 4000);
    this.setState({intervalIdNews: intervalIdNews});
  }

  componentWillUnmount(){
        // use intervalId from the state to clear the interval
        clearInterval(this.state.intervalId);
        clearInterval(this.state.intervalIdNews);
  }
  newsTimer(){
    this.setState({
      newsIndex: (this.state.newsIndex + 1)%10,
      currentNews: this.state.news.items[this.state.newsIndex]
    })
  }
  timer() {
        // setState method is used to update the statec
        let that = this;
        var bitcoinUrl = 'https://api.coindesk.com/v1/bpi/currentprice.json';
        fetch(bitcoinUrl)
        .then(res => res.json())
        .then((out) => {
          that.setState({
            current_price: out,
            changing: !that.state.changing
          })
          console.log(out)
        })
        .catch(err => { throw err });
    }
  render() {
    if(this.state.current_price && this.state.news){
    return (
      <BrowserRouter>
        <div>
        <Menu>
          <Menu.Item header><Link to ='/'>CoinFlip</Link> </Menu.Item>
          <Menu.Item name='aboutUs' ><Link to ='/ii'> Make Comments</Link> </Menu.Item>
          <Menu.Item name = 'Current Bitcoin Price: '>
          <Transition animation={'flash'} duration={200} visible={this.state.changing}>
          <div>
          <Label  color='teal' >
            EUR
            <Label.Detail>{this.state.current_price.bpi.EUR.rate}</Label.Detail>
          </Label>

          <Label  color='orange' >
            USD
          <Label.Detail>{this.state.current_price.bpi.USD.rate}</Label.Detail>
          </Label>
          </div>
          </Transition>
          </Menu.Item>
          <Menu.Item>
          <Popup
            trigger={<Button icon='newspaper' content={this.state.currentNews.title} style={{width:'700px'}}/>}
            header={'Author: '+this.state.currentNews.author}
            content={'Publish Date: '+this.state.currentNews.pubDate}
            on='hover'
            position='bottom left'
          />

          </Menu.Item>
          </Menu>
            <Route exact path="/" render={props =><FirstPage  firebase={this.firebase} {...props} />}/>
            <Route exact path="/ii" render={props =><AboutUs firebase={this.firebase}  {...props} />}/>

        </div>
      </BrowserRouter>
    );
  }else{
    return null;
  }
  }
}

export default App;
