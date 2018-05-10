import React, { Component } from 'react';
import {Label, Button, Segment} from 'semantic-ui-react'
import Chart from './chart/chart'
import Prediction from './chart/Prediction'

class Landing extends Component {
  constructor(props){
    super(props);
    this.state = {
      visChat:'none'
    };
    this.firebase  = this.props.firebase;
  }

  handleContextRef = contextRef => this.setState({ contextRef })

  handleChatBot(){
    if(this.state.visChat === 'block'){
      console.log(this.state.visChat)
      this.setState({
        visChat: 'none'
      })
    } else{
      this.setState({
        visChat: 'block'
      })
    }
  }

  render() {
    var tempstyle = {
      display:this.state.visChat,
      backgroundColor: 'white'
    }
    return (
      <div ref={this.handleContextRef}>
        <Prediction predictedPOC={1.04321} currentPrice={this.props.currentPrice} firebase={this.firebase}></Prediction>
        <Chart firebase = {this.firebase}/>
        <Segment inverted size='mini' style={{margin: 0, position:'fixed', bottom: 0, width: '100%'}}>
        <Button size='mini' primary onClick={this.handleChatBot.bind(this)}>Chatbot</Button>
        <Label color = 'orange' horizontal>AI Prediction Value (%)</Label>
        <Label color = 'teal' horizontal>Users Grading Value (%)</Label>
        <Label color = 'violet' horizontal>Num. of Users</Label>
        </Segment>
        <div id="floatframe" style={tempstyle}>
        <iframe title="#" style={{backgroundColor: 'white',float: 'right',height:'480px', width:'402px'}} src='https://webchat.botframework.com/embed/bidcoin?s=tdMyK9xpnuI.cwA.7I0.hHbCLkzuouhdbHoG9lO0ziuxVP0C70Tw7Bi8-QJgi8U'></iframe>
        </div>
      </div>
    );
  }
}

export default Landing;
