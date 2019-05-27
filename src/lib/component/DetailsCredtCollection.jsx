import React from 'react';
import moment from 'moment';
import { Table, Icon, Tooltip, Button, Modal, Row, Col, Input, message, Popover, notification } from 'antd';
const { TextArea } = Input;
import { CL } from '../tools/index';
import AsyncComponent from './asyncComponent.jsx';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';
import { Interface } from '../config/index.js';
import CF from 'currency-formatter';
import commonStore from 'Store/common';
import webSocket from  'Lib/tools/webSocket';

const {
  getAppInfoByMemberId, contentType, showSms, creditLog,
} = Interface;
const SendSMS = AsyncComponent(() => import('../../../src/components/creditCollection/sendSMS.jsx'));
class CredtCollectionDetail extends CLComponent {
    state = {
      messageType: 'User himself',
      confirmTitle: 'Send SMS',
      showInputMessage: false,
      applyIdAndPhoneNumbers: [],
      showMessageList: false,
      showCreditList: false,
      messageList: [],
      creditLogList: [],
      msgVisible: false
    }

    constructor(props) {
      super(props);
      this.bindCtx([
        'getApplyInfo',
        'sendSMS',
        'handleCancle',
        'handleOk',
        'disableShowMessage',
        'handleShowMessageList',
        'handleShowCreditList',
      ]);
    }

    componentWillMount() {
        commonStore.addEventChangeListener('SOCKET', this.updateSocket);
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

    sendSMS(applyIdAndPhoneNumber) {
      const that = this;
      const tempArray = [];
      tempArray.push(applyIdAndPhoneNumber);

      this.state.showInputMessage = true;
      this.setState({
        showInputMessage: true,
        applyIdAndPhoneNumbers: tempArray,
      });
      // console.log("compment state in sendSMS function",that.state);
    }

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

    sendMsg = (number) => {
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
        this.state.webSocket.send('{"command":"SendSMS","arguments":{"phone":"'+number+'","content":"'+this.state.msgWords+'"}}');
        this.setState({
            msgVisible: false
        })
    };

    handleVisibleChange = visible => {
        this.setState({ msgVisible: visible });
    };

    onWordsChange = (e) => {
        this.setState({ msgWords: e.target.value });
    };

    handleCancle() {
      this.setState({ showMessageList: false, showCreditList: false });
    }
    disableShowMessage() {
      this.setState({ showInputMessage: false });
    }

    handleOk() {
      this.setState({ showMessageList: false, showCreditList: false });
    }

    handleShowMessageList() {
      const that = this;
      that.setState({ showInputMessage: false });
      const settings = {
        contentType,
        method: showSms.type,
        url: `${showSms.url}/${that.props.settings.loanBasisInfo.appId}`,
      };

      function fn(res) {
        if (res.code == 200) {
          that.setState({ showMessageList: true, messageList: res.data.MessageLog, showInputMessage: false });
        }
      }
      CL.clReqwest({ settings, fn });
    }

    handleShowCreditList() {
      const that = this;
      const settings = {
        contentType,
        method: creditLog.type,
        url: `${creditLog.url}/${that.props.settings.orderInfo.id}`,
      };

      function fn(res) {
        if (res.code == 200) {
          that.setState({ showCreditList: true, creditLogList: res.data.CreditLog, showInputMessage: false });
        }
      }
      CL.clReqwest({ settings, fn });
    }

    getApplyInfo(doc) {
      const settings = {
        contentType,
        method: getAppInfoByMemberId.type,
        url: getAppInfoByMemberId.url,
        data: JSON.stringify({
          memberId: doc,
        }),
      };

      function fn(res) {
        if (res.data && res.data.id) {
          window.open(`${location.origin}${location.pathname}#/uplending/loanauditdetails/${res.data.id}/0`);
        }
      }
      CL.clReqwest({ settings, fn });
    }

    render() {
      const that = this;
      // console.log("compment state in render function",that.state);
      const {
        loanBasisInfo, orderInfo, deviceCheck, sameUser, sameDevice, tags, userApp,
      } = that.props.settings;
      const sameCompanyPhoneInfos = loanBasisInfo.sameCompanyPhoneInfos;
      const TagObj = {};
      if (tags && tags.length) {
        tags.map((doc, index) => {
          TagObj[doc.value] = doc.label;
        });
      }

      const tagsContent = (orderInfo.collectionTag || '').split(',').map((doc) => {
        return TagObj[doc];
      }).join(',');
      const CreditCollectionTop = {
      // title: "Credit Collection Top Information",
      //   title: <p style={{ color: 'red', }}>{loanBasisInfo.version == 1 ? 'From Loanit' : 'From Cashlending'}</p>,
      //   title:loanBasisInfo.memberPhone,

        data: [
          {
            title: 'Phone number',
            content: loanBasisInfo.memberPhone,
            type: 'text',
            render: function () {
              return (
                <div style={{ position: 'relative' }}>
                  <Tooltip placement="top" title={loanBasisInfo.memberPhone} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                    {loanBasisInfo.memberPhone}
                  </Tooltip>
                  <div>
                      <p style={{ color: 'red', margin: '0px' }}>{'Best time'} {loanBasisInfo.appropriateTime != null ? loanBasisInfo.appropriateTime : '—'}</p>
                  </div>
                    <Tooltip placement="top" title="phone" defaultVisible={false}>
                        <Icon
                            style={{
                                display: 'block',
                                position: 'absolute',
                                right: '-40px',
                                fontSize: '22px',
                                top: '0px',
                                color: '#108ee9',
                            }}
                            type="phone"
                            onClick={()=>that.callNumber(loanBasisInfo.memberPhone)}
                        />
                    </Tooltip>
                    <Tooltip placement="top" title="message" defaultVisible={false}>
                        <Popover
                            content={[<TextArea onChange={that.onWordsChange}/>, <a onClick={()=>that.sendMsg(loanBasisInfo.memberPhone)}>Send</a>]}
                            title="please input words"
                            trigger="click"
                            visible={that.state.msgVisible}
                            onVisibleChange={that.handleVisibleChange}
                        >
                            <Icon
                                style={{
                                    display: 'block',
                                    position: 'absolute',
                                    right: '-70px',
                                    fontSize: '22px',
                                    top: '0px',
                                    color: '#108ee9',
                                }}
                                type="message"
                            />
                        </Popover>
                    </Tooltip>
                    <Tooltip placement="top" title="mail" defaultVisible={false}>
                        <Icon
                            style={{
                                display: 'block',
                                position: 'absolute',
                                right: '-100px',
                                fontSize: '22px',
                                top: '0px',
                                color: '#108ee9',
                            }}
                            type="mail"
                            onClick={that.sendSMS.bind(null, { applicationId: loanBasisInfo.appId, phone: loanBasisInfo.memberPhone })}
                        />
                    </Tooltip>
                </div>
              );
            },
          },
          {
            title: 'Name',
            content: loanBasisInfo.name,
            type: 'text',
          },
          {
            title: 'Users of the same name',
            content: sameUser,
            type: 'text',
            render: function () {
              if (!sameUser) {
                return (<Icon type="minus" />);
              }
              return (<div>
                {sameUser.map((doc, index) => {
                  return (<a key={index} onClick={() => { that.getApplyInfo(doc.memberId); }}>{doc.telephoneNo}, </a>);
                })}
                      </div>);
            },
          },
          {
            title: 'Device ID',
            content: deviceCheck.unique ? 'unique' : (deviceCheck.deviceList && deviceCheck.deviceList.length ? deviceCheck.deviceList.map((doc) => {
              return doc.deviceId;
            }).join(',') : false),
            type: 'text',
          },
          {
            title: 'Users of the same device ID',
            content: sameDevice,
            type: 'text',
            render: function () {
              if (!sameDevice.length) {
                return (<Icon type="minus" />);
              }
              return (<div>
                {sameDevice.map((doc, index) => {
                  return (<a key={index} onClick={() => { that.getApplyInfo(doc.memberId); }}>{doc.telephoneNo},  </a>);
                })}
                      </div>);
            },
          },
          {
            title: 'Users of the same office number',
            content: sameCompanyPhoneInfos,
            type: 'text',
            render: function () {
              if (sameCompanyPhoneInfos == null) {
                return '';
              }
              if (!sameCompanyPhoneInfos.length) {
                return (<Icon type="minus" />);
              }
              return (<div>
                {sameCompanyPhoneInfos.map((doc, index) => {
                          return (<a key={index} onClick={() => { that.getApplyInfo(doc.memberId); }}>{doc.memberPhone},  </a>);
                        })}
                      </div>);
            },
          },
          {
            title: 'Age',
            content: moment(loanBasisInfo.birthday).toNow(true),
            type: 'text',
          },

          {
            title: 'Date of birth',
            content: moment(new Date(loanBasisInfo.birthday)).format('YYYY-MM-DD'),
            type: 'text',
          },
          {
            title: 'Gender',
            content: loanBasisInfo.sexName,
            type: 'text',
          },
          {
            title: 'Company name',
            content: loanBasisInfo.companyName,
            type: 'text',
          },
          {
            title: 'Payday 1',
            content: loanBasisInfo.payDay1,
            type: 'text',
          },
          {
            title: 'Payday 2',
            content: loanBasisInfo.payDay2,
            type: 'text',
          },
          {
            title: 'Office phone number',
            content: loanBasisInfo.companyTelephone,
            type: 'text',
          },
          {
            title: 'Amount',
            content: CF.format(orderInfo.overdueAmount, {}),
            type: 'text',
          },
          {
            title: 'Outstanding balance',
            content: orderInfo.remainAmount < 0 ? 0 : CF.format(orderInfo.remainAmount, {}),
            type: 'text',
          },
          {
            title: 'Amount of activity',
            content: orderInfo.activityStatus == 1 ? CF.format(orderInfo.activityRepaymentAmount, {}) : '—',
            type: 'text',
          },
          {
            title: 'Principal',
            content: CF.format(loanBasisInfo.appLoanAmount, {}),
            type: 'text',
          },
          {
            title: 'Loan Time ',
            content: moment(new Date(orderInfo.createdTime)).format('YYYY-MM-DD'),
            type: 'text',
          },
          {
            title: 'Repayment due time',
            content: moment(new Date((orderInfo || {}).srepaymentTime || loanBasisInfo.expireRepaymentTime)).format('YYYY-MM-DD'),
            type: 'text',
          },
          {
            title: 'Collection Tag',
            content: tagsContent,
            type: 'text',
          },
          {
            title: 'Last Used Time',
            content: userApp.lastAccessDate ? moment(new Date(userApp.lastAccessDate)).format('YYYY-MM-DD') : userApp.lastAccessDate,
            type: 'text',
          },
          {
            title: 'Open Times After Loan',
            content: userApp.numberOfUse,
            type: 'text',
          },
          {
            title: 'CIBI Approved Automatically',
            content: loanBasisInfo.autoLoan,
            type: 'text',
          },
        ],
      };

      const columns = [
        {
          title: 'time',
          dataIndex: 'createTime',
          width: '10%',
        },
        {
          title: 'SMS sender',
          dataIndex: 'creditName',
          width: '10%',
        },
        {
          title: 'type',
          dataIndex: 'messageType',
          width: '10%',
        },
        {
          title: 'phone number',
          dataIndex: 'phone',
          width: '10%',
        },
        {
          title: 'status',
          dataIndex: 'status',
          width: '10%',
          render: function (text, record) {
            if (record.status == 0) {
              return 'Send failed';
            } else if (record.status == 1) {
              return 'Send successfully';
            } else if (record.status == 2) {
              return 'Sending';
            }
          },
        },
        {
          title: 'Message',
          dataIndex: 'message',
          width: '50%',
          render: function (text, record) {
            return (<Tooltip placement="top" title={record.message} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
              {record.message.length < 100 ? record.message : `${record.message.substring(0, 100)}...`}
            </Tooltip>);
          },
        },
      ];

      const creditLogColumns = [
        {
          title: 'stage',
          dataIndex: 'stage',
          width: '16%',
          render: function (text, record) {
            if (record.stage == 2) {
              return 's1-1';
            } else if (record.stage == 3) {
              return 's1-2';
            } else if (record.stage == 4) {
              return 's2';
            } else if (record.stage == 5) {
              return 'm2';
            } else if (record.stage == 6) {
              return 'm3';
            } else if (record.stage == 7) {
              return 'm4';
            } else if (record.stage == 8) {
              return 'm4+';
            }
          },
        },
        {
          title: 'distributed',
          dataIndex: 'distributed',
          width: '16%',
        },
        {
          title: 'overdueDays',
          dataIndex: 'overdueDays',
          width: '16%',
        },
          {
              title: 'Company',
              dataIndex: 'companyName',
              width: '16%'
          },
        {
          title: 'collector',
          dataIndex: 'collector',
          width: '17%',
        },
        {
          title: 'distributor',
          dataIndex: 'distributor',
          width: '17%',
        },
      ];

      const data = that.state.messageList;
      const creditLogData = that.state.creditLogList;
      const sendSMSSettings = {
        messageType: 'User himself',
        confirmTitle: 'Send SMS',
        showInputMessage: that.state.showInputMessage,
        applyIdAndPhoneNumbers: that.state.applyIdAndPhoneNumbers,
        disableShowMessage: that.disableShowMessage,
      };

      // console.log("one render comeout!");
      return (
        <div>
          <Button style={{ float: 'right', mariginRight: '10px' }} type="primary" onClick={that.handleShowMessageList.bind(that)}>SMS sending record</Button>
          <Button style={{ float: 'right', marginRight: '10px' }} type="primary" onClick={that.handleShowCreditList.bind(that)} >Distribution records</Button>
          {/*<Button style={{ width: '0px', border: 'none' }} />*/}
          <p style={{ color: 'red', marginLeft: '15px' , marginTop: '10px'}}>{`From ` + loanBasisInfo.versionName}</p>
          <SendSMS settings={sendSMSSettings} />
          <CLBlockList settings={CreditCollectionTop} />
          <Modal
            title="SMS sending record"
            visible={that.state.showMessageList}
            onCancel={that.handleCancle}
            onOk={that.handleOk}
            cancelText="close"
            okText="ok"
            mask
            width={1200}
            height={800}
            footer={[
              <Button key="OK" type="primary" onClick={this.handleOk}>
               OK
              </Button>,
           ]}

            style={{ width: '2000px', height: '600px' }}
          >
            <Table
              bordered
              title={() => { 'Message List'; }}
              pagination={false}
              columns={columns}
              dataSource={data}
              scroll={{ y: 500 }}
              rowKey={record => record.index}
            />
          </Modal>
          <Modal
            title="Distribution records"
            visible={that.state.showCreditList}
            onCancel={that.handleCancle}
            onOk={that.handleOk}
            cancelText="close"
            okText="ok"
            mask
            width={1200}
            height={800}
            footer={[
              <Button key="OK" type="primary" onClick={this.handleOk}>
                OK
              </Button>,
            ]}

            style={{ width: '2000px', height: '600px' }}
          >
            <Table
              bordered
              title={() => { 'creditLog List'; }}
              pagination={false}
              columns={creditLogColumns}
              dataSource={creditLogData}
              scroll={{ y: 500 }}
              rowKey={record => record.index}
            />
          </Modal>
        </div>
      );
    }
}
export default CredtCollectionDetail;
