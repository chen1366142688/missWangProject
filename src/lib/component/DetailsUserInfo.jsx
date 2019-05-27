import React from 'react';
import moment from 'moment';
import { Button, Table, Modal, Icon, Tabs } from 'antd';
import { CL } from '../tools/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import CLComponent from './CLComponent.jsx';
import CF from 'currency-formatter';
import { Interface } from '../config/index.js';
import RedBox from 'redbox-react';

const { contentType, ordernumbers } = Interface;

class UserInfo extends CLComponent {
  state = {
    visible: false,
    serialNo: '',
    data: {},
    tableLoading: false,
  }
  constructor(props) {
    super(props);
    this.bindCtx([
      'render',
      'selectData',
      'showModal',
      'handleCancel',
      'handleOk',
    ]);
  }
  componentDidMount() {
    // const that = this;
    // window.setTimeout(() => {
    //   if (that.props.settings.orderInfo.serialNo) {
    //     that.selectData();
    //   } else {
    //     console.log('没有电话');
    //   }
    // }, 1500);
  }

  selectData() {
    const that = this;
    that.setState({ tableLoading: true });
    const settings = {
      contentType,
      method: ordernumbers.type,
      url: ordernumbers.url + that.props.settings.orderInfo.serialNo, //62854701341//
    };
    function fn(res) {
      that.setState({ data: res.data.data || {}, visible: true, tableLoading: false, });
    }
    CL.clReqwest({ settings, fn });
  }

  showModal = () => {
    this.selectData();
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  }

  handleOk = (e) => {
    this.setState({
      visible: false,
    });
  }

  render() {
    const that = this;
    const {
      loanBasisInfo, orderInfo, deviceCheck, sameUser, sameDevice,
    } = that.props.settings;
    const { lifetimeIds, showPaymentCode, dataCode, dataCodes } = that.props;
    const { data } = that.state;
    const {
      merchant, proc, procDtl, refDate, refNo, status, txnId, procMsg, from, channel, note, txid,
    } = that.state.data;
    const UserInfoData = {
      title: 'UserInfoData',
      columns: [
        {
          title: 'Application number',
          dataIndex: 'appId',
        },
        {
          title: 'Order number',
          dataIndex: 'serialNo',
          render: (index, doc) => {
            if (that.props.isOrder) {
              if (that.props.settings.orderInfo.serialNo) {
                return <Button onClick={this.showModal}>{doc ? doc.serialNo : '-'}</Button>;
              }
              return '-';
            }
            return doc ? doc.serialNo : '-';
          },
        },
        {
          title: 'Application time',
          dataIndex: 'applicationTime',
        },
        {
          title: 'Loan amount',
          dataIndex: 'appLoanAmount',
        },
        {
          title: 'Payment term',
          dataIndex: 'loanDays',
        },

      ],
      data: [
        {
          index: '1',
          appId: loanBasisInfo.appId,
          serialNo: (orderInfo || {}).serialNo,
          applicationTime: moment(new Date(loanBasisInfo.applicationTime)).format('YYYY-MM-DD HH:mm'),
          appLoanAmount: CF.format(loanBasisInfo.appLoanAmount, {}),
          loanDays: `${loanBasisInfo.apploanTimeLimit}days`,
          lifetimeId: lifetimeIds || '',
          dataCode: dataCode == '0' ? '-' : dataCode,
        },
      ],
    };

    if (showPaymentCode) {
      UserInfoData.columns.push(
        {
          title: 'Reference No.',
          dataIndex: 'lifetimeId',
        },
      );
    }

    if (dataCodes) {
      UserInfoData.columns.push(
        {
          title: 'Reference No.',
          dataIndex: 'dataCode',
        },
      );
    }

    return (
      <div>
        <Table
          bordered
          className="user-info cl-table"
          loading={this.state.tableLoading}
          pagination={false}
          columns={UserInfoData.columns}
          rowKey={record => record.index}
          dataSource={UserInfoData.data}
        />
        <Modal
          title=""
          onOk={this.handleOk}
          visible={this.state.visible}
          onCancel={this.handleCancel}
        >
          <div style={{ overflow: 'auto' }}>
            {
              from == 'Dragonpay' ? 
              <div>
                <p><b>from : </b>{from}</p>
                <p><b>merchant : </b>{merchant}</p>
                <p><b>proc : </b>{proc}</p>
                <p><b>procDtl : </b>{procDtl}</p>
                <p><b>refDate : </b>{refDate}</p>
                <p><b>refNo : </b>{refNo}</p>
                <p><b>status : </b>{status}</p>
                <p><b>txnId : </b>{txnId || '-'}</p>
                <p><b>procMsg : </b>{procMsg || '-'} </p>
              </div> : 
              <div style={{ color: '#e4393c' }}>
                  <p><b>from : </b>{from}</p>
                  <p><b>channel : </b>{channel}</p>
                  <p><b>refNo : </b>{refNo}</p>
                  <p><b>status : </b>{status}</p>
                  <p><b>note : </b>{note}</p>
                  <p><b>txid : </b>{txid}</p>
              </div>
            }

          </div>
        </Modal>
      </div>
    );
  }
}
export default UserInfo;
