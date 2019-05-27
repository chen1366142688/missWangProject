import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {Interface} from 'Lib/config/index';
import {Tabs} from 'antd';
import LoginProcess from './loginProcess';
import AuditProcess from './auditProcess';
import LoanProcess from './loanProcess';
import RepaymentProcess from './RepaymentProcess';
import RegisterApplyFunnel from './registerApplyFunnel';
import AuditRuleProcess from './auditRuleProcess';

import IndicatorProcess from './indicatorProcess';
import ApplyProcess from './applyProcess';
import UserRetainMonitor from './userRetainMonitor';
// import ProductMain from './productMain';
import LoanRiskLevel from './loanRiskLevel';
import OldRetail from './oldRetail';
import RealTimeOrderMonitor from './realTimeOrderMonitor';

const TabPane = Tabs.TabPane;

export default class MainProcess extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            type: "1"
        }
    }

    render() {
        return (
            <div className="main-process">
                <Tabs defaultActiveKey={this.state.type}>
                    <TabPane tab="登录" key="1">
                        <LoginProcess/>
                    </TabPane>
                    <TabPane tab="申请" key="2">
                        <ApplyProcess/>
                    </TabPane>
                    <TabPane tab="审核" key="3">
                        <AuditProcess/>
                    </TabPane>
                    <TabPane tab="审核规则" key="4">
                        <AuditRuleProcess/>
                    </TabPane>
                    <TabPane tab="放款" key="5">
                        <LoanProcess/>
                    </TabPane>
                    <TabPane tab="放款-风控等级" key="6">
                        <LoanRiskLevel/>
                    </TabPane>
                    <TabPane tab="还款" key="7">
                        <RepaymentProcess/>
                    </TabPane>
                    <TabPane tab="指标" key="8">
                        <IndicatorProcess/>
                    </TabPane>
                    {/*<TabPane tab="产品主流程" key="9">*/}
                        {/*<ProductMain/>*/}
                    {/*</TabPane>*/}
                    {/*<TabPane tab="点击流漏斗" key="10">*/}
                    {/*</TabPane>*/}
                    {/*<TabPane tab="收入指标" key="11">*/}
                    {/*</TabPane>*/}
                    <TabPane tab="注册申请漏斗-用户纬度" key="12">
                        <RegisterApplyFunnel/>
                    </TabPane>
                    <TabPane tab="用户留存" key="13">
                        <UserRetainMonitor/>
                    </TabPane>
                    <TabPane tab="存量老用户" key="14">
                        <OldRetail/>
                    </TabPane>
                    <TabPane tab="实时单量监控" key="15">
                        <RealTimeOrderMonitor/>
                    </TabPane>
                </Tabs>

            </div>
        )
    }
}
