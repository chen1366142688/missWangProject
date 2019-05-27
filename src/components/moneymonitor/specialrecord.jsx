import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import _ from 'lodash';
import { Button, DatePicker, Tooltip, message } from 'antd';
const { contentType, specialOperationLogList, specialOperationLogType } = Interface;

class Specialrecord extends CLComponent {
  state = {
    search: {},
    operationType: [],
    pagination: {
      total: 0,
      pageSize: 50,
      currentPage: 1,
    },
    tableLoading: false,
    data: [],
  }
  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'pageChage',
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

    that.setState({ search: search, pagination: pagination });
    this.loadData(this.state.search, this.state.pagination);
    this.getProductVersions();
  }

  loadData(search, page) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      },
      specialOperationLog: {
        startOperateDate: search.beginTime,
        endOperateDate: search.endTime,
        operatorName: search.operatorName,
        operateType: search.operateType,
      },
    };
    const settings = {
      contentType,
      method: specialOperationLogList.type,
      url: specialOperationLogList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      if (res.data) {
        if(res.data.extInfo !== null){
          message.error('Does not meet the search criteria, does not have this name');
        }
        const pagination = {
          total: res.data.totalCount,
          pageSize: res.data.pageSize,
          currentPage: res.data.currentPage,
        };
        sessionStorage.setItem('pagination', JSON.stringify(pagination));
        sessionStorage.setItem('search', JSON.stringify(search));

        that.setState({
          pagination: pagination,
          data: res.data.result,
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
      method: specialOperationLogType.type,
      url: specialOperationLogType.url,
    };
    function fn(res) {
      if (res.data) {
        that.setState({
          operationType: CL.setOptions(res.data),
        });
      }
    }
    CL.clReqwest({ settings, fn });
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


  pageChage(e, filters) { // list 切换页面
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };
    this.setState({ pagination: pagination,});
    this.loadData(this.state.search, pagination);
  }
  renderBody() {
    const that = this;
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      width: '200px',
    };
    const { data} = that.state;
    const columns = [
      {
        title: '日期',
        dataIndex: 'operateDate',
        width: '13%',
        render: function (text, record) {
          return moment(record.operateDate).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: '操作人',
        dataIndex: 'operatorName',
        width: '13%',
        render(index, record) {
          if (!record.operatorName) {
            return '—';
          }
          return record.operatorName;
        },
      },
      {
        title: '操作类型',
        dataIndex: 'operateTypeDesc',
        width: '13%',
        render(index, record) {
          if (!record.operateTypeDesc) {
            return '—';
          }
          return record.operateTypeDesc;
        },
      },
      {
        title: '用户',
        dataIndex: 'memberPhone',
        width: '13%',
        render(index, record) {
          if (!record.memberPhone) {
            return '—';
          }
          return record.memberPhone;
        },
      },
      {
        title: '申请单号',
        dataIndex: 'applicationId',
        width: '13%',
        render(index, record) {
          if (!record.applicationId) {
            return '—';
          }
          return record.applicationId;
        },
      },
      {
        title: '原因',
        dataIndex: 'reason',
        render: function (index, record) {
          if (!record.reason) {
            return '—';
          }
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.reason} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <p style={remarkStyle}>{record.reason}</p>
              </Tooltip>
            </div>
          );
        },
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: '17%',
        render: function (index, record) {
          if (!record.remark) {
            return '—';
          }
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.remark} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <p style={remarkStyle}>{record.remark}</p>
              </Tooltip>
            </div>
          );
        },
      },
    ];


    const operation = [
      {
        id: 'operateType',
        type: 'select',
        label: '操作类型',
        options:that.state.operationType,
        placeholder: 'Please select',
      },
      {
        id: 'sRepaymentTime',
        type: 'rangePicker',
        label: '日期',
        placeholder: 'ranger',
      },
      {
        id: 'operatorName',
        type: 'text',
        label: '操作人',
        placeholder: 'Please input',
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
    };

    return (
      <div className="Specialrecord" key="Specialrecord">
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
export default Specialrecord;
