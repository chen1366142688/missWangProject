import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import {CLComponent, CLBlockList, AsyncComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import _ from 'lodash';
import tableexport from 'tableexport';
import { Tabs} from 'antd';

const DailyOrder = AsyncComponent(() => import("./dailyOrder.jsx"));
const RepaymentOrder = AsyncComponent(() => import("./repaymentOrder.jsx"));
const NewOldUsers = AsyncComponent(() => import("./newOldUsers.jsx"));
const EvaOrderHandle = AsyncComponent(() => import("./evaOrderHandle.jsx"));
const EvaPayOverdue = AsyncComponent(() => import("./evaPayOverdue.jsx"));
const MonthPayment = AsyncComponent(() => import("./monthPayment.jsx"));
const SRepaymentOrder = AsyncComponent(() => import("./sRepaymentOrder.jsx"));


const TabPane = Tabs.TabPane;
class RiskReport extends CLComponent {
  state = {
    type: "1",
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "tabChange",
    ]);
  }

  componentDidMount() {
    let type = sessionStorage.getItem("operateDataType") || "1";
    this.setState({type: type})
  }

  tabChange (e) {
    const that = this;
    that.setState({
      type: e,
    });
    sessionStorage.setItem("operateDataType", e);
  }

  renderBody() {
    const that = this;
    return (
      <div className="input-order" key="operation-data">
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>
          {
            CL.isRole("Password Modification") ? (
              <TabPane tab="订单日报表" key="1">
                <DailyOrder  tableexport = {tableexport} />
              </TabPane>
            ) : ''
          }

          {
            CL.isRole("Password Modification") ? (
              <TabPane tab="每日应还订单" key="2">
                <SRepaymentOrder  tableexport = {tableexport}/>
              </TabPane>
            ) : ''
          }

          {
            CL.isRole("Password Modification") ? (
              <TabPane tab="每日还款订单" key="3">
                <RepaymentOrder tableexport = {tableexport} />
              </TabPane>
            ) : ''
          }
          

          {
            CL.isRole("Password Modification") ? (
              <TabPane tab="新老客户放款报表" key="4">
                <NewOldUsers  tableexport = {tableexport} />
              </TabPane>
            ) : ''
          }

          {
            CL.isRole("Password Modification") ? (
              <TabPane tab="信审人员订单处理报表" key="5">
                <EvaOrderHandle tableexport = {tableexport}/>
              </TabPane>
            ) : ''
          }

          {
            CL.isRole("Password Modification") ? (
              <TabPane tab="信审人员放款逾期率情况表" key="6">
                <EvaPayOverdue  tableexport = {tableexport}/>
              </TabPane>
            ) : ''
          }

          {
            CL.isRole("Password Modification") ? (
              <TabPane tab="月放款指标" key="7">
                <MonthPayment tableexport = {tableexport}/>
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
export default RiskReport;

