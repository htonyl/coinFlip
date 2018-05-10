import React, { Component } from 'react';
import { Popup, Button, Icon } from 'semantic-ui-react'

const rowStyle = {
    width:'100%'
};

const titleStyle = {
  width: '60%',
  display: 'inline-block',
  textAlign: 'left',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  padding: '0 2px'
};

const authorStyle = {
  width: '25%',
  display: 'inline-block',
  textAlign: 'left'
};

const scoreStyle = {
  width: '10%',
  display: 'inline-block',
  textAlign: 'left'
};

class NewsTableRow extends Component {
    constructor(props) {
        super(props);
    }

    render() {
      let item = this.props.item;
      let poc = ((item.score-1)*100).toPrecision(4);
      let type = item.source.search('reddit') < 0 ? 'newspaper' : 'reddit';
      return (
        <a href= {item.url} target="_blank">
          <Button icon style={rowStyle}>
            <div style={{ width: '5%', minWidth: 10, display: 'inline-block'}}>
              <Icon name={type}></Icon>
            </div>
            <div style={titleStyle}>
              {item.title}
            </div>
            <div style={authorStyle}>
              by <span style={{fontStyle: 'italic'}}>{item.author}</span>
            </div>
            <div style={scoreStyle}>
              <span style={{color: item.score >= 1 ? '#1e983a' : '#db2828'}}>
                {item.score >= 1 ?
                  <Icon name='caret up' /> :
                  <Icon name='caret down' />
                }
                {poc + '%'}
              </span>
            </div>
          </Button>
        </a>
      );
    }
}

export default NewsTableRow;
