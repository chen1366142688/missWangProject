import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';

import { Button, message, Table, Icon, Spin, Tabs, DatePicker, Row, Col, Modal } from 'antd';

const { contentType, getDayUserReport } = Interface;
let TB;

// 运营周报 用户方向 当周用户数据

class OperatorCurWeeklyBU extends CLComponent {
  state = {
    search: {},
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    tableLoading: false,
    showTableExport: false,
    data: [],
  };

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'download',
      'pageChage',
      'handleCancel',
      'getFormFields',
    ]);
  }


  componentDidMount() {
    const that = this;
    // 搜索条件
    const sessionSearch = sessionStorage.getItem('search');

    const Nowdate = new Date();
    // const WeekFirstDay = new Date(Nowdate - (Nowdate.getDay() - 1) * 86400000);
    // const WeekLastDay = new Date((WeekFirstDay / 1000 + 6 * 86400) * 1000);
    //
    // this.state.search.beginTime = WeekFirstDay;
    // this.state.search.endTime = WeekLastDay;

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

    const type = sessionStorage.getItem('operateDataType') || '1';
    this.setState({ type: type });
    this.loadData(this.state.search, this.state.pagination, this.state.sorter);
  }


  loadData(search, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });

    const params = {

      startTime: search.beginTime,
      endTime: search.endTime,

    };

    if (!params.startTime) {
      const Nowdate = new Date();

      // const WeekFirstDay = new Date(Nowdate - (Nowdate.getDay() - 1) * 86400000);
      const WeekFirstDay = new Date(moment().dayOfYear(Number));
      params.startTime = new Date((WeekFirstDay / 1000 - 6 * 86400) * 1000);

      params.endTime = WeekFirstDay;
    }


    const settings = {
      contentType,
      method: 'post',
      url: getDayUserReport.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });

      if (res.data) {
        const pagination = {
          total: 1,
          pageSize: 200,
          currentPage: 1,
        };

        sessionStorage.setItem('pagination', JSON.stringify(pagination));

        sessionStorage.setItem('search', JSON.stringify(search));

        that.setState({
          pagination: pagination,
          data: res.data,
          search: search,
        });
      }
    }

    CL.clReqwest({
      settings,
      fn,
    });
  }


  download(target) {
    const that = this;
    that.setState({ showTableExport: true });
    const { tableexport } = that.props;
    setTimeout(() => {
      TB = tableexport(document.querySelector('#ex-table-operator-cur-weekly-bu'), { formats: ['csv', 'txt', 'xlsx'] });
    }, 100);
  }

  handleCancel() {
    const that = this;
    that.setState({ showTableExport: false });
    if (TB) {
      TB.remove();
    }
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'sRepaymentTime') {
          search.beginTime = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search.endTime = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else {
          search[index] = doc;
        }
      }
    });
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    console.log(`this is search debug${search.beginTime}${search.endTime}`);
    this.setState({
      search: search,
      pagination: pagination,
    });
    this.loadData(search, pagination);
  }

  pageChage(e, filters, sorter) { // list 切换页面
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };

    const SORTDIC = {
      applicationTime: 2,
      memberRegisterDate: 1,
      descend: 1,
      ascend: 2,
    };

    const sorterClient = {
      sortFieldType: SORTDIC[sorter.field] || 2,
      sortType: SORTDIC[sorter.order] || 1,
    };

    this.setState({
      pagination: pagination,
      sorter: sorterClient,
    });
    this.loadData(this.state.search, pagination, sorterClient);
  }

  renderBody() {
    const that = this;
    const { data } = that.state;
    const { download } = that.props;
    const columns = [

      {
        title: '日期',
        dataIndex: 'strDate',
        width: 200,
        render(index, record) {
          return record.strDate;
        },
      },
      {
        title: '放款笔数',
        dataIndex: 'lendingCount',
        width: 200,
        render(index, record) {
          return CL.cf(record.lendingCount, 0);
        },
      },
      {
        title: '新用户放款笔数',
        dataIndex: 'newUserlendingCount',
        width: 200,
        render(index, record) {
          return CL.cf(record.newUserlendingCount, 0);
        },
      },
      {
        title: '老用户放款笔数',
        dataIndex: 'oldUserlendingCount',
        width: 200,
        render(index, record) {
          return CL.cf(record.oldUserlendingCount, 0);
        },
      }, {
        title: '老用户放款占比',
        dataIndex: 'oldUserLendingToAllRate',
        width: 200,
        render(index, record) {
          return `${CL.cf(record.oldUserLendingToAllRate, 2)}%`;
        },
      }, {
        title: '放款金额',
        dataIndex: 'lendingAmount',
        width: 200,
        render(index, record) {
          return CL.cf(record.lendingAmount, 2);
        },
      }, {
        title: '新用户放款金额',
        dataIndex: 'newUserlendingAmount',
        width: 200,
        render(index, record) {
          return CL.cf(record.newUserlendingAmount, 2);
        },
      }, {
        title: '老用户放款金额',
        dataIndex: 'oldUserlendingAmount',
        width: 200,
        render(index, record) {
          return CL.cf(record.oldUserlendingAmount, 2);
        },
      }, {
        title: '申请笔数',
        dataIndex: 'applicationCount',
        width: 200,
        render(index, record) {
          return CL.cf(record.applicationCount, 0);
        },
      }, {
        title: '新用户申请笔数',
        dataIndex: 'newUserApplicationCount',
        width: 200,
        render(index, record) {
          return CL.cf(record.newUserApplicationCount, 0);
        },
      }, {
        title: '老用户申请笔数',
        dataIndex: 'oldUserApplicationCount',
        width: 200,
        render(index, record) {
          return CL.cf(record.oldUserApplicationCount, 0);
        },
      }, {
        title: '老用户申请占比',
        dataIndex: 'oldUserApplicationToAllRate',
        width: 200,
        render(index, record) {
          return `${CL.cf(record.oldUserApplicationToAllRate, 2)}%`;
        },
      }, {
        title: '申请放款率',
        dataIndex: 'lengdingRate',
        width: 200,
        render(index, record) {
          return `${CL.cf(record.lengdingRate, 2)}%`;
        },
      }, {
        title: '新用户放款率',
        dataIndex: 'newUserLengdingRate',
        width: 200,
        render(index, record) {
          return `${CL.cf(record.newUserLengdingRate, 2)}%`;
        },
      }, {
        title: '老用户放款率',
        dataIndex: 'oldUserLengdingRate',
        width: 200,
        render(index, record) {
          return `${CL.cf(record.oldUserLengdingRate, 2)}%`;
        },
      },
      {
        title: '注册人数',
        dataIndex: 'registerCount',
        width: 200,
        render(index, record) {
          return CL.cf(record.registerCount, 0);
        },
      }, {
        title: '新用户申请注册比',
        dataIndex: 'newUserApplicationToRegisterRate',
        width: 200,
        render(index, record) {
          return `${CL.cf(record.newUserApplicationToRegisterRate, 2)}%`;
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

    const settings = {
      data: data,
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
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
      '放款笔数',
      '新用户放款笔数 ',
      '老用户放款笔数 ',
      '放款金额',
      '新用户放款金额',
      '老用户放款金额',
      '申请笔数',
      '新用户申请笔数',
      '老用户申请笔数',
      '老用户申请占比',
      '申请放款率',
      '新用户放款率',
      '老用户放款率',
      '老用户放款占比',
      '注册人数',
      '新用户申请注册比',
    ];

    return (
      <div className="credit-collection" key="credit-collection">
        <CLlist settings={settings} />

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
          <table className="ex-table" id="ex-table-operator-cur-weekly-bu">
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
                    <td>{record.strDate}</td>
                    <td>{CL.cf(record.lendingCount, 0)}</td>
                    <td>{CL.cf(record.newUserlendingCount, 0)}</td>
                    <td>{CL.cf(record.oldUserlendingCount, 0)}</td>
                    <td>{CL.cf(record.lendingAmount, 2)}</td>
                    <td>{CL.cf(record.newUserlendingAmount, 2)}</td>
                    <td>{CL.cf(record.oldUserlendingAmount, 2)}</td>
                    <td>{CL.cf(record.applicationCount, 0)}</td>
                    <td>{CL.cf(record.newUserApplicationCount, 0)}</td>
                    <td>{CL.cf(record.oldUserApplicationCount, 0)}</td>
                    <td>{`${CL.cf(record.oldUserApplicationToAllRate, 2)}%`}</td>
                    <td>{`${CL.cf(record.lengdingRate, 2)}%`}</td>
                    <td>{`${CL.cf(record.newUserLengdingRate, 2)}%`}</td>
                    <td>{`${CL.cf(record.oldUserLengdingRate, 2)}%`}</td>
                    <td>{`${CL.cf(record.oldUserLendingToAllRate, 2)}%`}</td>
                    <td>{CL.cf(record.registerCount, 0)}</td>
                    <td>{`${CL.cf(record.newUserApplicationToRegisterRate, 2)}%`}</td>
                  </tr>

                );
              })
            }
            </tbody>
          </table>
        </Modal>
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

export default OperatorCurWeeklyBU;

// add something for commit
