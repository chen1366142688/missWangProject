import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {Tabs} from 'antd';
import CouponList from './couponList';
import UserCouponDetail from './userCouponDetail';

const {TabPane} = Tabs;

export default class CouponManagement extends CLComponent {
    constructor(props) {
        super(props);
        let type = sessionStorage.getItem('operateDataType') || '1';
        this.state = {
            type: type
        }
    }

    tabChange = (e) => {
      let that = this;
      that.setState({
            type: e,
        });
      sessionStorage.setItem('operateDataType', e);
    };

    render() {
        return (<div className="coupon-management">
            <Tabs defaultActiveKey={this.state.type} onChange={this.tabChange}>
                <TabPane tab="User-Coupon Details" key="1">
                    <UserCouponDetail/>
                </TabPane>
                <TabPane tab="Coupon List" key="2">
                    <CouponList/>
                </TabPane>
            </Tabs>
        </div>)
    }
}
