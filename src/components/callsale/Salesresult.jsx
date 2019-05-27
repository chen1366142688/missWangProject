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
  callSaleSaleReuslt,
  callSaleAdviseAllType,
  contentType,
  appConfigListAppName,
} = Interface;
let TB;
let sessionCode = SessionManagement.getStorageList().callRetrieve.adviseResult;
class Salesresult extends CLComponent {
  state = {
    tableLoading: false,
    search: {},
    options: {
      IsApplication: [],
      OperatorDeal: [],
    },
    AppName: [],
    sales: [],
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
      'callSaleAdviseAllType',
      'pageChage',
      'appList',
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    let {pagination, search} = SessionManagement.getSession(sessionCode);
    pagination = pagination || {};
    search = search || {};
    this.callSaleAdviseAllType();
    this.appList();
    this.loadData(search, pagination);
    this.setState({ search, pagination});
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
      dealType: search.dealType,
      operatorId: search.id,
      isApplication: search.isApplication,
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      }
    };
    const settings = {
      contentType,
      method: callSaleSaleReuslt.type,
      url: callSaleSaleReuslt.url,
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

  callSaleAdviseAllType() {
    const that = this;
    const settings = {
      contentType,
      method: callSaleAdviseAllType.type,
      url: callSaleAdviseAllType.url,
    };
    function fn(res) {
      const sales = [];
      if (res.data) {
        res.data.sales.map((doc,index) => {
          sales.push({
            value: doc.id,
            name: doc.fullName,
          })
        })
        that.setState({
          appNameList: res.data,
          options: {
            // AppName: CL.setOptions(res.data.AppName),
            IsApplication: CL.setOptions(res.data.IsApplication),
            OperatorDeal: CL.setOptions(res.data.OperatorDeal),
          },
          sales: sales,
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  appList() {
    const that = this;
    const settings = {
      contentType,
      method: appConfigListAppName.type,
      url: appConfigListAppName.url,
    };
    function fn(res) {
      let obj = [];
      if (res.data) {
        res.data.map((doc, index) => {
          obj.push({
            value: doc,
            name: doc,
          });
        })
        that.setState({
          AppName: obj,
        });
      }
    }

    CL.clReqwest({ settings, fn });
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
        dataIndex: 'userName',
        width: '8%',
        render(index, record) {
          if(!record.userName){
            return '-'
          }else{
            return record.userName;
          }
        },
      },
      {
        title: 'Tel',
        width: '8%',
        dataIndex: 'telephoneNo',
        render(index, record) {
          if(!record.telephoneNo){
            return '-'
          }else{
            return record.telephoneNo;
          }
        },
      },
      {
        title: 'App name',
        width: '8%',
        dataIndex: 'versionName',
        render(index, record) {
          if(!record.versionName){
            return '-'
          }else{
            return record.versionName;
          }
        },
      },
      {
        title: 'Applied',
        width: '8%',
        dataIndex: 'isApplicationString',
        render(index, record) {
          if(!record.isApplicationString){
            return '-'
          }else{
            return record.isApplicationString;
          }
        },
      },
      {
        title: 'Latest application#',
        dataIndex: 'applicationId',
        width: '8%',
        render(index, record) {
          if(!record.applicationId){
            return '-'
          }else{
            return record.applicationId;
          }
        },
      },
      {
        title: 'Advisor',
        dataIndex: 'operatorName',
        width: '8%',
        render(index, record) {
          if(!record.operatorName){
            return '-'
          }else{
            return record.operatorName;
          }
        },
      },
      {
        title: 'Type',
        dataIndex: 'typeName',
        width: '8%',
        render(index, record) {
          if(!record.typeName){
            return '-'
          }else{
            return record.typeName;
          }
        },
      },
      {
        title: 'Operate time',
        dataIndex: 'ceatedTime',
        width: '8%',
        render: function (text, record) {
          if(!record.ceatedTime){
            return '-'
          }else{
            return moment(record.ceatedTime).format('YYYY-MM-DD HH:mm');
          }
        },
      },
      {
        title: 'Operate result',
        dataIndex: 'dealName',
        width: '8%',
        render(index, record) {
          if(!record.dealName){
            return '-'
          }else{
            return record.dealName;
          }
        },
      },
      {
        title: 'Quit Reason',
        dataIndex: 'reasonName',
        width: '8%',
        render(index, record) {
          if(!record.reasonName){
            return '-'
          }else{
            return record.reasonName;
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
        options: that.state.AppName,
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
        options: that.state.options.IsApplication,
      },
      {
        id: 'id',
        type: 'select',
        label: 'Advisor',
        placeholder: 'Please select',
        options: that.state.sales,
      },
      {
        id: 'dealType',
        type: 'select',
        label: 'Operate result',
        placeholder: 'Please select',
        options: that.state.options.OperatorDeal,
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
