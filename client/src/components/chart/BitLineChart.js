import React, { Component } from 'react';
import { Button } from 'semantic-ui-react'
import { Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceArea } from 'recharts';

class LineCharts extends Component {
    constructor(props) {
        super(props);
        let that = this;
        this.finalData = [...this.props.data];
        this.state = {
          data: this.finalData,
          loadPrediction: true,
          left: 'dataMin',
          right: 'dataMax',
          refAreaLeft: '',
          refAreaRight: '',
          top: 'dataMax+1',
          bottom: 'dataMin-1',
          top2: 'dataMax+20',
          bottom2: 'dataMin-20',
          animation: true
        }
        fetch('http://127.0.0.1:9000/api/predict')
        .then(res => res.json())
        .then((out) => {
            var original = this.state.data[0].high;
            var get_data = [];
            // eslint-disable-next-line
            out.res.map(function(d){
                get_data = get_data.concat({index: d.index, time: 0, high: Number(original*d.high).toFixed(2), low:Number(original*d.low).toFixed(2)});
            });
            get_data = get_data.reverse();
            console.log(get_data);
            this.finalData = [...get_data,...this.finalData];
            that.setState({loadPrediction: false});
            // that.setState({data: [...get_data,...this.state.data]} )
        })
        .catch(err => { throw err });
    }

    getAxisYDomain(from, to, ref, offset){
      try{
      var refData = this.finalData.slice(from, to);
      console.log(refData)
      console.log(refData)
      let [bottom, top] = [refData[0][ref], refData[0][ref]];
      refData.forEach(d => {
          if (d[ref] > top) top = d[ref];
          if (d[ref] < bottom) bottom = d[ref];
      });

      return [(bottom | 0) - offset, (top | 0) + offset]
    }catch(e){

    }
    };
    zoom() {
      try{
        let { refAreaLeft, refAreaRight } = this.state;

        if (refAreaLeft === refAreaRight || refAreaRight === '') {
            this.setState(() => ({
                refAreaLeft: '',
                refAreaRight: ''
            }));
            return;
        }

        // xAxis domain
        if (refAreaLeft > refAreaRight)
            [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
        // yAxis domain
        const [bottom, top] = this.getAxisYDomain(refAreaLeft+7, refAreaRight+7, 'low', 3000);
        const [bottom2, top2] = this.getAxisYDomain(refAreaLeft+7, refAreaRight+7, 'high', 3000);

        this.setState(() => ({
            refAreaLeft: '',
            refAreaRight: '',
            data: this.finalData.slice(),
            left: refAreaLeft,
            right: refAreaRight,
            bottom,
            top,
            bottom2,
            top2
        }));
      }catch(e){

      }
    };

    zoomOut() {
        const { data } = this.state;
        this.setState(() => ({
            data: data.slice(),
            refAreaLeft: '',
            refAreaRight: '',
            left: 'dataMin',
            right: 'dataMax',
            top: 'dataMax+2000',
            top2: 'dataMax+2000',
            bottom: 'dataMin+50'
        }));
    }
    setRefAreaLeft(ev){
      try{
        this.setState({refAreaLeft:ev.activeLabel})
      }catch(e){
      }
    }
    prediction(){
      let that = this;
      try{
        that.props.changeNum(this.finalData[6].high)
        this.setState({
          refAreaLeft: -7,
          refAreaRight: 24,
          data: this.finalData
        }, that.zoom());
      }catch(e){

      }
    }
    render() {
        const { data, left, right, refAreaLeft, refAreaRight, top, bottom } = this.state;

        return (
      <div className="highlight-bar-charts">
          <LineChart
            width={1200}
            height={400}
            data={data}
            onMouseDown = {this.setRefAreaLeft.bind(this)}
            onMouseMove = { (e) => this.state.refAreaLeft && this.setState({refAreaRight:e.activeLabel}) }
            onMouseUp = { this.zoom.bind( this ) }
          >
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis
              allowDataOverflow={true}
              dataKey="index"
              domain={[left, right]}
              type = "number"
            />
            <YAxis
              allowDataOverflow={true}
              domain={[bottom, top]}
              type="number"
              yAxisId="1"
             />
            <YAxis
              orientation="right"
              allowDataOverflow={true}
              domain={[bottom, top]}
              type="number"
              yAxisId="2"
             />
            <Tooltip/>
            <Legend />
            <Line yAxisId="1" type='natural' dataKey='low' stroke='#8884d8' animationDuration={300} dot={false}/>
            <Line yAxisId="2" type='natural' dataKey='high' stroke='#82ca9d' animationDuration={300} dot={false}/>

            {
            	(refAreaLeft && refAreaRight) ? (
              <ReferenceArea yAxisId="1" x1={refAreaLeft} x2={refAreaRight}  strokeOpacity={0.3} /> ) : null

            }
          </LineChart>
          <Button primary className="right floated" onClick={this.prediction.bind(this)} loading={this.state.loadPrediction}>Predict</Button>
          {React.cloneElement(this.props.children, { onClick: this.zoomOut.bind(this) })}
      </div>
    );
  }
}
    export default LineCharts;
