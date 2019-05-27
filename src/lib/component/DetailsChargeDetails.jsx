import React from 'react';
import moment from 'moment';
import { Table, Icon, Modal, DatePicker, Input, Button, message } from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CF from 'currency-formatter';
import { Interface } from '../../../src/lib/config/index';

const { restRepaymentTime, contentType } = Interface;
const { TextArea } = Input;
class ChargeDetails extends CLComponent {
  state = {
    Discount: false,
    resetReason: '',
    resetPaymentDueTime: '',
  }
  constructor(props) {
    super(props);
    this.bindCtx([
      'Discount',
      'DiscountApproval',
      'resetReason',
      'dateChanges',
    ]);
  }
  DiscountApproval(e) {
    this.setState({ Discount: true });
  }
  Discount = (e) => {
    const that = this;
    this.setState({
      Discount: false,
    });
    const settings = {
      contentType,
      method: restRepaymentTime.type,
      url: restRepaymentTime.url,
      data: JSON.stringify({
        applicationId: that.props.settings.loanBasisInfo.appId,
        resetPaymentDueTime: that.state.resetPaymentDueTime,
        resetReason: that.state.resetReason,
      }),
    };
    function fn(res) {
      if (res.data == true) {
        message.success('save success');
        window.location.reload(`#/uplending/postloandetails/${that.props.settings.orderInfo.orderId}/${that.props.settings.orderInfo.applicationId}`);
      } else {
        message.error(res.data);
      }
    }
    CL.clReqwest({ settings, fn });
  }
  handleCancel = (e) => {
    this.setState({ Discount: false });
  }
  resetReason(e) {
    this.setState({ resetReason: e.target.value });
  }
  dateChanges(e) {
    const that = this;
    const resetPaymentDueTime = new Date(e.format('YYYY-MM-DD HH:mm:ss')).getTime();
    that.setState({ resetPaymentDueTime: resetPaymentDueTime });
  }
  render() {
    const that = this;
    const { loanBasisInfo, orderInfo } = that.props.settings;
    const ChargeDetailsInfo = {
      columns: [
        {
          title: 'Repayment due time',
          dataIndex: 'expireRepaymentTime',
          render: function () {
            if (that.props.isReset) {
              return (
                <div style={{ margin: 0, padding: 0 }}>
                  <p style={{ display: 'inline-block' }}>{moment(new Date((orderInfo || {}).srepaymentTime || loanBasisInfo.expireRepaymentTime)).format('YYYY-MM-DD')}</p>
                  {
                    (that.props.settings.orderInfo.status == '2' || that.props.settings.orderInfo.status == '4') && (_.indexOf(JSON.parse(sessionStorage.getItem('roles')), 'Reset Repayment Due Time') > -1) ? (
                      <Button type="primary" onClick={that.DiscountApproval} style={{ marginLeft: '15px' }}>reset</Button>) : ''
                  }
                </div>);
            }
            return <span>{moment(new Date((orderInfo || {}).srepaymentTime || loanBasisInfo.expireRepaymentTime)).format('YYYY-MM-DD')}</span>;
          },
        },
        {
          title: 'Total payment',
          dataIndex: 'appSrepaymentAmount',
          width: '14%',
        },
        {
          title: 'Net proceed',
          dataIndex: 'appAccountAmount',
          width: '14%',
        },
        {
          title: 'Total charge',
          dataIndex: 'appTotalCharge',
          width: '14%',
        },
        {
          title: 'Interest',
          dataIndex: 'appInterest',
          width: '14%',
        },
        {
          title: 'Evaluation service fee',
          dataIndex: 'appAuditServiceExpense',
          width: '14%',
        },
        {
          title: 'Account management fee',
          dataIndex: 'appAccountManageExpense',
          width: '14%',
        },
      ],
      data: [
        {
          index: '1',
          expireRepaymentTime: moment(new Date((orderInfo || {}).srepaymentTime || loanBasisInfo.expireRepaymentTime)).format('YYYY-MM-DD'),
          appSrepaymentAmount: CF.format(loanBasisInfo.appSrepaymentAmount, {}),
          appTotalCharge: CF.format(loanBasisInfo.appTotalCharge, {}),
          appInterest: CF.format(loanBasisInfo.appInterest, {}),
          appAuditServiceExpense: CF.format(loanBasisInfo.appAuditServiceExpense, {}),
          appAccountManageExpense: CF.format(loanBasisInfo.appAccountManageExpense, {}),
          appAccountAmount: CF.format(loanBasisInfo.appAccountAmount, {}),
        },
      ],
    };
    return (
      <div>
        <Table
          bordered
          className="charge-details cl-table"
          key="charge-details cl-table"
          title={() => (<h4 className="table-title"> Charge Details (<span style={{ color: 'red' }}>{`Form ` + loanBasisInfo.versionName}</span>)</h4>)}
          loading={!loanBasisInfo}
          pagination={false}
          columns={ChargeDetailsInfo.columns}
          rowKey={record => record.index}
          dataSource={ChargeDetailsInfo.data}
        />
        <Modal
          title="Reset repayment due time"
          visible={that.state.Discount}
          onOk={() => { that.Discount(); }}
          onCancel={that.handleCancel}
          okText="Confirm"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px', height: '2000px' }}
        >
          <b style={{ width: '175px', display: 'inline-block' }}>New time : </b>
          <DatePicker
            showTime
            format="YYYY-MM-DD"
            onChange={that.dateChanges}
          />
          <br />
          <br />
          <TextArea placeholder="Please Nose the reason..." autosize={{ minRows: 2, maxRows: 6 }} onChange={that.resetReason} />
        </Modal>
      </div>
    );
  }
}
export default ChargeDetails;
