import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, AsyncComponent } from '../../../src/lib/component/index';
import { CLlist } from '../../../src/lib/component/index';
import { CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';
import MjbManagement from './mjbManagement.jsx';
import { Button, Modal, Select, message, Row, Col, InputNumber, Tabs, Tooltip  } from 'antd';
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const Option = Select.Option;
let { marketingRuleList, marketingRuleFlip, marketingRuleThresholdValueUpdate, contentType } = Interface;
let req;
const MarketingRules = AsyncComponent(() => import('./marketingRules.jsx'));
const MarketingVariable = AsyncComponent(() => import('./marketingVariable.jsx'));
const MarketingSendTheRecord = AsyncComponent(() => import('./marketingSendTheRecord.jsx'));
class Marketrulesengine extends CLComponent {
  state = {
    data: [],
    dataW: [],
    originData: [],
    modal: false,
    tableLoading: false,
    current: {},
    search: {},
    applyOpt: [
      { name: 'N', value: 'N' },
      { name: 'Y', value: 'Y' },
    ],
    type: '1',
  };

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'toggleApplied',
      'loadData',
      'toggleModal',
      'onChange',
      'handleOk',
      'getFormFields',
    ]);
  }

  componentDidMount() {
    let type = sessionStorage.getItem('marketrulesengine') || '1';
    this.setState({ type });
    this.loadData();
  }

  loadData() {
    const that = this;
    that.setState({ tableLoading: true });
    let settings = {
      contentType,
      method: marketingRuleList.type,
      url: marketingRuleList.url,
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      that.setState({ data: res.data, dataW:res.data, originData: _.cloneDeep(res.data) });
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({ settings, fn });
  }

  //更改状态
  toggleApplied(record) {
    const that = this;

    confirm({
      title: '更改规则应用状态?',
      content: `确定修改该风控应用状态吗?`,
      onOk() {
        that.setState({ btnLoading: true });
        // 吸怪数据库状态
        let settings = {
          contentType,
          method: marketingRuleFlip.type,
          url: `${marketingRuleFlip.url}${record.code}/${record.enabled ? 'disable' : 'enable'}`,
        };

        function fn(res) {
          that.setState({ btnLoading: false });
          if (res.data) {
            message.success('modify success');
            that.loadData();
          }
        }

        CL.clReqwest({ settings, fn });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  toggleModal(doc, type) {
    this.setState({
      modal: !this.state.modal,
      current: _.cloneDeep(doc)
    });
  }

  onChange = (target, doc, type) => {
    doc.thresholdValues = doc.thresholdValues.map((item) => {
      if (item.name === type) {
        item.value = String(target);
      }
      return item;
    });
    this.setState({current: doc});
  }

  handleOk() {
    const that = this;
    let { current, originData } = that.state;
    let flag;
    originData = originData.map((doc) => {
      if (doc.code === current.code && JSON.stringify(current.thresholdValues) !== JSON.stringify(doc.thresholdValues)) {
        doc = current;
        flag = true;
      }
      return doc;
    });

    if (!flag) {
      message.error('你没有修过阈值！');
      return;
    }

    let valueList = _.map(current.thresholdValues, (item, index) => {
      return { code: current.code, name: item.name, value: item.value };
    });
    confirm({
      title: '修改阈值',
      content: `确定要修改阈值吗？`,
      onOk() {
        that.setState({ btnLoading: true });
        let settings = {
          contentType,
          method: marketingRuleThresholdValueUpdate.type,
          url: marketingRuleThresholdValueUpdate.url,
          data: JSON.stringify({
            valueList
          })
        };

        function fn(res) {
          that.setState({ btnLoading: false });
          if (res.data) {
            message.success('modify success');
            that.loadData();
          }
        }

        CL.clReqwest({ settings, fn });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
    this.setState({
      // data: data,
      current: {},
      modal: false
    });
  }

  getFormFields(fields, thats) {
    let search = {};
    let data = this.state.searchData || this.state.data;
    let values = _.chain(fields).values().compact().value();
    if (!values.length) {
      this.setState({
        data: this.state.searchData || this.state.data,
        search: {}
      });
      this.loadData();
      return;
    }

    let filterData = [];
    _.map(fields, function (doc, index) {
      if (doc) {
        if (index === 'enabled') {
          search[index] = doc;
          data = filterData.length ? filterData : data;
          filterData = [];
          _.each(data, (item) => {
            if (doc === 'Y' && item.enabled) {
              filterData.push(item);
            } else if (doc === 'N' && !item.enabled) {
              filterData.push(item);
            }
          });
        } else {
          search[index] = doc;
        }

      }
    });

    this.setState({ data: filterData, searchData: data, search: search });
  }

  isEmpty = ($obj) => {
    if (!$obj && $obj !== 0 && $obj !== '') return true;

    if (typeof $obj === "string") {
      $obj = $obj.replace(/\s*/g, "");

      if ($obj === '') return true;
    }

    return (Array.isArray($obj) && $obj.length === 0) || (Object.prototype.isPrototypeOf($obj) && Object.keys($obj).length === 0);
  }

  factoryNum = (list, code, bigList) => {
    if (this.isEmpty(list)) {
      return false;
    } else {
      return _.map(list, item => {
        return <Row span={8} style={{marginTop: 8}}>
          <span style={{display:'inline-block',textAlign:'right',marginRight: 10, minWidth:200}}>{item.summary}</span><InputNumber min={0} max={1200} value={item.value} onChange={(...arg) => {
          this.onChange(...arg, bigList, item.name);
        }}/>
        </Row>;
      });
    }
  }

  factory = (arr, code) => {
    var index = 0;
    if (arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].code == code) {
          index = i;
        }
      }
    }
    return index;
  }

  tabChange = (e) => {
    const that = this;
    that.setState({ type: e });
    sessionStorage.setItem('marketrulesengine', e);
  }

  renderBody() {
    const that = this;
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      maxWidth: '180px',
    };
    const { current, data } = that.state;
    const columns = [
      {
        title: '策略代码',
        width: '10%',
        dataSource: 'code',
        key: 'code',
        render(index, record) {
          return record.code;
        },
      },
      {
        title: '策略内容',
        width: '18%',
        dataSource: 'description',
        key: 'description',
        render: function (index, record) {
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.description} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <p style={remarkStyle}>{record.description}</p>
              </Tooltip>
            </div>
          );
        },
      },
      {
        title: '阈值',
        width: '10%',
        dataSource: 'thresholdValueString',
        key: 'thresholdValueString',
        render(index, record) {
          return record.thresholdValueString;
        },
      },
      {
        title: '营销方式',
        width: '7%',
        dataSource: 'marketingModeName',
        key: 'marketingModeName',
        render(index, record) {
          return record.marketingModeName;
        },
      },
      {
        title: '营销等级',
        width: '7%',
        dataSource: 'marketingGradeName',
        key: 'marketingGradeName',
        render(index, record) {
          return record.marketingGradeName;
        },
      },
      {
        title: '应用阶段',
        width: '12%',
        dataSource: 'applyingStageName',
        key: 'applyingStageName',
        render(index, record) {
          if(!record.applyingStageName){
            return '-';
          }
          return record.applyingStageName;
        },
      },
      {
        title: '应用时间',
        width: '12%',
        dataSource: 'updateTime',
        key: 'updateTime',
        render(index, record) {
          return moment(new Date(record.updateTime)).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: '在线状态',
        width: '8%',
        dataSource: 'enabled',
        key: 'enabled',
        render(index, record) {
          return record.enabled ? 'Y' : 'N';
        },
      },
      {
        title: '操作',
        dataSource: 'oper',
        key: 'oper',
        render(index, record) {
          if (!CL.isRole('marketing_engine_oper')) {
            return '-';
          }
          let toggleStatus = record.enabled ? '暂停' : '启动';
          return (
            <div>
              {_.values(record.thresholdValues).length ? (
                <div>
                  <Button type="primary" loading={that.state.btnLoading} onClick={() => { that.toggleModal(record); }}>更改阈值</Button>
                </div>
              ) : ''}
              <div style={{ marginTop: '5px' }}>
                <Button type="danger" loading={that.state.btnLoading} onClick={() => {that.toggleApplied(record); }}>{toggleStatus}</Button>
              </div>
            </div>
          );
        },
      },
    ];

    const operation = [
      {
        id: 'enabled',
        type: 'select',
        label: '状态',
        placeholder: '请选择在线状态',
        options: that.state.applyOpt,
      }
    ];

    const settings = {
      data: data,
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pageChange: false,
      pagination: false,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
    };

    return (
      <div className="marketrulesengine" key="marketrulesengine">
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>
          <TabPane tab='营销规则' key="1">
            <MarketingRules />
          </TabPane>
          <TabPane tab='营销变量' key="2">
            <MarketingVariable />
          </TabPane>
          <TabPane tab='发送记录' key="3">
            <MarketingSendTheRecord />
          </TabPane>
          <TabPane tab='马甲包管理' key="4">
            <MjbManagement />
          </TabPane>
          <TabPane tab='营销规则(Old)' key="5">
            <CLlist settings={settings} />
          </TabPane>
        </Tabs>
        <Modal
          title="更改阈值"
          visible={that.state.modal}
          onOk={() => {
            that.handleOk();
          }}
          onCancel={() => {
            that.toggleModal(current);
          }}
          okText="Confirm"
          cancelText="Cancel"
          mask={false}
        >
          <Row style={{marginTop: 20}}>
            <Col span={4}>
              <strong>策略代码</strong>：{current.code}
            </Col>

            <Col span={13} offset={1}>
              <strong>策略内容</strong>：{current.description}
            </Col>

            <Col span={5} offset={1}>
              <strong>阈值</strong>: {current.thresholdValueString}
            </Col>
          </Row>
          <Row style={{marginTop: 20}}>
            {
              that.factoryNum(that.state.dataW.length == 0 ? [] : that.state.dataW[that.factory(that.state.dataW, current.code)].thresholdValues, current.code, that.state.dataW.length == 0 ? [] : that.state.dataW[that.factory(that.state.dataW, current.code)])
            }
          </Row>
        </Modal>
      </div>
    );
  }

  render(data) {
    return (
      <QueueAnim className="marketrulesengine">
        {this.renderBody()}
      </QueueAnim>
    );
  }
}

export default Marketrulesengine;
