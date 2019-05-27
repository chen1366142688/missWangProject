import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import tableexport from 'tableexport';
import CF from 'currency-formatter';
import _ from 'lodash';
import { Button, message, Table, Icon, Spin, Tabs, DatePicker, Row, Col, Modal, Select } from 'antd';

const Option = Select.Option;

const { contentType, callbackLogStatistics, networkList, trafficmonitortype } = Interface;
let TB;

class AdjustSearchTool extends CLComponent {
  state = {
    search: {},
    options: {
      statusOptions1: [],
    },
    appName: [
      { name: 'Cashlending', value: 'com.unipeso.phone' },
      { name: 'Loanit', value: 'com.unipeso.variant' },
      { name: 'SwakCash', value: 'com.unipeso.swakcash' },
    ],
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    tableLoading: false,
    showTableExport: false,
    data: [],
    timeArrayObj: [],
    statusOptions2: [],
  };

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'loadTypeContentData',
      'pageChage',
      'handleCancel',
      'download',
      'getFormFields',
      'trafficmonitortype',
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
    this.setState({type: type});
    this.loadData(that.state.search, that.state.pagination,);
    this.loadTypeContentData();
    this.trafficmonitortype();
  }

    loadData(search, page) {
        const that = this;
        that.setState({tableLoading: true});
        let params = {};
        if (search.networkName || search.trackerName) {
            if (search.networkName == undefined) {
                params = {
                    startTime: '' || search.beginTime,
                    endTime: '' || search.endTime,
                    trackerName: search.trackerName || '',
                    dataType: search.dataType || '',
                    appName: search.appName || '',
                };
            }
            if (search.trackerName == undefined) {
                params = {
                    startTime: '' || search.beginTime,
                    endTime: '' || search.endTime,
                    networkName: search.networkName || '',
                    dataType: search.dataType || '',
                    appName: search.appName || '',
                };
            }
            if (search.networkName !== undefined && search.trackerName !== undefined) {
                params = {
                    startTime: '' || search.beginTime,
                    endTime: '' || search.endTime,
                    networkName: search.networkName || '',
                    trackerName: search.trackerName || '',
                    dataType: search.dataType || '',
                    appName: search.appName || '',
                };
            }
        } else {
            params = {
                startTime: '' || search.beginTime,
                endTime: '' || search.endTime,
                dataType: search.dataType || '',
                appName: search.appName || '',
            };
        }
        const settings = {
            contentType,
            method: callbackLogStatistics.type,
            url: callbackLogStatistics.url,
            data: JSON.stringify(params),
        };

        function fn(res) {
            that.setState({tableLoading: false});
            if (res.data) {
                const pagination = {
                    total: 1,
                    pageSize: 90,
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
        CL.clReqwest({settings, fn});
    }

  loadTypeContentData() {
    const that = this;
    const getTypeSettings = {
      contentType,
      method: networkList.type,
      url: networkList.url,
    };

    function getTypeBack(res) {
      const Obj = [];
      _.each(res.data, (doc, index) => {
        Obj.push({
          name: doc,
          value: doc,
        });
      });
      that.setState({
        options: {
          statusOptions1: Obj,
        },
      });
    }

    CL.clReqwest({
      settings: getTypeSettings,
      fn: getTypeBack
    });
  }

  trafficmonitortype() {
    const that = this;
    const settings = {
      contentType,
      method: trafficmonitortype.type,
      url: trafficmonitortype.url,
    };

    function fn(res) {
      if (res.data) {
        that.setState({
          statusOptions2: CL.setOptions(res.data),
        });
      }
    }

    CL.clReqwest({settings, fn});
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'time') {
          search.beginTime = new Date(doc[0].format('YYYY-MM-DD 00:00:00')).getTime();
          search.endTime = new Date(doc[1].format('YYYY-MM-DD 23:59:59')).getTime();
        } else {
          search[index] = doc;
        }
      }
    });
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
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
      sorter: sorterClient
    });
    this.loadData(this.state.search, pagination, sorterClient);
  }

  download(target) {
    const that = this;
    that.setState({ showTableExport: true });
    setTimeout(() => {
      TB = tableexport(document.querySelector('#ex-table'), { formats: ['csv', 'txt', 'xlsx'] });
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
    const columns = [
      {
        title: 'Time',
        dataIndex: 'queryDate',
        width: '8.2%',
      },
      {
        title: 'App Platform',
        dataIndex: 'appName',
        width: '8.2%',
        render: function (index, record) {
          if (!record.appName) {
            return 'ALL';
          } else {
            return record.appName;
          }
        },
      },
      {
        title: 'Network name',
        dataIndex: 'networkName',
        width: '8.2%',
        render: function (index, record) {
          if (!record.networkName) {
            return 'ALL';
          } else {
            return record.networkName;
          }
        },
      },
      {
        title: 'Tracker name',
        dataIndex: 'trackerName',
        width: '8.2%',
        render: function (index, record) {
          if (!record.trackerName) {
            return 'ALL';
          } else {
            return record.trackerName;
          }
        },
      },
      {
        title: '注册人数',
        dataIndex: 'registerNum',
        width: '8.2%',
        render(index, record) {
          return record.registerNum;
        },
      }, {
        title: '开始申请人数',
        dataIndex: 'startApplyNum',
        width: '8.2%',
        render(index, record) {
          return record.startApplyNum;
        },
      },
      {
        title: '完善资料提交人数',
        dataIndex: 'finishInfoNum',
        width: '8.2%',
        render(index, record) {
          return record.finishInfoNum;
        },
      },
      {
        title: '提交申请成功人数',
        dataIndex: 'commitApplyNum',
        width: '8.2%',
        render(index, record) {
          return record.commitApplyNum;
        },
      },
      {
        title: '放款人数',
        dataIndex: 'paymentedMemberNum',
        width: '8.2%',
        render(index, record) {
          return record.paymentedMemberNum;
        },
      },
      {
        title: '放款笔数',
        dataIndex: 'paymentNum',
        width: '8.2%',
        render(index, record) {
          return record.paymentNum;
        },
      },
      {
        title: '放款金额',
        dataIndex: 'paymentAmount',
        width: '8.2%',
        render(index, record) {
          return record.paymentAmount;
        },
      },
      {
        title: '还款人数',
        dataIndex: 'repaymentMemberNum',
        render(index, record) {
          return record.repaymentMemberNum;
        },
      },
    ];


    const operation = [
      {
        id: 'networkName',
        type: 'select',
        label: 'Network name',
        options: that.state.options.statusOptions1,
        placeholder: 'Please select',
      },
      {
        id: 'trackerName',
        type: 'text',
        label: 'Tracker name',
        placeholder: 'Input Tracker name',
      },
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Time',
        placeholder: 'ranger',
      },
      {
        id: 'dataType',
        type: 'select',
        label: '数据类型',
        options: that.state.statusOptions2,
        placeholder: 'Please select',
      },
      {
        id: 'appName',
        type: 'select',
        label: 'App Platform',
        options: that.state.appName,
        placeholder: 'Please select',
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
      'Time',
      'Network name',
      'Tracker name',
      '注册人数',
      '开始申请人数',
      '完善资料提交人数',
      '提交申请成功人数',
      '放款人数',
      '放款笔数',
      '放款金额',
      '还款人数',
    ];

    return (
      <div className="credit-collection" key="credit-collection">
        <CLlist settings={settings} tableexport={tableexport}/>
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
          <table id="ex-table">
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
                    <td>{record.queryDate}</td>
                    <td>{record.networkName || 'ALL'}</td>
                    <td>{record.trackerName || 'ALL'}</td>
                    <td>{record.registerNum}</td>
                    <td>{record.startApplyNum}</td>
                    <td>{record.finishInfoNum}</td>
                    <td>{record.commitApplyNum}</td>
                    <td>{record.paymentedMemberNum}</td>
                    <td>{record.paymentNum}</td>
                    <td>{CL.cf(record.paymentAmount, 2)}</td>
                    <td>{record.repaymentMemberNum}</td>
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

export default AdjustSearchTool;
