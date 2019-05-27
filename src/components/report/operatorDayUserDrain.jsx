import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';

import { Button, message, Table, Icon, Spin, Tabs, DatePicker, Row, Col, Modal } from 'antd';

const { contentType, getDayUserDrainReport } = Interface;
let TB;

// 运营周报 用户方向

class OperatorDayUserDrain extends CLComponent {
    state = {
      search: {},
      pagination: {
        total: 0,
        pageSize: 30,
        currentPage: 1,
      },
      tableLoading: false,
      showTableExport: false,
      data: [],
    }

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
      const WeekFirstDay = new Date(Nowdate - (Nowdate.getDay() - 1) * 86400000);
      const WeekLastDay = new Date((WeekFirstDay / 1000 + 6 * 86400) * 1000);

      this.state.search.beginTime = WeekFirstDay;
      this.state.search.endTime = WeekLastDay;

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

        const WeekFirstDay = new Date(Nowdate - (Nowdate.getDay() - 1) * 86400000);

        params.startTime = WeekFirstDay;

        params.endTime = new Date((WeekFirstDay / 1000 + 6 * 86400) * 1000);
      }


      const settings = {
        contentType,
        method: 'post',
        url: getDayUserDrainReport.url,
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

      CL.clReqwest({ settings, fn });
    }


    download(target) {
      const that = this;
      that.setState({ showTableExport: true });
      const { tableexport } = that.props;
      setTimeout(() => {
        TB = tableexport(document.querySelector('#ex-table-operator-day-user-drain'), { formats: ['csv', 'txt', 'xlsx'] });
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
      this.setState({ search: search, pagination: pagination });
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

      this.setState({ pagination: pagination, sorter: sorterClient });
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
          title: '注册人数',
          dataIndex: 'registerCount',
          width: 200,
          render(index, record) {
            return CL.cf(record.registerCount, 0);
          },
        },
        {
          title: '注册填写资料用户数',
          dataIndex: 'registerCompletedAndNotCount',
          width: 200,
          render(index, record) {
            return CL.cf(record.registerCompletedAndNotCount, 0);
          },
        },
        {
          title: '注册完善资料用户数',
          dataIndex: 'registerCompletedCount',
          width: 200,
          render(index, record) {
            return CL.cf(record.registerCompletedCount, 0);
          },
        },
        {
          title: '注册资料填写流失率',
          dataIndex: 'registerNotCompletedRate',
          width: 200,
          render(index, record) {
            return `${CL.cf(record.registerNotCompletedRate, 2)}%`;
          },
        },
        {
          title: '注册申请人数',
          dataIndex: 'registerApplicationCount',
          width: 200,
          render(index, record) {
            return CL.cf(record.registerApplicationCount, 0);
          },
        },
        {
          title: '注册申请流失率',
          dataIndex: 'registerNotApplicationRate',
          width: 200,
          render(index, record) {
            return `${CL.cf(record.registerNotApplicationRate, 2)}%`;
          },
        },
        {
          title: '注册放款人数',
          dataIndex: 'registerLendingCount',
          width: 200,
          render(index, record) {
            return CL.cf(record.registerLendingCount, 0);
          },
        },
        {
          title: '注册放款流失率',
          dataIndex: 'registerNotSuccessfulLoanRate',
          width: 200,
          render(index, record) {
            return `${CL.cf(record.registerNotSuccessfulLoanRate, 2)}%`;
          },
        },
        {
          title: '注册还款人数',
          dataIndex: 'registerRepaymentCount',
          width: 200,
          render(index, record) {
            return CL.cf(record.registerRepaymentCount, 0);
          },
        },
        {
          title: '未还款人数占比',
          dataIndex: 'lendingNotSuccessfulRepaymentRate',
          width: 200,
          render(index, record) {
            return `${CL.cf(record.lendingNotSuccessfulRepaymentRate, 2)}%`;
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
        '注册完善资料用户数',
        '注册填写资料用户数',
        '注册资料填写流失率',
        '注册人数',
        '注册放款人数',
        '注册放款流失率',
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
            <table className="ex-table" id="ex-table-operator-day-user-drain">
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
                                        <td>{CL.cf(record.registerCompletedCount, 0)}</td>
                                        <td>{CL.cf(record.registerCompletedAndNotCount, 0)}</td>
                                        <td>{`${CL.cf(record.registerNotCompletedRate, 2)}%`}</td>
                                        <td>{CL.cf(record.registerCount, 0)}</td>
                                        <td>{CL.cf(record.registerLendingCount, 0)}</td>
                                        <td>{`${CL.cf(record.registerNotSuccessfulLoanRate, 2)}%`}</td>
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
export default OperatorDayUserDrain;

// add something for commit
