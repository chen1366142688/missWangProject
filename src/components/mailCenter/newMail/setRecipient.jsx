import React from 'react';
import {Select} from 'antd';
import action from '../actions';

export default class SetRecipient extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            individualRecList: [],
            recipientIds: null
        }
    }

    componentDidMount() {
        this.getRecipientList();
    }

    getRecipientList = () => {
        action.getMailRecipientList()
            .then((list) => {
                this.setState({
                    individualRecList: list
                })
            })
        action.getMailIndividualRecipientMapList(this.props.mailId)
            .then((list) => {
                let recipientIds = _.map(list, item => {
                    return item.recipientId;
                })
                this.individualRecipientChange(recipientIds);
            })
    };

    individualRecipientChange = (e) => {
        this.setState({
            recipientIds: e
        });
        this.props.setRecipient(e);
    };

    render(data) {
        return (
            <div className="SET-RECIPIENT">
                <div className="individual-recipient">
                    <p>set individual recipient:</p>
                    <Select
                        mode="multiple"
                        style={{width: 500}}
                        placeholder="Please select"
                        onChange={this.individualRecipientChange}
                        value={this.state.recipientIds}
                    >
                        {
                            _.map(this.state.individualRecList, item => {
                                return <Select.Option key={item.id} value={item.id}>{item.address}</Select.Option>
                            })
                        }
                    </Select>
                </div>
                <div className="group-recipient">
                    <p>set group recipient:</p>
                    <span className="wait-for-development">敬请期待</span>
                </div>
            </div>
        );
    }
}