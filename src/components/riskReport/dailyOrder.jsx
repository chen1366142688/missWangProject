import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import _ from 'lodash';

import { Button, message, Table, Icon, Spin, Tabs, DatePicker, Row, Col, Modal } from 'antd';

let TB;
const { dailyOrderRep, contentType } = Interface;
let req;

class DailyOrder extends CLComponent {
  state = {
    search: {},
    data: [],
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
      method: 'get',
      url: `${dailyOrderRep.url}${search.startSRepaymentTime || moment().subtract(10, 'days').format('YYYY-MM-DD')}/${search.endSRepaymentTime || moment().format('YYYY-MM-DD')}`,
    };
    console.log('1', moment().subtract(10, 'days').format('YYYY-MM-DD'));
    console.log('2', moment().format('YYYY-MM-DD'));
    function fn(res) {
      that.setState({ tableLoading: false });
      const arr = new Array();
      const box = res.data.everydayVlue;
      for (let i = 0; i < box.length; i++) {
        if (!box[i].screeningdate && !box[i].automaticpassrate) {
          arr.push(i);
        }
      }
      let len = arr.length;
      while (len--) {
        box.splice(arr[len], 1);
      }
      that.setState({
        data: box,
        total: res.data.totalVlue,
      });
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({ settings, fn });
  }

  getFormFields(fields) {
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
  }

  download(target) {
    const that = this;
    that.setState({ showTableExport: true });
    const { tableexport } = that.props;
    setTimeout(() => {
      TB = tableexport(document.querySelector('#ex-table-daily-order'), { formats: ['csv', 'txt', 'xlsx'] });
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
        width: '5.5%',
        render(index, record) {
          return record.screeningdate ? record.screeningdate.split(' ')[0] : 'total';
        },
      },
      {
        title: '当日新增注册用户',
        dataIndex: 'dengesnewregisteredusers',
        width: '5%',
        render(index, record) {
          return CL.cf(record.dengesnewregisteredusers, 0);
        },
      },
      {
        title: '当日注册申请用户',
        dataIndex: 'dengesregisteredapplyusers',
        width: '5.5%',
        render(index, record) {
          return CL.cf(record.dengesregisteredapplyusers, 0);
        },
      },
      {
        title: '转化率',
        dataIndex: 'conversionrate',
        width: '6%',
        render(index, record) {
          return record.conversionrate;
        },
      },
      {
        title: '申请总数',
        dataIndex: 'applyamount',
        width: '5%',
        render(index, record) {
          return CL.cf(record.applyamount, 0);
        },
      },

      {
        title: '新用户申请',
        dataIndex: 'newusersapply',
        width: '5.5%',
        render(index, record) {
          return CL.cf(record.newusersapply, 0);
        },
      },

      {
        title: '新用户通过',
        dataIndex: 'newuserspass',
        width: '5%',
        render(index, record) {
          return CL.cf(record.newuserspass, 0);
        },
      },
      {
        title: '新用户通过率',
        dataIndex: 'newuserspassingrate',
        width: '6%',
        render(index, record) {
          return record.newuserspassingrate;
        },
      },
      {
        title: '老用户申请',
        dataIndex: 'oldusersapply',
        width: '5.5%',
        render(index, record) {
          return CL.cf(record.oldusersapply, 0);
        },
      },
      {
        title: '老用户通过订单',
        dataIndex: 'olduserspassorders',
        width: '5.5%',
        render(index, record) {
          return CL.cf(record.olduserspassorders, 0);
        },
      },
      {
        title: '老用户通过率',
        dataIndex: 'olduserspassrate',
        width: '6%',
        render(index, record) {
          return record.olduserspassrate;
        },
      },
      {
        title: '今日到期订单',
        dataIndex: 'dengesexpireorder',
        width: '5%',
        render(index, record) {
          return CL.cf(record.dengesexpireorder, 0);
        },
      },
      {
        title: '今日还款订单总数',
        dataIndex: 'dengesrepaymentorderamount',
        width: '6%',
        render(index, record) {
          return CL.cf(record.dengesrepaymentorderamount, 0);
        },
      },
      {
        title: '当日放款订单',
        dataIndex: 'loanordersum',
        width: '5%',
        render(index, record) {
          return CL.cf(record.loanordersum, 0);
        },
      },
      {
        title: '新用户自动规则通过率',
        dataIndex: 'automaticpassrate',
        width: '6%',
        render(index, record) {
          return record.automaticpassrate;
        },
      },
      {
        title: '新用户人工通过率',
        dataIndex: 'artificialpassrate',
        width: '6%',
        render(index, record) {
          return record.artificialpassrate;
        },
      },
      {
        title: '当日申请老客户通过占比',
        dataIndex: 'oldusersapplyrate',
        width: '5.5%',
        render(index, record) {
          return record.oldusersapplyrate;
        },
      },
      {
        title: '当日申请单未处理量',
        dataIndex: 'unhandleapplyamount',
        width: '6%',
        render(index, record) {
          return CL.cf(record.unhandleapplyamount, 0);
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
    ];

    // 把total添加到数据末端
    if (data.length && that.state.total.applyamount && !_.find(data, { screeningdate: null })) {
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
      '当日新增注册用户',
      '当日注册申请用户',
      '转化率',
      '申请总数',
      '新用户申请',
      '新用户通过',
      '新用户通过率',
      '老用户申请',
      '老用户通过订单',
      '老用户通过率',
      '今日到期订单',
      '今日还款订单总数',
      '当日放款订单',
      '新用户自动规则通过率',
      '新用户人工通过率',
      '当日申请老客户通过占比',
      '当日申请单未处理量',
    ];

    return (
      <div className="credit-collection" key="credit-collection">

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
          <table className="ex-table" id="ex-table-daily-order">
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
                       <td>{record.dengesnewregisteredusers}</td>
                       <td>{record.dengesregisteredapplyusers}</td>
                       <td>{record.conversionrate}</td>
                       <td>{record.applyamount}</td>
                       <td>{record.newusersapply}</td>
                       <td>{record.newuserspass}</td>
                       <td>{record.newuserspassingrate}</td>
                       <td>{record.oldusersapply}</td>
                       <td>{record.olduserspassorders}</td>
                       <td>{record.olduserspassrate}</td>
                       <td>{record.dengesexpireorder}</td>
                       <td>{record.dengesrepaymentorderamount}</td>
                       <td>{record.loanordersum}</td>
                       <td>{record.automaticpassrate}</td>
                       <td>{record.artificialpassrate}</td>
                       <td>{record.oldusersapplyrate}</td>
                       <td>{record.unhandleapplyamount}</td>
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
      <QueueAnim className="animate-content">
        {this.renderBody()}
      </QueueAnim>
    );
  }
}
export default DailyOrder;

