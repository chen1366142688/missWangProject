import React from 'react';
import QueueAnim from 'rc-queue-anim';
import reqwest from 'reqwest';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';
import { Button, Col, DatePicker, Modal, Row, Select, Input, Tooltip, message } from 'antd';

const { contentType, sellerAdd, sellerList, sellerModify } = Interface;
const { Option } = Select;
class CooperationCompany extends CLComponent {
  state = {
    search: {},
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    tableLoading: false,
    data: [],
    type: [
      { name: 'N', value: '0' },
      { name: 'Y', value: '1' },
    ],
    showHidden: false,
    dataList: {},
    subStatus: '',

  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'pageChage',
      'getFormFields',
      'showHidden',
      'handleCancel',
      'onChange',
      'editContent',
      'save',
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

    // 分页
    const sessionPagination = sessionStorage.getItem('pagination');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }

    this.setState({ search: search, pagination: pagination, subStatus: '' });
    this.loadData(search, pagination);
  }

  loadData(search, page) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      startCreateTime:search.beginTime,
      endCreateTime:search.endTime,
      pageRequestDto: {
        currentPage: page.currentPage || 1,
        limit: page.pageSize || 10,
      },
    };
    const settings = {
      contentType,
      method: sellerList.type,
      url: sellerList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      if (res.response) {
        const pagination = {
          total: res.response.total,
          pageSize: res.response.limit,
          currentPage: res.response.currentPage,
        };
        sessionStorage.setItem('pagination', JSON.stringify(pagination));
        sessionStorage.setItem('search', JSON.stringify(search));
        that.setState({
          pagination: pagination,
          data: res.response.rows,
          search: search,
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  save() {
    const that = this;
    if (that.state.subStatus === '1') { // 新增
      let settings = {
        contentType,
        method: sellerAdd.type,
        url: sellerAdd.url,
        data: JSON.stringify(that.state.dataList),
      };

      function fn(res) {
        if (res.code !== null) {
          message.error('The  name already exists, please input again.');
          that.setState({ showHidden: true });
        } else if (res.status == 'SUCCESS') {
          that.setState({ showHidden: false });
          that.loadData(that.state.search, that.state.pagination);
        }
      }

      CL.clReqwest({ settings, fn });

    } else if (that.state.subStatus === '2') { // 编辑
      let params = {
        companyName: that.state.dataList.companyName,
        status: that.state.dataList.status,
        id: that.state.dataList.id,
      };
      let settings = {
        contentType,
        method: sellerModify.type,
        url: sellerModify.url,
        data: JSON.stringify(params),
      };

      function fn(res) {
        if (res.msg !== null && res.code !== null) {
          message.error('The  name already exists, please input again.');
        } else {
          that.setState({ showHidden: false });
          that.loadData(that.state.search, that.state.pagination);
        }
      }

      CL.clReqwest({ settings, fn });

    } else {
      console.log('这是查看');
    }
  }

  showHidden(e){
    this.setState({ showHidden: true, subStatus: '1' });
  }

  handleCancel() {
    const that = this;
    that.setState({
      showHidden: false,
      dataList: {},
      subStatus: '',
    });
  }

  editContent(data) {
    this.setState({ showHidden: true, dataList: data, subStatus: '2' });
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'time') {
          search.beginTime = doc[0].format('YYYY-MM-DD 00:00:00');
          search.endTime = doc[1].format('YYYY-MM-DD 23:59:59');
        } else {
          search[index] = doc;
        }
      }
    });
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({
      search: search,
      pagination: pagination
    });
    this.loadData(search, pagination);
  }

  pageChage(e) { // list 切换页面
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };

    this.setState({ pagination: pagination });
    this.loadData(this.state.search, pagination);
  }

  onChange(e, target){
    let dataList = this.state.dataList;
    if (target == 'status') {
      dataList[target] = e || '0';
    } else if (target == 'companyName') {
      dataList[target] = e.target.value;
    }
    this.setState({ dataList });
  }

  renderBody() {
    const that = this;
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      width: '100px',
    };
    const { data } = that.state;
    const columns = [
      {
        title: 'Company',
        dataIndex: 'companyName',
        width: '20%',
        render: function (index, record) {
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.companyName} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <p style={remarkStyle}>{record.companyName}</p>
              </Tooltip>
            </div>
          );
        },
      },
      {
        title: 'Product',
        dataIndex: 'producNames',
        width: '20%',
        render: function (index, record) {
          return record.producNames || '-';
        },
      },
      {
        title: 'Status',
        dataIndex: 'statusDesc',
        width: '20%',
        render: function (index, record) {
          return record.statusDesc;
        },
      },
      {
        title: 'Created time/Updated time',
        dataIndex: 'createTime',
        width: '20%',
        render(index, record) {
          if (record.createTime && record.updateTime) {
            return <div>{record.createTime} / {record.updateTime}</div>;
          } else if (!record.createTime) {
            return record.updateTime;
          } else {
            return record.createTime;
          }
        },
      },
      {
        title: 'Operate',
        dataIndex: 'updateDate',
        render: function (text, record) {
          if ((_.indexOf(JSON.parse(sessionStorage.getItem('roles')), 'supermarket_Company') > -1)) {
            return (
              <div>
                <Button type="primary" onClick={() => {that.editContent(record); }}>Edit</Button>
              </div>
            );
          } else {
            return '-';
          }
        },
      },
    ];


    const operation = [
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Created time',
        placeholder: 'ranger',
      },

    ];

    const settings = {
      data: data,
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      defaultbtn: [{
        title: 'Create',
        type: 'primary',
        fn: that.showHidden,
      }],
    };

    return (
      <div className="CooperationCompany" key="CooperationCompany">
        <CLlist settings={settings} />
        <Modal
          title=""
          visible={that.state.showHidden}
          onOk={that.save}
          onCancel={that.handleCancel}
          okText={'Save'}
          cancelText={'Cancel'}
          mask={false}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={3} offset={1}>Company</Col>
            <Col span={20}>
              <Input maxLength={50} style={{ width: 280 }} type="text" value={that.state.dataList.companyName} onChange={(e) => { that.onChange(e, 'companyName'); }}/>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={3} offset={1}>Status</Col>
            <Col span={20}>
              <Select
                onChange={(e) => { that.onChange(e, 'status'); }}
                style={{ width: 280 }}
                value={that.state.dataList.status == '0' ? 'N' : that.state.dataList.status == '1' ? 'Y' : that.state.dataList.status}
              >
                {
                  that.state.type.map(doc => {
                    return (
                      <Option key={doc.value} value={doc.value}>{doc.name}</Option>
                    );
                  })
                }
              </Select>
            </Col>
          </Row>
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
export default CooperationCompany;
