import React, { Component } from 'react';
import { Statistic, Header } from 'semantic-ui-react'
import { RadialBarChart, RadialBar, Label } from 'recharts';

const captionStyle = {
  textAlign: 'right',
  fontStyle: 'italic',
  fontWeight: 'lighter',
  color: 'gray'
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
      let price = (this.props.predictedPOC*this.props.currentPrice.high).toFixed(2);
      let color = this.props.predictedPOC >= 1 ? '#21ba45' : '#db2828';
      return (
        <div>
          <Header>Predicted Price Change (Daily)</Header>
          <div style={captionStyle}>Last updated: 2018-20-30-123</div>
          <Statistic.Group horizontal>
          <Statistic horizontal>
              <Statistic.Value style={{color:color}}>{poc}%</Statistic.Value>
              <Statistic.Label>Predicted Price ($USD): {price}</Statistic.Label>
          </Statistic>
          </Statistic.Group>
        </div>
      );
    }
}

export default Prediction;
