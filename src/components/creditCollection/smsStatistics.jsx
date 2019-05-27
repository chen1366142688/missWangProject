import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLList from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';

import { Button,DatePicker, Modal } from 'antd';
import tableexport from 'tableexport';

const { contentType, collectReportCreditSendReport } = Interface;
let TB;

class SmsStatistics extends CLComponent {
  state = {
    search: {},
    tableLoading: false,
    showTableExport: false,
    data: [],
    date: '',
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'download',
      'handleCancel',
      'getFormFields',
    ]);
  }


  componentDidMount() {
    const that = this;
    // 搜索条件
    const sessionSearch = sessionStorage.getItem('search');
    let search = this.state.search;
    if (sessionSearch) {
      search = JSON.parse(sessionSearch);
    }

    this.loadData(this.state.search);
  }


  loadData(search, page) {
    const that = this;
    that.setState({ tableLoading: true });

    const params = {
      startTime: '' || search.beginTime,
      endTime: '' || search.endTime,
    };

    const settings = {
      contentType,
      method: collectReportCreditSendReport.type,
      url: collectReportCreditSendReport.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });

      if (res.data) {
        that.setState({
          data: res.data.list,
          date: res.data.date,
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }


  download(target) {
    const that = this;
    that.setState({ showTableExport: true });
    const { tableexport } = that.props;
    setTimeout(() => {
      TB = tableexport(document.querySelector('#ex-table-sms-statistics'), { formats: ['csv', 'txt', 'xlsx'] });
    }, 100);
  }

  handleCancel() {
    const that = this;
    that.setState({ showTableExport: false });
    if (TB) {
      TB.remove();
    }
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'time') {
          search.beginTime = doc[0].format('YYYY-MM-DD');
          search.endTime = doc[1].format('YYYY-MM-DD');
          search.a = doc[0].format('YYYY.MM.DD');
          search.b = doc[1].format('YYYY.MM.DD');
        } else {
          search[index] = doc;
        }
      }
    });
    this.setState({ search: search});
    this.loadData(search);
  }

  renderBody() {
    const that = this;
    const { data } = that.state;
    const { download } = that.props;
    const columns = [
      {
        title: '催收员',
        dataIndex: 'operatorName',
        width: 200,
        render(index, record) {
          return record.operatorName;
        },
      },
      {
        title: 'Addressbook type',
        dataIndex: 'addressbookCount',
        width: 200,
        render(index, record) {
          return record.addressbookCount;
        },
      },
      {
        title: 'Contact person type',
        dataIndex: 'contactCount',
        width: 200,
        render(index, record) {
          return record.contactCount;
        },
      },
      {
        title: 'User himself type',
        dataIndex: 'userCount',
        width: 200,
        render(index, record) {
          return record.userCount;
        },
      },
      {
        title: 'Total',
        dataIndex: 'total',
        width: 200,
        render(index, record) {
          return record.total;
        },
      },
    ];

    const operation = [
      {
        id: 'time',
        type: 'rangePicker',
        label: '日期',
        placeholder: 'ranger',
      },
    ];

    const settings = {
      data: data.map((doc, index) => {
        doc.id = index;
        return doc;
      }),
      operation: operation,
      columns: columns,
      getFields: that.getFormFields,
      pagination: false,
      pageChange: false,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      defaultdate:[{
        name: `日期 : ` + (!that.state.search.beginTime ? moment(new Date()).format('YYYY.MM.DD') : that.state.search.a)  + ` — ` +(!that.state.search.endTime ? moment(new Date()).format('YYYY.MM.DD'): that.state.search.b),
      }],
      btn: [
        {
          title: 'Download',
          type: 'danger',
          fn: that.download,
        },
      ],
    };


    // 下载表格
    const th = [
      '催收员',
      'Addressbook type',
      'Contact person type',
      'User himself type',
      'Total',
    ];

    return (
      <div className="SmsStatistics" key="SmsStatistics">
        <CLList settings={settings} />
        <Modal
          className="te-modal"
          title="Download"
          closable
          visible={that.state.showTableExport}
          width="100%"
          style={{ top: 0 }}
          onCancel={that.handleCancel}
          footer={[
            <Button key="back" size="large" onClick={that.handleCancel}>Cancel</Button>,
           ]}
        >
          <table className="ex-table" id="ex-table-sms-statistics">
            <thead>
              <tr>
                {th.map((doc) => {
                   return (<th key={doc}>{doc}</th>);
                 })}
              </tr>
            </thead>
            <tbody>
              {
                 data.map((record, index) => {
                   return (
                     <tr key={index}>
                       <td>{record.operatorName}</td>
                       <td>{record.addressbookCount}</td>
                       <td>{record.contactCount}</td>
                       <td>{record.userCount}</td>
                       <td>{record.total}</td>
                     </tr>
                   );
                 })
               }
            </tbody>
          </table>
        </Modal>
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
export default SmsStatistics;
