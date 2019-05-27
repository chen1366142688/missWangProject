import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLList from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';
import { Button, message, Table, Icon, Spin, Tabs, DatePicker, Row, Col, Modal } from 'antd';

const { contentType, getCollectorReport, getCompanyList } = Interface;
let TB;

// 催收员报表
class CollectorReport extends CLComponent {
  state = {
    search: {},
    pagination: {
      total: 0,
      pageSize: 100,
      currentPage: 1,
    },
    tableLoading: false,
    showTableExport: false,
    data: [],
    companyList: []
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
      this.getCompanyListMth();
    this.loadData(this.state.search, this.state.pagination, this.state.sorter);
  }

    getCompanyListMth = () => {
        let settings = {
            contentType,
            method: getCompanyList.type,
            url: getCompanyList.url,
            data: JSON.stringify({
                pageRequestDto: {
                    currentPage: 1,
                    limit: 1000,
                    order: 'desc',
                    sort: ['id']
                }
            })
        };

        CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.status === "SUCCESS") {
                    let companyList = res.response.rows.map(item => {
                        return {
                            name: item.name,
                            value: item.id
                        }
                    }) || [];
                    companyList.unshift({
                        name: "Unipeso",
                        value: 0
                    });
                    this.setState({
                        companyList
                    })
                }
            });
    };

  loadData(search, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });
    const params = {
      searchCondition: search || this.state.search,
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 100,
      },
    };

    const settings = {
      contentType,
      method: 'post',
      url: getCollectorReport.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      if (res.data) {
        const pagination = {
          total: res.data.totalCount,
          pageSize: 100,
          currentPage: res.data.currentPage,
        };
        that.setState({
          data: res.data.result,
          search: search,
          pagination: pagination,
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
      TB = tableexport(document.querySelector('#ex-table-collector-report'), { formats: ['csv', 'txt', 'xlsx'] });
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
          search.beginTime = new Date(doc.format('YYYY-MM-DD')).getTime();
          search.endTime = new Date(doc.format('YYYY-MM-DD')).getTime();
        } else {
          search[index] = doc;
        }
      }
    });
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
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
        title: '催收员',
        dataIndex: 'collectorName',
        width: '6%',
        render(index, record) {
          return record.collectorName;
        },
      },
        {
            title: 'Company',
            dataIndex: 'companyName',
            width: '6%'
        },
      {
        title: '催收时间',
        dataIndex: 'queryDate',
        width: '6%',
        render(index, record) {
          return record.queryDate;
        },
      },
      {
        title: '当日首次催记时间',
        dataIndex: 'firstTimeRecordTime',
        width: '6%',
        render(index, record) {
          if (record.firstTimeRecordTime == null) {
            return 'no data';
          }
          return record.firstTimeRecordTimeString;
        },
      },
      {
        title: '当日入催量',
        dataIndex: 'oneDayCollectCount',
        width: '6%',
        render(index, record) {
          return record.oneDayCollectCount;
        },
      },
      {
        title: '8-10点催记量',
        dataIndex: 'eightToTenRecordTime',
        width: '6%',
        render(index, record) {
          return CL.cf(record.eightToTenRecordTime, 0);
        },
      },
      {
        title: '10-12点催记量',
        dataIndex: 'tenToTwelveRecordTime',
        width: '6%',
        render(index, record) {
          return CL.cf(record.tenToTwelveRecordTime, 0);
        },
      },
      {
        title: '12-14点催记量',
        dataIndex: 'twelveToFourTeenRecordTime',
        width: '6%',
        render(index, record) {
          return CL.cf(record.twelveToFourTeenRecordTime, 0);
        },
      }, {
        title: '14-16点催记量',
        dataIndex: 'fourTeenToSixTeenRecordTime',
        width: '6%',
        render(index, record) {
          return CL.cf(record.fourTeenToSixTeenRecordTime, 0);
        },
      }, {
        title: '16-18点催记量',
        dataIndex: 'sixTeenToEighteenRecordTime',
        width: '6%',
        render(index, record) {
          return CL.cf(record.sixTeenToEighteenRecordTime, 0);
        },
      }, {
        title: '18-20点催记量',
        dataIndex: 'eighteenToTwentyRecordTime',
        width: '6%',
        render(index, record) {
          return CL.cf(record.eighteenToTwentyRecordTime, 0);
        },
      }, {
        title: '20-22点催记量',
        dataIndex: 'twentyToTwentyTwoRecordTime',
        width: '6%',
        render(index, record) {
          return CL.cf(record.twentyToTwentyTwoRecordTime, 0);
        },
      }, {
        title: '本周累计催记量',
        dataIndex: 'oneWeekRecordTime',
        width: '6%',
        render(index, record) {
          return CL.cf(record.oneWeekRecordTime, 0);
        },
      },
      {
        title: '本月累计催记量',
        dataIndex: 'oneMonthRecordTime',
        width: '6.5%',
        render(index, record) {
          return CL.cf(record.oneMonthRecordTime, 0);
        },
      },
      {
        title: '未完成案件量',
        dataIndex: 'notFinishCollectCount',
        width: '6.5%',
        render(index, record) {
          return record.notFinishCollectCount;
        },
      },
      {
        title: '入催案件总量',
        dataIndex: 'allCollectCount',
        // width: '6.5%',
        render(index, record) {
          return record.allCollectCount;
        },
      },
    ];

    const operation = [
      {
        id: 'sRepaymentTime',
        type: 'dateTime',
        label: '日期',
      },
        {
            id: 'companyId',
            type: 'select',
            label: 'Company',
            placeholder: 'Please select',
            options: this.state.companyList || []
        }
    ];

    const settings = {
      data: data.map((doc, index) => {
        doc.id = index;
        return doc;
      }),
      operation: operation,
      columns: columns,
      getFields: that.getFormFields,
      // pagination: that.state.pagination || {},
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
      '催收员',
      '催收时间',
      '当日首次催记时间',
      '当日入催量',
      '8-10点催记量',
      '10-12点催记量',
      '12-14点催记量',
      '14-16点催记量',
      '16-18点催记量',
      '18-20点催记量',
      '20-22点催记量',
      '本周累计催记量',
      '本月累计催记量',
      '未完成案件量',
      '入催案件总量',
    ];

    return (
      <div className="credit-collection" key="credit-collection">
        <CLList settings={settings} />
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
          <table className="ex-table" id="ex-table-collector-report">
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
                       <td>{record.collectorName}</td>
                       <td>{record.queryDate}</td>
                       <td>{record.firstTimeRecordTimeString}</td>
                       <td>{record.oneDayCollectCount}</td>
                       <td>{CL.cf(record.eightToTenRecordTime, 0)}</td>
                       <td>{CL.cf(record.tenToTwelveRecordTime, 0)}</td>
                       <td>{CL.cf(record.twelveToFourTeenRecordTime, 0)}</td>
                       <td>{CL.cf(record.fourTeenToSixTeenRecordTime, 0)}</td>
                       <td>{CL.cf(record.sixTeenToEighteenRecordTime, 0)}</td>
                       <td>{CL.cf(record.eighteenToTwentyRecordTime, 0)}</td>
                       <td>{CL.cf(record.twentyToTwentyTwoRecordTime, 0)}</td>
                       <td>{CL.cf(record.oneWeekRecordTime, 0)}</td>
                       <td>{CL.cf(record.oneMonthRecordTime, 0)}</td>
                       <td>{CL.cf(record.notFinishCollectCount, 0)}</td>
                       <td>{CL.cf(record.allCollectCount, 0)}</td>
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

export default CollectorReport;
