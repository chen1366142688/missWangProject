import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {Interface} from 'Lib/config/index';
import {Tabs} from 'antd';
import DailyData from './dailyData';
import FunnelData from './funnelData';
import PlatformWholeData from './platformWholeData';

const TabPane = Tabs.TabPane;

export default class MonitorData extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            type: "1"
        }
    }

    render() {
        return (
            <div className="monitor-data">
                <Tabs defaultActiveKey={this.state.type} onChange={this.tabChange}>
                    <TabPane tab="渠道监控-日常数据" key="1">
                        <DailyData/>
                    </TabPane>
                    <TabPane tab="渠道监控-漏斗数据" key="2">
                        <FunnelData/>
                    </TabPane>
                    <TabPane tab="平台数据-整体数据" key="3">
                        <PlatformWholeData/>
                    </TabPane>
                </Tabs>

            </div>
        )
    }
}
