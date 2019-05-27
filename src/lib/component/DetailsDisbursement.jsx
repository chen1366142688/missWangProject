import React from 'react';
import moment from 'moment';
import { Table, Icon} from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';


class Disbursement extends CLComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const that = this;
    const {loanBasisInfo, mark,} = that.props.settings;
    const DisbursementInformaiton = {
      title: "Disbursement  Informaiton",
      data: [
        {
          title: "Channel type",
          content: loanBasisInfo.paymentChannelTypeName,
          type: 'text',
          
        },
        {
          title: "Institution name",
          content: loanBasisInfo.bank,
          type: 'text',
          
        },
        {
          title: "Account number",
          content: loanBasisInfo.accountNo,
          type: 'text',
          
        },
        {
          title: "Account holder name",
          content: loanBasisInfo.bankAccountOwner,
          type: 'text',
          // check: CL.setMark(mark.accountHolderName)
        }
      ]
    }

    return (
      <CLBlockList  settings={DisbursementInformaiton}/>
    );
  }
}
export default Disbursement;