import React, { Component } from 'react';
import {Label, Button, Segment, Header} from 'semantic-ui-react'
import Chart from './chart/chart'

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
      <div ref={this.handleContextRef} style={{paddingBottom: '52px'}}>
        <Header style={{fontSize:'2em', width:'80%', margin:'auto', padding:'4px 36px'}}>Bitcoin</Header>
        <Chart currentPrice={this.props.currentPrice} firebase={this.firebase}/>
        <Segment inverted size='mini' style={{margin: 0, position:'fixed', bottom: 0, width: '100%'}}>
        <Button size='mini' primary style={{marginRight:18}} onClick={this.handleChatBot.bind(this)}>Chat with us!</Button>
        <Label color='orange' horizontal>Risk: 11.38%</Label>
        <Label color='teal' horizontal>Sample: 10 / 19</Label>
        { false &&
          <div>
            <Label color = 'orange' horizontal>AI Prediction Value (%)</Label>
            <Label color = 'teal' horizontal>Users Grading Value (%)</Label>
            <Label color = 'violet' horizontal>Num. of Users</Label>
          </div>
        }
        </Segment>
        <div id="floatframe" style={tempstyle}>
        <iframe title="#" style={{backgroundColor: 'white',float: 'right',height:'480px', width:'402px'}} src='https://webchat.botframework.com/embed/bidcoin?s=tdMyK9xpnuI.cwA.7I0.hHbCLkzuouhdbHoG9lO0ziuxVP0C70Tw7Bi8-QJgi8U'></iframe>
        </div>
      </div>
    );
  }
}

export default Landing;
