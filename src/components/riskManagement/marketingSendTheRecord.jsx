import React from 'react';
import QueueAnim from 'rc-queue-anim';

import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import { Tooltip } from 'antd';
import _ from 'lodash';

let name = sessionStorage.getItem("loginName");
const { contentType, notificationPage } = Interface;

class MarketingSendTheRecord extends CLComponent {
  state = {
    pagination: {
      total: 0,
      pageSize: 20,
      currentPage: 1,
    },
    tableLoading: false,
    search: {},
    marketingList: [
      {name: '短信', value: 'M'},
      {name: '推送', value: 'P'},
      {name: '优惠卷', value: 'C'},
    ],
    stateObj: [
      {name: '已发送', value: 'Y'},
      {name: '未发送', value: 'N'},
    ],
    data: [],
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getFormFields',
      'loadData',
      'pageChage',
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
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

    this.loadData(search, pagination);
    this.setState({search: search, pagination: pagination});
  }

  loadData = (search,page) => {
    const that = this;
    that.setState({
      tableLoading: true,
    });
    let currentPage = page ? page.currentPage : '1';
    let pageSize = page ? page.pageSize : '20';
    let startDate = search ? search.startDate : '';
    let endDate = search? search.endDate : '';
    let type = search ? search.type : '';
    let memberId = search ? search.memberId : '';
    let code = search ? search.code : '';
    let state = search ? search.state : '';
    const settings = {
      contentType,
      method: 'get',
      // url: 'http://118.25.213.60:9088/notification/page'+'?currentPage='+currentPage+'&pageSize='+ pageSize+(endDate?'&endDate='+endDate :'')+(startDate?'&startDate='+startDate :'')+(memberId?'&memberId='+memberId:'')+(type?'&type='+type:'')+(code?'&code='+code:'')+(state?'&state='+state:''),
      url: notificationPage.url+'?currentPage='+currentPage+'&pageSize='+ pageSize+(endDate?'&endDate='+endDate :'')+(startDate?'&startDate='+startDate :'')+(memberId?'&memberId='+memberId:'')+(type?'&type='+type:'')+(code?'&code='+code:'')+(state?'&state='+state:''),
      headers: {
        "AMS-ACCESS-TOKEN":name
      }
    };
    function fn(res) {
      if (res) {
        let pagination = {
          total: res.page.count,
          pageSize: res.page.size,
          currentPage: res.page.currentPage,
        }
        that.setState({data: res.data || [], pagination, tableLoading: false,});
      }
    }
    CL.clReqwest({settings, fn});
  };

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (_.isArray(doc)) { // 判断为时间对象
          search.startDate = doc[0].format('YYYY-MM-DD');
          search.endDate = doc[1].format('YYYY-MM-DD');
        } else {
          search[index] = doc;
        }
      }
    });
    
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({search: search, pagination: pagination});
    this.loadData(search, pagination, this.state.sorter);
  }


  pageChage (e) {
    let pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total
    }
    this.setState({pagination: pagination,})
    this.loadData(this.state.search, pagination,)
  }

  renderBody() {
    const that = this;
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      maxWidth: '200px',
    };
    const columns = [
      {
        title: '发送时间',
        dataIndex: 'createTime',
        width: "14%",
      },
      {
        title: '任务类型',
        width: "8%",
        dataIndex: 'taskType',
        render(index,record){
          return record.taskType == 'C' ? '营销规则' : record.taskType == 'O'? '单次任务' : '-';
        }
      },
      {
        title: '策略类型',
        dataIndex: 'name',
        width: "8%",
      },
      {
        title: '策略代码',
        dataIndex: 'code',
        width: "8%",
      },
      {
        title: 'APP名称',
        dataIndex: 'app',
        width: "8%",
      },
      {
        title: 'member id',
        dataIndex: 'memberId',
        width: "7%",
      },
      {
        title: '发送状态',
        dataIndex: 'state',
        width: "7%",
        render(index,record){
          return record.state == 'N' ? '未发送' : '已发送';
        }
      },
      {
        title: '营销方式',
        dataIndex: 'type',
        width: "7%",
        render(index,record){
          return record.type == 'P' ? '推送' : record.type == 'M'? '短信' : record.type == 'C'?'优惠卷':'-';
        }
      },
      {
        title: '内容',
        dataIndex: 'content',
        width: "23%",
        render: function (index, record) {
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.content} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <p style={remarkStyle}>{record.content}</p>
              </Tooltip>
            </div>
          );
        },
      },
      {
        title: '发送人',
        dataIndex: 'sender',
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
      {
        id: 'type',
        type: 'select',
        label: '营销方式',
        placeholder: 'Please select',
        options: that.state.marketingList,
      },
      {
        id: 'memberId',
        type: 'text',
        label: 'member id',
        placeholder: 'Please Input',
      },
      {
        id: 'code',
        type: 'text',
        label: '策略代码',
        placeholder: 'Please Input',
      },
      {
        id: 'state',
        type: 'select',
        label: '发送状态',
        placeholder: 'Please select',
        options: that.state.stateObj,
      },
    ];

    const settings = {
      data: data.map( function (doc, index) {
        doc.id = doc.appId;
        return doc;
      }),
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
    };

    return (
      <div className="marketingSendTheRecord" key="marketingSendTheRecord">
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
export default MarketingSendTheRecord;
