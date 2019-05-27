import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, AsyncComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL, SessionManagement } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import commonStore from 'Store/common';

import _ from 'lodash';
import { Button, Input, Modal, Tabs, Tooltip, message, Select, Col, Row, Icon, notification } from 'antd';

const Option = Select.Option;
const { TextArea } = Input;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const {
  saleManagementList,
  contentType,
  callSaleClientReasonType,
  appConfigListAppName,
  marketingCallAllType,
  marketingCallcl
} = Interface;
let TB;
const Salesresult = AsyncComponent(() => import('./Salesresult.jsx'));
const CallAnain = AsyncComponent(() => import('./callAnain.jsx'));
const CallData = AsyncComponent(() => import('./callData.jsx'));

let numArr = [];
for (let i = 4; i <= 72; i++) {
  numArr.push(i);
}

let sessionCode = SessionManagement.getStorageList().callRetrieve.clientList;
import webSocket from  'Lib/tools/webSocket';

class Callsale extends CLComponent {
  state = {
    tableLoading: false,
    search: {},
    typeNameList: [],
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    dateStart: _.map(numArr, item => {
      return {
        name: '' + item,
        value: '' + item
      };
    }),
    dateEnd: _.map(numArr, item => {
      return {
        name: '' + item,
        value: '' + item
      };
    }),
    data: [],
    firstButtonPopover: false,
    type: '1',
    subject: '',
    dataList: {},
    appName: '',
    telephoneNo: '',
    reasonTypeList: [],
    appList: [],
    reasion: '',
    dealType: '',
    arr: [],
    advisorList: [],
    title: '',
    callAgain: false,
    msgVisible: false
  };

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'handleCancel',
      'sendTextMessage',
      'tabChange',
      'noteChange1',
      'firstButton',
      'secondButton',
      'pageChage',
      'version',
      'telephoneNo',
      'search',
      'clear',
      'suspend',
    ]);

  }

    componentWillMount() {
        commonStore.addEventChangeListener('SOCKET', this.updateSocket);
    }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    let type = sessionStorage.getItem('operateDataType') || '1';
    this.setState({ type: type });
    this.loadData(this.state.search, this.state.pagination);
    this.callSaleClientReasonType();
    this.getProductVersion();
    this.marketingCallAllType();
  }

  componentWillUnmount() {
    SessionManagement.destroySession(sessionCode);
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

    onWordsChange = (e) => {
        this.setState({ msgWords: e.target.value });
    };

    openMsgInput = (phone) => {
        this.setState({ phone, msgVisible: true });
    };

  loadData(search, page) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      tabIndex: '1',
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10
      },
      operatorId: that.state.advisor,
      callType: that.state.typeName,
    };
    for (let key in search) {
      if (key == 'appName') {
        params.appName = search[key];
      } else if (key == 'telephoneNo') {
        params.telephoneNo = search[key];
      }
    }
    const settings = {
      contentType,
      method: saleManagementList.type,
      url: saleManagementList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      const data = res.data;
      if (res.code == 200) {
        const pagination = {
          total: data.page.totalCount,
          pageSize: data.page.pageSize,
          currentPage: data.page.currentPage,
        };

        SessionManagement.setSessionBatch(sessionCode, { pagination, search });

        that.setState({
          data: data.page.result || [],
          pagination: pagination,
        });
      } else {
        console.log('请求失败，可能是服务器故障!');
      }
    }

    CL.clReqwest({
      settings,
      fn
    });
  }

  pageChage(e) { // list 切换页面
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };

    this.setState({ pagination: pagination });
    this.loadData(this.state.search, pagination);
  }

  search() {
    const that = this;
    let searchNow = that.state.search;
    for (let key in searchNow) {
      if (searchNow[key] == '') {
        delete searchNow[key];
      }
    }
    const pagination = that.state.pagination;
    pagination.currentPage = 1;
    this.setState({
      search: searchNow,
      pagination: pagination
    });
    this.loadData(searchNow, pagination);
  }

  clear() {
    let search = this.state.search;
    for (let key in search) {
      search.appName = '';
      search.telephoneNo = '';
      search.startHour = '';
      search.endHour = '';
      search.endHour = '';
      search.advisor = '';
      search.typeName = '';
    }
    this.setState({
      appName: null,
      telephoneNo: null,
      startHour: null,
      endHour: null,
      advisor: null,
      typeName: null,
      search: search
    });
  }

  callSaleClientReasonType() {
    const that = this;
    const settings = {
      contentType,
      method: callSaleClientReasonType.type,
      url: callSaleClientReasonType.url,
    };

    function fn(res) {
      const data = res.data;
      if (data) {
        that.setState({
          reasonTypeList: data || [],
        });
      }
    }

    CL.clReqwest({
      settings,
      fn
    });
  }

  getProductVersion() {
    const that = this;
    const settings = {
      contentType,
      method: appConfigListAppName.type,
      url: appConfigListAppName.url,
    };

    function fn(res) {
      const data = res.data;
      if (data) {
        const roles = [];
        res.data.map((doc, index) => {
          roles.push({
            name: doc,
            value: doc,
          });
        });
        that.setState({
          appList: roles,
        });
      }
    }

    CL.clReqwest({
      settings,
      fn
    });
  }

  marketingCallAllType = () => {
    const that = this;
    const settings = {
      contentType,
      method: marketingCallAllType.type,
      url: marketingCallAllType.url,
    };

    function fn(res) {
      const data = res.data;
      if (data) {
        let advisorList = [];
        let typeNameList = [];
        res.data.advisor.map((doc,index) => {
          advisorList.push({
            name: doc.string,
            value: doc.val
          });
        });
        let obj = res.data.type;
        for (const x in obj) {
          typeNameList.push({
              name: obj[x],
              value: x
            });
        }
        that.setState({
          advisorList,
          typeNameList
        });
      }
    }

    CL.clReqwest({ settings,fn});
  }

  handleReset = () => {
    this.setState({
      pagination: {},
      search: {}
    });
  };

  tabChange(e) {
    this.setState({
      type: e,
    });
    sessionStorage.setItem('operateDataType', e);
  }

  advisor = (e) => {
    let search = this.state.search;
    // e == 0 ? search.packetName = '0' : search.packetName = e;
    search.advisor = e;
    this.setState({
      search: search,
      advisor: e
    });
  };

  typeNameOnchange = (e) => {
    let search = this.state.search;
    search.typeName = e;
    this.setState({
      search: search,
      typeName: e
    });
  }

  version(e) {
    let search = this.state.search;
    search.appName = e;
    this.setState({
      search: search,
      appName: e
    });
  }

  telephoneNo(e) {
    let search = this.state.search;
    search.telephoneNo = e.target.value || '';
    this.setState({
      search: search,
      telephoneNo: e.target.value
    });
  }

  firstButton(data, title) {
    this.setState({ firstButtonPopover: true, dataList: data, dealType: 1, title: title });
  }

  secondButton(data, title) {
    this.setState({ firstButtonPopover: true, dataList: data, dealType: 2, title: title });
  }

  fourButton = (data, title) => {
    this.setState({ firstButtonPopover: true, dataList: data, dealType: 4, title: title });
  }

  thirdButton = (data) => {
    const that = this;
    confirm({
      title: 'Whether to do ?',
      onOk() {
        const settings = {
          contentType,
          method: marketingCallcl.type,
          url: marketingCallcl.url,
          data: JSON.stringify({
            callId: data.callNo,
            dealStatus: 3,
          }),
        };
        const fn = function (res) {
          if (res && res.data) {
            that.setState({
              firstButtonPopover: false,
            });
            that.loadData(that.state.search, that.state.pagination);
            message.success('Success');
          }
        };
        CL.clReqwest({
          settings,
          fn
        });
      },
    });
  };

  suspend(e) {
    this.setState({ reasion: e, });
  }

  handleCancel = (e) => {
    this.setState({
      firstButtonPopover: false,
        msgVisible: false
    });
    if (TB) {
      TB.remove();
    }
  };

  sendTextMessage() {
    const that = this;
    const data = that.state.dataList;
    confirm({
      title: 'Notice',
      content: 'Whether to do ?',
      onOk() {
        const settings = {
          contentType,
          method: marketingCallcl.type,
          url: marketingCallcl.url,
          data: JSON.stringify({
            callId: data.callNo,
            dealStatus: that.state.dealType,
            reason: that.state.reasion,
            remark: that.state.subject,
          }),
        };
        const fn = function (res) {
          if (res && res.data) {
            that.setState({
              firstButtonPopover: false
            });
            that.loadData(that.state.search, that.state.pagination);
            message.success('success');
          }
        };
        CL.clReqwest({
          settings,
          fn
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  noteChange1(e) {
    if (e.target.value.length > 2000) {
      message.error('The number of words exceeds 2000 characters');
      return;
    }
    this.setState({ subject: e.target.value });
  }

  renderBody() {
    const that = this;
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      width: '100px',
    };
    let showStatus = false;
    if ((_.indexOf(JSON.parse(sessionStorage.getItem('roles')), 'sales_admin') > -1)) {
      showStatus = true;
    }
    const columns = [
      {
        title: 'Call No',
        dataIndex: 'callNo',
        width: '5%',
        render: function (text, record) {
          return record.callNo;
        },
      },
      {
        title: 'Quit time',
        dataIndex: 'quitTime',
        width: '10%',
        render: function (text, record) {
          if(!record.quitTime){
            return '—'
          }
          return moment(record.quitTime)
            .format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: 'Name',
        width: '9%',
        dataIndex: 'name',
        render(index, record) {
          if(!record.name){
            return '—'
          }
          return record.name;
        },
      },
      {
        title: 'Gender',
        width: '6%',
        dataIndex: 'gender',
        render(index, record) {
          if(!record.gender){
            return '—'
          }
          return record.gender;
        },
      },
      {
        title: 'Age',
        dataIndex: 'age',
        width: '5%',
        render(index, record) {
          if(!record.age){
            return '—'
          }
          return record.age;
        },
      },
      {
        title: 'Tel',
        dataIndex: 'tel',
          width: 180,
        render(index, record) {
          if(!record.tel){
            return '—'
          }
          return [record.tel,
            <Tooltip placement="top" title="phone" defaultVisible={false}>
              <Icon
                  style={{
                      fontSize: '22px',
                      color: '#108ee9',
                      marginLeft: "5px"
                  }}
                  type="phone"
                  onClick={() => that.callNumber(record.tel)}
              />
            </Tooltip>,
            <Tooltip placement="top" title="message" defaultVisible={false}>
              <Icon
                  style={{
                      fontSize: '22px',
                      color: '#108ee9',
                      marginLeft: "5px"
                  }}
                  type="message"
                  onClick={() => that.openMsgInput(record.tel)}
              />
            </Tooltip>];
        },
      },
      {
        title: 'App name',
        dataIndex: 'appName',
        width: '8%',
        render(index, record) {
          if(!record.appName){
            return '—'
          }
          return record.appName;
        },
      },
      {
        title: 'Type',
        dataIndex: 'type',
        width: '9%',
        render(index, record) {
          if(!record.type){
            return '—'
          }
          return record.type;
        },
      },
      {
        title: 'Remark',
        dataIndex: 'remark',
        width: '10%',
        render(index, record) {
          if(!record.remark){
            return '—';
          }
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.remark} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <a style={remarkStyle}>{record.remark}</a>
              </Tooltip>
            </div>
          );
        },
      },
      {
        title: 'Advisor',
        dataIndex: 'advisor',
        width: '8%',
        render(index, record) {
          if(!record.advisor){
            return '—'
          }
          return record.advisor;
        },
      },
      {
        title: 'Operate',
        dataIndex: 'resideCity',
        render: function (text, record) {
          return (
            <Row gutter={1}>
              <Col span={8}>
                <Button type="primary" onClick={() => { that.firstButton(record, 'Deal'); }} style={{ padding: '0 28px' }}>Deal</Button>
              </Col>
              <Col span={8}>
                <Button type="danger" onClick={() => { that.secondButton(record, 'Suspend'); }}>Suspend</Button>
              </Col>
              {record.callAgain == true ? 
              <Col span={8}>
                <Button type="danger" onClick={() => { that.thirdButton(record); }}>Call again</Button>
              </Col>  : 
              <Col span={8}>
                <Button type="danger" onClick={() => { that.fourButton(record, 'Unreachable'); }} >Unreachable</Button>
              </Col>} 
            </Row>
          );
        },
      },
    ];

    const { data = [] } = this.state;
    const settings = {
      data: data,
      columns: columns,
      // operation: operation,
      // getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      sessionCode,
      handleReset: this.handleReset
    };

    return (
      <div className="Callsale" key="Callsale">
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>
          <TabPane tab="Client list" key="1">
          {showStatus? 
            <div>
            <Row style={{ marginTop: 20, padding: '0 20px' }}>
              <Col span={6}>
                <span>APP name：</span>
                <Select onChange={that.version} style={{ width: 150 }} value={that.state.appName}>
                  {
                    that.state.appList.map(doc => {
                      return (
                        <Option key={doc.value} value={doc.value}>{doc.name}</Option>
                      );
                    })
                  }
                </Select>
              </Col>
              <Col span={6}>
                <span>Tel：</span>
                <Input value={that.state.telephoneNo} onChange={that.telephoneNo} style={{ width: 150 }}/>
              </Col>
              <Col span={6}>
                <span style={{ marginRight: 15 }}>Advisor：</span>
                <Select onChange={that.advisor} style={{ width: 150 }} value={that.state.advisor}>
                  {
                    that.state.advisorList.map(doc => {
                      return (
                        <Option key={doc.value} value={doc.value}>{doc.name}</Option>
                      );
                    })
                  }
                </Select>
              </Col>
              <Col span={6}>
                <span style={{ marginRight: 15 }}>Type：</span>
                <Select onChange={that.typeNameOnchange} style={{ width: 150 }} value={that.state.typeName}>
                  {
                    that.state.typeNameList.map(doc => {
                      return (
                        <Option key={doc.value} value={doc.value}>{doc.name}</Option>
                      );
                    })
                  }
                </Select>
              </Col>
            </Row>
            <Row style={{ marginTop: 20 }}>
              <Col span={2} offset={20}>
                <Button type="primary" onClick={that.search}>search</Button>
              </Col>
              <Col span={2}>
                <Button type="text" onClick={that.clear}>clear</Button>
              </Col>
            </Row>
          </div> : ''
        }
          
            <CLlist settings={settings} />
          </TabPane>
          {/* <TabPane tab="Call again" key="2">
            <CallAnain />
          </TabPane> */}
          <TabPane tab="Advise Result" key="3">
            <Salesresult />
          </TabPane>
          <TabPane tab="Call data" key="4">
            <CallData />
          </TabPane>
        </Tabs>
        <Modal
          visible={that.state.firstButtonPopover}
          onOk={this.sendTextMessage}
          onCancel={that.handleCancel}
          okText="Confirm"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
          title={that.state.title}
        >
          <h4 style={{ padding: 10 }}>Why quit before？</h4>
          <Select onChange={that.suspend} style={{ width: 280 }} value={that.state.reasion}>
            {
              that.state.reasonTypeList.map(doc => {
                return (
                  <Option key={doc.type} value={doc.type}>{doc.typeName}</Option>
                );
              })
            }
          </Select>
          <h4 style={{ padding: 10 }}>Notes:</h4>
          <TextArea placeholder="Please inout..." autosize={{ minRows: 2, maxRows: 6 }} onChange={that.noteChange1}/>
        </Modal>
        <Modal
            title="please input words"
            visible={that.state.msgVisible}
            onCancel={that.handleCancel}
            mask
            footer={[
              <Button key="OK" type="primary" onClick={that.sendMsg}>
                Send
              </Button>,
            ]}

            style={{ width: '2000px', height: '600px' }}
        >
          <TextArea onChange={that.onWordsChange}/>
        </Modal>
      </div>
    );
  }

  render(data) {
    return (
      <QueueAnim className="animate-content" type={this.state.aniType}>
        {this.state.showBlock ? [this.renderBody()] : null}
      </QueueAnim>
    );
  }
}

export default Callsale;
