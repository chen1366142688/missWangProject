import React from 'react';
import {Table, message, Button, Radio, Select, Modal, Input, Tooltip, Icon, notification} from 'antd';
const { TextArea } = Input;
import {CL} from 'Lib/tools/index';

const RadioGroup = Radio.Group;
import CLComponent from './CLComponent.jsx';
import {Interface} from '../config/index.js';
import _ from 'lodash';
import moment from 'moment';
import commonStore from 'Store/common';

const {contentType, getNewAddressBookDetail, getNewAddressBookSubmit, applicationApplicantVerification} = Interface;
import webSocket from  'Lib/tools/webSocket';

export default class AddressBookNew extends CLComponent {
    constructor(props) {
        super(props);
        this.state = {
            res: [],
            list: [],
            disabled: this.props.addressBookType !== "show_submit" || false,
            ButtonStatus: false,
            msgVisible: false
        }
    }

    componentWillMount() {
        commonStore.addEventChangeListener('SOCKET', this.updateSocket);
        this.getDetail();
    }

    componentDidMount(){
        webSocket();
    }

    componentWillUnmount() {
        commonStore.removeEventChangeListener('SOCKET', this.updateSocket);
    }

    updateSocket = () => {
        let socket = commonStore.getSocketData();
        if (socket.type === "open") {
            this.setState({
                webSocket: socket.webSocket
            })
        } else if (socket.type === "close") {
            this.setState({
                webSocket: null
            })
        } else if (socket.type === "msg") {
            // TODO:
        }
    };

    changeNumber = (number) => {
        this.setState({
            number
        })
    };

    openChangeNumberWin = () => {
        let _this = this;
        Modal.info({
            title: 'Edit phone number',
            content: (
                <div>
                    <Input placeholder="please input" onChange={(e)=>this.changeNumber(e.target.value)} defaultValue={this.state.number}/>
                </div>
            ),
            okText: "Sure",
            okType: "primary",
            onOk() {
                document.getElementById("phoneNumber").innerHTML = "You are calling the phone number: " + _this.state.number;
            },
        });
    };

    callNumber = (number) => {
        let _this = this;

        if (!this.state.webSocket) {
            Modal.info({
                title: 'error',
                content: (
                    <div>
                        <p>can not connect to server!</p>
                    </div>
                ),
                okText: "Try to connect",
                okType: "primary",
                onOk() {
                    webSocket();
                    message.info('connecting...');
                    setTimeout(() => {
                        if (_this.state.webSocket) {
                            message.error('connect success!');
                        } else {
                            message.error('connect failed!');
                        }
                    }, 3000)
                },
            });
            return;
        }

        number = number.replace(/^63([0-9]*)/, '0$1');
        this.changeNumber(number);
        Modal.confirm({
            title: 'Call confirmation',
            content: (
                <div>
                    <p id="phoneNumber">You are calling the phone number: {number}</p>
                    {/*<Button type="primary" onClick={this.openChangeNumberWin}>修改号码</Button>*/}
                </div>
            ),
            okText: 'Sure',
            okType: 'primary',
            onOk() {
                _this.state.webSocket.send('{"command":"Dial","arguments":{"phone":"' + _this.state.number + '"}}');
                const key = `open${Date.now()}`;

                const args = {
                    message: 'Call reminder',
                    description:
                        'calling...',
                    btn: <Button type="danger" size="small" onClick={() => {
                        _this.state.webSocket.send('{"command":"HungUp"}');
                        notification.close(key);
                    }
                    }>
                        Hung up
                    </Button>,
                    key,
                    duration: 0,
                };
                notification.open(args);
            }
        });
    };

    sendMsg = () => {
        let _this = this;
        if(!this.state.msgWords){
            message.error('empty words!');
            return;
        }
        if (!this.state.webSocket) {
            Modal.info({
                title: 'error',
                content: (
                    <div>
                        <p>can not connect to server!</p>
                    </div>
                ),
                okText: "Try to connect",
                okType: "primary",
                onOk() {
                    webSocket();
                    message.info('connecting...');
                    setTimeout(()=>{
                        if(_this.state.webSocket){
                            message.error('connect success!');
                        }else{
                            message.error('connect failed!');
                        }
                    }, 3000)
                },
            });
            return;
        }
        this.state.webSocket.send('{"command":"SendSMS","arguments":{"phone":"' + this.state.phone + '","content":"' + this.state.msgWords + '"}}');
        this.setState({
            msgVisible: false
        })
    };

    handleCancel = () => {
        this.setState({ msgVisible: false });
    };

    onWordsChange = (e) => {
        this.setState({ msgWords: e.target.value });
    };

    openMsgInput = (phone) => {
        this.setState({ phone, msgVisible: true });
    };

    handleChange = (data, e) => {
        if (data.telephone && e) {
            let res = this.state.res;
            let idx = _.findIndex(res, item => {
                return item.id == data.telephone;
            });

            if (idx > -1) {
                res[idx].value = e;
                this.setState({
                    res
                })
            } else {
                res.push({
                    id: data.telephone,
                    value: e
                })
            }
            data.optionType = e;
        }
    };

    onRadioChange = (data, e) => {
        let res = this.state.res;
        let idx = _.findIndex(res, item => {
            return item.id == data.telephone;
        });

        if (idx > -1) {
            res[idx].radio = e.target.value;
        } else {
            res.push({
                id: data.telephone,
                radio: e.target.value
            })
        }
        data.dealStatus = e.target.value

        this.setState({
            res
        })
    };

    getDetail = () => {
        let _this = this;

        const settings = {
            contentType,
            method: getNewAddressBookDetail.type,
            url: getNewAddressBookDetail.url + `/${this.props.appId}`
        };

        function fn(res) {
            if (res && res.data) {
                let no = 0;
                let list = _.map(res.data.list, (item) => {
                    no++;
                    return {
                        id: item.telephone,
                        no,
                        name: item.name,
                        telephone: item.telephone,
                        lastCallTime: item.lastCallTime && moment(item.lastCallTime).format('YYYY-MM-DD HH:mm:ss'),
                        dealStatus: item.dealStatus,
                        optionType: item.optionType != null ? item.optionType + "" : undefined,
                        opts: _.map(res.data.option, (value, key) => {
                            return {
                                value: key,
                                name: value
                            }
                        })
                    }
                });
                _this.setState({list})
            }
        }

        CL.clReqwest({settings, fn});
    };


    submit = () => {
        const _this = this;
        let validRes = false;

        let res = this.state.res;

        let unconnectNum = 0;
        let unReach = 0;

        // 1、如果存在一个有关系，且下拉选项已选，则可以提交
        // 2、如果存在三个及以上无关系，则可以提交
        // 3、全部都有选，则可以提交
        _.each(res, item => {
            if (item.radio == 2 && !!item.value) {
                validRes = true;
            } else if (item.radio == 3) {
                unconnectNum++;
            } else if (item.radio == 1) {
                unReach++;
            }
        });

        if (unconnectNum >= 3) {
            validRes = true;
        }

        if (unconnectNum + unReach === this.state.list.length || unconnectNum + unReach >= 10) {
            validRes = true;
        }

        if (!validRes) {
            message.warn('Do not meet the submission conditions');
            return;
        }
        this.applicationApplicantVerification();

    };
    applicationApplicantVerification = () => {
        let _this = this;
        const settings = {
            contentType,
            method: applicationApplicantVerification.type,
            url: applicationApplicantVerification.url + `/${_this.props.appId}`
        };
        function fn(res) {
            if(res.data.selected==null){
                message.warn('Please verify the borrower first!');
            }else{
                Modal.confirm({
                    title: 'Confirm',
                    content: 'Whether to do?',
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk() {
                            let list = [];
                        _.each(_this.state.list, (item) => {
                            if (item.dealStatus) {
                                list.push({
                                    name: item.name,
                                    telephone: item.telephone,
                                    lastCallTime: moment(item.lastCallTime).unix() * 1000,
                                    dealStatus: item.dealStatus,
                                    optionType: item.optionType
                                })
                            }
                        });
                        const settings = {
                            contentType,
                            method: getNewAddressBookSubmit.type,
                            url: getNewAddressBookSubmit.url,
                            data: JSON.stringify({
                                applicationId: _this.props.appId,
                                loanAddressbookLogList: list
                            })
                        };
        
                        function fn(res) {
                            if (res && res.code == 200) {
                                location.hash = '#/uplending/loanaudit';
                                if (res.data == "approve") {
                                    message.success("Application has been approved")
                                } else if (res.data == "refuse") {
                                    message.success("Application has been refused")
                                }
                            } else {
                                res.result && message.error(res.result);
                            }
                        }
                        CL.clReqwest({settings, fn});
                        
                    }
                });
            }
        }
        CL.clReqwest({settings, fn});
      }

    render() {
        let _this = this;
        let columns = [{
            title: 'No',
            dataIndex: 'no',
            key: 'no',
            width: "5%",
            render(text, data) {
                return text || '-'
            }
        }, {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: "20%",
            render(text, data) {
                return text || '-'
            }
        }, {
            title: 'Telephone',
            dataIndex: 'telephone',
            key: 'telephone',
            width: "20%",
            render(text, data) {
                return <div>
                    <span>{text || '-'}</span>
                    <Tooltip placement="top" title="phone" defaultVisible={false}>
                        <Icon
                            style={{
                                display: 'block',
                                position: 'absolute',
                                right: '60px',
                                fontSize: '22px',
                                top: '0px',
                                color: '#108ee9',
                            }}
                            type="phone"
                            onClick={()=>_this.callNumber(text)}
                        />
                    </Tooltip>
                    <Tooltip placement="top" title="message" defaultVisible={false}>
                        <Icon
                            style={{
                                display: 'block',
                                position: 'absolute',
                                right: '30px',
                                fontSize: '22px',
                                top: '0px',
                                color: '#108ee9',
                            }}
                            type="message"
                            onClick={()=>_this.openMsgInput(text)}
                        />
                    </Tooltip>
                </div>
            }
        }, {
            title: 'Last Call Time',
            dataIndex: 'lastCallTime',
            key: 'lastCallTime',
            width: "20%",
            render(text, data) {
                return text || '-'
            }
        }, {
            title: 'Operation',
            dataIndex: 'operation',
            render(text, data) {
                return <span>
                    <RadioGroup onChange={(e) => _this.onRadioChange(data, e)}
                                disabled={_this.state.disabled}
                                defaultValue={data.dealStatus}>
                    <Radio value={1}><label style={{color: "#000"}}>Unanswered</label></Radio>
                    <Radio value={2}><label style={{color: "#000"}}>Relevant</label>
                        <Select style={{width: 150, marginLeft: 10, color: "#000"}}
                                disabled={_this.state.disabled}
                                defaultValue={data.optionType}
                                onChange={(e) => _this.handleChange(data, e)}
                                placeholder="please select">
                            {
                                _.map(data.opts, item => {
                                    return <Option value={item.value}>{item.name}</Option>
                                })
                            }
                        </Select>
                    </Radio>
                    <Radio value={3}><label style={{color: "#000"}}>Inrelevant</label></Radio>
                </RadioGroup>
                </span>
            }
        }];
        return (<div className="address-book-new" style={{margin: "0 10px"}}>
            <div>
                <h3 style={{display: "inline-block",}}>{this.props.weatherCollection ? "Address book verification by Evaluation" : "Address book verification"}</h3>
                <Button onClick={this.submit}
                        type="primary"
                        disabled={this.state.disabled}
                        style={{
                            position: "relative",
                            margin: "0px 10px 10px 0px",
                            float: "right",
                            top: "52px",
                            right: "20px",
                            zIndex: 1
                        }}>
                    Submit
                </Button>
            </div>
            <Table bordered={true}
                   columns={columns}
                   scroll={{y: 300}}
                   dataSource={this.state.list}
                   pagination={false}/>
            <Modal
                title="please input words"
                visible={this.state.msgVisible}
                onCancel={this.handleCancel}
                mask
                footer={[
                    <Button key="OK" type="primary" onClick={this.sendMsg}>
                        Send
                    </Button>,
                ]}

                style={{ width: '2000px', height: '600px' }}
            >
                <TextArea onChange={this.onWordsChange}/>
            </Modal>
        </div>)
    }
}