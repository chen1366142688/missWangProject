import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL, SessionManagement } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';

const {
  callDataList, contentType } = Interface;

let sessionCode = SessionManagement.getStorageList().callRetrieve.callData;
class CallData extends CLComponent {
  state = {
    tableLoading: false,
    search: {},
    data: [],
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getFormFields',
      'loadData',
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    const {search} = SessionManagement.getSession(sessionCode);
    // 搜索条件
    this.loadData(search || this.state.search);
  }

    componentWillUnmount(){
        SessionManagement.destroySession(sessionCode);
    }
  loadData(search) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      startTime: search.startDate,
      endTime: search.endTime,
    };
    const settings = {
      contentType,
      method: callDataList.type,
      url: callDataList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      const data = res.data;
      if (data) {
        SessionManagement.setSession(sessionCode, 'search', search);
        // 保存当前的搜索条件 以及分页
        that.setState({ data: data.list, });
      }
    }

    CL.clReqwest({
      settings,
      fn
    });
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'time') { // 判断为时间对象
          search.startDate = new Date(doc[0].format('YYYY-MM-DD 00:00:00')).getTime();
          search.endTime = new Date(doc[1].format('YYYY-MM-DD 23:59:59')).getTime();
          search.a = doc[0].format('YYYY.MM.DD');
          search.b = doc[1].format('YYYY.MM.DD');
        } else {
          search[index] = doc;
        }
      }
    });
    this.setState({ search});
    this.loadData(search);
  }

  handleReset = () => {
    this.setState({ search: {} });
  }

  renderBody() {
    const that = this;
    const columns = [
      {
        title: 'Advisor',
        dataIndex: 'operatorName',
        width: '7.5%',
        render(index, record) {
          if (record.operatorName == null) {
            return '-';
          } else {
            return record.operatorName;
          }
        },
      },
      {
        title: 'Unprocessed ',
        dataIndex: 'unprocessedCount',
        width: '7%',
        render(index, record) {
          return record.unprocessedCount;
        },
      },
      {
        title: 'Deal',
        width: '6%',
        dataIndex: 'dealCount',
        render(index, record) {
          if (record.dealCount == null) {
            return '-';
          } else {
            return record.dealCount;
          }
        },
      },
      {
        title: 'Deal-Applied',
        width: '7.5%',
        dataIndex: 'dealAppliedCount',
        render(index, record) {
          if (record.dealAppliedCount == null) {
            return '-';
          } else {
            return record.dealAppliedCount;
          }
        },
      },
      {
        title: 'Deal- Rate',
        width: '7.5%',
        dataIndex: 'dealRate',
        render(index, record) {
          if (record.dealRate == null) {
            return '-';
          } else {
            return record.dealRate;
          }
        },
      },
      {
        title: 'Suspend',
        dataIndex: 'suspendCount',
        width: '6%',
        render(index, record) {
          if (record.suspendCount == null) {
            return '-';
          } else {
            return record.suspendCount;
          }
        },
      },
      {
        title: 'Suspend-Applied',
        dataIndex: 'suspendAppliedCount',
        width: '7.5%',
        render(index, record) {
          if(record.suspendAppliedCount == null){
            return '-'
          }else{
            return record.suspendAppliedCount;
          }
        },
      },
      {
        title: 'Suspend-Rate',
        dataIndex: 'suspendRate',
        width: '7.5%',
        render: function (text, record) {
          if(record.suspendRate == null){
            return '-'
          }else{
            return record.suspendRate;
          }
        },
      },
      {
        title: 'Unreachable',
        dataIndex: 'unreachableCount',
        width: '7%',
        render: function (text, record) {
          if (record.unreachableCount == null) {
            return '-';
          } else {
            return record.unreachableCount;
          }
        },
      },
      {
        title: 'Unreachable-Applied',
        dataIndex: 'unreachableAppliedCount',
        width: '7.5%',
        render: function (text, record) {
          if (record.unreachableAppliedCount == null) {
            return '-';
          } else {
            return record.unreachableAppliedCount;
          }
        },
      },
      {
        title: 'Unreachable-Rate',
        dataIndex: 'unreachableRate',
        width: '8%',
        render: function (text, record) {
          if(record.unreachableRate == null){
            return '-'
          }else{
            return record.unreachableRate;
          }
        },
      },
      {
        title: 'Total Result',
        dataIndex: 'productionCount',
        width: '7%',
        render(index, record) {
          if(record.productionCount == null){
            return '-'
          }else{
            return record.productionCount;
          }
        },
      },
      {
        title: 'Total Result—Applied',
        dataIndex: 'productionAppliedCount',
        width: '7%',
        render(index, record) {
          if(record.productionAppliedCount == null){
            return '-'
          }else{
            return record.productionAppliedCount;
          }
        },
      },
      {
        title: 'Total Result—Rate',
        dataIndex: 'productionRate',
        render(index, record) {
          if(record.productionRate == null){
            return '-'
          }else{
            return record.productionRate;
          }
        },
      },
    ];

    const data = this.state.data;
    const operation = [
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Operate time',
        placeholder: 'ranger',
      },
    ];

    const settings = {
      data: data || {},
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: false,
      pageChange: false,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      defaultdate:[{
        name: `日期 : ` + (!that.state.search.startDate ? moment(new Date()).format('YYYY.MM.DD') : that.state.search.a)  + ` — ` +(!that.state.search.endTime ? moment(new Date()).format('YYYY.MM.DD'): that.state.search.b),
      }],
      sessionCode,
      handleReset: this.handleReset
    };

    return (
      <div className="CallData" key="CallData">
        <CLlist settings={settings}/>
      </div>
    );
  }

  render(data) {
    return (
      <QueueAnim className="CallData">
        {this.renderBody()}
      </QueueAnim>
    );
  }
}
export default CallData;
