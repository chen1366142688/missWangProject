import React from 'react'
import {Tabs} from 'antd';
import ThresholdRule from './thresholdRule';

const TabPane = Tabs.TabPane;

export default class AlertRules extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Threshold Rule" key="1">
                    <ThresholdRule/>
                </TabPane>
            </Tabs>
        </div>)
    }
}