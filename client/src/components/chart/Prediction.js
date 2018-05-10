import React, { Component } from 'react';
import { Statistic, Header } from 'semantic-ui-react'
import { RadialBarChart, RadialBar, Label } from 'recharts';

const captionStyle = {
  textAlign: 'right',
  fontStyle: 'italic',
  fontWeight: 'lighter',
  color: 'gray',
  display: 'inline-block',
  position:'absolute',
  right: 0,
  bottom:0
};

class Prediction extends Component {
    constructor(props) {
        super(props);
        this.firebase = this.props.firebase;
    }

    render() {
      let poc = ((this.props.predictedPOC-1)*100).toPrecision(4);
      if(this.props.predictedPOC >= 1)
        poc = "+" + poc;
      let currPrice = this.props.currentPrice ? parseFloat(this.props.currentPrice.replace(",","")) : 0;
      let price = (this.props.predictedPOC*currPrice).toFixed(2);
      let color = this.props.predictedPOC >= 1 ? '#21ba45' : '#db2828';
      return (
        <div style={{margin:'auto', width:'80%', position:'relative'}}>
          <Statistic.Group horizontal style={{display: 'inline-block'}}>
            <Statistic>
              <Header style={{display: 'inline-block'}}>Predicted Price Change (Daily):</Header>
            </Statistic>
            <Statistic style={{margin:'0 12px'}}>
              <Statistic.Value style={{color:color}}>{poc}%</Statistic.Value>
              <Statistic.Label>Predicted price: {price} ($USD)</Statistic.Label>
            </Statistic>
          </Statistic.Group>
          <div style={captionStyle}>Last updated: 2018-20-30-123</div>
        </div>
      );
    }
}

export default Prediction;
