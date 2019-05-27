import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL, SessionManagement } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';
import { Button, Input, DatePicker, Tooltip, Icon, } from 'antd';

const {
  contentType,
  adviseReusltList,
  marketingCallAllType,
  appConfigListAppName
} = Interface;
let sessionCode = SessionManagement.getStorageList().callRetrieve.adviseResult;
class Salesresult extends CLComponent {
  state = {
    tableLoading: false,
    search: {},
    appList: [],
    advisorList: [],
    operation: [],
    IsApplication: [],
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    data: [],
    callSaleAdviseAllType: [],
    appVersionList: [],
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
    let {pagination, search} = SessionManagement.getSession(sessionCode);
    pagination = pagination || {};
    search = search || {};
    this.loadData(search, pagination);
    this.setState({ search, pagination});
    this.marketingCallAllType();
    this.getProductVersion();
  }
  componentWillUnmount(){
      SessionManagement.destroySession(sessionCode);
  }
  loadData(search, page) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      appName: search.appName,
      telephoneNo: search.telephoneNo,
      startTime: search.startDate,
      endTime: search.endTime,
      dealStatus: search.dealType,
      operatorId: search.operatorId,
      isApplication: search.isApplication,
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      }
    };
    const settings = {
      contentType,
      method: adviseReusltList.type,
      url: adviseReusltList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      const data = res.data;
      if (data) {
        const pagination = {
          total: data.page.totalCount,
          pageSize: data.page.pageSize,
          currentPage: data.page.currentPage,
        };

        SessionManagement.setSessionBatch(sessionCode, {
            pagination, search
        });

        that.setState({
          data: data.page.result,
          pagination: pagination,
        });
      }
    }

    CL.clReqwest({
      settings,
      fn
    });
  }

    handleReset = () => {
        this.setState({
            pagination: {},
            search: {}
        })
    }

  pageChage(e) { // list 切换页面
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };

    this.setState({ pagination: pagination });
    this.loadData(this.state.search, pagination);
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'time') { // 判断为时间对象
          search.startDate = new Date(doc[0].format('YYYY-MM-DD 00:00:00')).getTime();
          search.endTime = new Date(doc[1].format('YYYY-MM-DD 23:59:59')).getTime();
        } else {
          search[index] = doc;
        }
      }
    });
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({ search, pagination });
    this.loadData(search, pagination,);
  }

  getProductVersion = () => {
    const that = this;
    const settings = {
      contentType,
      method: appConfigListAppName.type,
      url: appConfigListAppName.url,
    };

    function fn(res) {
      const data = res.data;
      if (data) {
        const roles = [];
        res.data.map((doc, index) => {
          roles.push({
            name: doc,
            value: doc,
          });
        });
        that.setState({
          appList: roles,
        });
      }
    }

    CL.clReqwest({
      settings,
      fn
    });
  }

  marketingCallAllType = () => {
    const that = this;
    const settings = {
      contentType,
      method: marketingCallAllType.type,
      url: marketingCallAllType.url,
    };

    function fn(res) {
      const data = res.data;
      if (data) {
        let advisorList = [];
        let typeNameList = [];
        let IsApplication = [];
        let operation = [];
        res.data.advisor.map((doc,index) => {
          advisorList.push({
            name: doc.string,
            value: doc.val
          });
        });
        res.data.IsApplication.map((doc,index) => {
          IsApplication.push({
            name: doc.typeName,
            value: doc.type
          });
        });
        let obj = res.data.type;
        for (const x in obj) {
          typeNameList.push({
              name: obj[x],
              value: x
            });
        };
        let arrList = res.data.operation;
        for (const x in arrList) {
          operation.push({
              name: arrList[x],
              value: x
            });
        }
        that.setState({
          advisorList,
          typeNameList,
          IsApplication,
          operation,
        });
      }
    }
    CL.clReqwest({ settings,fn});
  }


  renderBody() {
    const that = this;
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      width: '100px',
    };
    const columns = [
      {
          title: 'Call No',
          dataIndex: 'callNo',
          width: '8%',
          render(index, record) {
              return record.callNo || '-';
          }
      },
      {
        title: 'Name',
        dataIndex: 'name',
        width: '8%',
        render(index, record) {
          if(!record.name){
            return '-'
          }else{
            return record.name;
          }
        },
      },
      {
        title: 'Tel',
        width: '8%',
        dataIndex: 'tel',
        render(index, record) {
          if(!record.tel){
            return '-'
          }else{
            return record.tel;
          }
        },
      },
      {
        title: 'App name',
        width: '8%',
        dataIndex: 'appName',
        render(index, record) {
          if(!record.appName){
            return '-'
          }else{
            return record.appName;
          }
        },
      },
      {
        title: 'Applied',
        width: '8%',
        dataIndex: 'applied',
        render(index, record) {
          if(!record.applied){
            return '-'
          }else{
            return record.applied;
          }
        },
      },
      {
        title: 'Latest application#',
        dataIndex: 'latestApplication',
        width: '8%',
        render(index, record) {
          if(!record.latestApplication){
            return '-'
          }else{
            return record.latestApplication;
          }
        },
      },
      {
        title: 'Advisor',
        dataIndex: 'advisor',
        width: '8%',
        render(index, record) {
          if(!record.advisor){
            return '-'
          }else{
            return record.advisor;
          }
        },
      },
      {
        title: 'Type',
        dataIndex: 'type',
        width: '8%',
        render(index, record) {
          if(!record.type){
            return '-'
          }else{
            return record.type;
          }
        },
      },
      {
        title: 'Operate time',
        dataIndex: 'operateTime',
        width: '8%',
        render: function (text, record) {
          if(!record.operateTime){
            return '-'
          }else{
            return moment(record.operateTime).format('YYYY-MM-DD HH:mm');
          }
        },
      },
      {
        title: 'Operate result',
        dataIndex: 'operateResult',
        width: '8%',
        render(index, record) {
          if(!record.operateResult){
            return '-'
          }else{
            return record.operateResult;
          }
        },
      },
      {
        title: 'Quit Reason',
        dataIndex: 'quitReason',
        width: '8%',
        render(index, record) {
          if(!record.quitReason){
            return '-'
          }else{
            return record.quitReason;
          }
        },
      },
      {
        title: 'Note',
        dataIndex: 'note',
        render(index, record) {
          if(!record.note){
            return '-'
          }else{
            return (
              <div style={{ position: 'relative' }}>
                <Tooltip placement="top" title={record.note} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                  <p style={remarkStyle}>{record.note}</p>
                </Tooltip>
              </div>
            );
          }
        },
      },
    ];

    const data = this.state.data;
    const operation = [
      {
        id: 'appName',
        type: 'select',
        label: 'APP name',
        placeholder: 'Please select',
        options: that.state.appList,
      },
      {
        id: 'telephoneNo',
        type: 'text',
        label: 'Tel',
        placeholder: 'Please input',
      },
      {
        id: 'isApplication',
        type: 'select',
        label: 'Applied',
        placeholder: 'Please select',
        options: that.state.IsApplication,
      },
      {
        id: 'operatorId',
        type: 'select',
        label: 'Advisor',
        placeholder: 'Please select',
        options: that.state.advisorList,
      },
      {
        id: 'dealType',
        type: 'select',
        label: 'Operate result',
        placeholder: 'Please select',
        options: that.state.operation,
      },
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Operate time',
        placeholder: 'ranger',
      },
    ];

    const settings = {
      data: data || [],
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      sessionCode,
      handleReset: this.handleReset
    };

    return (
      <div className="Salesresult" key="Salesresult">
        <CLlist settings={settings}/>
      </div>
    );
  }

  render(data) {
    return (
      <QueueAnim className="Salesresult" type={this.state.aniType}>
        {this.state.showBlock ? [this.renderBody()] : null}
      </QueueAnim>
    );
  }
}
export default Salesresult;
