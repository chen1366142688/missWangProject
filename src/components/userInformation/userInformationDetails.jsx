import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import { Interface } from '../../../src/lib/config/index';
import {
  CLComponent,
  AddressBook,
  AddressBookInfo,
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
  CreditCollectionInfo,
  LoanRecord,
  AppFromAddressBook,
} from '../../../src/lib/component/index';
import { CLAnimate, CL} from '../../../src/lib/tools/index';
import { Button, Row, Col, Card, Table, Input, message, Spin, Modal, Icon, Tooltip } from 'antd';

const { getRevaluationDetail, contentType, LoanAuditExamine, getAuditMark, getRevMark,
  saveOperateRecord, getApplicationHistory, Details, getAppInfoByMemberId, getPaymentCode,getByMemberIdCode} = Interface;

class UserInformationDetails extends CLComponent {
  state = {
    data: null,
    pagination: false,
    mark: {},
    btnLoading: false,
    ahCurrentPage: 1,
    ahPageSize: 10,
    ahTotal: 0,
    ahLoading: false
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "loadData",
      "checkAppDetails",
      "getApplicationHistoryList",
      "ahPageChange",
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    this.loadData(this.props.match.params)
  }

  checkAppDetails (e) {
    location.hash = `/uplending/loanauditdetails/${e.target.value}`;
  }

  loadData (params) {
    const that = this;
    const settings = {
      contentType,
      method: Details.getLoanBasisiInfo.type,
      url: Details.getLoanBasisiInfo.url + params.id,
    }

    function setMark (res) {
      if (res.data) {
        that.setState({mark: res.data});
      }
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
          applicationId
        });

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
            that.setState({
              orderInfo: res.data,
              orderId: res.data.id
            });
          } else {
            that.setState({orderInfo: {}});
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

        //获取还款码接口
        const paymentCodeSettings = {
          contentType,
          method:getByMemberIdCode.type,
          url: getByMemberIdCode.url + res.data.memberId
        }
        function paymentCodeFn (res) {
          if (res.data) {
              that.setState({
                lifetimeId: res.data.lifetimeId || null
              })
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
        CL.clReqwest({settings: repetitionUserSettings, fn: repetitionUserFn});
        CL.clReqwest({settings: paymentCodeSettings, fn: paymentCodeFn});

      } else {
        that.setState({data: {}});
      }
    }
    CL.clReqwest({settings, fn});
    that.getApplicationHistoryList(params, 1);
  }

  getApplicationHistoryList (params, currentPage) {
    const that = this;
    that.setState({ahLoading: true});
    const ahsettings = {
      contentType,
      method: getApplicationHistory.type,
      url: getApplicationHistory.url,
      data: JSON.stringify({
        loanApplicationInfo: {
          memberId: params.userId
        },
        page: {
          currentPage: currentPage || 1,
          pageSize: that.state.ahPageSize
        }
      })
    }

    function ahData (res) {
      that.setState({ahLoading: false});
      if (res.data) {
        that.setState({
          applicationHistory: res.data.page.result || [],
          ahCurrentPage: res.data.page.currentPage,
          ahTotal: res.data.page.totalCount,
        });
      }
    }
    CL.clReqwest({settings: ahsettings, fn: ahData});
  }

  ahPageChange (e) {
    this.getApplicationHistoryList (this.props.match.params , e)
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
      firstMessage,
      lastMessage,
      firstCall,
      lastCall,
      deviceCheck,
      sameUser,
      contact1,
      contact2,
      message1,
      message2,
      mark,
    } = this.state;

    loanBasisInfo = loanBasisInfo || {};
    orderInfo = orderInfo || {};
    deviceCheck = deviceCheck || {};
    userData = userData || {};
    contactPerson = contactPerson || {};
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

    const IdentificationInfoSettings = {loanBasisInfo, deviceCheck, sameUser, sameDevice}
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
    const ApplicationHistory = {
      columns: [
        {
          title: 'Application No',
          dataIndex: 'id',
          render(index, render) {
            return (
              <Button type="primary" onClick={that.checkAppDetails} value={render.id}>{render.id}</Button>
            )
          }
        },
        {
          title: 'Time',
          dataIndex: 'applicationTime',
          width: "10%",
        },
        {
          title: 'Loan Amount',
          dataIndex: 'loanAmount',
        },
        {
          title: 'Repayment Amount',
          dataIndex: 'srepaymentAmount',
        },
        {
          title: 'Payment Term',
          dataIndex: 'loanTimeLimit'
        },
        {
          title: 'Operation',
          dataIndex: 'operation',
          render: function (index, doc) {
            if (!doc) {
              return '-';
            }
            return (
              <div>
                {doc.operation.map( function (subItem, index) {
                  const type = subItem.operateStatusName !== 'Rollback' ? 'dashed' : 'danger';
                  return (
                    <Row key={index}>
                      <Col span={8}>
                        <Tooltip placement="top" title={subItem.operateDesc}>
                           <Button size="small" type={type} >{subItem.operateStatusName}</Button>
                        </Tooltip>
                      </Col>
                      <Col span={10}>{moment(new Date(subItem.operateTime)).format("YYYY-MM-DD HH:mm")}</Col>
                    </Row>
                  )
                })}
              </div>
            );
          },
          width: "25%"
        },
        {
          title: 'Notes',
          dataIndex: 'notes',
          render: function (index, doc) {
            if (!doc) {
              return '-';
            }
            return (
              <div>
                {doc.notes.map( function (subItem, index) {
                  return (
                    <Row key={index} span={8}>
                      <Tooltip placement="top" title={subItem.operateDesc}>
                         <Button size="small">note</Button>
                      </Tooltip>
                      <Col span={10}>{moment(new Date(subItem.operateTime)).format("YYYY-MM-DD HH:mm")}</Col>
                    </Row>
                  )
                })}
              </div>
            );
          },
          width: "25%"
        }
      ],
      data: _.map((that.state.applicationHistory || []), function (doc, index) {
        let obj = _.pick(doc, ['id', 'applicationTime', 'loanAmount', 'srepaymentAmount', 'appName', 'loanTimeLimit', 'operateRecordVos']);
        obj.applicationTime =  moment(new Date(obj.applicationTime)).format("YYYY-MM-DD HH:mm");
        obj.index = index;

        obj.operation = [];
        obj.notes = [];
        _.each(obj.operateRecordVos, (subItem, index) => {
          if (subItem.operateStatus) {
            obj.operation.push(subItem);
          } else {
            obj.notes.push(subItem)
          }
        })
        return obj;
      })
    };
    const ahPagination = {
      current: that.state.ahCurrentPage || 1,
      onChange: that.ahPageChange,
      total: that.state.ahTotal,
      pageSize: that.state.ahPageSize
    }

    return (
      <div className="loan-audit-details" key="loan-audit-details">
        <IdentificationInfo settings={IdentificationInfoSettings} lifetimeId={that.state.lifetimeId} showPaymentCode={true}/>
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
        {that.state.memberId ? (<CreditCollectionInfo orderId={that.state.orderId} memberId = {that.state.memberId} />): ""}
        <Table  bordered  className="credit-colleition-information cl-table"
          title = {() => (<h4 className="table-title"> Application History </h4>)}
          columns={ApplicationHistory.columns}
          dataSource={ApplicationHistory.data}
          rowKey={record =>  record.index}
          pagination = {ahPagination}
          loading = {that.state.ahLoading}
        />
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
export default UserInformationDetails;

