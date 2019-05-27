import React from 'react';
import moment from 'moment';

import { CL } from '../tools/index';
import AsyncComponent from './asyncComponent.jsx';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';
import {Interface} from "../config/index.js";
import { Table, Icon, Input, Select, Row, Col, Modal, Button, message, Tooltip, notification} from 'antd';
const { TextArea } = Input;
const { confirm } = Modal;
const {Option} = Select;
import commonStore from 'Store/common';

const SendSMS =  AsyncComponent(() => import('../../../src/components/creditCollection/sendSMS.jsx'));

const { Details, contentType,  modificationLog, contactSave} = Interface;
let flag = false;

const TYPE = {
  1: "Required Contact",
  2: "Alternate contact"
}

const TYPEREVERT = {
  "Required Contact": 1,
  "Alternate contact": 2
}
import webSocket from  'Lib/tools/webSocket';



class ContactInfo extends CLComponent {

  constructor(props) {
    super(props);
    this.bindCtx([
      'loadData',
      "addNew",
      "minusNew",
      "setDocValue",
      "showConfim",
      "getLogs",
      "addMofiedData",
      "sendSMS",
      "disableShowMessage",
    ]);
  }

  state = {
      showInputMessage:false,
      applyIdAndPhoneNumbers:[],
         
    data: [],
    showSaveBtn: false,
    memberId: '',
    rsList: [],
    mData: [],
    msgVisible: false
  }

    componentWillMount() {
        commonStore.addEventChangeListener('SOCKET', this.updateSocket);
    }

  componentDidMount () {
    flag = false;
    this.getLogs()
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

  sendSMS(applyIdAndPhoneNumber){
      
      let tempArray = [];
       
      tempArray.push(applyIdAndPhoneNumber);
      
     this.state.showInputMessage = true;
      
     this.setState({
         showInputMessage:true,
         applyIdAndPhoneNumbers:tempArray});
       
   }

  componentWillReceiveProps (nextProps, nextState) {
    //远程加载数据
    if (nextProps.settings.contactPerson && nextProps.settings.contactPerson.loanContactPersonInfoRequired && !flag) {
      flag = !flag;
      this.loadData(nextProps.settings);
    }

    //从settings中获取PRequired  POptional
    if (!this.state.PRequired && nextProps.settings.contactPerson) {
      const that = this;
      const {contactPerson} = nextProps.settings;
      if (!contactPerson.loanContactPersonInfoRequired) {
        return;
      }

      const {loanContactPersonInfoRequired: PRequiredInfo, loanContactPersonInfoOptional: POptionalInfo} = contactPerson || {};
      const PRequired = PRequiredInfo && PRequiredInfo.length ? PRequiredInfo[0] : {};
      const PRequired1 = PRequiredInfo && PRequiredInfo.length ? PRequiredInfo[1] : {};
      const POptional = POptionalInfo && POptionalInfo.length ? POptionalInfo[0] : PRequired1;

      this.setState({
        PRequired,
        PRequired1,
        POptional
      })

      that.setData(PRequired, POptional)
    }

    //从settings中获取mark
    if (!this.state.mark && nextProps.settings.mark && _.values(nextProps.settings.mark).length) {
      const {mark} = nextProps.settings;
      this.setState({mark})
    }

    //从settings中获取memberId
    if (!this.state.memberId && nextProps.settings.memberId) {
      const {memberId} = nextProps.settings;
      this.setState({memberId})
    }
  }

  disableShowMessage(){
      
      
      this.setState({showInputMessage:false});
      
  }
  
  
  loadData (settings) {
    const that = this;
    const {contactPerson, memberId} = settings;
    const {loanContactPersonInfoRequired: PRequiredInfo, loanContactPersonInfoOptional: POptionalInfo} = contactPerson || {};

    const PRequired = PRequiredInfo && PRequiredInfo.length ? PRequiredInfo[0] : {};
    const PRequired1 = PRequiredInfo && PRequiredInfo.length ? PRequiredInfo[1] : {};
    const POptional = POptionalInfo && POptionalInfo.length ? POptionalInfo[0] : PRequired1;


    const applistSettings1 = {
      contentType,
      method: Details.getAppListByContact.type,
      url: Details.getAppListByContact.url,
      data: JSON.stringify({
        contactPersonInfo: {
          telephoneNo: PRequired.telephoneNo
        },
        page: {
          currentPage: 1,
          pageSize: 20
        }
      })
    }
    function applistFn1 (res) {
      if (res.data) {
        that.setState({
          PRequiredApp: res.data.result[0], 
        });
        that.setData();
      }
    }

    const applistSettings2 = {
      contentType,
      method: Details.getAppListByContact.type,
      url: Details.getAppListByContact.url,
      data: JSON.stringify({
        contactPersonInfo: {
          telephoneNo: POptional.telephoneNo
        },
        page: {
          currentPage: 1,
          pageSize: 20
        }
      })
    }
    function applistFn2 (res) {
      if (res.data) {
        that.setState({
          POptionalApp: res.data.result[0], 
        });
        that.setData();
      }
    }
    
    if (memberId && PRequired.telephoneNo && POptional.telephoneNo) {
      CL.clReqwest({settings: applistSettings1, fn: applistFn1});
      CL.clReqwest({settings: applistSettings2, fn: applistFn2});
    }
  }
  
  //点击加号
  addNew (e, doc) {
    let { data, mData} = this.state;
    const that = this;
    let obj = {
      "index": TYPEREVERT[doc.type] + 2,
      "type": doc.type,
      "relationship": "select",
      "name": "input",
      "telephoneNo":"input",
      "check":false,
      "modify": true
    }

    if (e.target.classList[1] === "anticon-edit") {
      obj.modify = "modifying";
    }


    let arr = [];
    _.each(mData , function (item) {
      if (item.type !== doc.type) {
        arr.push(item);
      }
    })
    doc.tag = "ContactInformation"
    CL.setEditFlag(doc)

    data = _.map(data, function(item) {
      if (doc.index == item.index) {
        item.modify = "modifying";
      }
      return item;
    });
    data.push(obj);

    that.setState({
      data,
      mData: arr,
      showSaveBtn: true,
    })
  }

  minusNew(e, doc) {
    const that = this;
    let {data} = that.state;

    //数据
    data = _.filter(data, function (o) {
      return o.index !== doc.index;
    });
    //还原加号
    data = _.map(data,  function (o) {
      if (o.type === doc.type) {
        o.modify = false;
      }
      return o;
    })

    data.length === 2 ? CL.removeEditFlag("ContactInformation") : '';
  
    that.setState({
      data,
      showSaveBtn: data.length === 2 ? false : true
    });
  }

  setDocValue (e, doc, tag) {
    if (!_.isString(e)) {
      e = e.target.value;
    }

    const that = this
    let {data} = that.state;

    data = _.map(data, function (item) {
      if (item.index === doc.index) {
        item[tag] = e;
      }
      return item;
    })
    that.setState({data});
  }

  setData (PRequired, POptional) {
    const that = this;
    const { PRequiredApp, POptionalApp, mark = {}} = that.state;
    PRequired = PRequired || that.state.PRequired;
    POptional = POptional || that.state.POptional;
    const data = [
      {
        index: "1",
        type: "Required Contact", //添加勾勾叉叉
        relationship: PRequired.relationship,
        name: PRequired.name,
        telephoneNo: PRequired.telephoneNo,
        applyed: PRequiredApp,
        // check: CL.setMark(mark, PRequired.id),
        matchingName: PRequired.matchingName,
        callAmount: PRequired.callAmount,
      },
      { 
        index: "2",
        type: "Alternate contact", //添加勾勾叉叉
        relationship: POptional.relationship,
        name: POptional.name,
        telephoneNo: POptional.telephoneNo,
        applyed: POptionalApp,
        // check: CL.setMark(mark, POptional.id),
        matchingName: POptional.matchingName,
        callAmount: POptional.callAmount,
      }
    ]

    that.setState({data: data})
  }

  showConfim (e) {
    const that = this;

    const memberId = that.state.memberId || this.props.settings.memberId;
    const {data} =that.state;

    let arr = data.slice(2);
    
    arr = arr.map( function (doc) {
      if ( doc.relationshipValue && doc.nameValue && doc.telephoneNoVaule ) {
        return {
          memberId: memberId,
          "relationship": doc.relationshipValue,
          "contactName": doc.nameValue,
          "contactTelNo": doc.telephoneNoVaule,
          "type": doc.type === "Alternate contact" ? 2 : 1
        }
      }
    })
    arr = _.compact(arr);

    if (!arr.length) {
      message.error("You must fill all input");
      return;
    }

    confirm({
      title: 'Confirm Save ?',
      content: 'Do you Want to save these contact information',
      onOk() {
        that.confirmSave(arr)
      },
      onCancel() {
      },
    });
  }

  confirmSave (arr) {
    const that = this;
    const settings = {
      contentType,
      method: contactSave.type,
      url: contactSave.url,
      data: JSON.stringify({logList: arr})
    }

    function fn (res) {
      if (res.code === 200  && res.result === "save success") {
        message.success("Save success");
        that.getLogs();
        that.setState({showSaveBtn: false});
        CL.removeEditFlag("ContactInformation")
      }
    }
    
    CL.clReqwest({settings, fn});
  }

  //经修改历史添加到数据最后
  addMofiedData(arr) {
    const that = this;
    if (!arr || !arr.length) {
      return [];
    }

    let {data} = that.state;

    arr = arr.map((doc, index) => {
      return {
        "index": 3 + index,
        "type": TYPE[doc.type],
        "relationship": doc.relationshipDes,
        "name": doc.contactName,
        "telephoneNo": doc.contactTelNo,
        "check": false,
        "modify": "modified"
      }
    });

    that.setState({
      mData: arr,
      data: data.slice(0, 2)
    })
  }

  //从服务端获取修改历史
  getLogs () {
    const that = this;
    const memberId = that.state.memberId || that.props.settings.memberId;
    const settings = {
      contentType,
      method: modificationLog.type,
      url: modificationLog.url,
      data: JSON.stringify({
        log: {
          memberId: memberId
        }
      })
    }

    function fn (res) {
      if (res.data) {
        that.setState({
          rsList: _.map(res.data.relationshipType, (doc) => {
            return {name: doc.typeName, value: doc.type };
          })
        })
        that.addMofiedData(res.data.logList);
      }
    }
    
    CL.clReqwest({settings, fn});
  }

  render() {
    const that = this;
    const {contactPerson, edit} = that.props.settings;
    const iconStyle = {
      color: "#108ee9",
      display: "block",
      position: "absolute",
      fontSize: "20px",
      marginTop: "-8px",
      cursor: "pointer",
      marginLeft: "10px",
    }

    //检查数据，是否需要将加号取消掉
    data = _.map(that.state.data, function(item) {
      if (_.find(that.state.mData, {type: item.type})) {
        item.modify = "modifying";
      }
      return item;
    });

    let data = _.sortBy(that.state.data.concat(that.state.mData), "index");

    const ContactInformation = {
      columns: [
        {
          title: 'Required type',
          dataIndex: 'type',
          render: function (index, doc) {
            if (doc.check) {
              return (<div>
                <Icon type={doc.check} />
                {doc.type}
              </div>)
            }
            return doc.type;
          }
        },
        {
          title: 'Relationship',
          dataIndex: 'relationship',
          render: function (index, record) {
            if (record.relationship === "select") {
              return (
                <Select
                  placeholder={"Please select"}
                  defaultValue=""
                  value={record.relationshipValue} 
                  style={{ width: 120 }} 
                  // onChange={handleChange}
                  onChange={(arg)=> {
                      that.setDocValue(arg, record, "relationshipValue");
                    }
                  }
                >
                  {that.state.rsList.map((d, index) => <Option key={d.value}>{d.name}</Option>)}
                </Select>
              )
            }  else  {
              return record.relationship;
            }
          }
        },
        
        {
          title: 'Contact name',
          dataIndex: 'name',
          render: function (index, record) {
            if (record.name === "input") {
              return (
                <Input  
                  // value={doc.editValue} 
                  placeholder={"Input contact name"}
                  style={{ width: "60%" }}
                  value={record.nameValue}
                  onChange={(...arg)=> {
                      that.setDocValue(...arg, record, "nameValue");
                    }
                  }
                />
              )
            }  else  {
              return record.name;
            }
          }
        },
        {
          title: 'Name in Contact List',
          dataIndex: 'matchingName',
          render: function (index, record) {
            let name = '';
            if (!record.matchingName) {
              name = "—";
            } else {
              name = record.matchingName;
            }
            return name;
          }
        },
        {
          title: 'Contact Tel No',
          dataIndex: 'telephoneNo',
          width: 200,
          render: function (doc, record) {
            if (record.telephoneNo === "input") {
             return (
              <Input  
                placeholder={"Input contact tel no"}
                style={{ width: "60%" }}
                value={record.telephoneNoVaule}
                onChange={(...arg)=> {
                    that.setDocValue(...arg, record, "telephoneNoVaule");
                  }
                }
              />
            )
            } else {
                
               if(that.props.settings.sendMessaageCom){
                   
                   if (record.applyed) {
                       return (<div style={{position: "relative"}}>
                         <a href={`#/uplending/loanauditdetails/${record.applyed.appId}/0`}
                            target="_blank">{record.telephoneNo}</a>

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
                               onClick={()=>that.callNumber(record.telephoneNo)}
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
                                 onClick={()=>that.openMsgInput(record.telephoneNo)}
                             />
                         </Tooltip>
                         <Tooltip placement="top" title="mail" defaultVisible={false}>
                           <Icon style={{
                               display: "block",
                               position: "absolute",
                               right: "0",
                               fontSize: "22px",
                               top: "0px",
                               color: "#108ee9"
                           }}
                                 type="mail"
                                 onClick={that.sendSMS.bind(null, {
                                     applicationId: that.props.settings.applyId,
                                     phone: record.telephoneNo
                                 })}/>
                         </Tooltip>
                       </div>)
                     } else {
                       return (<div style={{position: "relative"}}>{record.telephoneNo}

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
                               onClick={()=>that.callNumber(record.telephoneNo)}
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
                               onClick={()=>that.openMsgInput(record.telephoneNo)}
                           />
                         </Tooltip>
                         <Tooltip placement="top" title="mail" defaultVisible={false}>
                           <Icon style={{ display: "block",
                                   position: "absolute",
                                   right: "0",
                                   fontSize: "22px",
                                   top: "0px",
                                   color: "#108ee9"}}
                                 type="mail"
                                 onClick={that.sendSMS.bind(null,{applicationId:that.props.settings.applyId,phone:record.telephoneNo})} />
                         </Tooltip>
                       </div>);
                     }
                   
               }else{
                   
                   if (record.applyed) {
                       return (<a href={`#/uplending/loanauditdetails/${record.applyed.appId}/0`} target="_blank">{record.telephoneNo}</a>)
                     } else {
                       return record.telephoneNo;
                     }
                   
               }
            }
          }
        },
        {
          title: 'Whether to apply',
          dataIndex: 'applyed',
          render: function (doc, record) {
            if (record.applyed) {
              return 'Y';
            } else {
              return "N";
            }
          }
        },
        {
          title: 'Call Amount',
          dataIndex: 'callAmount',
          render: function (index, record) {
            let amount = '';
            if (!record.callAmount) {
              amount = "—";
            } else {
              amount = record.callAmount;
            }
            return amount;
          }
        },
      ],
      data: data,
      tag: "ContactInformation"
    };

    if (edit) {
      ContactInformation.columns.push({
        title: 'Modify contact',
        dataIndex: 'contactIcon',
        render: function (doc, record) {
          if (!record.modify) {
            return (<Icon style={iconStyle} type="plus-circle-o" onClick={(...arg) => { that.addNew(...arg, record)}}/>)
          } else if (record.modify === "modifying") {
            return "";
          } else if (record.modify === "modified") {
            return (<Icon style={iconStyle} type="edit" onClick={(...arg) => { that.addNew(...arg, record)}}/>)
          } else {
            return (<Icon style={iconStyle} type="minus-circle-o" onClick={(...arg) => { that.minusNew(...arg, record)}}/>)
          }
        }
      })
    }

    //标记行class
    function setTrClassName (record, index) {
      if (record.index > 2) {
        return "blueFont";
      } else {
        return "normal";
      }
    }

    const sendSMSSettings = {
            messageType:"Contact person",
            confirmTitle:"Send SMS",
            showInputMessage:that.state.showInputMessage,
            applyIdAndPhoneNumbers:that.state.applyIdAndPhoneNumbers,
            disableShowMessage:that.disableShowMessage
    }
    
    return (<div>
      <SendSMS settings={sendSMSSettings}></SendSMS>
      <Table  bordered  className="contact-information cl-table" key="contact-information cl-table" 
        title = {() => (
          <Row>
            <Col span={4}>
              <h4 className="table-title"> Contact Information </h4>
            </Col>
            {
              that.state.showSaveBtn ? (
                <Col>
                    <Button type="primary" onClick={that.showConfim}> Save </Button>
                </Col>
              ) : ''
            }
          </Row>
        )}
        loading = {!contactPerson}
        pagination = {false}
        rowClassName = {setTrClassName}
        columns={ContactInformation.columns} 
        rowKey={record =>  record.index}
        dataSource={ContactInformation.data} />
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
    )
  }
}
export default ContactInfo;