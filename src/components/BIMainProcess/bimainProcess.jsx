import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {Interface} from 'Lib/config/index';
import {Tabs} from 'antd';
import AuditProcess from './auditProcess';
import LoanProcess from './loanProcess';
import RepaymentProcess from './RepaymentProcess';
import IndicatorProcess from './indicatorProcess';
import ApplyProcess from './applyProcess';
import RegisterApplyFunnel from './registerApplyFunnel';
import UserRetainMonitor from './userRetainMonitor';
import OldRetail from './oldRetail';
import RealTimeOrderMonitor from './realTimeOrderMonitor';

const TabPane = Tabs.TabPane;

export default class BiMainProcess extends CLComponent {
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
                    <TabPane tab="实时单量监控" key="1">
                        <RealTimeOrderMonitor/>
                    </TabPane>
                    <TabPane tab="申请" key="2">
                        <ApplyProcess/>
                    </TabPane>
                    {/* <TabPane tab="审核" key="3">
                        <AuditProcess/>
                    </TabPane> */}
                    <TabPane tab="放款" key="5">
                        <LoanProcess/>
                    </TabPane>
                    <TabPane tab="还款" key="6">
                        <RepaymentProcess/>
                    </TabPane>
                    <TabPane tab="指标" key="7">
                        <IndicatorProcess/>
                    </TabPane>
                    <TabPane tab="注册申请转化" key="8">
                        <RegisterApplyFunnel/>
                    </TabPane>
                    <TabPane tab="用户留存" key="9">
                        <UserRetainMonitor/>
                    </TabPane>
                    <TabPane tab="存量用户转化监控" key="10">
                        <OldRetail/>
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}
