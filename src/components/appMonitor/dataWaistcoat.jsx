import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import _ from 'lodash';
import { Button, message, Table, Icon, DatePicker, Modal,} from 'antd';
import tableexport from 'tableexport';
const { contentType, getVestBagData, appMonitorProductVersionPacket } = Interface;
let TB;

class DataWaistcoat extends CLComponent {
  state = {
    search: {},
      appVersion: [],
    pagination: {
      total: 0,
      pageSize: 50,
      currentPage: 1,
    },
    tableLoading: false,
    showTableExport: false,
    data: [],
    appVersionList: [],
  }
  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'pageChage',
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

    const type = sessionStorage.getItem('operateDataType') || '1';
    this.setState({ type: type });
    this.loadData(this.state.search, this.state.pagination, this.state.sorter);
    this.getProductVersions();
  }

  loadData(search, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      startTime: search.beginTime || '',
      endTime: search.endTime || '',
      version: search.version || '',
    };
    let arr = that.state.appVersionList;
    arr.forEach(doc => {
      if (doc.packetName === params.version) {
        params = _.extend(params, doc);
      }
    });
    const settings = {
      contentType,
      method: 'post',
      url: getVestBagData.url,
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
  getProductVersions(){
    const that = this;
    const settings = {
      contentType,
      method: appMonitorProductVersionPacket.type,
      url: appMonitorProductVersionPacket.url,
    };
    function fn(res) {
      let obj = [];
      let obj1 = [];
      if (res.data) {
        res.data.map((doc, index) => {
          obj.push({
            value: doc.packetName,
            name: doc.versionName,
          });
          obj1.push({
            version: (doc.version).toString(),
            packetName: doc.packetName,
          });
        })
        that.setState({
          appVersion: obj,
          appVersionList: obj1,
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }
  download(target) {
    const that = this;
    that.setState({ showTableExport: true });
    setTimeout(() => {
      TB = tableexport(document.querySelector('#ex-table-data-waist-coat'), { formats: ['csv', 'txt', 'xlsx'] });
    }, 100);
  }

  handleCancel () {
    const that = this;
    that.setState({showTableExport: false});
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
    const { data , appVersion} = that.state;
    const columns = [
      {
        title: '时间',
        dataIndex: 'strDate',
        width: '7.6%',
        render: function (index, record) {
          return record.strDate;
        },
      },
      {
        title: 'APP名称',
        dataIndex: 'appName',
        width: '7.6%',
        render(index, record) {
          return record.appName;
        },
      },
      {
        title: '当日数据',
        dataIndex: 'invitationTop1',
        children: [
          {
            title: '注册人数',
            dataIndex: 'registerCount',
            key: 'registerCount',
            width: '7.6%',
            render(index, record){
              if(!record.registerCount){
                return '0'
              }else{
                return record.registerCount
              }
            }
          },
          {
            title: '申请笔数',
            dataIndex: 'applicationCount',
            key: 'applicationCount',
            width: '7.6%',
            render(index, record){
              if(!record.applicationCount){
                return '0'
              }else{
                return record.applicationCount
              }
            }
          },
          {
            title: '放款笔数',
            dataIndex: 'lendingCount',
            key: 'lendingCount',
            width: '7.6%',
            render(index, record){
              if(!record.lendingCount){
                return '0'
              }else{
                return record.lendingCount
              }
            }
          },
          {
            title: '放款金额',
            dataIndex: 'lendingAmount',
            key: 'lendingAmount',
            width: '7.6%',
            render(index, record){
              if(!record.lendingAmount){
                return '0'
              }else{
                return CL.cf(record.lendingAmount, 2);
              }
            }
          },
          {
            title: '还款笔数',
            dataIndex: 'repaymentCount',
            key: 'repaymentCount',
            width: '7.6%',
            render(index, record){
              if(!record.repaymentCount){
                return '0'
              }else{
                return record.repaymentCount
              }
            }
          },
        ],
      },
      {
        title: '注册用户转化数据',
        dataIndex: 'invitationTop3',
        children: [
          {
            title: '申请人数',
            dataIndex: 'registerApplicationCount',
            key: 'registerApplicationCount',
            width: '7.6%',
            render(index, record){
              if(!record.registerApplicationCount){
                return '0'
              }else{
                return record.registerApplicationCount
              }
            }
          },
          {
            title: '注册申请率',
            dataIndex: 'registerApplicationRate',
            key: 'registerApplicationRate',
            width: '7.6%',
            render(index, record){
              if(!record.registerApplicationRate){
                return '0.00%'
              }else{
                return record.registerApplicationRate
              }
            }
          },
          {
            title: '通过人数',
            dataIndex: 'registerLendingCount',
            key: 'registerLendingCount',
            width: '7.6%',
            render(index, record){
              if(!record.registerLendingCount){
                return '0'
              }else{
                return record.registerLendingCount
              }
            }
          },
          {
            title: '申请通过率',
            dataIndex: 'registerApplicationSuccessfulRate',
            key: 'registerApplicationSuccessfulRate',
            width: '7.6%',
            render(index, record){
              if(!record.registerApplicationSuccessfulRate){
                return '0'
              }else{
                return record.registerApplicationSuccessfulRate
              }
            }
          },
          {
            title: '还款人数',
            dataIndex: 'registerRepaymentCount',
            key: 'registerRepaymentCount',
            width: '7.6%',
            render(index, record){
              if(!record.registerRepaymentCount){
                return '0'
              }else{
                return record.registerRepaymentCount
              }
            }
          },
          {
            title: '还款人数占比',
            dataIndex: 'registerRepaymentRate',
            key: 'registerRepaymentRate',
            render(index, record){
              if(!record.registerRepaymentRate){
                return '0'
              }else{
                return record.registerRepaymentRate
              }
            }
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
      {
        id: 'version',
        type: 'select',
        label: 'APP名称',
        options:that.state.appVersion,
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
      '时间',
      'APP名称',

      '当日数据-注册人数',
      '当日数据-申请笔数',
      '当日数据-放款笔数',
      '当日数据-放款金额',
      '当日数据-还款笔数',

      '注册用户转化数据-申请人数',
      '注册用户转化数据-注册申请率',
      '注册用户转化数据-通过人数',
      '注册用户转化数据-申请通过率',
      '注册用户转化数据-还款人数',
      '注册用户转化数据-还款人数占比',


    ];

    return (
      <div className="DataWaistcoat" key="DataWaistcoat">
        <CLlist settings={settings} tableexport={tableexport} />

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
          <table className="ex-table" id="ex-table-data-waist-coat">
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
                    <td>{record.appName}</td>
                    <td>{record.registerCount}</td>
                    <td>{record.applicationCount}</td>
                    <td>{record.lendingCount}</td>
                    <td>{CL.cf(record.lendingAmount, 2)}</td>
                    <td>{record.repaymentCount}</td>
                    <td>{record.registerApplicationCount}</td>
                    <td>{CL.cf(record.registerApplicationRate, 2) + '%'}</td>
                    <td>{record.registerLendingCount}</td>
                    <td>{CL.cf(record.registerApplicationSuccessfulRate, 2) + '%'}</td>
                    <td>{record.registerRepaymentCount}</td>
                    <td>{CL.cf(record.registerRepaymentRate, 2) + '%'}</td>
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
export default DataWaistcoat;
