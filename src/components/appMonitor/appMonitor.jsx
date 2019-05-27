import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, AsyncComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import tableexport from 'tableexport';
import CF from 'currency-formatter';
import _ from 'lodash';
import { Button, message, Table, Icon, DatePicker, Modal, Tabs } from 'antd';

const { contentType, getInvideFrendsData } = Interface;
let TB;
const TabPane = Tabs.TabPane;
const DataWaistcoat = AsyncComponent(() => import("./dataWaistcoat.jsx"));
const Lossofdata = AsyncComponent(() => import("./lossofdata.jsx"));
class AppMonitor extends CLComponent {
  state = {
    search: {},
    options: {
      statusOptions1: [],
    },
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    tableLoading: false,
    showTableExport: false,
    data: [],
    type: '1',
    btnLoading: false,
  }
  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'pageChage',
      'handleCancel',
      'download',
      'tabChange',
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
    this.loadData(this.state.search, this.state.pagination, this.state.sorter);
  }

  loadData(search, page, sorter) {
    const that = this;
    that.setState({ btnLoading: true });

    const params = {

      startTime: search.beginTime || '',
      endTime: search.endTime || '',

    };

    const settings = {
      contentType,
      method: 'post',
      url: getInvideFrendsData.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ btnLoading: false });
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
  tabChange(e) {
    const that = this;
    that.setState({
      type: e,
    });
    sessionStorage.setItem('operateDataType', e);
  }
  download(target) {
    const that = this;
    that.setState({ showTableExport: true });
    // const {tableexport} = that;
    setTimeout(() => {
      TB = tableexport(document.querySelector('#ex-table-invite-friends'), { formats: ['csv', 'txt', 'xlsx'] });
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
    const columns = [
      {
        title: '时间',
        dataIndex: 'showTime',
        width: '5.5%',
        render: function (index, record) {
          return record.showTime;
        },
      },
      {
        title: '当日数据',
        dataIndex: '',
        children: [
          {
            title: '邀请人数',
            dataIndex: 'invitationCount',
            key: 'invitationCount',
            width: '4.5%',
            render(index, record) {
              if (!record.invitationCount) {
                return '0';
              }
              return record.invitationCount;
            },
          },
          {
            title: '受邀注册人数',
            dataIndex: 'invitedCount',
            key: 'invitedCount',
            width: '6%',
            render(index, record) {
              if (!record.invitedCount) {
                return '0';
              }
              return record.invitedCount;
            },
          },
          {
            title: '受邀通过人数',
            dataIndex: 'lendingPeopleCount',
            key: 'lendingPeopleCount',
            width: '6%',
            render(index, record) {
              if (!record.lendingPeopleCount) {
                return '0';
              }
              return record.lendingPeopleCount;
            },
          },
          {
            title: '放款笔数',
            dataIndex: 'lendingCount',
            key: 'lendingCount',
            width: '4.5%',
            render(index, record) {
              if (!record.lendingCount) {
                return '0';
              }
              return record.lendingCount;
            },
          },
          {
            title: '放款金额',
            dataIndex: 'lendingAmount',
            key: 'lendingAmount',
            width: '5%',
            render(index, record) {
              if (!record.lendingAmount) {
                return '0';
              }
              return CL.cf(record.lendingAmount, 2);
            },
          },
        ],
      },
      {
        title: '受邀注册用户转化数据',
        dataIndex: '',
        children: [
          {
            title: '申请人数',
            dataIndex: 'registerApplicationCount',
            key: 'registerApplicationCount',
            width: '5%',
            render(index, record) {
              if (!record.registerApplicationCount) {
                return '0';
              }
              return record.registerApplicationCount;
            },
          },
          {
            title: '注册申请率',
            dataIndex: 'registerApplicationRate',
            key: 'registerApplicationRate',
            width: '5.5%',
            render(index, record) {
              if (!record.registerApplicationRate) {
                return '0';
              }
              return record.registerApplicationRate;
            },
          },
          {
            title: '通过人数',
            dataIndex: 'registerLendingCount',
            key: 'registerLendingCount',
            width: '5%',
            render(index, record) {
              if (!record.registerLendingCount) {
                return '0';
              }
              return record.registerLendingCount;
            },
          },
          {
            title: '申请通过率',
            dataIndex: 'registerApplicationSuccessfulRate',
            key: 'registerApplicationSuccessfulRate',
            width: '5.5%',
            render(index, record) {
              if (!record.registerApplicationSuccessfulRate) {
                return '0';
              }
              return record.registerApplicationSuccessfulRate;
            },
          },
          {
            title: '还款人数',
            dataIndex: 'registerRepaymentCount',
            key: 'registerRepaymentCount',
            width: '5%',
            render(index, record) {
              if (!record.registerRepaymentCount) {
                return '0';
              }
              return record.registerRepaymentCount;
            },
          },
          {
            title: '还款人数占比',
            dataIndex: 'registerRepaymentRate',
            key: 'registerRepaymentRate',
            width: '5.5%',
            render(index, record) {
              if (!record.registerRepaymentRate) {
                return '0';
              }
              return record.registerRepaymentRate;
            },
          },
        ],
      },
      {
        title: 'Top1邀请人',
        dataIndex: '',
        children: [
          {
            title: '邀请人',
            dataIndex: 'invitationTop1.phone',
            key: 'invitationTop1.phone',
            width: '5.8%',
            render(index, record) {
              if (!record.invitationTop1) {
                return '0';
              }
              return record.invitationTop1.phone;
            },
          },
          {
            title: '受邀注册人数',
            dataIndex: 'invitationTop1.invitedCount',
            key: 'invitationTop1.invitedCount',
            width: '6.2%',
            render(index, record) {
              if (!record.invitationTop1) {
                return '0';
              }
              return record.invitationTop1.invitedCount;
            },
          },
        ],
      },
      {
        title: 'Top2邀请人',
        dataIndex: '',
        children: [
          {
            title: '邀请人',
            dataIndex: 'invitationTop2.phone',
            key: 'invitationTop2.phone',
            width: '5.8%',
            render(index, record) {
              if (!record.invitationTop2) {
                return '0';
              }
              return record.invitationTop2.phone;
            },
          },
          {
            title: '受邀注册人数',
            dataIndex: 'invitationTop2.invitedCount',
            key: 'invitationTop2.invitedCount',
            width: '6.2%',
            render(index, record) {
              if (!record.invitationTop2) {
                return '0';
              }
              return record.invitationTop2.invitedCount;
            },
          },
        ],
      },
      {
        title: 'Top3邀请人',
        dataIndex: '',
        children: [
          {
            title: '邀请人',
            dataIndex: 'invitationTop3.phone',
            key: 'invitationTop3.phone',
            width: '5.8%',
            render(index, record) {
              if (!record.invitationTop3) {
                return '0';
              }
              return record.invitationTop3.phone;
            },
          },
          {
            title: '受邀注册人数',
            dataIndex: 'invitationTop3.invitedCount',
            key: 'invitationTop3.invitedCount',
            render(index, record) {
              if (!record.invitationTop3) {
                return '0';
              }
              return record.invitationTop3.invitedCount;
            },
          },
        ],
      },
    ];


    const operation = [
      {
        id: 'sRepaymentTime',
        type: 'rangePicker',
        label: 'Time',
        placeholder: 'ranger',
      },
    ];

    const settings = {
      data: data,
      // columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: false,
      // pageChange: that.pageChage,
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
      '时间',
      '当日数据-邀请人数',
      '当日数据-受邀注册人数',
      '当日数据-受邀通过人数',
      '当日数据-放款笔数',
      '当日数据-放款金额',
      '受邀注册用户转化数据-申请人数',
      '受邀注册用户转化数据-注册申请率',
      '受邀注册用户转化数据-通过人数',
      '受邀注册用户转化数据-申请通过率',
      '受邀注册用户转化数据-还款人数',
      '受邀注册用户转化数据-还款人数占比',
      'Top1邀请人-邀请人',
      'Top1邀请人-受邀注册人数',
      'Top2邀请人-邀请人',
      'Top2邀请人-受邀注册人数',
      'Top3邀请人-邀请人',
      'Top3邀请人-受邀注册人数',
    ];

    return (
      <div className="credit-collection" key="credit-collection">
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>
          <TabPane tab="App Data" key="1">
            <DataWaistcoat tableexport={tableexport} />
          </TabPane>
          <TabPane tab="邀请好友数据" key="2">
            <CLlist settings={settings} tableexport={tableexport} />
            <Table
              bordered
              size="small"
              className="user-info cl-table"
              scroll={{ y: 1500, x: 2000 }}
              rowKey={record => record.index}
              pagination={false}
              columns={columns}
              dataSource={settings.data}
              loading={that.state.btnLoading}
              tableexport={tableexport}
            />
          </TabPane>
          <TabPane tab="Loss of data" key="3">
            <Lossofdata  tableexport = {tableexport} />
          </TabPane>
        </Tabs>
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
          <table className="ex-table" id="ex-table-invite-friends">
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
                    <td>{record.showTime}</td>
                    <td>{record.invitationCount || '0'}</td>
                    <td>{record.invitedCount || '0'}</td>
                    <td>{record.lendingPeopleCount || '0'}</td>
                    <td>{record.lendingCount || '0'}</td>
                    <td>{record.lendingAmount || '0'}</td>
                    <td>{record.registerApplicationCount || '0'}</td>
                    <td>{record.registerApplicationRate || '0'}</td>
                    <td>{record.registerLendingCount || '0'}</td>
                    <td>{record.registerApplicationSuccessfulRate || '0'}</td>
                    <td>{record.registerRepaymentCount || '0'}</td>
                    <td>{record.registerRepaymentRate || '0'}</td>
                    <td>{record.invitationTop1 ? record.invitationTop1.phone : '0'}</td>
                    <td>{record.invitationTop1 ? record.invitationTop1.invitedCount : '0'}</td>
                    <td>{record.invitationTop2 ? record.invitationTop2.phone : '0'}</td>
                    <td>{record.invitationTop2 ? record.invitationTop2.invitedCount : '0'}</td>
                    <td>{record.invitationTop3 ? record.invitationTop3.phone : '0'}</td>
                    <td>{record.invitationTop3 ? record.invitationTop3.invitedCount : '0'}</td>
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
export default AppMonitor;
