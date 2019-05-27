import React from 'react';
import {Table, Button, Modal, Form, Input, Tooltip, Popconfirm} from 'antd';
import action from './actions';

class MailSetting extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            current: 1,
            visible: false
        }
    }

    componentDidMount() {
        this.getMailListMth();
    }

    getMailListMth = () => {
        action.getMailList()
            .then((list) => {
                this.setState({
                    list
                })
            })
    }

    setting = (id) => {
        location.hash = "/uplending/newmail/" + id;
    };

    startup = (id) => {
        action.startupMail(id)
            .then((res) => {
                this.getMailListMth();
            })
    };

    stop = (id) => {
        action.stopMail(id)
            .then((res) => {
                this.getMailListMth();
            })
    };

    handleCancel = (e) => {
        this.setState({
            visible: false
        })
    };


    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            action.addMail(values)
                .then((res) => {
                    if (res) {
                        this.getMailListMth();
                        this.setState({
                            visible: false
                        })
                        this.props.form.resetFields();
                    }
                })
        })
    };

    onNewMail = () => {
        this.setState({
            visible: true
        })
    };
    
    delete = (id) => {
        action.delMail(id)
            .then((res) => {
                if (res) {
                    this.getMailListMth();
                }
            })
    };

    validMail = (id) => {
        action.validMail(id)
            .then((res) => {
                if (res) {
                    this.getMailListMth();
                }
            })
    };

    render(data) {
        const _this = this;
        const {getFieldDecorator} = this.props.form;
        const dataSource = this.state.list;

        const columns = [{
            title: '名称',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: '是否完成设置',
            dataIndex: 'complate',
            render(text, data) {
                return text ? "完成" : [<span>未完成</span>,
                    <Tooltip placement="top" title="make sure you have complate all infomation">
                        <Popconfirm placement="right" title="do you wants to valid your params?"
                                    onConfirm={() => _this.validMail(data.id)} okText="Yes" cancelText="No">
                            <Button style={{marginLeft: "15px"}} size="small" type="danger">校验</Button>
                        </Popconfirm>
                    </Tooltip>]
            }
        }, {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
        }, {
            title: '操作',
            render(text, data) {
                if (!!data.startup) {
                    return <Popconfirm placement="right" title="Are you sure to stop this task?"
                                       onConfirm={() => _this.stop(data.id)} okText="Yes" cancelText="No">
                        <Button style={{marginLeft: "15px"}} type="danger" size="small">停止</Button>
                    </Popconfirm>
                }
                return [<Button type="default" size="small" onClick={() => _this.setting(data.id)}>设置</Button>,
                    <Popconfirm placement="right" title="Are you sure to startup this task?"
                                onConfirm={() => _this.startup(data.id)} okText="Yes" cancelText="No">
                        <Button style={{marginLeft: "15px"}} type="primary" size="small">启动</Button>
                    </Popconfirm>,
                    <Popconfirm placement="right" title="Are you sure to delete this task?"
                                onConfirm={() => _this.delete(data.id)} okText="Yes" cancelText="No">
                        <Button style={{marginLeft: "15px"}} type="danger" size="small">删除</Button>
                    </Popconfirm>]
            }
        }];
        return (
            <div className="MAIL-SETTING">
                <div className="mail-title">
                    <Button onClick={this.onNewMail} type="primary">新增</Button>
                </div>
                <Table dataSource={dataSource}
                       columns={columns}
                       pagination={false}/>
                <Modal
                    title="New Mail"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}>
                    <Form labelCol={{span: 5}} wrapperCol={{span: 12}}>
                        <Form.Item
                            label="name"
                        >
                            {getFieldDecorator('name', {
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
            </div>
        );
    }
}

const MailSettingForm = Form.create()(MailSetting);

export default MailSettingForm;

