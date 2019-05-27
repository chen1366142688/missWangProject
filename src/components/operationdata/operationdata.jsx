import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import {CLComponent, CLBlockList, AsyncComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import _ from 'lodash';

const Businessdata = AsyncComponent(() => import("./businessdata.jsx"));
const Loandata = AsyncComponent(() => import("./loandata.jsx"));
const NodeData = AsyncComponent(() => import("./nodeData.jsx"));
const UserCollectionData = AsyncComponent(() => import("./userCollectionData.jsx"));


import { Button, message, Table , Icon, Spin, Tabs, DatePicker, Row, Col } from 'antd';
const TabPane = Tabs.TabPane;
const { RangePicker } = DatePicker;

let  { contentType, analysisHistory, analysisToday, analysisAmount } = Interface;

class OperationData extends CLComponent {
  state = {
    type: "1",
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1
    },
    tableLoading: false,
    search: {
      // appId: "",
      // status: "",
      // beginTime: "",
      // endTime: "",
      // basicName: 1

    },
    options: {
      status: []
    },
    data: [],
    biModal:false,
    bDate: '',
    currnetId: ""
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "tabChange"
    ]);
  }

  componentDidMount() {
    let type = sessionStorage.getItem("operateDataType") || "1";
    this.setState({type: type})
  }


  tabChange (e) {
    const that = this;
    that.setState({
      tableLoading: true,
      type: e,
      applicationStage: {},
      columns: []
    });

    sessionStorage.setItem("operateDataType", e);
  }

  renderBody() {
    const that = this;

    return (
      <div className="input-order" key="operation-data">
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>
          {
            CL.isRole("Oper-loanData") ? (
              <TabPane tab="Loan Data" key="1">
                <Loandata />
              </TabPane>
            ) : ''
          }

          {
            CL.isRole("Oper-nodeData") ? (
              <TabPane tab="Node Data" key="2">
                <NodeData />
              </TabPane>
            ) : ''
          }

          {
            CL.isRole("Oper-UCDisbursementData") ? (
              <TabPane tab="User&Collection Disbursement Data" key="3">
                <UserCollectionData />
              </TabPane>
            ) : ''
          }
        </Tabs>
      </div>

    )
  }

  render (data) {
    return (
      <QueueAnim className="animate-content">
        {this.renderBody()}
      </QueueAnim>
    )
  }
}
export default OperationData;

// {
//   CL.isRole("Oper-UCDisbursementData") ? (
//     <TabPane tab="Business Data" key="4">
//       <Businessdata />
//     </TabPane>
//   ) : ''
// }

