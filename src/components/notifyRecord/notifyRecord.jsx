import React from 'react';
import QueueAnim from 'rc-queue-anim';

import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import { Tooltip } from 'antd';
import _ from 'lodash';

let name = sessionStorage.getItem("loginName");
const { contentType, notificationPageList, ruleListGetT } = Interface;

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
      {name: '邮件', value: 'E'},
    ],
    ststeObj: [],
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
    this.stateobj();
    this.setState({search: search, pagination: pagination});
  }

  loadData = (search,page) => {
    const that = this;
    that.setState({
      tableLoading: true,
    });
    let currentPage = page ? page.currentPage : '1';
    let pageSize = page ? page.pageSize : '20';
    let receiver = search ? search.receiver : '';
    let ruleId = search? search.ruleId : '';
    let type = search ? search.type : '';
    const settings = {
      contentType,
      method: 'get',
      url: notificationPageList.url +'currentPage='+currentPage+'&pageSize='+ pageSize+(receiver?'&receiver='+receiver :'')+(ruleId?'&ruleId='+ruleId :'')+(type?'&type='+type:''),
      headers: {
        "CMS-ACCESS-TOKEN":name
      }
    };
    function fn(res) {
      if (res) {
        let pagination = {
          total: res.page.count,
          pageSize: res.page.size,
          currentPage: res.page.currentPage,
        }
        that.setState({data: res.data, pagination, tableLoading: false,});
      }
    }
    CL.clReqwest({settings, fn});
  };

  stateobj = () => {
    let that = this;
    const settings = {
      contentType,
      method: 'get',
      url: ruleListGetT.url,
      headers: {
        "CMS-ACCESS-TOKEN":name
      }
    };
    function fn(res) {
      if (res) {
        let ststeObj = [];
        _.map(res.data,(doc)=>{
          ststeObj.push({
            value: doc.id,
            name: doc.name,
          });
        })
        that.setState({ststeObj});
      }
    }
    CL.clReqwest({settings, fn});
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
          search[index] = doc;
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
      maxWidth: '350px',
    };
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        width: "10%",
        render(index,record){
            return record.id
        }
      },
      {
        title: '接受者',
        dataIndex: 'receiver',
        width: "15%",
      },
      {
        title: '消息类型',
        width: "10%",
        dataIndex: 'type',
        render(index,record){
          return record.type == 'E' ? '邮件' : record.type == 'M'? '短信' : '-';
        }
      },
      {
        title: '规则',
        dataIndex: 'ruleName',
        width: "12%",
      },
      {
        title: '消息内容',
        dataIndex: 'message',
        render(index,record){
          return <div style={{ position: 'relative' }}>
                <Tooltip placement="top" 
                         title={record.message} 
                         defaultVisible={false} 
                         overlayStyle={{ wordWrap: 'break-word' }}
                >
                  <p style={remarkStyle}>{record.message}</p>
                </Tooltip>
              </div>
        }
      },
      {
        title: '发送时间',
        dataIndex: 'createTime',
        width: "16%",
      },
    ];

    const data = this.state.data;
    const operation = [
      {
        id: 'type',
        type: 'select',
        label: '消息类型',
        placeholder: 'Please select',
        options: that.state.marketingList,
      },
      {
        id: 'ruleId',
        type: 'select',
        label: '规则',
        placeholder: 'Please select',
        options: that.state.ststeObj,
      },
      {
        id: 'receiver',
        type: 'text',
        label: '接受者',
        placeholder: 'Please Input',
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