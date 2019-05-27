import React from 'react';
import {Table, Switch, Button, Modal, Form, Input, Popconfirm} from 'antd';
import action from './actions';

class MailAccountList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            visiblePwd: false,
            pwd: null
        }
    }

    componentDidMount() {
        this.getMailAccountListMth();
    }

    getMailAccountListMth = () => {
        action.getMailAccountList()
            .then((list) => {
                this.setState({
                    list
                })
            })
    }

    onSenderChange = (e, id) => {
        if (e) {
            this.setState({
                visiblePwd: true,
                senderStatus: e,
                senderId: id
            })
        } else {
            action.changeMailAccountStatus(e, this.state.password, id, "sender")
                .then((res) => {
                    if (res) {
                        this.getMailAccountListMth();
                    }
                })
        }
    };

    onRecipientChange = (e, id) => {
        action.changeMailAccountStatus(e, this.state.password, id, "recipient")
            .then((res) => {
                if (res) {
                    this.getMailAccountListMth();
                }
            })
    };

    onNewMailAccount = (e) => {
        this.setState({
            visible: true
        })
    };

    handleCancel = (e) => {
        this.setState({
            visible: false,
            visiblePwd: false,
            pwd: null
        })
    };

    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            action.addMailAccount(values)
                .then((res) => {
                    if (res) {
                        this.getMailAccountListMth();
                        this.setState({
                            visible: false
                        })
                        this.props.form.resetFields();
                    }
                })
        })
    };

    delete = (id) => {
        action.delMailAccount(id)
            .then((res) => {
                if (res) {
                    this.getMailAccountListMth();
                }
            })
    };

    setPassword = (e) => {
        this.setState({
            pwd: e.target.value
        })
    };

    setSender = () => {
        action.changeMailAccountStatus(this.state.senderStatus, this.state.pwd, this.state.senderId, "sender")
            .then((res) => {
                if (res) {
                    this.handleCancel();
                    this.getMailAccountListMth();
                }
            })
    };

    render(data) {
        const _this = this;
        const {getFieldDecorator} = this.props.form;
        const dataSource = this.state.list;

        const columns = [{
            title: '邮件地址',
            dataIndex: 'address',
            key: 'address',
        }, {
            title: '是否发送人',
            dataIndex: 'isSender',
            render(text, data) {
                return <Switch checked={!!text} onChange={(e) => _this.onSenderChange(e, data.id)}/>
            }
        }, {
            title: '是否收件人',
            dataIndex: 'isRecipient',
            render(text, data) {
                return <Switch checked={!!text} onChange={(e) => _this.onRecipientChange(e, data.id)}/>
            }
        }, {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
        }, {
            title: '操作',
            render(text, data) {
                return <Popconfirm placement="right" title="Are you sure to delete this task?"
                                   onConfirm={() => _this.delete(data.id)} okText="Yes" cancelText="No">
                    <Button type="danger" size="small">删除</Button>
                </Popconfirm>
            }
        }];
        return (
            <div className="MAIL-ACCOUNT-LIST">
                <div className="mail-title">
                    <Button onClick={this.onNewMailAccount} type="primary">新增</Button>
                </div>
                <Table dataSource={dataSource}
                       columns={columns}
                       pagination={false}/>
                <Modal
                    title="New mail account"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}>
                    <Form labelCol={{span: 5}} wrapperCol={{span: 12}}>
                        <Form.Item
                            label="address"
                        >
                            {getFieldDecorator('address', {
                                rules: [{required: true, message: 'Please input!'}],
                            })(
                                <Input/>
                            )}
                        </Form.Item>
                        <Form.Item
                            label="remark"
                        >
                            {getFieldDecorator('remark', {
                                rules: [{required: true, message: 'Please input!'}],
                            })(
                                <Input/>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    title="Set password"
                    visible={this.state.visiblePwd}
                    onOk={this.setSender}
                    onCancel={this.handleCancel}>
                    <Input value={this.state.pwd} onChange={this.setPassword}/>
                </Modal>
            </div>
        );
    }
}

const MailAccount = Form.create()(MailAccountList);

export default MailAccount;

