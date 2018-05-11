import React, { Component } from 'react';
import { Statistic, Header } from 'semantic-ui-react'
import { RadialBarChart, RadialBar, Label } from 'recharts';

const captionStyle = {
  textAlign: 'right',
  fontStyle: 'italic',
  fontWeight: 'lighter',
  color: 'gray',
  position:'absolute',
  right:0
};

class Prediction extends Component {
    constructor(props) {
        super(props);
        this.state = {
          updateTime: 'nil',
          prediction: 1
        };
        this.firebase = this.props.firebase;
    }

    componentDidMount() {
      this.props.firebase.database().ref('predictions').once('value', (snap)=>{
        let val = snap.val()
        let preds = Object.keys(val).map((elem)=>val[elem]);
        let pred = preds[0];
        this.setState({
          updateTime: new Date(pred.timestamp).toDateString(),
          prediction: pred.value
        });
      });
    }

    render() {
      let pred = this.state.prediction;
      let poc = ((pred-1)*100).toPrecision(4);
      if(pred >= 1) poc = "+" + poc;
      let currPrice = this.props.currentPrice ? parseFloat(this.props.currentPrice.replace(",","")) : 0;
      // let currPrice = this.props.currentPrice.high;
      let price = (pred*currPrice).toFixed(2);
      let color = pred >= 1 ? '#21ba45' : '#db2828';
      return (
        <div style={{padding:'20px 20px 10px 20px', position:'relative'}}>
          <Statistic.Group horizontal style={{display:'block', position:'relative'}}>
            <Statistic>
              <Header style={{display: 'inline-block', fontSize:'1.6em', fontWeight:'bold'}}>Predicted Price Change (Daily):</Header>
            </Statistic>
            <Statistic style={{margin:'0 12px'}}>
              <Statistic.Value style={{color:color}}>{poc}%</Statistic.Value>
            </Statistic>
            <Statistic>
              <Statistic.Label>/ ${price} USD</Statistic.Label>
            </Statistic>
            <Statistic>
              <Statistic.Label style={captionStyle}>Last updated: {this.state.updateTime}</Statistic.Label>
            </Statistic>
          </Statistic.Group>
        </div>
      );
    }
}

export default Prediction;
