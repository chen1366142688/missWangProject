import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import _ from 'lodash';

import { Button, message, Table, Icon, Spin, Tabs, DatePicker, Row, Col } from 'antd';

const { getAuditData, contentType } = Interface;


class auditDetails extends CLComponent {
  state = {
    search: {},
    data: [],
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getFormFields',
    ]);
  }

  componentDidMount() {
    this.loadData();
  }

  loadData(search, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });
    // 兼容多选清空后，数组接口不支持
    const params = {
      // collectDate: search.time || moment(new Date()).format('YYYY-MM-DD'),
      collectDate: search ? search.collectDate : moment(new Date()).format('YYYY-MM-DD'),
    };
    const settings = {
      contentType,
      method: getAuditData.type,
      url: getAuditData.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      const data = res.data.operator;
      if (data) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].pendingApproval == null) {
            data[i].pendingApproval = '—';
          }
        }
        that.setState({ data: res.data.operator });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'collectDate') {
          search.collectDate = doc.format('YYYY-MM-DD');
        } else {
          search[index] = doc;
        }
      }
    });
    this.setState({ search: search });
    this.loadData(search);
  }

  renderBody() {
    const that = this;
    const { data } = that.state;

    const columns = [
      {
        title: 'Auditor',
        dataIndex: 'typeName',
        width: '5%',
      },
      {
        title: 'Approved',
        dataIndex: 'passed',
        width: '7%',
      },
      {
        title: 'Applying',
        dataIndex: 'pendingApproval',
        width: '7%',
      },
      {
        title: 'Refused',
        dataIndex: 'refused',
        width: '7%',
      },
      {
        title: 'Rollback',
        dataIndex: 'rollback',
        width: '7%',
      },
      {
        title: 'Production',
        dataIndex: 'processingQuantity',
        width: '7%',
      },
    ];

    const operation = [
      {
        id: 'collectDate',
        type: 'dateTime',
        label: 'Date',
        placeholder: 'ranger',
      },
    ];

    const settings = {
      data: data.map((doc, index) => {
        doc.id = index;
        return doc;
      }),
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: false,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
    };

    return (
      <div className="loan-audit1" key="loan-audit1">
        <CLlist settings={settings} />
      </div>
    );
  }

  render(data) {
    return (
      <QueueAnim className="animate-content1">
        {this.renderBody()}
      </QueueAnim>
    );
  }
}
export default auditDetails;

