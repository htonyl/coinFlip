import React, { Component } from 'react';
import moment from 'moment'
import BitLineChart from './BitLineChart'
import { Loader,Dimmer,Container, Header, Button, Image} from 'semantic-ui-react'
import ListChart from './listChart'

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
            var historyData =  out.dataset.data;
            // eslint-disable-next-line
            historyData.map(function(data, index){
                let unixTime = moment(data[0], 'YYYY-MM-DD').unix();
                let high = data[2];
                let low = data[3];
                let finalData = {index: index, time: unixTime, high: high, low: low};
                that.finalHistoryData.push(finalData);
            })
            that.setState({
                data: that.finalHistoryData
            })
            console.log(that.finalHistoryData);
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
                <Header as='h2' icon textAlign='center'>
                <Image circular size='tiny' src='/image/bitcoinLogo.png' />{' '}
                    Bidcoin
                    <Header.Subheader>
                    Online Bitcoin Predictor and data analyzar
                    </Header.Subheader>
                </Header>
                <div style={{display: 'flex',alignItems: 'center',justifyContent: 'center'}}>
                <BitLineChart changeNum = {this.changeNum.bind(this)} style= {{margin: '0 auto'}} data = {this.state.data}><Button primary floated='right'>Zoom Out</Button></BitLineChart>
                </div>
                </Container>
            <div style={{display: 'flex',alignItems: 'center',justifyContent: 'center'}}>
                <ListChart num = {this.state.predictedNum} firebase = {this.props.firebase}/>
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
