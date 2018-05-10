import React, { Component } from 'react';
import { Statistic, Header, List, Popup, Button} from 'semantic-ui-react'
import { RadialBarChart, RadialBar, Label} from 'recharts';
import Prediction from './Prediction';
import NewsTableRow from './NewsTableRow';

class NewsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
          news: [],
          posts: [],
          active: true,
          topk: [],
          topkIdx: 0
        };

        let that = this;
        this.firebase = this.props.firebase;
        this.firebase.database().ref('scoredNews').once('value', (snap) => {
          let val = snap.val();
          let news = Object.keys(val).map(elem => val[elem]);
          that.setState({ news: news }, ()=>that.sortTopk(true));
        });
        this.firebase.database().ref('scoredPosts').once('value', (snap) => {
          let val = snap.val();
          let posts = Object.keys(val).map(elem => val[elem]);
          that.setState({ posts: posts }, ()=>that.sortTopk(true));
          console.log(posts);
        });
        this.handleClick = this.handleClick.bind(this)
    }

    sortTopk(pos){
        const k = 5;
        let topk = this.state.posts.concat(this.state.news);
        if(pos){
          topk.sort((a,b) => b.score-a.score);  
        }else{
          topk.sort((a,b) => a.score-b.score);
        }
        // Split sorted news & posts into batches of size k
        let topkSplit = [];
        for(var i = 1; i*k < topk.length; i++){
          topkSplit.push(topk.slice(k*(i-1), k*i));
        }
        topkSplit.push(topk.slice(topk.length-k, topk.length));
        console.log(topkSplit);
        this.setState({
          topk: topkSplit
        });
    }

    handleClick(){
      this.setState({ active: !this.state.active})
      if(this.state.active){
        this.sortTopk(false)
      }else{
        this.sortTopk(true)
      }
    }

    render() {
      const { active } = this.state
      let topk = this.state.topk.length ? this.state.topk[this.state.topkIdx] : [];
      return (
          <table style={{width:'100%', paddingTop: "24px"}}>
            <thead>
              <tr>
                <th style={{width:'100%', padding:'10px 20px', backgroundColor:'#F9F9F9', textAlign:'left', fontSize: 24}}>
                  Top News / Posts
                  <Button color='red' toggle active={active} onClick={this.handleClick} size='tiny' floated='right'>
                    Toggle
                  </Button>
                </th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th style={{width:'100%', padding:'0 20px 10px 20px', margin:'0 10px', backgroundColor:'#F9F9F9'}}>
                  <List>
                    {
                      topk.map((elem)=>{
                        return (
                          <List.Item>
                            <Popup
                              trigger={<NewsTableRow item={elem}></NewsTableRow>}
                              content='Hide the popup on any scroll event'
                              on='click'
                              hideOnScroll
                            />
                          </List.Item>
                        );
                      })
                    }
                  </List>
                </th>
                
              </tr>
            </tbody>
          </table>

      );
    }
}

export default NewsTable;
