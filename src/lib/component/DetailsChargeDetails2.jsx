import React from 'react';
import moment from 'moment';
import { Table, Icon} from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CF from 'currency-formatter';

class ChargeDetails2 extends CLComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const that = this;
    const {loanBasisInfo, orderInfo } = that.props.settings;
    const ChargeDetails2Information = {
      columns: [
        {
            title: "Status",
            dataIndex: "statusName",
          },
          {
            title: "Repayment time",
            dataIndex: "frepaymentTime",
          },
          {
            title: "Overdue days",
            dataIndex:"overdueDays",
          },
          {
            title: "Amount",
            dataIndex:"overdueAmount",
          },
          {
            title: "Principal",
            dataIndex: "overduePrincipal",
          },
          {
            title: "Interest",
            dataIndex: "appInterest",
          },
          {
            title: "Late payment fee",
            dataIndex: "overdueDelayTax",
          },
          {
            title: "Overdue fee",
            dataIndex: "overduePayment",
          }
      ],
      data: [
        {
          index: "1",
          statusName: orderInfo.statusName,
          frepaymentTime: orderInfo.frepaymentTime ?moment(new Date(orderInfo.frepaymentTime)).format("YYYY-MM-DD HH:mm") : orderInfo.frepaymentTime,
          overdueDays: orderInfo.overdueDays,
          appInterest: CF.format(loanBasisInfo.appInterest, {}),
          overduePrincipal: CF.format(loanBasisInfo.appLoanAmount, {}),
          overdueDelayTax: CF.format(orderInfo.overdueDelayTax, {}),
          overduePayment: CF.format(orderInfo.overduePayment, {}),
          overdueAmount: CF.format(orderInfo.overdueAmount, {}),
        }
      ]
    }

    return (
      <Table  bordered  className="charge-details cl-table" 
        loading = {!orderInfo}
        pagination = {false}
        columns={ChargeDetails2Information.columns} 
        rowKey={record =>  record.index}
        dataSource={ChargeDetails2Information.data} />
    );
  }
}
export default ChargeDetails2;