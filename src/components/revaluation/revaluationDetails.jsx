import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { Interface } from '../../../src/lib/config/index';
import {
  CLComponent,
  AddressBook, 
  AddressBookInfo, 
  NoteLog, 
  OperateRecord, 
  AppInstall, 
  MessageInfo,  
  PhonecallLog,
  MailInfo,
  // FacebookInfo,
  ContactInfo,
  Disbursement,
  EmploymentInfo,
  BasicInfo,
  IdentificationInfo,
  ChargeDetails,
  UserInfo,
  LoanRecord,
  AppFromAddressBook,

} from '../../../src/lib/component/index';
import { CLAnimate, CL} from '../../../src/lib/tools/index';
import { Button, Row, Col, Card, Table, Input, message, Spin, Modal, Icon} from 'antd';
const { TextArea } = Input;
const { getRevaluationDetail, contentType, LoanAuditExamine, getAuditMark, getRevMark,
  saveLoanNotes, contactAndCall, contactAndMessage, Details, getAppInfoByMemberId} = Interface;

function examie ({comment, id, status, fallBackMessage}, that) {
  that.setState({btnLoading: true});
  const settings = {
    contentType,
    method: LoanAuditExamine.type,
    url: LoanAuditExamine.url,
    data: JSON.stringify({
      comment,
      id,
      status,
      fallBackMessage,
      operationType: 2
    })
  }

  function fn(res) {
    that.setState({btnLoading: false});
    if (res.data) {
      message.success("operate success");
      location.hash = "/uplending/revaluation";
    }
  }
  CL.clReqwest({settings, fn});
}


class RevaluationDetails extends CLComponent {
  state = {
    data: null,
    pagination: false,
    mark: {},
    btnLoading: false,
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "loadData",
      "confirm",
      "saveNote",
      "setFallBackMessage",
      "handleOk",
      "handleCancel",
      "setNote",
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    this.loadData(this.props.match.params)
  }

  loadData (params) {
    const that = this;
    const settings = {
      contentType,
      method: Details.getLoanBasisiInfo.type,
      url: Details.getLoanBasisiInfo.url + params.id,
    }

    function fn (res) { //加载数据异步，加载完成后风控异步
      if (res.data) {
        that.setState({loanBasisInfo: res.data});
        const applicationId = params.id;
        const memberId = res.data.memberId;
        const name = res.data.name;
        const basisId = res.data.id;
        that.setState({
          memberId,
          applicationId,
        });

        const markSettings = {
          contentType,
          method: getRevMark.type,
          url: getRevMark.url + params.id
        }
        function markFn(res) {
          if (res.data) {
            that.setState({mark: res.data});
          }
        }

        const contactPersonSettings = {
          contentType,
          method: Details.getLoanContactInfo.type,
          url: Details.getLoanContactInfo.url,
          data: JSON.stringify({
            memberId,
            id: basisId,
            appId: parseInt(applicationId),
          })
        }
        function contactPersonFn (res) {
          if (res.data) {
            //获取两个必填联系人通话详情
            const tel1 = res.data.loanContactPersonInfoRequired[0].telephoneNo;
            const tel2 = (res.data.loanContactPersonInfoOptional[0] || {}).telephoneNo || res.data.loanContactPersonInfoRequired[1].telephoneNo;
            const requiredId = res.data.loanContactPersonInfoRequired[0].id;
            const optionalId = (res.data.loanContactPersonInfoOptional[0] || {}).id || res.data.loanContactPersonInfoRequired[1].id;

            that.setState({
              contactPerson: res.data,
              requiredId: requiredId,
              optionalId: optionalId
            });

            const contact1Settings = {
              contentType,
              method: Details.contactAndCall.type,
              url: Details.contactAndCall.url,
              data: JSON.stringify({
                memberId: memberId,
                telephone: tel1
              })
            }
            function contact1Info (res) {
              if (res.data) {
                that.setState({contact1: res.data});
              }
            }

            const contact2Settings = {
              contentType,
              method: Details.contactAndCall.type,
              url: Details.contactAndCall.url,
              data: JSON.stringify({
                memberId: memberId,
                telephone: tel2
              })
            }
            function contact2Info (res) {
              if (res.data) {
                that.setState({contact2: res.data});
              }
            }

            const message1Settings = {
              contentType,
              method: Details.contactAndMessage.type,
              url: Details.contactAndMessage.url,
              data: JSON.stringify({
                memberId: memberId,
                telephone: tel1
              })
            }
            function message1Info (res) {
              if (res.data) {
                that.setState({message1: res.data});
              }
            }

            const message2Settings = {
              contentType,
              method: Details.contactAndMessage.type,
              url: Details.contactAndMessage.url,
              data: JSON.stringify({
                memberId: memberId,
                telephone: tel2
              })
            }
            function message2Info (res) {
              if (res.data) {
                that.setState({message2: res.data});
              }
            }

            CL.clReqwest({settings: contact1Settings, fn: contact1Info});
            CL.clReqwest({settings: contact2Settings, fn: contact2Info});
            CL.clReqwest({settings: message1Settings, fn: message1Info});
            CL.clReqwest({settings: message2Settings, fn: message2Info});
          } else {
            that.setState({contactPerson: {}});
          }
        }

        const userDataSettings = {
          contentType,
          method: Details.getUserData.type,
          url: Details.getUserData.url,
          data: JSON.stringify({
            memberId
          })
        }
        function userDataFn (res) {
          if (res.data) {
            that.setState({userData: res.data});
          }
        }

        const orderInfoSettings = {
          contentType,
          method: Details.getLoanOrderInfo.type,
          url: Details.getLoanOrderInfo.url,
          data: JSON.stringify({
            applicationId
          })
        }
        function orderInfoFn (res) {
          if (res.data) {
            that.setState({orderInfo: res.data});
          }
        }

        const firstMessageSettings = {
          contentType,
          method: Details.getFirstMessage.type,
          url: Details.getFirstMessage.url,
          data: JSON.stringify({
            memberId
          })
        }
        function firstMessageFn (res) {
          if (res.data) {
            that.setState({firstMessage: res.data});
          }
        }

        const lastMessageSettings = {
          contentType,
          method: Details.getLastMessage.type,
          url: Details.getLastMessage.url,
          data: JSON.stringify({
            memberId
          })
        }
        function lastMessageFn (res) {
          if (res.data) {
            that.setState({lastMessage: res.data});
          }
        }

        const firstCallSettings = {
          contentType,
          method: Details.getFirstCall.type,
          url: Details.getFirstCall.url,
          data: JSON.stringify({
            memberId
          })
        }
        function firstCallFn (res) {
          if (res.data) {
            that.setState({firstCall: res.data});
          }
        }

        const lastCallSettings = {
          contentType,
          method: Details.getLastCall.type,
          url: Details.getLastCall.url,
          data: JSON.stringify({
            memberId
          })
        }
        function lastCallFn (res) {
          if (res.data) {
            that.setState({lastCall: res.data});
          }
        }

        const deviceCheckSettings = {
          contentType,
          method: Details.deviceCheck.type,
          url: Details.deviceCheck.url,
          data: JSON.stringify({
            memberId
          })
        }
        function deviceCheckFn (res) {
          if (res.data) {
            that.setState({deviceCheck: res.data});
          }
        }

        const loanNoteSettings = {
          contentType,
          method: Details.getLoanNotes.type,
          url: Details.getLoanNotes.url,
          data: JSON.stringify({
            applicationId,
            memberId
          })
        }
        function loanNotesFn (res) {
          if (res.data) {
            that.setState({noteLog: res.data.loanNotesList});
          }
        }

        const repetitionUserSettings = {
          contentType,
          method: Details.repetitionUser.type,
          url: Details.repetitionUser.url,
          data: JSON.stringify({
            loanBasisInfo: {
              notMemberId: memberId,
              name: name
            }
          })
        }

        function repetitionUserFn (res) {
          let users = [];
          if (res.data.repetitionUser && res.data.repetitionUser.length) {
            res.data.repetitionUser.map( function (doc, index) {
              users.push({
                id: index,
                telephoneNo: doc.memberPhone,
                memberId: doc.memberId
              })
            })
          }

          if (users.length) {
            that.setState({sameUser: users})
          }
        }

        CL.clReqwest({settings: markSettings, fn: markFn});
        CL.clReqwest({settings: contactPersonSettings, fn: contactPersonFn});
        CL.clReqwest({settings: userDataSettings, fn: userDataFn});
        CL.clReqwest({settings: orderInfoSettings, fn: orderInfoFn});
        CL.clReqwest({settings: firstMessageSettings, fn: firstMessageFn});
        CL.clReqwest({settings: lastMessageSettings, fn: lastMessageFn});
        CL.clReqwest({settings: firstCallSettings, fn: firstCallFn});
        CL.clReqwest({settings: lastCallSettings, fn: lastCallFn});
        CL.clReqwest({settings: deviceCheckSettings, fn: deviceCheckFn});
        CL.clReqwest({settings: loanNoteSettings, fn: loanNotesFn});
        CL.clReqwest({settings: repetitionUserSettings, fn: repetitionUserFn});
      }
    }
    CL.clReqwest({settings, fn: fn});
  }

  setFallBackMessage (e) {
    if (e.target.value.length > 2000) {
      message.error("Exceeding the word limit.");
      return;
    }
    this.setState({fallBackMessage: e.target.value});
  }

  handleOk() {
    const that = this; 
    const fallBackMessage = this.state.fallBackMessage;
    const comment = this.refs.notes.textAreaRef.value || '';
    const id = this.props.match.params.id;
    const status = "fallback";

    if (comment.length > 2000) {
      message.error("Exceeding the word limit.");
      return;
    }

    if (!fallBackMessage) {
      message.error("you must type fallback message!");
      return;
    }

    examie({comment, id, status, fallBackMessage}, that);
  }

  handleCancel () {
    this.setState({refuseModalShow: false});
  }

  confirm (e) {
    const that = this;
    const comment = that.refs.notes.textAreaRef.value || '';
    const status = e.target.value;
    const id = that.props.match.params.id;
    const fallBackMessage = '';
    const confirm = Modal.confirm;

    if (comment.length > 2000) {
      message.error("Exceeding the word limit.");
      return;
    }

    const messageObj = {
      refuse: "refuse",
      pass: "approve"
    }

    if (status === 'refuse' || status === 'pass') {
      confirm({
        title: 'Notice ?',
        content: `Sure to ${messageObj[status]}?`,
        okText: "Confirm",
        cancelText: 'No',
        onOk() {
          examie({comment, id, status, fallBackMessage}, that)
        }
      });
    }

    if (status === "fallback")  {
      that.setState({refuseModalShow: true});
    }
  }

  saveNote (e) {
    const that = this;
    const applicationId = that.props.match.params.id;
    const note = that.refs.notes.textAreaRef.value || '';
    const appStatus = that.state.loanBasisInfo.appStatus;
    if (note.length > 2000) {
      message.error("Exceeding the word limit.");
      return;
    }
    that.setState({note: ''});
    const settings = {
      contentType,
      method: saveLoanNotes.type,
      url: saveLoanNotes.url,
      data: JSON.stringify({
        note,
        applicationId,
        appStatus
      })
    }

    that.setState({btnLoading: true});
    function fn (res) {
      that.setState({btnLoading: false});
      if (res.data) {
        message.success("operate success");
        that.loadData(that.props.match.params);
      }
    }
    CL.clReqwest({settings, fn});
  }

  setNote (e) {
    if (e.target.value.length > 2000) {
      message.error("Exceeding the word limit.");
      return;
    }
    this.setState({note: e.target.value});
  }

 
  renderBody() {
    const that = this;
    if (!this.state.loanBasisInfo) {
      return (
        <div className="full-loading" key="full-loading">
          <Spin size="large" />
        </div>
      );
    }

    let {
      loanBasisInfo, 
      orderInfo, 
      userData,
      contactPerson,
      deviceCheck,
      sameUser,
      mark,
      noteLog,
      firstMessage,
      lastMessage,
      firstCall,
      lastCall,
      contact1,
      contact2,
      message1,
      message2,
    } = this.state;

    loanBasisInfo = loanBasisInfo || {};
    orderInfo = orderInfo || {};
    userData = userData || {};
    deviceCheck = deviceCheck || {};
    contact1 = contact1 || {};
    contact2 = contact2 || {};
    message1 = message1 || {};
    message2 = message2 || {};
    firstCall = firstCall || {};
    lastCall = lastCall || {};
    firstMessage = firstMessage || {};
    lastMessage = lastMessage || {};
    mark = mark || {};

    let {usersOfTheSameDevice} = deviceCheck;
    usersOfTheSameDevice = usersOfTheSameDevice || {};
    let sameDevice = [];
    _.each(usersOfTheSameDevice, (doc, index) => {
      _.each(doc, (subItem, subIndex) => {
        if (!_.find(sameDevice, function (o) {return o.telephoneNo === subItem.telephoneNo})) {
          sameDevice.push(subItem);
        }
      });
    });


    const UserInfoSettings = { loanBasisInfo, orderInfo,}
    const ChargeDetailsSettings = {loanBasisInfo,}
    const IdentificationInfoSettings = {loanBasisInfo, deviceCheck, sameUser, sameDevice, }
    const BasicInfoSettings = {loanBasisInfo, mark,}
    const EmploymentInfoSettings= {loanBasisInfo, mark,}
    const DisbursementSettings = {loanBasisInfo, mark,}
    const ContactInfoSettings = {contactPerson, mark, memberId: that.state.memberId}
    const PhonecallLogSettings = {userData, mark, firstCall, lastCall, contact1, contact2, 
      requiredId: that.state.requiredId, 
      optionalId: that.state.optionalId
    }
    
    const MessageInfoSettings = {userData, mark, firstMessage, lastMessage, message2, message1, 
      requiredId: that.state.requiredId, 
      optionalId: that.state.optionalId,
      showMark: true
    }
    const MailInfoSettings = {userData,}
    // const FacebookInfoSettings = {loanBasisInfo, userData,}
    const NoteLogSettings = { noteLog,}

    return (
      <div className="loan-audit-details" key="loan-audit-details">

        <UserInfo settings={UserInfoSettings}/>
        <ChargeDetails settings={ChargeDetailsSettings}/>
        <IdentificationInfo settings={IdentificationInfoSettings}/>
        <BasicInfo settings={BasicInfoSettings}/>
        <EmploymentInfo settings={EmploymentInfoSettings}/>
        <Disbursement settings={DisbursementSettings}/>
        <LoanRecord memberId = {that.state.memberId}/>
        <ContactInfo settings={ContactInfoSettings}/>
        <AddressBookInfo memberId = {that.state.memberId} mark= {mark} showMark = {true}/>
        <AddressBook memberId = {that.state.memberId}/>
        <AppFromAddressBook memberId = {that.state.memberId}/>
        {/* <FacebookInfo settings={FacebookInfoSettings} /> */}
        <MailInfo settings={MailInfoSettings} />
        <MessageInfo settings={MessageInfoSettings} />
        <PhonecallLog settings={PhonecallLogSettings} />
        <AppInstall memberId = {that.state.memberId} />
        <NoteLog settings = {NoteLogSettings}/>
        <OperateRecord memberId = {that.state.memberId} applicationId = {that.state.applicationId}/>

        <Row className="notes" gutter={16}>
          <Col span={6} className="loan-details-oper">
            <h4>Notes:</h4>
            <Input.TextArea
            placeholder="please enter a note" 
            autosize={{ minRows: 2, maxRows: 6 }} 
            ref={"notes"}
            onChange={that.setNote}
            value = {that.state.note}
            />
          </Col>
          <Col span={4} className="save-note">
            <Button size="large" type="primary" onClick={that.saveNote} value="prepass">Save</Button>
          </Col>
        </Row>

        <Row className="btn-style">
          <Col span={6}>
            <Button size="large" type="primary" onClick={that.confirm} value="pass" loading={that.state.btnLoading}>Approve</Button>
          </Col>
          <Col span={6}>
            <Button size="large" onClick={that.confirm} value="fallback" loading={that.state.btnLoading}>Rollback</Button>
          </Col>
          <Col span={6}>
            <Button size="large" type="danger" onClick={that.confirm} value="refuse" loading={that.state.btnLoading} >Refuse</Button>
          </Col>
        </Row>

        <Modal
          title="Rollback"
          visible={that.state.refuseModalShow}
          onOk={that.handleOk}
          onCancel={that.handleCancel}
          okText =  {"Confirm"}
          cancelText = {'No'}
          mask = {false}
          style= {{width:"2000px"}}
        > 
          <TextArea autosize={{ minRows: 3, maxRows: 7 }} onChange={that.setFallBackMessage}/>
        </Modal>
      </div>
    )
  }

  render () {
    return (
      <QueueAnim className="animate-content" type={this.state.aniType}>
        {this.state.showBlock ? [ this.renderBody() ] : null}
      </QueueAnim>
    )
  }
}
export default RevaluationDetails;

