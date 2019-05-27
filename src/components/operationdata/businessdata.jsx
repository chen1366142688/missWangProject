import React from 'react';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import { Button, message, Table , Icon, Spin, Tabs, DatePicker, Row, Col } from 'antd';




class Businessdata extends CLComponent {
  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
    ]);
  }

  state = {
    data1: []
  }


  renderBody () {
    return (
      <div>
        报表
      </div>
    )
  }

  render () {
    return this.renderBody();
  }
}

export default Businessdata;