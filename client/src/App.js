import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Link } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { Popup, Button, Transition, Menu, Label } from 'semantic-ui-react'
import Comments from './components/Comments'
import Landing from './components/Landing'
import firebase from 'firebase'
import config from './key/keys.js'

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      current_price: null,
      changing: false
    }

    // Initialize firebase
    this.firebase = firebase.initializeApp(config);

    // Get current price
    var bitcoinUrl = 'https://api.coindesk.com/v1/bpi/currentprice.json';
    let that = this;
    fetch(bitcoinUrl)
    .then(res => res.json())
    .then((out) => {
      that.setState({
        current_price: out,
        changing: !that.state.changing
      })
    })
    .catch(err => { throw err });
  }

  componentDidMount() {
    // Update price every 10 seconds & Slide news every 4 seconds
    let intervalId = setInterval(this.handleUpdatePrice.bind(this), 10000);
    let intervalIdNews = setInterval(this.handleSlideNews.bind(this), 4000);
    this.setState({
      intervalIdNews: intervalIdNews,
      intervalId: intervalId
    });

    // Get recent news from firebase for header bar display
    this.firebase.database().ref('scoredNews').on("value", (snap)=>{
      let val = snap.val();
      let news = Object.keys(val).map((elem)=>val[elem]);
      this.setState({
        news: news,
        newsIndex: 0,
        currentNews: news[0]
      });
    });
  }

  componentWillUnmount(){
    // use intervalId from the state to clear the interval
    clearInterval(this.state.intervalId);
    clearInterval(this.state.intervalIdNews);
  }

  handleSlideNews(){
    let newsIndex = (this.state.newsIndex + 1) % this.state.news.length;
    this.setState({
      newsIndex: newsIndex,
      currentNews: this.state.news[newsIndex]
    })
  }

  handleUpdatePrice() {
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
          <Menu.Item name='aboutUs' ><Link to ='/comments'> Make Comments</Link> </Menu.Item>
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
            content={'Publish Date: '+this.state.currentNews.time}
            on='hover'
            position='bottom left'
          />

          </Menu.Item>
          </Menu>
            <Route exact path="/" render={props =><Landing firebase={this.firebase} {...props} />}/>
            <Route exact path="/comments" render={props =><Comments firebase={this.firebase} {...props} />}/>

        </div>
      </BrowserRouter>
    );
  }else{
    return null;
  }
  }
}

export default App;
