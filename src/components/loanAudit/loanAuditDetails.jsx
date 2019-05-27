import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { AsyncComponent } from '../../../src/lib/component/index';
import PersonalAudit from './personalAudit'
import { Interface } from '../../../src/lib/config/index';


import {
  CLBlockList,
  CLComponent,
  AddressBook,
  AddressBookNew,
  AddressBookInfo,
  NoteLog,
  OperateRecord,
  MessageInfo,
  PhonecallLog,
  MailInfo,
  livingPhoto,
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
  DetailsRemark,
} from '../../../src/lib/component/index';
import { CLAnimate, CL } from '../../../src/lib/tools/index';

import { Button, Row, Col, Card, Table, Input, message, Spin, Modal, Icon, Select, Radio, } from 'antd';
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const confirm = Modal.confirm;
const Option = Select.Option;

const {
  contentType,
  LoanAuditExamine,
  notPassReasonList,
  getEvaMark,
  saveLoanNotes,
  getAppInfoByMemberId,
  Details,
  exceptionFinish,
  cancelException,
  getNewAddressBookInfo,
  loanBasisInfoExamin,
  applicationApplicantVerification
} = Interface;

function examie({
                  comment, id, status, fallBackMessage, rollbackReason, refuseReason,
                }, that) {
  that.setState({
    btnLoading: true,
    rollbackModalShow: false,
    cancelModalShow: false,
    refuseModalShow: false
  });

  const settings = {
    contentType,
    method: LoanAuditExamine.type,
    url: LoanAuditExamine.url,
    data: JSON.stringify({
      comment,
      id,
      status,
      fallBackMessage,
      operationType: 1,
      rollbackReason,
      refuseReason,
    }),
  };


  function fn(res) {
    that.setState({ btnLoading: false });
    if (res.data) {
      message.success('operate success');
      location.hash = '/uplending/loanaudit';
    }
  }

  CL.clReqwest({
    settings,
    fn
  });
}

function examie1({ applicationId, code, reason, }, that) {
  that.setState({
    btnLoading: true,
    rollbackModalShow: false,
    cancelModalShow: false,
    refuseModalShow: false
  });

  const settings = {
    contentType,
    method: cancelException.type,
    url: cancelException.url,
    data: JSON.stringify({
      applicationId,
      reason,
      code,
    }),
  };


  function fn(res) {
    that.setState({ btnLoading: false });
    if (res.data) {
      console.log('成功参数-->', res);
    }
  }

  CL.clReqwest({
    settings,
    fn
  });
}

class LoanAuditDetails extends CLComponent {
  state = {
    data: null,
    pagination: false,
    mark: {},
    btnLoading: false,
    noteLog: [],
    sameUser: '',
    loanBasisInfo1: '',
    refuseList: [],
    rollBackList: [],
    exceptionReason: [],
    rollbackReason: '',
    code: '',
    refuseReason: '',
    rollbackModalShow: false,
    cancelModalShow: false,
    refuseModalShow: false,
    editModal: false,
    editInfo: {},
    cityList: [],
    bl: [],
    cityChoose: '',
    barangayChoose: '',
    closeReason: '',
    disabled: false,
    ButtonStatus: false,
    radioList: [],
    radioValue: '',
    submitStatus: false,
  };

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'confirm',
      'handleRollbackOk',
      'handleCancel',
      'setFallBackMessage',
      'setCancelMessage',
      'saveNote',
      'setNote',
      'discontinue',
      'getNotPassList',
      'setFallBackOption',
      'setCancelOption',
      'setRefuseOption',
      'handleRefuseOk',
      'reload',
      'notSaveModifyBtn',
      'cancellationrequest',
      'noteChange',
      'handleCancelOk',
      // "discontinues"
    ]);
  }

  componentWillMount(){
    this.getAddressBookType();
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    this.loadData(this.props.match.params);
    this.getNotPassList();
    this.applicationApplicantVerification();
    CL.removeEditFlag('ContactInformation');
    CL.removeEditFlag('EmploymentInformaiton');
    CL.removeEditFlag('BasicInformation');
    CL.removeEditFlag('Identification');
  }

  getAddressBookType = () => {
      let _this = this;
      const settings = {
          contentType,
          method: getNewAddressBookInfo.type,
          url: getNewAddressBookInfo.url + `/${this.props.match.params.id}`
      };

      function fn(res) {
          if (res && res.data) {
              let addressBookType = res.data;
              _this.setState({addressBookType})
          }
      }

      CL.clReqwest({settings, fn});
  };

  applicationApplicantVerification = () => {
    let _this = this;
    const settings = {
        contentType,
        method: applicationApplicantVerification.type,
        url: applicationApplicantVerification.url + `/${this.props.match.params.id}`
    };

    function fn(res) {
        if (res && res.data) {
            _this.setState({radioList: res.data.options, radioValue: res.data.selected})
        }
        if(res.data.selected!==null){
          _this.setState({disabled:true, ButtonStatus:true});
        }
        if(res.data.options.length == 0){
          _this.setState({submitStatus:true});
        }
    }

    CL.clReqwest({settings, fn});
  }

  setFallBackMessage(e) {
    if (e.target.value.length > 2000) {
      message.error('Exceeding the word limit.');
      return;
    }
    this.setState({ fallBackMessage: e.target.value });
  }

  setCancelMessage(e) {
    if (e.target.value.length > 500) {
      message.error('Exceeding the word limit.');
      return;
    }
    this.setState({ reason: e.target.value });
  }

  setFallBackOption(e) {
    this.setState({ rollbackReason: e });
  }

  setCancelOption(e) {
    this.setState({ code: e });
  }

  setRefuseOption(e) {
    this.setState({ refuseReason: e });
  }

  setNote(e) {
    if (e.target.value.length > 2000) {
      message.error('Exceeding the word limi84t.');
      return;
    }
    this.setState({ note: e.target.value });
  }

  // discontinue (e) {
  //   const that = this;
  //   const settings = {
  //     contentType,
  //     method: exceptionFinish.type,
  //     url: exceptionFinish.url + that.props.match.params.id,
  //   }
  //   const type = that.props.match.params.type;

  //   function fn (res) {
  //     that.setState({btnLoading: false});
  //     if (res.data) {
  //       message.success("operate success");
  //       if (type === "2") {
  //         location.hash = "/uplending/paymentfailed";
  //       } else {
  //         location.hash = "/uplending/loanaudit";
  //       }

  //     }
  //   }
  //   that.setState({btnLoading: true});

  //   confirm({
  //     title: 'Discontinue！',
  //     content: 'After processing, the user will reapply. Whether or not to discontinue ?',
  //     onOk() {
  //       CL.clReqwest({settings, fn});
  //     },
  //     onCancel() {
  //       that.setState({btnLoading: false});
  //     },
  //   });
  // }
  discontinue(e) {
    this.setState({ discontinue: true });
  }

  discontinues = (e) => {
    const that = this;
    this.setState({ discontinue: false });
    const settings = {
      contentType,
      method: exceptionFinish.type,
      url: exceptionFinish.url,
      data: JSON.stringify({
        applicationId: that.props.match.params.id,
        closeReason: that.state.closeReason,
        closeType: that.state.code,
      }),
    };

    function fn(res) {
      if (res.data) {
        message.success(res.result);
        // that.loadData(this.props.match.params);
        location.hash = '/uplending/loanaudit';
      }
    }

    CL.clReqwest({
      settings,
      fn
    });
  };

  noteChange(e) {
    if (e.target.value.length > 2000) {
      message.error('The number of words exceeds 2000 characters');
      return;
    }
    this.setState({ closeReason: e.target.value });
  }

  handleCancel1 = (e) => {
    this.setState({ discontinue: false });
  };

  handleRollbackOk() {
    const that = this;
    const fallBackMessage = this.state.fallBackMessage;
    const comment = this.refs.notes.textAreaRef.value || '';
    const id = this.props.match.params.id;
    const status = 'fallback';
    const reason = that.state.rollbackReason;

    if (comment.length > 2000) {
      message.error('Exceeding the word limit.');
      return;
    }

    if (!fallBackMessage) {
      message.error('“Rollback details” is required.');
      return;
    }

    if (!reason) {
      message.error('“Rollback Reason” is required.');
      return;
    }

    examie({
      comment,
      id,
      status,
      fallBackMessage,
      rollbackReason: reason,
    }, that);
  }

  handleRefuseOk() {
    const that = this;

    const id = this.props.match.params.id;
    const status = 'refuse';
    const reason = that.state.refuseReason;

    if (!reason) {
      message.error('“Refuse Reason” is required.');
      return;
    }
    examie({
      id,
      status,
      refuseReason: reason
    }, that);
  }

  getNotPassList() {
    const that = this;
    const settings = {
      contentType,
      method: notPassReasonList.type,
      url: notPassReasonList.url,
    };

    function fn(res) {
      if (res.data) {
        that.setState({
          refuseList: CL.setOptions(_.filter(res.data.refuseReason, (o) => {
            return o.type !== 215;
          })),
          rollBackList: CL.setOptions(res.data.rollbackReason),
          exceptionReason: CL.setOptions(res.data.exceptionReason),
        });
      }
    }

    CL.clReqwest({
      settings,
      fn
    });
  }

  handleCancel() {
    this.setState({
      refuseModalShow: false,
      rollbackModalShow: false,
      cancelModalShow: false,
    });
  }

  loadData(params) {
    const that = this;
    const settings = {
      contentType,
      method: Details.getLoanBasisiInfo.type,
      url: Details.getLoanBasisiInfo.url + params.id,
    };


    function fn(res) {
      if (res.data) {
        that.setState({ loanBasisInfo: res.data });
        const applicationId = params.id;
        const memberId = res.data.memberId;
        const name = res.data.name;
        const basisId = res.data.id;

        that.setState({
          memberId: memberId,
          applicationId: applicationId,
        });

        const markSettings = {
          contentType,
          method: getEvaMark.type,
          url: getEvaMark.url + params.id,
        };

        function markFn(res) {
          if (res.data) {
            that.setState({ mark: res.data });
          }
        }

        const getLoanContactInfoSettings = {
          contentType,
          method: Details.getLoanContactInfo.type,
          url: Details.getLoanContactInfo.url,
          data: JSON.stringify({
            memberId,
            id: basisId,
            appId: parseInt(applicationId),
          }),

        };

        function contactPersonFn(res) {
          if (res.data) {
            that.setState({ contactPerson: res.data });
          }
        }

        const userDataSettings = {
          contentType,
          method: Details.getUserData.type,
          url: Details.getUserData.url,
          data: JSON.stringify({
            memberId,
          }),
        };

        function userDataFn(res) {
          if (res.data) {
            that.setState({ userData: res.data });
          }
        }

        const orderInfoSettings = {
          contentType,
          method: Details.getLoanOrderInfo.type,
          url: Details.getLoanOrderInfo.url,
          data: JSON.stringify({
            applicationId,
          }),
        };

        function orderInfoFn(res) {
          if (res.data) {
            that.setState({ orderInfo: res.data });
          }
        }

        const personalAppInstallInfoSettings = {
          contentType,
          method: Details.getPersonalAppInstallInfo.type,
          url: Details.getPersonalAppInstallInfo.url,
          data: JSON.stringify({
            memberId,
          }),
        };

        function personalAppInstallInfoFn(res) {
          if (res.data) {
            that.setState({ personalAppInstallInfo: res.data });
          }
        }

        const deviceCheckSettings = {
          contentType,
          method: Details.deviceCheck.type,
          url: Details.deviceCheck.url,
          data: JSON.stringify({
            memberId,
          }),
        };

        function deviceCheckFn(res) {
          if (res.data) {
            that.setState({ deviceCheck: res.data });
          }
        }


        const operateRecordHistorySettings = {
          contentType,
          method: Details.getOperateRecordHistory.type,
          url: Details.getOperateRecordHistory.url,
          data: JSON.stringify({
            memberId,
            lessId: applicationId,
          }),
        };

        function operateRecordHistoryFn(res) {
          if (res.data) {
            that.setState({ operateRecordHistory: res.data });
          }
        }

        const loanNoteSettings = {
          contentType,
          method: Details.getLoanNotes.type,
          url: Details.getLoanNotes.url,
          data: JSON.stringify({
            applicationId,
            memberId,
          }),
        };

        function loanNotesFn(res) {
          if (res.data) {
            that.setState({ noteLog: res.data.loanNotesList });
          }
        }

        const repetitionUserSettings = {
          contentType,
          method: Details.repetitionUser.type,
          url: Details.repetitionUser.url,
          data: JSON.stringify({
            loanBasisInfo: {
              notMemberId: memberId,
              name: name,
            },
          }),
        };

        function repetitionUserFn(res) {
          const users = [];
          if (res.data.repetitionUser && res.data.repetitionUser.length) {
            res.data.repetitionUser.map((doc, index) => {
              users.push({
                id: index,
                telephoneNo: doc.memberPhone,
                memberId: doc.memberId,
              });
            });
          }

          if (users.length) {
            that.setState({ sameUser: users });
          }
        }

        const loanBasisInfoLivingSettings = {
          contentType,
          method: Details.livingPhoto.type,
          url: Details.livingPhoto.url + applicationId,
          // data: JSON.stringify({
          //   loanBasisInfo: {
          //     notMemberId: memberId,
          //   },
          // }),
        };

        function fn(res) {
          if (res.data) {
            that.setState({ loanBasisInfo1: res.data.livingPhotoBase64 });
          }
        }

        CL.clReqwest({
          settings: markSettings,
          fn: markFn
        });
        CL.clReqwest({
          settings: loanBasisInfoLivingSettings,
          fn
        });
        CL.clReqwest({
          settings: getLoanContactInfoSettings,
          fn: contactPersonFn
        });
        CL.clReqwest({
          settings: userDataSettings,
          fn: userDataFn
        });
        CL.clReqwest({
          settings: orderInfoSettings,
          fn: orderInfoFn
        });
        // CL.clReqwest({settings: personalAppInstallInfoSettings, fn: personalAppInstallInfoFn});
        CL.clReqwest({
          settings: deviceCheckSettings,
          fn: deviceCheckFn
        });
        // CL.clReqwest({settings: operateRecordHistorySettings, fn: operateRecordHistoryFn});
        CL.clReqwest({
          settings: repetitionUserSettings,
          fn: repetitionUserFn
        });
        CL.clReqwest({
          settings: loanNoteSettings,
          fn: loanNotesFn
        });
      }
    }

    CL.clReqwest({
      settings,
      fn
    });
  }

  notSaveModifyBtn(e) {
    const that = this;
    const status = e.target.value;
    if (CL.getEditFlag()) {
      confirm({
        title: 'Sure leave?',
        content: 'you changed some  data, but didn\'t save, sure to leave',
        okText: 'Confirm',
        cancelText: 'No',
        onOk() {
          that.confirm(status);
          CL.removeEditFlag();
        },
      });
    } else {
      that.confirm(status);
    }
  }

  cancellationrequest(e) {
    const that = this;
    const status = e.target.value;
    if (CL.getEditFlag()) {
      confirm({
        title: 'Sure leave?',
        content: 'you changed some  data, but didn\'t save, sure to leave',
        okText: 'Confirm',
        cancelText: 'No',
        onOk() {
          that.confirm(status);
          CL.removeEditFlag();
        },
      });
    } else {
      that.confirm(status);
    }
  }

  confirm(e) {
    const that = this;
    const comment = that.refs.notes.textAreaRef.value || '';
    const status = _.isString(e) ? e : e.target.value;
    const id = that.props.match.params.id;
    const fallBackMessage = '';
    const confirm = Modal.confirm;

    const messageObj = {
      refuse: 'refuse',
      pass: 'approve',
    };

    if (comment.length > 2000) {
      message.error('Exceeding the word limit.');
      return;
    }

    if (status === 'pass') {
      confirm({
        title: 'Notice ?',
        content: `Sure to ${messageObj[status]}?`,
        okText: 'Confirm',
        cancelText: 'No',
        onOk() {
          examie({
            comment,
            id,
            status,
            fallBackMessage,
          }, that);
        },
      });
    }

    if (status === 'Cancel') {
      that.setState({ cancelModalShow: true });
    }

    if (status === 'refuse') {
      that.setState({ refuseModalShow: true });
    }

    if (status === 'fallback') {
      that.setState({ rollbackModalShow: true });
    }
  }

  saveNote(e) {
    const that = this;
    const applicationId = that.props.match.params.id;
    const note = that.refs.notes.textAreaRef.value || '';
    const appStatus = that.state.loanBasisInfo.appStatus;
    if (note.length > 2000) {
      message.error('Exceeding the word limit.');
      return;
    }
    that.setState({ note: '' });
    const settings = {
      contentType,
      method: saveLoanNotes.type,
      url: saveLoanNotes.url,
      data: JSON.stringify({
        note,
        applicationId,
        appStatus,
      }),
    };

    that.setState({ btnLoading: true });

    function fn(res) {
      that.setState({ btnLoading: false });
      if (res.data) {
        message.success('operate success');
        that.loadData(that.props.match.params);
      }
    }

    CL.clReqwest({
      settings,
      fn
    });
  }

  //新增取消申请提交接口
  handleCancelOk(e) {
    const that = this;
    const applicationId = that.props.match.params.id;
    const reason = that.state.reason || '';
    const code = that.state.code;
    if (reason.length > 500) {
      message.error('Exceeding the word limit.');
      return;
    }
    confirm({
      title: 'Notice ?',
      content: `whether to cancel this application ?`,
      okText: 'Yes',
      cancelText: 'No',
      onOk() {
        examie1({
          applicationId,
          reason,
          code,
        }, that);
      },
    });
  }

  reload() {
    const that = this;
    that.loadData(that.props.match.params);
  }

  RadioStatus = (e) => {
    this.setState({radioValue: e.target.value});
  }

  SubmitStatus = () => {
    const that = this;
    const applicationId = that.props.match.params.id;
      confirm({
        content: 'Whether to continue?',
        okText: 'Confirm',
        cancelText: 'Cancel',
        onOk() {
          const settings = {
            contentType,
            method: loanBasisInfoExamin.type,
            url: loanBasisInfoExamin.url,
            data: JSON.stringify({
              applicationId:applicationId,
              result:that.state.radioValue,
            }),
          };
      
          function fn(res) {
            that.setState({ btnLoading: false });
              if(res.code == 200){
                message.success(res.data);
                that.setState({disabled: true, ButtonStatus: true});
                location.hash = '/uplending/loanauditdetails/'+applicationId+'/1';
                
              }else{
                message.error(res.data);
              }
              that.applicationApplicantVerification();
              that.loadData(that.props.match.params);
              location.hash = '/uplending/loanauditdetails/'+applicationId+'/1';
          }
          CL.clReqwest({settings,fn});
        },
      });
  }

  renderBody() {
    const { selectedRowKeys } = this.state;
    const that = this;
    let disabled = that.state.disabled;
    if (!this.state.loanBasisInfo) {
      return (
        <div className="full-loading" key="full-loading">
          <Spin size="large"/>
        </div>
      );
    }

    let {
      loanBasisInfo,
      loanBasisInfo1,
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
    // loanBasisInfo1 = loanBasisInfo1 || {};
    orderInfo = orderInfo || {};
    deviceCheck = deviceCheck || {};
    userData = userData || {};
    mark = mark || {};
    firstCall = firstCall || {};
    lastCall = lastCall || {};
    firstMessage = firstMessage || {};
    lastMessage = lastMessage || {};
    contact1 = contact1 || {};
    contact2 = contact2 || {};
    message1 = message1 || {};
    message2 = message2 || {};


    let { usersOfTheSameDevice } = deviceCheck;
    usersOfTheSameDevice = usersOfTheSameDevice || {};

    const sameDevice = [];
    _.each(usersOfTheSameDevice, (doc, index) => {
      _.each(doc, (subItem, subIndex) => {
        if (!_.find(sameDevice, (o) => {
          return o.telephoneNo === subItem.telephoneNo;
        })) {
          sameDevice.push(subItem);
        }
      });
    });


    const UserInfoSettings = {
      loanBasisInfo,
      orderInfo
    };
    const ChargeDetailsSettings = { loanBasisInfo };
    const IdentificationInfoSettings = {
      loanBasisInfo,
      loanBasisInfo1,
      deviceCheck,
      sameUser,
      sameDevice,
      edit: loanBasisInfo.appStatusName === 'Applying' ? true : false,
      reload: that.reload,
    };
    const BasicInfoSettings = {
      loanBasisInfo,
      mark,
      edit: loanBasisInfo.appStatusName === 'Applying' ? true : false,
      reload: that.reload,
    };
    const EmploymentInfoSettings = {
      loanBasisInfo,
      mark,
      edit: loanBasisInfo.appStatusName === 'Applying' ? true : false,
      editFn: that.showEditModal,
      reload: that.reload,
    };
    const DisbursementSettings = {
      loanBasisInfo,
      mark
    };
    const ContactInfoSettings = {
      contactPerson,
      mark,
      memberId: that.state.memberId,
      edit: loanBasisInfo.appStatusName === 'Applying' ? true : false,
    };
    // const ContactInfoSettings = {contactPerson, mark, memberId: that.state.memberId, edit: true}
    const MailInfoSettings = { userData };
    // const FacebookInfoSettings = {
    //   loanBasisInfo,
    //   userData
    // };
    const NoteLogSettings = { noteLog };

    let discontinueFlag = false;
    if ((loanBasisInfo.appStatusName === 'Approved' || loanBasisInfo.appStatusName === 'PaySucess' || that.props.match.params.type === '2') && (_.indexOf(JSON.parse(sessionStorage.getItem('roles')), 'exceptionfinish') > -1)) {
      discontinueFlag = true;
    }
    let discontinueFlag1 = false;
    if ((loanBasisInfo.appStatusName === 'Applying') && (_.indexOf(JSON.parse(sessionStorage.getItem('roles')), 'exceptionfinish') > -1)) {
      discontinueFlag1 = true;

    }
    const four = (contactPerson && contactPerson.loanContactPersonInfoRequired && contactPerson.loanContactPersonInfoRequired[1] ? contactPerson.loanContactPersonInfoRequired[1].telephoneNo : '') ||
      (contactPerson && contactPerson.loanContactPersonInfoOptional && contactPerson.loanContactPersonInfoOptional[0] ? contactPerson.loanContactPersonInfoOptional[0].telephoneNo : '');
    const DetailsRemarkSettings = {
      appId: that.state.applicationId,
      callTitle: 'call log',
      phoneData: {
        1: loanBasisInfo.memberPhone,
        2: loanBasisInfo.companyTelephone,
        3: contactPerson && contactPerson.loanContactPersonInfoRequired && contactPerson.loanContactPersonInfoRequired[0] ? contactPerson.loanContactPersonInfoRequired[0].telephoneNo : '',
        4: four,
      },
    };

    return (
      <div className="loan-audit-details" key="loan-audit-details">
        <UserInfo settings={UserInfoSettings} isOrder/>
        <ChargeDetails settings={ChargeDetailsSettings}/>
        <IdentificationInfo settings={IdentificationInfoSettings}/>
        <BasicInfo settings={BasicInfoSettings}/>
        {loanBasisInfo.applicationType === 'older' ? '' :
        <EmploymentInfo settings={EmploymentInfoSettings}/>
        }
        <Disbursement settings={DisbursementSettings}/>
        <LoanRecord memberId={that.state.memberId}/>
        {loanBasisInfo.applicationType === 'A' ?
        <ContactInfo settings={ContactInfoSettings}/> : ''
        }
        <AddressBookInfo memberId={that.state.memberId} mark={mark} showMark={false}/>
        <AppFromAddressBook memberId={that.state.memberId}/>
        {that.state.submitStatus ? '':
        <div style={{marginLeft: 10, marginRight: 10}}>
          <h4 style={{color:'#999999', fontWeight: 500}}>The user verification</h4>
            <Row style={{border:'1px solid #e8e8e8', padding:'12px 0', backgroundColor:'#fafafa',color:'#000'}}>
              <Col span={8} style={{paddingLeft: 15}}>Please verify if it is the borrower him/herself applying ? </Col>
              <Col span={14}>
                <RadioGroup onChange={that.RadioStatus} value={that.state.radioValue}>
                <Row style={{display:'inlink-block'}}>
                  {_.map(that.state.radioList,(doc)=>{
                    return (
                          <Col span={6}><Radio value={doc.type} disabled={disabled}>{doc.typeName}</Radio></Col>
                      )
                  })}
                </Row>
                </RadioGroup>
              </Col>
              {that.state.ButtonStatus ? '':
                <Col style={{marginTop: -5}} span={2}><Button onClick={that.SubmitStatus}>Submit</Button></Col>}
            </Row>
        </div>
        }
        
        {/* 新增通讯录 */}
          {this.state.addressBookType ? (this.state.addressBookType === "show_original" ?
              <AddressBook memberId={that.state.memberId}
                           LoanAudit isloanApply
                           appId={this.props.match.params.id}/> :
              <AddressBookNew memberId={that.state.memberId}
                              addressBookType={this.state.addressBookType}
                              appId={this.props.match.params.id}/>) : null
          }
        {/* <FacebookInfo settings={FacebookInfoSettings}/> */}
        <DetailsRemark {...DetailsRemarkSettings} />
        <NoteLog settings={NoteLogSettings}/>
        <OperateRecord memberId={that.state.memberId} applicationId={that.state.applicationId}/>
        <Row className="notes" gutter={16}>
          <Col span={6} className="loan-details-oper">
            <h4>Notes:</h4>
            <Input.TextArea
              placeholder="please enter a note"
              autosize={{
                minRows: 2,
                maxRows: 6
              }}
              ref="notes"
              onChange={that.setNote}
              value={that.state.note}
            />
          </Col>
          <Col span={4} className="save-note">
            <Button size="large" type="primary" onClick={that.saveNote} value="pass">Save</Button>
          </Col>
        </Row>
        <Row className="btn-style" style={{ borderBottom: '5px #108ee9 solid' ,paddingBottom: 20}}>
            {this.state.addressBookType === "show_original" && <Col span={5}>
            {
              loanBasisInfo.appStatusName === 'Applying' ? (
                <Button size="large" type="primary" onClick={that.notSaveModifyBtn} value="pass" loading={that.state.btnLoading}>Approve</Button>
              ) : ''
            }
          </Col>}
            {this.state.addressBookType === "show_original" && <Col span={5}>
            {
              loanBasisInfo.appStatusName === 'Applying' ? (
                <Button size="large" onClick={that.notSaveModifyBtn} value="fallback" loading={that.state.btnLoading}>Rollback</Button>
              ) : ''
            }
          </Col>}
            {this.state.addressBookType === "show_original" && <Col span={5}>
            {
              loanBasisInfo.appStatusName === 'Applying' ? (
                <Button size="large" type="danger" onClick={that.notSaveModifyBtn} value="refuse" loading={that.state.btnLoading}>Refuse</Button>
              ) : ''
            }
          </Col>}
          <Col span={5}>
            {
              discontinueFlag ? (
                <Button size="large" type="primary" onClick={that.discontinue} value="pass" loading={that.state.btnLoading}>Discontinue</Button>
              ) : ''
            }
            {/*<Button size="large" type="primary" onClick={that.discontinue} value="pass" loading={that.state.btnLoading}>Discontinue</Button>*/}

          </Col>
          <Col span={4}>
            {
              discontinueFlag1 ? (
                <Button size="large" onClick={that.cancellationrequest} value="Cancel" loading={that.state.btnLoading}>Cancel</Button>
              ) : ''
            }
            {/*<Button size="large" onClick={that.cancellationrequest} value="Cancel" loading={that.state.btnLoading}>Cancel</Button>*/}
          </Col>
        </Row>
        {/* {this.state.addressBookType === "show_original" && <PersonalAudit appId={this.props.match.params.id}/>} */}

        <Modal
          title="Rollback"
          visible={that.state.rollbackModalShow}
          onOk={that.handleRollbackOk}
          onCancel={that.handleCancel}
          okText="Confirm"
          cancelText="No"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={4}>
              Rollback Reason:
            </Col>
            <Col span={20}>
              <Select
                showSearch
                style={{ width: 500 }}
                placeholder="Select a reason"
                optionFilterProp="children"
                onChange={that.setFallBackOption}
              >
                {
                  that.state.rollBackList.map((doc) => {
                    return (<Option key={doc.value} value={doc.value.toString()}>{doc.name}</Option>);
                  })
                }
              </Select>
            </Col>
          </Row>

          <Row style={{ marginTop: 20 }}>
            <Col span={4}>
              Rollback details:
            </Col>
            <Col span={20}>
              <span style={{ color: 'red' }}>The details will be displayed on the app</span>
            </Col>
          </Row>

          <Row style={{ marginTop: 20 }}>
            <Col>
              <TextArea autosize={{
                minRows: 3,
                maxRows: 7
              }} onChange={that.setFallBackMessage}/>
            </Col>
          </Row>
        </Modal>
        {/*新增取消申请弹窗*/}
        <Modal
          title="Cancle user`s application"
          visible={that.state.cancelModalShow}
          onOk={that.handleCancelOk}
          onCancel={that.handleCancel}
          okText="Save"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            {/*<Col span={4} >*/}
            {/*Rollback Reason:*/}
            {/*</Col>*/}
            <Col span={20}>
              <Select
                showSearch
                style={{ width: 500 }}
                placeholder="Select a reason"
                optionFilterProp="children"
                onChange={that.setCancelOption}
              >
                {
                  that.state.exceptionReason.map((doc) => {
                    return (<Option key={doc.value} value={doc.value.toString()}>{doc.name}</Option>);
                  })
                }
              </Select>
            </Col>
          </Row>

          {/*<Row style={{ marginTop: 20 }}>*/}
          {/*<Col span={4}>*/}
          {/*Rollback details:*/}
          {/*</Col>*/}
          {/*<Col span={20}>*/}
          {/*<span style={{ color: 'red' }}>The details will be displayed on the app</span>*/}
          {/*</Col>*/}
          {/*</Row>*/}

          <Row style={{ marginTop: 20 }}>
            <Col>
              <TextArea autosize={{
                minRows: 3,
                maxRows: 7
              }} onChange={that.setCancelMessage}/>
            </Col>
          </Row>
        </Modal>
        <Modal
          title="Refuse"
          visible={that.state.refuseModalShow}
          onOk={that.handleRefuseOk}
          onCancel={that.handleCancel}
          okText="Confirm"
          cancelText="No"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={4}>
              Refuse Reason:
            </Col>
            <Col span={20}>
              <Select
                showSearch
                style={{ width: 500 }}
                placeholder="Select a reason"
                optionFilterProp="children"
                onChange={that.setRefuseOption}
              >
                {
                  that.state.refuseList.map((doc) => {
                    return (<Option key={doc.value} value={doc.value.toString()}>{doc.name}</Option>);
                  })
                }
              </Select>
            </Col>
          </Row>
        </Modal>
        <Modal
          title="Please Enter note information"
          visible={that.state.discontinue}
          onOk={this.discontinues}
          onCancel={that.handleCancel1}
          okText="Save"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Select
            showSearch
            style={{ width: 500 }}
            placeholder="Select a reason"
            optionFilterProp="children"
            onChange={that.setCancelOption}
          >
            {
              that.state.exceptionReason.map((doc) => {
                return (<Option key={doc.value} value={doc.value.toString()}>{doc.name}</Option>);
              })
            }
          </Select>
          <br/>
          <br/>
          <TextArea placeholder="Please input the reason..." autosize={{
            minRows: 2,
            maxRows: 6
          }} onChange={that.noteChange}/>
        </Modal>
      </div>
    );
  }

  render() {
    return (
      <QueueAnim className="animate-content" type={this.state.aniType}>
        {this.state.showBlock ? [this.renderBody()] : null}
      </QueueAnim>
    );
  }
}

export default LoanAuditDetails;




