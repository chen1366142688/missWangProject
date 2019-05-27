import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import { Interface } from '../../../src/lib/config/index';
import {
  CLComponent,
  AddressBook,
  AddressBookInfo,
  MailInfo,
  // FacebookInfo,
  ContactInfo,
  Disbursement,
  EmploymentInfo,
  BasicInfo,
  IdentificationInfo,
  ChargeDetails,
  ChargeDetails2,
  UserInfo,
  CreditCollectionInfo,
  LoanRecord,
  AppFromAddressBook,
  RepaymentRecord,
} from '../../../src/lib/component/index';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Button, Row, Col, Card, Table, Input, message, Spin, Icon } from 'antd';

const {
  contentType, LoanAuditExamine, Details, getAppInfoByMemberId, getPaymentCode,getByMemberIdCode,
} = Interface;

class PostLoanDetails extends CLComponent {
  state = {
    data: null,
    pagination: false,
    lifetimeIds: '',
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    this.loadData(this.props.match.params);
  }

  loadData(params) {
    const that = this;
    const settings = {
      contentType,
      method: Details.getLoanBasisiInfo.type,
      url: Details.getLoanBasisiInfo.url + params.applicationId,
    };

    function fn(res) {
      if (res.data) {
        that.setState({ loanBasisInfo: res.data });
        const applicationId = params.applicationId;
        const memberId = res.data.memberId;
        const name = res.data.name;
        const basisId = res.data.id;
        const orderId = params.id;

        that.setState({
          memberId,
          applicationId,
          orderId,
        });

        // 获取还款码接口
        const paymentCodeSettings = {
          contentType,
          method: getByMemberIdCode.type,
          url: getByMemberIdCode.url + res.data.memberId,
        };
        function paymentCodeFn(res) {
          if (res.data) {
            that.setState({ lifetimeIds: res.data.lifetimeId });
          }
        }
        CL.clReqwest({ settings: paymentCodeSettings, fn: paymentCodeFn });
        const contactPersonSettings = {
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
            // 获取两个必填联系人通话详情
            const tel1 = res.data.loanContactPersonInfoRequired[0].telephoneNo;
            const tel2 = (res.data.loanContactPersonInfoOptional[0] || {}).telephoneNo || res.data.loanContactPersonInfoRequired[1].telephoneNo;

            that.setState({ contactPerson: res.data });

            const contact1Settings = {
              contentType,
              method: Details.contactAndCall.type,
              url: Details.contactAndCall.url,
              data: JSON.stringify({
                memberId: memberId,
                telephone: tel1,
              }),
            };
            function contact1Info(res) {
              if (res.data) {
                that.setState({ contact1: res.data });
              }
            }

            const contact2Settings = {
              contentType,
              method: Details.contactAndCall.type,
              url: Details.contactAndCall.url,
              data: JSON.stringify({
                memberId: memberId,
                telephone: tel2,
              }),
            };
            function contact2Info(res) {
              if (res.data) {
                that.setState({ contact2: res.data });
              }
            }

            const message1Settings = {
              contentType,
              method: Details.contactAndMessage.type,
              url: Details.contactAndMessage.url,
              data: JSON.stringify({
                memberId: memberId,
                telephone: tel1,
              }),
            };
            function message1Info(res) {
              if (res.data) {
                that.setState({ message1: res.data });
              }
            }

            const message2Settings = {
              contentType,
              method: Details.contactAndMessage.type,
              url: Details.contactAndMessage.url,
              data: JSON.stringify({
                memberId: memberId,
                telephone: tel2,
              }),
            };
            function message2Info(res) {
              if (res.data) {
                that.setState({ message2: res.data });
                // let arrObj= [];
                // _.eachres.data.){

                // }
              }
            }

            CL.clReqwest({ settings: contact1Settings, fn: contact1Info });
            CL.clReqwest({ settings: contact2Settings, fn: contact2Info });
            CL.clReqwest({ settings: message1Settings, fn: message1Info });
            CL.clReqwest({ settings: message2Settings, fn: message2Info });
          } else {
            that.setState({ contactPerson: {} });
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
          method: Details.getOrderInfoByOrderId.type,
          url: Details.getOrderInfoByOrderId.url,
          data: JSON.stringify({
            id: orderId,
          }),
        };
        function orderInfoFn(res) {
          if (res.data) {
            that.setState({ orderInfo: res.data });
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
          // console.log(res.data);
          if (res.data) {
            that.setState({ deviceCheck: res.data });
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
          // console.log(res.data);
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


        CL.clReqwest({ settings: contactPersonSettings, fn: contactPersonFn });
        CL.clReqwest({ settings: userDataSettings, fn: userDataFn });
        CL.clReqwest({ settings: orderInfoSettings, fn: orderInfoFn });
        CL.clReqwest({ settings: deviceCheckSettings, fn: deviceCheckFn });
        CL.clReqwest({ settings: repetitionUserSettings, fn: repetitionUserFn });
      } else {
        that.setState({ loanBasisInfo: {} });
      }
    }
    CL.clReqwest({ settings, fn });
  }
  renderBody() {
    const { selectedRowKeys } = this.state;
    const that = this;
    const notShowMark = true;

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
    } = this.state;
    loanBasisInfo = loanBasisInfo || {};
    orderInfo = orderInfo || {};
    deviceCheck = deviceCheck || {};
    userData = userData || {};

    mark = mark || {};

    let { usersOfTheSameDevice } = deviceCheck;
    usersOfTheSameDevice = usersOfTheSameDevice || {};

    const sameDevice = [];
    _.each(usersOfTheSameDevice, (doc, index) => {
      _.each(doc, (subItem, subIndex) => {
        if (!_.find(sameDevice, (o) => { return o.telephoneNo === subItem.telephoneNo; })) {
          sameDevice.push(subItem);
        }
      });
    });
    const ChargeDetailsSettings = { loanBasisInfo, orderInfo };
    const ChargeDetails2Settings = { loanBasisInfo, orderInfo };
    const IdentificationInfoSettings = {
      loanBasisInfo, deviceCheck, sameUser, sameDevice,
    };
    const BasicInfoSettings = { loanBasisInfo, mark, notShowMark };
    const EmploymentInfoSettings = { loanBasisInfo, mark, notShowMark };
    const DisbursementSettings = { loanBasisInfo, mark, notShowMark };
    const ContactInfoSettings = {
      contactPerson, mark, notShowMark, memberId: that.state.memberId,
    };
    // const FacebookInfoSettings = { loanBasisInfo, userData };
    const UserInfoSettings = { loanBasisInfo, orderInfo, lifetimeIds: that.state.lifetimeIds };
    return (
      <div className="loan-audit-details" key="loan-audit-details">

        <UserInfo settings={UserInfoSettings} lifetimeIds={that.state.lifetimeIds} isOrder showPaymentCode />
        <ChargeDetails settings={ChargeDetailsSettings} isReset />
        <ChargeDetails2 settings={ChargeDetails2Settings} />
        <IdentificationInfo settings={IdentificationInfoSettings} />
        <BasicInfo settings={BasicInfoSettings} />
        <EmploymentInfo settings={EmploymentInfoSettings} />
        <Disbursement settings={DisbursementSettings} />
        <LoanRecord memberId={that.state.memberId} />
        <RepaymentRecord appId={that.props.match.params.applicationId} />
        <ContactInfo settings={ContactInfoSettings} />
        <AddressBookInfo memberId={that.state.memberId} mark={mark} showMark />
        <AddressBook memberId={that.state.memberId} />
        <AppFromAddressBook memberId={that.state.memberId} />
        {/* <FacebookInfo settings={FacebookInfoSettings} /> */}
        <CreditCollectionInfo orderId={that.state.orderId} memberId={that.state.memberId} />

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
export default PostLoanDetails;

