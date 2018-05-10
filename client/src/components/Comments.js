import React, { Component } from 'react';
import {Button,Form,Segment ,Icon,Label, List,Container, Header} from 'semantic-ui-react';

class Comments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data:[]
        };
        let that = this;
        this.props.firebase.database().ref('posts').on("child_added", function(snapshot) {
            that.setState({
                data: [...that.state.data, {key:snapshot.key,data:snapshot.val()}]
            })
            console.log(snapshot.val())
        });

    }
    submitForm(e){
        let that = this;
        e.preventDefault();
        if(this.state.technology && this.state.community && this.state.news && this.state.reason){
            if(this.state.technology >= 0 && this.state.technology <= 100){
                if(this.state.community >= 0 && this.state.community <= 100){
                    if(this.state.news >= 0 && this.state.news <= 100){
                        this.props.firebase.database().ref('userInfo/predictionNum').transaction(function(queue_length) {
                            if(queue_length|| (queue_length === 0))
                            {
                                queue_length++;
                            }
                            return queue_length;
                        });
                        this.props.firebase.database().ref('userInfo/technology').transaction(function(queue_length) {
                            if(queue_length|| (queue_length === 0))
                            {
                                queue_length = queue_length + Number(that.state.technology);
                            }
                            return queue_length;
                        });
                        this.props.firebase.database().ref('userInfo/community').transaction(function(queue_length) {
                            if(queue_length|| (queue_length === 0))
                            {
                                queue_length = queue_length + Number(that.state.community);
                            }
                            return queue_length;
                        });
                        this.props.firebase.database().ref('userInfo/news').transaction(function(queue_length) {
                            if(queue_length|| (queue_length === 0))
                            {
                                queue_length = queue_length + Number(that.state.news);
                            }
                            return queue_length;
                        });
                        this.props.firebase.database().ref('posts').push().set({
                            dateTime: new Date().toString(),
                            name: this.state.name,
                            technology: this.state.technology,
                            news: this.state.news,
                            reason: this.state.reason,
                            community: this.state.community,
                            votes: 0
                        });
                    }
                }
            }
        }
    }
    handleChange = name => event => {
        this.setState({
          [name]: event.target.value,
        })
    }

    render() {
        // let that = this;
        return (
            <div>
                <Container>
                <Header as='h2'>Comments from others</Header>

                    <Segment>

                        <List divided verticalAlign='middle' >
                        {
                            this.state.data.map(function(d,index){
                                return (
                                        <List.Item>
                                                  <Icon name='right triangle' />
                                            <List.Content>
                                            <List.Header as ='a'>
                                                Reason
                                            </List.Header>
                                            <List.Content>
                                            {d.data.reason}
                                            </List.Content>
                                            </List.Content>
                                            <List.Content verticalAlign='bottom'    floated = 'right'>
                                            {'Posted by '+d.data.name+' on '+new Date(d.data.dateTime).toDateString()+' '}
                                            <Label horizontal as='a' color='blue' size='small'>
                                                Technology
                                                <Label.Detail>{d.data.technology+'%'}</Label.Detail>
                                                </Label>
                                                <Label horizontal as='a' color='orange' size='small'>
                                                Community
                                                <Label.Detail>{d.data.community+'%'}</Label.Detail>
                                                </Label>
                                                <Label horizontal as='a' color='brown' size='small'>
                                                News
                                                <Label.Detail>{d.data.news+'%'}</Label.Detail>
                                                </Label>
                                            </List.Content>
                                        </List.Item>
                                )}
                                )

                        }


                    </List>
                    </Segment>
                    </Container>
                    <br/><br/>


                    <Container>
            <Header as='h2'>Time for you to predict the price</Header>

            <Segment >
            <Form onSubmit = {this.submitForm.bind(this)}>
            <Form.Field onChange = {this.handleChange('name')} label='Name' control='input' />
            <Form.Group widths='equal'>
                <Form.Field onChange = {this.handleChange('technology')} label='Score for Tech' control='input' type='number' max={100} min ={0} />
                <Form.Field onChange = {this.handleChange('community')} label='Score for Community' control='input' type='number' max={100} min ={0} />
                <Form.Field onChange = {this.handleChange('news')} label='Score for News' control='input' type='number' max={100} min ={0} />
            </Form.Group>
            <Form.TextArea onChange = {this.handleChange('reason')} label='Reason' placeholder='Please tell us the reason' />
            <Button type='submit'>Submit</Button>

            </Form>
            </Segment>
            </Container>
            </div>
        );
    }
}

export default Comments;
