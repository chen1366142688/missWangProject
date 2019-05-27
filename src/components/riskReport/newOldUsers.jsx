import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import _ from 'lodash';

import { Button, message, Table, Icon, Spin, Tabs, DatePicker, Select, Row, Col, Modal } from 'antd';

let TB;
const {
  newcustomerLoaninfo, oldcustomerLoaninfo, allcustomerloaninfo, contentType,
} = Interface;
let req;

class NewOldUsers extends CLComponent {
  state = {
    search: {},
    data: [],
    user: [
      { name: '新客户', value: 1 },
      { name: '老客户', value: 2 },
      { name: '所有客户', value: 3 },
    ],
    showTableExport: false,
    total: {},
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'handleCancel',
      'download',
      'getFormFields',
    ]);
  }

  componentDidMount() {
    const that = this;
    // 搜索条件
    const sessionSearch = sessionStorage.getItem('search');
    let search = this.state.search;
    if (sessionSearch) {
      search = JSON.parse(sessionSearch);
    }

    // 分页
    const sessionPagination = sessionStorage.getItem('pagination');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }

    // 排序
    const sessionSorter = sessionStorage.getItem('sorter');
    let sorter = this.state.sorter;
    if (sessionSorter) {
      sorter = JSON.parse(sessionSorter);
    }

    this.loadData(search);
  }

  loadData(search, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });
    const settings = {
      contentType,
      method: newcustomerLoaninfo.type,
      url: `${newcustomerLoaninfo.url}${search.startSRepaymentTime || moment().subtract(10, 'days').format('YYYY-MM-DD')}/${search.endSRepaymentTime || moment().format('YYYY-MM-DD')}`,
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      const arr = new Array();
      const box = res.data.everydayVlue;
      for (let i = 0; i < box.length; i++) {
        if (!box[i].screeningdate && !box[i].befscreeningdate) {
          arr.push(i);
        }
      }
      let len = arr.length;
      while (len--) {
        box.splice(arr[len], 1);
      }
      if (res.data.totalVlue) {
        box.push(res.data.totalVlue);
      }
      that.setState({
        data: res.data.everydayVlue,
        total: res.data.totalVlue,
      });
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({ settings, fn });
  }


  loadData1(search, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });
    const settings = {
      contentType,
      method: oldcustomerLoaninfo.type,
      url: `${oldcustomerLoaninfo.url}${search.startSRepaymentTime || moment().subtract(10, 'days').format('YYYY-MM-DD')}/${search.endSRepaymentTime || moment().format('YYYY-MM-DD')}`,
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      that.setState({
        data: res.data.everydayVlue,
        total: res.data.totalVlue,
      });
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({ settings, fn });
  }
  loadData2(search, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });
    const settings = {
      contentType,
      method: allcustomerloaninfo.type,
      url: `${allcustomerloaninfo.url}${search.startSRepaymentTime || moment().subtract(10, 'days').format('YYYY-MM-DD')}/${search.endSRepaymentTime || moment().format('YYYY-MM-DD')}`,
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      that.setState({
        data: res.data.everydayVlue,
        total: res.data.totalVlue,
      });
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({ settings, fn });
  }
  getFormFields(fields) {
    if (fields.status == 1) {
      const search = {};
      _.map(fields, (doc, index) => {
        if (doc) {
          if (index === 'sRepaymentTime') {
            search.startSRepaymentTime = doc[0].format('YYYY-MM-DD');
            search.endSRepaymentTime = doc[1].format('YYYY-MM-DD');
          } else {
            search[index] = doc;
          }
        }
      });
      this.setState({ search });
      this.loadData(search);
    } else if (fields.status == 2) {
      const search = {};
      _.map(fields, (doc, index) => {
        if (doc) {
          if (index === 'sRepaymentTime') {
            search.startSRepaymentTime = doc[0].format('YYYY-MM-DD');
            search.endSRepaymentTime = doc[1].format('YYYY-MM-DD');
          } else {
            search[index] = doc;
          }
        }
      });
      this.setState({ search });
      this.loadData1(search);
    }else if (fields.status == 3) {
      const search = {};
      _.map(fields, (doc, index) => {
        if (doc) {
          if (index === 'sRepaymentTime') {
            search.startSRepaymentTime = doc[0].format('YYYY-MM-DD');
            search.endSRepaymentTime = doc[1].format('YYYY-MM-DD');
          } else {
            search[index] = doc;
          }
        }
      });
      this.setState({ search });
      this.loadData2(search);
    }
  }

  download(target) {
    const that = this;
    that.setState({ showTableExport: true });
    const { tableexport } = that.props;
    setTimeout(() => {
      TB = tableexport(document.querySelector('#ex-table-new-old-users'), { formats: ['csv', 'txt', 'xlsx'] });
    }, 100);
  }

  handleCancel() {
    const that = this;
    that.setState({ showTableExport: false });
    if (TB) {
      TB.remove();
    }
  }

  renderBody() {
    const that = this;
    const { data } = that.state;
    const { download } = that.props;
    const columns = [
      {
        title: '日期',
        dataIndex: 'screeningdate',
        width: '4.4%',
        render(index, record) {
          return record.screeningdate ? record.screeningdate.split(' ')[0] : 'total';
        },
      },
      {
        title: '放款金额',
        dataIndex: 'loanAmount ',
        width: '4.4%',
        render(index, record) {
          return CL.cf(record.loanAmount, 2);
        },
      },
      {
        title: '放款户数',
        dataIndex: 'loanCount ',
        width: '3%',
        render(index, record) {
          return CL.cf(record.loanCount, 0);
        },
      },
      {
        title: '逾期未还本金',
        dataIndex: 'overdueAmount',
        width: '4.4%',
        render(index, record) {
          return CL.cf(record.overdueAmount, 2);
        },
      },
      {
        title: '逾期未还户数',
        dataIndex: 'overdueCount ',
        width: '3%',
        render(index, record) {
          return CL.cf(record.overdueCount, 0);
        },
      },

      {
        title: '30天金额逾期率',
        dataIndex: 'thirtyDaysAmountOverdueRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.thirtyDaysAmountOverdueRate, 2)}%`;
        },
      },
      {
        title: '30天订单数逾期率',
        dataIndex: 'thirtyDaysCountOverdueRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.thirtyDaysCountOverdueRate, 2)}%`;
        },
      },
      {
        title: '21天金额逾期率',
        dataIndex: 'tweentyoneDaysAmountOverdueRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.tweentyoneDaysAmountOverdueRate, 2)}%`;
        },
      },
      {
        title: '21天订单数逾期率',
        dataIndex: 'tweentyoneDaysCountOverdueRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.tweentyoneDaysCountOverdueRate, 2)}%`;
        },
      },
      {
        title: '14天金额逾期率',
        dataIndex: 'fourteenDaysAmountOverdueRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.fourteenDaysAmountOverdueRate, 2)}%`;
        },
      },
      {
        title: '14天订单数逾期率',
        dataIndex: 'fourteenDaysCountOverdueRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.fourteenDaysCountOverdueRate, 2)}%`;
        },
      },
      {
        title: '7天金额逾期率',
        dataIndex: 'sevenDaysAmountOverdueRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.sevenDaysAmountOverdueRate, 2)}%`;
        },
      },
      {
        title: '7天订单数逾期率',
        dataIndex: 'sevenDaysCountOverdueRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.sevenDaysCountOverdueRate, 2)}%`;
        },
      },
      {
        title: '金额自然逾期率',
        dataIndex: 'naturalAmountOverdueRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.naturalAmountOverdueRate, 2)}%`;
        },
      },
      {
        title: '户数自然逾期率',
        dataIndex: 'naturalCountOverdueRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.naturalCountOverdueRate, 2)}%`;
        },
      },
      {
        title: '回收本金',
        dataIndex: 'retrieveAmount',
        width: '4.4%',
        render(index, record) {
          return CL.cf(record.retrieveAmount, 2);
        },
      },
      {
        title: '本金回收率',
        dataIndex: 'retrieveAmountRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.retrieveAmountRate, 2)}%`;
        },
      },
      {
        title: '回收户数',
        dataIndex: 'retrieveCount',
        width: '3%',
        render(index, record) {
          return CL.cf(record.retrieveCount, 0);
        },
      },
      {
        title: '户数回收率',
        dataIndex: 'retrieveCountRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.retrieveCountRate, 2)}%`;
        },
      },
      {
        title: '催回金额',
        dataIndex: 'reminderAmount',
        width: '4.4%',
        render(index, record) {
          return CL.cf(record.reminderAmount, 2);
        },
      },
      {
        title: '金额催回率',
        dataIndex: 'reminderAmountRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.reminderAmountRate, 2)}%`;
        },
      },
      {
        title: '催回户数',
        dataIndex: 'reminderCount',
        width: '3%',
        render(index, record) {
          return CL.cf(record.reminderCount, 0);
        },
      },
      {
        title: '户数催回率',
        dataIndex: 'reminderCountRate',
        width: '4.4%',
        render(index, record) {
          return `${CL.cf(record.reminderCountRate, 2)}%`;
        },
      },
      {
        title: '逾期应收总金额',
        dataIndex: 'overdueAllAmount',
        width: '4.4%',
        render(index, record) {
          return CL.cf(record.overdueAllAmount, 2);
        },
      },
    ];

    const operation = [
      {
        id: 'sRepaymentTime',
        type: 'rangePicker',
        label: '日期',
        placeholder: 'ranger',
      },
      {
        id: 'status',
        type: 'select',
        label: '客户类型',
        options: that.state.user,
        placeholder: '新客户',
        // showInit: 1,
      },
    ];

    // 把total添加到数据末端
    if (data.length && that.state.total.loanCount && !_.find(data, { screeningdate: null })) {
      that.state.total.screeningdate = null;
      data.push(that.state.total);
    }
    const settings = {
      data: data.map((doc, index) => {
        doc.id = index;
        return doc;
      }),
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: false,
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      btn: [
        {
          title: 'Download',
          type: 'danger',
          fn: that.download,
        },
      ],
    };

    // 下载表格
    const th = [
      '日期',
      '放款金额',
      '放款户数',
      '逾期未还本金',
      '逾期未还户数',
      '30天金额逾期率',
      '30天订单数逾期率',
      '21天金额逾期率',
      '21天订单数逾期率',
      '14天金额逾期率',
      '14天订单数逾期率',
      '7天金额逾期率',
      '7天订单数逾期率',
      '金额自然逾期率',
      '户数自然逾期率',
      '回收本金',
      '本金回收率',
      '回收户数',
      '户数回收率',
      '催回金额',
      '金额催回率',
      '催回户数',
      '户数催回率',
      '逾期应收总金额',
    ];

    return (
      <div className="credit-collection4" key="credit-collection4">
        <Modal
          className="te-modal"
          title="Download"
          closable
          visible={that.state.showTableExport}
          width="100%"
          style={{ top: 0 }}
          onCancel={that.handleCancel}
          footer={[
            <Button key="back" size="large" onClick={that.handleCancel}>Cancel</Button>,
           ]}
        >
          <table className="ex-table" id="ex-table-new-old-users">
            <thead>
              <tr>
                {th.map((doc) => {
                   return (<th key={doc}>{doc}</th>);
                 })}
              </tr>
            </thead>
            <tbody>
              {
                 data.map((record, index) => {
                   return (
                     <tr key={index}>
                       <td>{record.screeningdate ? record.screeningdate.split(' ')[0] : 'total'}</td>
                       <td>{record.loanAmount}</td>
                       <td>{record.loanCount}</td>
                       <td>{record.overdueAmount}</td>
                       <td>{record.overdueCount}</td>
                       <td>{record.thirtyDaysAmountOverdueRate}</td>
                       <td>{record.thirtyDaysCountOverdueRate}</td>
                       <td>{record.tweentyoneDaysAmountOverdueRate}</td>
                       <td>{record.tweentyoneDaysCountOverdueRate}</td>
                       <td>{record.fourteenDaysAmountOverdueRate}</td>
                       <td>{record.fourteenDaysCountOverdueRate}</td>
                       <td>{record.sevenDaysAmountOverdueRate}</td>
                       <td>{record.sevenDaysCountOverdueRate}</td>
                       <td>{record.naturalAmountOverdueRate}</td>
                       <td>{record.naturalCountOverdueRate}</td>
                       <td>{record.retrieveAmount}</td>
                       <td>{record.retrieveAmountRate}</td>
                       <td>{record.retrieveCount}</td>
                       <td>{record.retrieveCountRate}</td>
                       <td>{record.reminderAmount}</td>
                       <td>{record.reminderAmountRate}</td>
                       <td>{record.reminderCount}</td>
                       <td>{record.reminderCountRate}</td>
                       <td>{record.overdueAllAmount}</td>
                     </tr>
                   );
                 })
               }
            </tbody>
          </table>
        </Modal>
        <CLlist settings={settings} />

      </div>
    );
  }

  render(data) {
    return (
      <QueueAnim className="animate-content4">
        {this.renderBody()}
      </QueueAnim>
    );
  }
}
export default NewOldUsers;

