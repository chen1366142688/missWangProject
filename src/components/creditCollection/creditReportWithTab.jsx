import React from 'react';
import QueueAnim from 'rc-queue-anim';
import { CLComponent, AsyncComponent } from '../../../src/lib/component/index';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import _ from 'lodash';
import tableexport from 'tableexport';
import { Tabs } from 'antd';


const PostLoanReport = AsyncComponent(() => import('../riskReport/postLoanReport.jsx'));
const CreditReport = AsyncComponent(() => import('./creditReport.jsx'));

const MonthlyReportDetails = AsyncComponent(() => import('./monthlyReportDetails.jsx'));
const CollectorReport = AsyncComponent(() => import('./collectorReport.jsx'));
const SmsStatistics = AsyncComponent(() => import('./smsStatistics.jsx'));
const CollectionRemarkDetail = AsyncComponent(()=>import('./collectionRemarkDetail.jsx'));
const CollectionTodayGoal = AsyncComponent(()=>import('./collectionTodayGoal.jsx'));

const TabPane = Tabs.TabPane;
class CreditReportWithTab extends CLComponent {
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
              <TabPane tab="CreditReport" key="1">
                <CreditReport tableexport={tableexport} />
              </TabPane>
            ) : ''
          }

          {
            CL.isRole('Password Modification') ? (
              <TabPane tab="贷后周报" key="2">
                <PostLoanReport tableexport={tableexport} />
              </TabPane>
            ) : ''
          }


          {
               CL.isRole('Password Modification') ? (
                 <TabPane tab="催收员报表" key="3">
                   <CollectorReport tableexport={tableexport} />
                 </TabPane>
               ) : ''
           }

          {
               CL.isRole('Password Modification') ? (
                 <TabPane tab="催收月报明细" key="4">
                   <MonthlyReportDetails tableexport={tableexport} />
                 </TabPane>
               ) : ''
           }

          {
            CL.isRole('Password Modification') ? (
              <TabPane tab="短信发送统计" key="5">
                <SmsStatistics tableexport={tableexport} />
              </TabPane>
            ) : ''
          }

          {
            CL.isRole('Password Modification') ? (
                <TabPane tab="催收备注明细" key="6">
                  <CollectionRemarkDetail tableexport={tableexport} />
                </TabPane>
            ) : ''
          }

          {
            CL.isRole('Password Modification') ? (
              <TabPane tab="今日目标" key="7">
                <CollectionTodayGoal tableexport={tableexport} />
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
export default CreditReportWithTab;

