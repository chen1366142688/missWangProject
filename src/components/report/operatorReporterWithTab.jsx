import React from 'react';
import QueueAnim from 'rc-queue-anim';
import { CLComponent, AsyncComponent } from '../../../src/lib/component/index';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import _ from 'lodash';
import tableexport from 'tableexport';
import { Tabs } from 'antd';


const OperatorCurWeeklyBD = AsyncComponent(() => import('../report/operatorCurWeeklyBD.jsx'));

const OperatorPastWeeklyBD = AsyncComponent(() => import('../report/operatorPastWeeklyBD.jsx'));

const OperatorMonthlyBD = AsyncComponent(() => import('../report/operatorMonthlyBD.jsx'));

const OperatorCurWeeklyBU = AsyncComponent(() => import('../report/operatorCurWeeklyBU.jsx'));

const OperatorMonthlyBU = AsyncComponent(() => import('../report/operatorMonthlyBU.jsx'));

const OperatorDayUserDrain = AsyncComponent(() => import('../report/operatorDayUserDrain.jsx'));

const OperatorCurWeeklyBO = AsyncComponent(() => import('../report/operatorCurWeeklyBO.jsx'));

const OperatorPastWeeklyBO = AsyncComponent(() => import('../report/operatorPastWeeklyBO.jsx'));


const TabPane = Tabs.TabPane;

// 运营报表页签


class OperatorReporterWithTab extends CLComponent {
  state = {
    type: '1',
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'tabChange',
    ]);
  }

  componentDidMount() {
    const type = sessionStorage.getItem('operateDataType') || '1';
    this.setState({ type: type });
  }

  tabChange(e) {
    const that = this;
    that.setState({
      type: e,
    });
    sessionStorage.setItem('operateDataType', e);
  }

  renderBody() {
    const that = this;
    return (
      <div className="input-order" key="operation-data">

        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>

          {
                CL.isRole('Password Modification') ? (
                  <TabPane tab="运营周报总体业务数据" key="1">
                    <OperatorMonthlyBD tableexport={tableexport} />
                  </TabPane>
                ) : ''
            }

          {
                CL.isRole('Password Modification') ? (
                  <TabPane tab="当前周业务数据" key="2">
                    <OperatorCurWeeklyBD tableexport={tableexport} />
                  </TabPane>
                ) : ''
            }

          {
                CL.isRole('Password Modification') ? (
                  <TabPane tab="历史周业务数据" key="3">
                    <OperatorPastWeeklyBD tableexport={tableexport} />
                  </TabPane>
                ) : ''
            }

          {
                CL.isRole('Password Modification') ? (
                  <TabPane tab="新老用户对比-日报" key="4">
                    <OperatorCurWeeklyBU tableexport={tableexport} />
                  </TabPane>
                ) : ''
            }

          {
                CL.isRole('Password Modification') ? (
                  <TabPane tab="新老用户对比-月报" key="5">
                    <OperatorMonthlyBU tableexport={tableexport} />
                  </TabPane>
                ) : ''
            }

          {
                CL.isRole('Password Modification') ? (
                  <TabPane tab="用户流失数据" key="6">
                    <OperatorDayUserDrain tableexport={tableexport} />
                  </TabPane>
                ) : ''
            }

          {
                CL.isRole('Password Modification') ? (
                  <TabPane tab="本周逾期数据" key="7">
                    <OperatorCurWeeklyBO tableexport={tableexport} />
                  </TabPane>
                ) : ''
            }

          {
                CL.isRole('Password Modification') ? (
                  <TabPane tab="历史逾期数据" key="8">
                    <OperatorPastWeeklyBO tableexport={tableexport} />
                  </TabPane>
                ) : ''
            }
        </Tabs>
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
export default OperatorReporterWithTab;

