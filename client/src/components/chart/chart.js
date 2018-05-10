import React, { Component } from 'react';
import moment from 'moment'
import BitLineChart from './BitLineChart'
import { Loader,Dimmer,Container, Header, Button, Image} from 'semantic-ui-react'
import ListChart from './listChart'
import NewsTable from './NewsTable'

class Chart extends Component {
    constructor(props) {
        super(props);
        this.state = {
          predictedNum: '__________'
        };

        this.historyURL = 'https://www.quandl.com/api/v3/datasets/BCHARTS/COINBASEUSD.json?api_key=Ld5Pj_h8zrsozT9ExZop&start_date=2017-01-14';
        this.finalHistoryData = [];
        let that = this;
        fetch(this.historyURL)
        .then(res => res.json())
        .then((out) => {
            let historyData =  out.dataset.data;
            // eslint-disable-next-line
            historyData.map(function(data, index){
                let date = moment(data[0], 'YYYY-MM-DD');
                let unixTime = date.unix();
                let high = data[2];
                let low = data[3];
                let finalData = {index: index, date: date._i, time: unixTime, high: high, low: low};
                that.finalHistoryData.push(finalData);
            })
            that.setState({
                data: that.finalHistoryData
            })
        })
        .catch(err => { throw err });
    }

    changeNum(num){
      this.setState({
        predictedNum:num
      })
    }

    render() {
        if(this.state.data){
        return (
            <div>
                <Container>
                <div style={{display: 'flex',alignItems: 'center',justifyContent: 'center'}}>
                <BitLineChart
                  changeNum={this.changeNum.bind(this)}
                  style={{margin: '0 auto'}}
                  data={this.state.data}>
                  <Button primary floated='right' style={{margin: '8px 0'}}>Zoom Out</Button>
                </BitLineChart>
                </div>
                </Container>
                <div style={{display: 'flex',alignItems: 'center',justifyContent: 'center'}}>
                    <NewsTable predictedPOC={1.12} currentPrice={this.state.data[0]} firebase={this.props.firebase}/>
                </div>
            </div>
        );
        }else{
            return (
            <Dimmer active>
            <Loader content='Loading' />
            </Dimmer>)
        }
    }
}

export default Chart;
