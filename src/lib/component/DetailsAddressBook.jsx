import React from 'react';
import { Table, Tooltip, Icon, Modal, Row, Col, Input, message, Button, notification } from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import AsyncComponent from './asyncComponent.jsx';
import { Interface } from '../config/index.js';
import commonStore from 'Store/common';

const SendSMS = AsyncComponent(() => import('../../../src/components/creditCollection/sendSMS.jsx'));

const {
  Details, contentType, creditAddressbook, creditAddressbookNew, saveAddressbookDesc, sendsmsPan,
} = Interface;
const { TextArea } = Input;
import webSocket from  'Lib/tools/webSocket';
class AddressBook extends CLComponent {
  state = {

    showInputMessage: false,
    applyIdAndPhoneNumbers: [],
    selectedRows: [],
    addressBookInfo: [],
    addressBookInfo2: [],
    abRemark: false,
    remarkText: '',
    auditRemark: '',
    isloanApply: false,
    count: 0,
    msgVisible: false
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'loadData',
      'showRemarkModal',
      'handleOk',
      'handleCancel',
      'setRemarkText',
      'loadData2',
      'goTo',
      'sendSMS',
      'disableShowMessage',
    ]);
  }

    componentWillMount() {
        commonStore.addEventChangeListener('SOCKET', this.updateSocket);
    }

  componentDidMount() {
    const credit = this.props.credit;
    const loanAudit = this.props.LoanAudit;
      webSocket();
    if (credit) {
      this.loadData3();
    }else if(loanAudit){
      this.loadData2();
    } else {
      this.loadData();
    }
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
        this.setState({ msgVisible: false, abRemark: false });
    };

    onWordsChange = (e) => {
        this.setState({ msgWords: e.target.value });
    };

    openMsgInput = (phone) => {
        this.setState({ phone, msgVisible: true });
    };


    disableShowMessage() {
    this.setState({ showInputMessage: false });
  }

  loadData() {
    const that = this;
    const memberId = that.props.memberId;
    const addressBookInfoSettings = {
      contentType,
      method: Details.getAddressBookInfo.type,
      url: Details.getAddressBookInfo.url,
      data: JSON.stringify({
        merberId: memberId,
      }),
    };

    function addressBookInfoFn(res) {
      if (res.data) {
        that.setState({ addressBookInfo: res.data });
      }
    }

    if (memberId) {
      CL.clReqwest({ settings: addressBookInfoSettings, fn: addressBookInfoFn });
    }
  }

  loadData2() {
    const that = this;
    const appId = this.props.appId;
    const Apply = that.props.isloanApply;
    that.setState({ isloanApply: Apply });
    const settings = {
      contentType,
      method: creditAddressbook.type,
      url: creditAddressbook.url + appId,  //creditAddressbook替换的
    };
    function fn(res) {
      if (res.data) {
        that.setState({ addressBookInfo2: res.data });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  loadData3() {
    const that = this;
    const appId = this.props.appId;
    const Apply = that.props.isloanApply;
    that.setState({ isloanApply: Apply });
    const settings = {
      contentType,
      method: creditAddressbookNew.type,
      url: creditAddressbookNew.url + appId,  //creditAddressbook替换的
    };
    function fn(res) {
      if (res.data) {
        that.setState({ addressBookInfo2: res.data });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  setRemarkText(e) {
    const that = this;
    if (that.state.isloanApply) {
      this.setState({ auditRemark: e.target.value });
    } else {
      this.setState({ remarkText: e.target.value });
    }
  }

  sendSMS() {
    const that = this;
    const applyIdAndPhoneNumbers = [];

    for (let i = 0; i < that.state.selectedRows.length; i++) {
      const applyIdAndPhoneNumber = {};

      applyIdAndPhoneNumber.phone = that.state.selectedRows[i].phone;
      applyIdAndPhoneNumber.applicationId = that.props.appId;

      applyIdAndPhoneNumbers.push(applyIdAndPhoneNumber);
    }
    const settings = {
      contentType,
      method: sendsmsPan.type,
      url: sendsmsPan.url,
      data:JSON.stringify({
        applicationId: that.props.appId,
        count: that.state.count,
      }),
    };
    function fn(res) {
      if (res.data == true) {
        that.setState(
          {
            showInputMessage: true,
            applyIdAndPhoneNumbers: applyIdAndPhoneNumbers,

          });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  handleOk(e) {
    const text = this.state.remarkText;
    const auditRemark = this.state.auditRemark;
    const current = this.state.current;
    const that = this;
    const settings = { // 催收申请单的通讯备注
      contentType,
      method: saveAddressbookDesc.type,
      url: saveAddressbookDesc.url + current.id,
      data: JSON.stringify({ auditRemark, text }),
    };
    function fn(res) {
      if (res.data) {
        message.success('save success');
        if(that.props.credit){
          that.loadData3();
        }else{
          that.loadData2();
        }
        that.handleCancel();
      }
    }

    CL.clReqwest({ settings, fn });
  }

  showRemarkModal(e, doc, auditRemark) {
    this.setState({
      abRemark: true,
      current: doc,
      remarkText: doc.description,
      auditRemark: doc.auditRemark,
      sendSMSSettings: {
        showInputMessage: false,
      },

    });
  }

  goTo(tag, doc) {
    if (tag === 'creditcollectionDetails') {
      window.open(`${location.origin}${location.pathname}#/uplending/creditcollectionDetails/${doc.orderId}/${doc.applicationId}/0`);
    } else if (tag === 'loanauditdetails') {
      window.open(`${location.origin}${location.pathname}#/uplending/loanauditdetails/${doc.applicationId}/1`);
    } else {
      window.open(`${location.origin}${location.pathname}#/uplending/postloandetails/${doc.orderId}/${doc.applicationId}`);
    }
  }

  render() {
    const that = this;
    const addressBookInfo = that.state.addressBookInfo || [];
    const { credit } = that.props;
    const { LoanAudit } = that.props;
    const isloanApply = that.props.isloanApply;
    const editStyle = {
      display: 'block',
      position: 'absolute',
      right: '15px',
      fontSize: '22px',
      top: '0px',
      color: '#108ee9',
      cursor: 'pointer',
    };

    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      width: '90px',
    };

    const AddressBooks = {
      columns: [
        {
          title: 'No.',
          dataIndex: 'index',
          width: '3%',
        },
        {
          title: 'Phone No',
          dataIndex: 'telephoneNo',
          width: '10%',
          render: (index, doc) => {
              let phoneIcon = doc.telephoneNo;
              if (doc.repaymentStatus && doc.repaymentStatus === 'Delinquent') {
                  phoneIcon = <a onClick={() => {
                      that.goTo('creditcollectionDetails', doc);
                  }}>{doc.telephoneNo}</a>;
              }

              if (doc.repaymentStatus && doc.repaymentStatus === 'Delinquent') {
                  phoneIcon = <a onClick={() => {
                      that.goTo('loanauditdetails', doc);
                  }}>{doc.telephoneNo}</a>;
              }

              if (doc.repaymentStatus && (doc.repaymentStatus !== 'Delinquent' && doc.repaymentStatus !== '—')) {
                  phoneIcon = <a onClick={() => {
                      that.goTo('postloandetails', doc);
                  }}>{doc.telephoneNo}</a>;
              }

              return <div>
                  {phoneIcon}
                  <Tooltip placement="top" title="phone" defaultVisible={false}>
                      <Icon
                          style={{
                              fontSize: '22px',
                              color: '#108ee9',
                              marginLeft: "5px"
                          }}
                          type="phone"
                          onClick={()=>that.callNumber(doc.telephoneNo)}
                      />
                  </Tooltip>
                  <Tooltip placement="top" title="message" defaultVisible={false}>
                      <Icon
                          style={{
                              fontSize: '22px',
                              color: '#108ee9',
                              marginLeft: "5px"
                          }}
                          type="message"
                          onClick={()=>that.openMsgInput(doc.telephoneNo)}
                      />
                  </Tooltip>
              </div>;
          },
        },
        {
          title: 'Name',
          dataIndex: 'name',
          width: '10%',
        },
        {
          title: 'Latest Call Time Lag',
          dataIndex: 'lastCallDuration',
          width: '10%',
        },
        {
          title: 'Latest Call Time',
          dataIndex: 'lastCallTime',
          width: '10%',
        },
        {
          title: 'Call Amount Within Half Years',
          dataIndex: 'callAmountWithinHalfYear',
          width: '10%',
        },
        {
          title: 'Recent Status',
          dataIndex: 'status',
          width: '10%',
        },
        {
          title: 'Recent Repayment Status',
          dataIndex: 'repaymentStatus',
          width: '10%',
        },
      ],
      data: _.map(addressBookInfo, (doc, index) => {
        const obj = _.pick(doc, ['telephoneNo', 'name', 'description', 'auditRemark']);
        obj.index = index + 1;
        return obj;
      }),
    };

    const columns = [
      {
        title: 'No.',
        dataIndex: 'index',
        width: '3%',
      },
      {
        title: 'Phone No',
        dataIndex: 'phone',
        width: '10%',
        render: (index, doc) => {
          let phoneIcon = doc.phone;
          if (isloanApply) {
            if (doc.repaymentStatus && doc.repaymentStatus === 'Delinquent') {
                phoneIcon = <a onClick={() => { that.goTo('loanauditdetails', doc); }} >{doc.phone}</a>;
            }
          } else if (!isloanApply) {
            if (doc.repaymentStatus && doc.repaymentStatus === 'Delinquent') {
                phoneIcon = <a onClick={() => { that.goTo('creditcollectionDetails', doc); }} >{doc.phone}</a>;
            }
          }

          if (doc.repaymentStatus && (doc.repaymentStatus !== 'Delinquent' && doc.repaymentStatus !== '—')) {
              phoneIcon = <a onClick={() => { that.goTo('postloandetails', doc); }} >{doc.phone}</a>;
          }

            return <div>
                {phoneIcon}
                <Tooltip placement="top" title="phone" defaultVisible={false}>
                    <Icon
                        style={{
                            fontSize: '22px',
                            color: '#108ee9',
                            marginLeft: "5px"
                        }}
                        type="phone"
                        onClick={()=>that.callNumber(doc.phone)}
                    />
                </Tooltip>
                <Tooltip placement="top" title="message" defaultVisible={false}>
                    <Icon
                        style={{
                            fontSize: '22px',
                            color: '#108ee9',
                            marginLeft: "5px"
                        }}
                        type="message"
                        onClick={()=>that.openMsgInput(doc.phone)}
                    />
                </Tooltip>
            </div>;
        },
      },
      {
        title: 'Name',
        dataIndex: 'name',
        width: '10%',
      },
      {
        title: 'Latest Call Time Lag',
        dataIndex: 'lastCallDuration',
        width: '10%',
      },
      {
        title: 'Latest Call Time',
        dataIndex: 'lastCallTime',
        width: '10%',
      },
      {
        title: 'Call Amount Within Half Years',
        dataIndex: 'callAmountWithinHalfYear',
        width: '10%',
      },
      {
        title: 'Recent Status',
        dataIndex: 'status',
        width: '10%',
      },
      {
        title: 'Recent Repayment Status',
        dataIndex: 'repaymentStatus',
        width: '10%',
      },
    ];

    if (isloanApply) {
      columns.push(
        {
          title: 'Remark by Evaluation',
          dataIndex: 'auditRemark',
          width: '10%',
          render: function (index, record1) {
            return (
              <div style={{ position: 'relative' }}>
                <Tooltip placement="top" title={record1.auditRemark} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                  <a style={remarkStyle}>{record1.auditRemark}</a>
                </Tooltip>
                <Icon type="edit" style={editStyle} onClick={(...arg) => { that.showRemarkModal(...arg, record1, 'auditRemark'); }} />
              </div>
            );
          },
        },
      );
    } else if (!isloanApply) {
      columns.push(
        {
          title: 'Remark by Evaluation',
          dataIndex: 'auditRemark',
          width: '10%',
          render: function (index, record1) {
            return (
              <div style={{ position: 'relative' }}>
                <Tooltip placement="top" title={record1.auditRemark} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                  <a style={remarkStyle}>{record1.auditRemark}</a>
                </Tooltip>
              </div>
            );
          },
        },
        {
          title: 'Remark',
          dataIndex: 'description',
          width:'10%',
          render: function (index, record) {
            return (
              <div style={{ position: 'relative' }}>
                <Tooltip placement="top" title={record.description} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                  <a style={remarkStyle}>{record.description}</a>
                </Tooltip>
                <Icon type="edit" style={editStyle} onClick={(...arg) => { that.showRemarkModal(...arg, record); }} />
              </div>
            );
          },
        },
      );
    }


    let data = _.map(that.state.addressBookInfo2, (doc, index) => {
      doc.lastCallDuration = parseInt(doc.lastCallDuration) ? `${parseInt(doc.lastCallDuration)}s` : '0s';
      _.each(doc, (v, i) => {
        if (!doc[i]) {
          doc[i] = '—';
        }
      });
      return doc;
    });

    data = _.sortBy(data, (doc) => { return -new Date(doc.lastCallTime).getTime(); });
    data = data.map((doc, index) => {
      doc.index = index + 1;
      return doc;
    });

    if (credit) {
      AddressBooks.columns = columns;
      AddressBooks.data = data;
    }
    if (LoanAudit) {
      AddressBooks.columns = columns;
      AddressBooks.data = data;
    }
    let rowSelection;
    if (that.props.sendMessaageCom) {
      rowSelection = {
        width: '10px',

        onChange: (selectedRowKeys, selectedRows) => {
          that.setState({
            selectedRows: selectedRows,
            showInputMessage: false,
            applyIdAndPhoneNumbers: [],
            count: selectedRowKeys.length,

          });
        },
      };
    } else {
      rowSelection = false;
    }

    const sendSMSSettings = {
      messageType: 'Addressbook person',
      confirmTitle: 'Send SMS to Addressbook',
      showInputMessage: that.state.showInputMessage,
      applyIdAndPhoneNumbers: that.state.applyIdAndPhoneNumbers,
      disableShowMessage: that.disableShowMessage,

    };

    return (
      <div className="address-book cl-table" key="address-book cl-table">
        <SendSMS settings={sendSMSSettings} />
        <Table
          bordered
          title={() => (that.props.sendMessaageCom == true ? 
            <div>
              <h4 className="table-title"> Address Book</h4>
              <Button type="primary" style={{ marginLeft: '90%' }} onClick={that.sendSMS.bind(this)}>Send SMS</Button></div> : <h4 className="table-title"> Address Book</h4>)}
          // loading={!that.state.addressBookInfo.length && !that.state.addressBookInfo2.length}
          pagination={false}
          columns={AddressBooks.columns}
          dataSource={AddressBooks.data}
          rowSelection={rowSelection}
          scroll={{ y: 320 }}
          rowKey={record => record.index}
        />

        <Modal
          title="Address Book Remark"
          visible={that.state.abRemark}
          onOk={that.handleOk}
          onCancel={that.handleCancel}
          okText="Save"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={4}>
              <h4>Remark:</h4>
            </Col>
          </Row>

          <Row style={{ marginTop: 20 }}>
            <Col>
              <TextArea autosize={{ minRows: 3, maxRows: 7 }} onBlur={that.setRemarkText} defaultValue={that.state.remarkText} />
            </Col>
          </Row>
        </Modal>
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
      </div>
    );
  }
}
export default AddressBook;
