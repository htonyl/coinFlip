import React, { Component } from 'react';
import { Statistic,Header} from 'semantic-ui-react'
import { RadialBarChart, RadialBar, Label} from 'recharts';

// const style = {
//     top: 0,
//     left: 350,
//     lineHeight: '24px'
// };

class ListChart extends Component {
    constructor(props) {
        super(props);
        let that = this;
        this.state = {
            duration: 50,
            techdata:[
                {name: 'AI Prediction', uv: 80.69, fill: '#f2711c'},
              ],
            communitydata:[
                {name: 'AI Prediction', uv: 62.55, fill: '#f2711c'},
            ],
            newsdata:[
                {name: 'AI Prediction', uv: 18.67, fill: '#f2711c'},
            ]
        };
        this.firebase = this.props.firebase;
        this.firebase.database().ref('userInfo').once('value',function(snap){
            that.setState({
                numofUser: snap.val().predictionNum,
                technology: snap.val().technology,
                community:snap.val().community,
                news:snap.val().news,
            },function(){
                that.setState({
                    techdata: [
                     {name: 'Num. of Users to predict', uv: this.state.numofUser,fill: '#6435c9'},
                     {name: 'User Prediction', uv: this.state.technology/this.state.numofUser, fill: '#00b5ad'},
                     ...this.state.techdata,
                    ],
                    communitydata: [
                        {name: 'Num. of Users to predict', uv: this.state.numofUser,fill: '#6435c9'},
                        {name: 'User Prediction', uv: this.state.community/this.state.numofUser, fill: '#00b5ad'},
                        ...this.state.communitydata,
                    ],
                    newsdata: [
                        {name: 'Num. of Users to predict', uv: this.state.numofUser,fill: '#6435c9'},
                        {name: 'User Prediction', uv: this.state.news/this.state.numofUser, fill: '#00b5ad'},
                        ...this.state.newsdata,
                    ],
                });
            })
        })
    }
    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    render() {
        var techdata =this.state.techdata;
        var newsdata = this.state.newsdata;
        var communitydata = this.state.communitydata;
        return (
            <table style = {{width:'80%'}}>
                <tr>
                    <th>
                        <Header>Technology</Header>

                        <RadialBarChart width={250} height={150} cx='50%' cy={150} innerRadius="20%" outerRadius="200%" barSize={10} data={techdata} startAngle={180} endAngle={0}>
                        <RadialBar label={{ fill: '#666', position: 'insideStart' }} minAngle={15}  background clockWise={false} dataKey='uv'/>
                        <Label> any string or number</Label>
                        </RadialBarChart>

                    </th>
                    <th>
                        <Header>News</Header>
                        <RadialBarChart width={250} height={150} cx='50%' cy={150} innerRadius="20%" outerRadius="200%" barSize={10} data={newsdata} startAngle={180} endAngle={0}>
                        <RadialBar label={{ fill: '#666', position: 'insideStart' }} minAngle={15}  background clockWise={false} dataKey='uv'/>
                        </RadialBarChart>
                    </th>
                    <th>
                        <Header>Community</Header>
                        <RadialBarChart width={250} height={150} cx='50%' cy={150} innerRadius="20%" outerRadius="200%" barSize={10} data={communitydata} startAngle={180} endAngle={0}>
                        <RadialBar label={{ fill: '#666', position: 'insideStart' }} minAngle={15}  background clockWise={false} dataKey='uv'/>
                        </RadialBarChart>
                    </th>
                    <th>
                        <Header>Predicted Price (Tomorrow)</Header>
                        <Statistic.Group horizontal>

                        <Statistic horizontal>
                            <Statistic.Value>{this.props.num}</Statistic.Value>
                            <Statistic.Label>AI Prediction ($USD)</Statistic.Label>
                        </Statistic>

                        </Statistic.Group>

                    </th>

                </tr>
            </table>

        );
    }
}

export default ListChart;
