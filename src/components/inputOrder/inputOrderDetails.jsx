import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import _ from 'lodash';
import Viewer from 'viewerjs';

import { Interface } from '../../../src/lib/config/index';
import {CLComponent, CLForm} from '../../../src/lib/component/index';
import CLBlockList from '../../../src/lib/component/CLBlockList.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Button, Row, Col, Card, Table, Input, message, Spin, Modal} from 'antd';
import CF from 'currency-formatter';

const { TextArea } = Input;
const { contentType, getSubmitRepaymentAmountDetail, saveRepaymentAmount, repaymentLogs} = Interface;


class InputOrderDetails extends CLComponent {
  state = {
    data: null,
    pagination: {
      total: 0,
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
      size: 'default',
      pageSizeOptions: ['10', '20', '30', '40', '50', '100', '150', '200'],
    },
    
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "loadData",
      "getFields",
      "showModal",
      "pageChange",
      "getLogs"
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    this.loadData(this.props.match.params)
    this.getLogs(this.props.match.params);
  }

  showModal(e) {
    const viewer = new Viewer(e.target, {});
  }

  pageChange (e) {
    const that = this;
    const pagination = that.state.pagination;
    pagination.currentPage = e.current;
    pagination.pageSize = e.pageSize;
    that.setState({pagination: pagination});
    that.getLogs(this.props.match.params, pagination);
  }


  loadData (params) {
    const that = this;
    const settings = {
      contentType,
      method: getSubmitRepaymentAmountDetail.type,
      url: getSubmitRepaymentAmountDetail.url + params.id,
    }

    function fn(res) {
      if (res.data) {
        that.setState({data: res.data});
      }
    }

    CL.clReqwest({settings, fn});
  }

  getLogs (params, page) {
    const that = this;
    page = page || {};
    const settings2 = {
      contentType,
      method: repaymentLogs.type,
      url: repaymentLogs.url,
      data: JSON.stringify({
        "repaymentInputLogs":{"applicationId": params.id},
        "page":{
          "currentPage": page.currentPage || that.state.pagination.currentPage, 
          "pageSize": page.pageSize || that.state.pagination.pageSize}
      })
    }

    function fn2(res) {
      if (res.data) {
        let pagination = that.state.pagination;
        pagination.total = res.data.page.totalCount;
        pagination.currentPage = res.data.page.currentPage;
        that.setState({
          logs: res.data.page.result,
          pagination
        });
      }
    }
    CL.clReqwest({settings: settings2, fn: fn2});
  }

  getFields (fields, thatForm) {
    let params = {};
    const that = this;
    _.map(fields, function (doc, index) {
      if (doc) {
        if (_.isObject(doc)) { //判断为时间对象
          params[index] = new Date(doc.format("YYYY-MM-DD HH:mm")).getTime();
        } else {
          params[index] = doc;
        }
      }
    });

    params.applicationId = this.props.match.params.id;
    // params.repaymentRemarkId = that.state.data.remark.id;

    if (!params.repaymentAmount) {
      thatForm.setState({loading: false});
      message.error("repayment amount can not be null");
      return;
    }

    if (!params.repaymentTime) {
      thatForm.setState({loading: false});
      message.error("you must pick a time");
      return;
    }

    const settings = {
      contentType,
      method: saveRepaymentAmount.type,
      url: saveRepaymentAmount.url,
      data: JSON.stringify(params)
    }

    function fn (res) {
      thatForm.setState({loading: false});
      if (res.data) {
        message.success(res.result);
        location.hash = "/uplending/inputorder";
      }
    }
    CL.clReqwest({settings, fn});
  }

  renderBody() {
    const { selectedRowKeys, pagination } = this.state;
    let that = this;
    const gridStyle = {
      width: '20%',
      textAlign: 'center',
    };

    if (!this.state.data) {
      return (
        <div className="full-loading" key="full-loading">
          <Spin size="large" />
        </div>
      );
    }

    let {imagList, remark} = this.state.data;
    imagList = imagList || [];
    remark = remark || {};

    let list = [
      {
        title: "Bank Account Number",
        content: remark.userBankAccount,
        type: 'text',
    
      },
      {
        title: "User Remark",
        content: remark.remarks,
        type: 'text',
        
      }
    ];

    let imgs =  _.map(imagList, function (doc, index) {
        let obj = {
          title: 'Photo of evidence',
          content: 'Photo of evidence',
          type: 'img'
        };

        obj.url = doc.imagUrl;
        return obj;
    });

    if (imgs.length) {
      list = imgs.concat(list);
    }

    const Info = {
      title: "Input repayment order",
      data: list
    }

    const settings = {
      options: [
        {  id: 'repaymentAmount',
          type: 'number',
          label: 'Repayment amount',
          placeholder: 'Please type repayment amount'
        },
        {
          id: 'repaymentTime',
          type: 'dateTime',
          label: 'Repayment time',
          placeholder: 'Please type repayment time',
          format: 'YYYY-MM-DD'
        }
      ],
      getFields: that.getFields
    }

    const tableColumn = [
      {
        title: 'Photo of evidence',
        dataIndex: 'imagUrl',
        key: 'imagUrl',
        render: function (index, doc) {
          return (
            <div>
              {
                doc.imgs3Url.split("|").map( function (doc, index) {
                  if (doc) {
                    return (<img key={index} width="40" onClick={that.showModal} src={doc} alt="images" />)
                  }
                })
              }
            </div>
          )
        }
      },
      {
        title: 'Bank Account Number',
        dataIndex: 'userBankAccount',
        key: 'userBankAccount',
        width: "15%",
      },
      {
        title: 'User Remark',
        dataIndex: 'remarks',
        key: 'remarks',
        width: "10%",
      },
      {
        title: 'Input Amount',
        dataIndex: 'inputAmount',
        key: 'id',
        width: "10%",
        render(index, record) {
          return CF.format( record.inputAmount, {});
        }
      },
      {
        title: 'Input Operator',
        dataIndex: 'inputOperator',
        key: 'inputOperator',
        width: "10%",
      },
      {
        title: 'Input Time',
        dataIndex: 'inputTime',
        key: 'inputTime',
        width: "10%",
        render: function ( index, doc) {
          return moment(new Date(doc.inputTime)).format('YYYY-MM-DD HH:mm');
        }
      },
    ]

    function showTotal() {
      let totalPage = (pagination.total || 0) / pagination.pageSize;
      if (pagination.total % pagination.pageSize !== 0) {
        totalPage = parseInt(totalPage) + 1;
      } 
      return `${pagination.total || 1} data, ${totalPage} pages in total, current on page ${pagination.currentPage}`;
    }
    pagination.showTotal = showTotal;

    return (
      <div className="loan-audit-details" key="loan-audit-details">
        <Table  bordered  size="small" 
          title={() => (<h2>Repayment Logs</h2>)}
          className="repayment-logs-tb cl-table" 
          scroll={{ y: 800 }}
          rowKey={record =>  record.id} 
          pagination = {pagination}
          columns={tableColumn} 
          dataSource={that.state.logs}
          onChange={that.pageChange}
        />

        <CLBlockList  settings={Info}/>
        

        <CLForm settings = {settings}/>
      </div>
    )
  }

  render () {
    return (
      <QueueAnim className="animate-content" type={this.state.aniType}>
        {this.state.showBlock ? [ this.renderBody() ] : null}
      </QueueAnim>
    )
  }
}
export default InputOrderDetails;