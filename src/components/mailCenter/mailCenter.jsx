import React from 'react';
import MailAccountList from './mailAccountList';
import MailSetting from './mailSetting';
import { Tabs } from 'antd';

const TabPane = Tabs.TabPane;

export default class MailCenter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {

    }

    render(data) {
        return (
            <div className="MAIL-CENTER">
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Mail Account List" key="1"><MailAccountList /></TabPane>
                    <TabPane tab="Group" key="2"><span className="wait-for-development">敬请期待</span></TabPane>
                    <TabPane tab="Set Mail" key="3"><MailSetting /></TabPane>
                </Tabs>
            </div>
        );
    }
}

