import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';
import { Button, Tooltip } from 'antd';
const { toolPushHistory, contentType } = Interface;
let req;

class Operatingtoolhistory extends CLComponent {
  state = {
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    tableLoading: false,
    search1: {},
    options: {
      examineStatusList: [],
      sexType: [],
    },
    data: [],
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getFormFields',
      'loadData',
      'pageChage',
      'History',
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    // 搜索条件
    const sessionSearch = sessionStorage.getItem('search1');
    let search1= this.state.search1;
    if (sessionSearch) {
      search1 = JSON.parse(sessionSearch);
    }

    // 分页
    const sessionPagination = sessionStorage.getItem('pagination');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }

    this.loadData(search1,pagination);
    this.setState({ search1: search1, pagination: pagination});
  }

  loadData(search1, pushMessageHistoryPage){
    const that = this;
    that.setState({ tableLoading: true });
    const params = {
      startTime: search1.startDate || '',
      endTime: search1.endTime || '',
      pushMessageHistoryPage: {
        currentPage: pushMessageHistoryPage.currentPage || 1,
        pageSize: pushMessageHistoryPage.pageSize || 10,
    }

    };
      const settings = {
        contentType,
        method: toolPushHistory.type,
        url: toolPushHistory.url,
        data: JSON.stringify(params),
      };
      function fn(res) {
        that.setState({ tableLoading: false });
        const data = res.data;
        if (res.data) {
          const pagination = {
            total: data.pushMessageHistoryPage.totalCount,
            pageSize: data.pushMessageHistoryPage.pageSize,
            currentPage: data.pushMessageHistoryPage.currentPage,
          };
          sessionStorage.setItem('pagination', JSON.stringify(pagination));
          that.setState({
            pagination: pagination,
            data: res.data.pushMessageHistoryPage.result,
          });
        }
      }
      CL.clReqwest({ settings, fn });
  }

  getFormFields(fields) {
    const search1 = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'time') { // 判断为时间对象
          search1.startDate = new Date(doc[0].format('YYYY-MM-DD'));
          search1.endTime = new Date(doc[1].format('YYYY-MM-DD'));
        } else {
          search1[index] = doc;
        }
      }
    });
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({ search1: search1, pagination: pagination });
    this.loadData(search1, pagination);
  }

  pageChage(e) { // list 切换页面
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };

    this.setState({ pagination: pagination });
    this.loadData(this.state.search1, pagination);
  }
  History(data) { // 点击按钮跳转
    const arr = location.hash.split('/');
    arr.pop();
    arr.push('operatingtool');
    const str = arr.join('/');
    const url = `${location.protocol}//${location.host}${location.pathname}${str}`;
    window.open(url);
  }
  renderBody() {
    const that = this;
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      width: '300px',
    };
    const columns = [
      {
        title: '发送时间',
        dataIndex: 'createTime',
        width: '13%',
        render: function (text, record) {
          return moment(record.createTime).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: '发送者',
        width: '10%',
        dataIndex: 'operatorName',
      },
      {
        title: 'APP名称',
        width: '10%',
        dataIndex: 'versionName',
        render:function(text,record){
          if(!record.versionName){
            return '—';
          }else{
            return record.versionName;
          }
        }
      },
      {
        title: '目标人数',
        width: '10%',
        dataIndex: 'targetNumber',
      },
      {
        title: '读取数',
        dataIndex: 'readNumber',
        width: '10%',
      },
      {
        title: '用户当前状态',
        dataIndex: 'userStatusName',
        width: '13%',
      },
      {
        title: 'Title',
        dataIndex: 'subject',
        width: '13%',
      },
      {
        title: '消息内容',
        dataIndex: 'message',
        render: function (index, record) {
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.message} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <p style={remarkStyle}>{record.message}</p>
              </Tooltip>
            </div>
          );
        },
      },
    ];

    const data = this.state.data;
    const operation = [
      {
        id: 'time',
        type: 'rangePicker',
        label: '发送时间',
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
      search: that.state.search1,
      btn: [
        {
          title: 'Back',
          type: 'primary',
          fn: that.History,
        },
      ],
    };
    return (
      <div className="Operatingtoolhistory" key="Operatingtoolhistory">
        <CLlist settings={settings} />
      </div>
    );
  }

  render(data) {
    return (
      <QueueAnim className="animate-content" type={this.state.aniType}>
        {this.state.showBlock ? [this.renderBody()] : null}
      </QueueAnim>
    );
  }
}
export default Operatingtoolhistory;
