import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import {CLComponent} from '../../../src/lib/component/index';
import {DragList, CLlist} from '../../../src/lib/component/index';
import {CLAnimate, CL} from '../../../src/lib/tools/index';
import {Interface} from '../../../src/lib/config/index';
import _ from 'lodash';
import {Button, Tabs, Input, Modal, DatePicker, Select, Icon, message, Row, Col, InputNumber} from 'antd';

const Option = Select.Option;
const {TabPane} = Tabs;
const confirm = Modal.confirm;
let that;

const {
  riskList1, riskList, changeRiskOrder, toggleRiskStatus, thresholdValueRiskChange, riskControlList, riskControlUpdate, contentType,
} = Interface;
let req;

class UserlevelA extends CLComponent {
  state = {
    type: '1',
    data: [],
    datas:[],
    showModal: false,
    currentStatus: '',
    originData: [],
    modal: false,
    current: {},
    search: {},
    typeOpt: [],
    applyOpt: [
      {name: 'N', value: 'N'},
      {name: 'Y', value: 'Y'},
    ],
    dataList: [],
    riskList: [],
    ruleId: '',
    detailList: [],
    dataCode: '复贷用户规则',
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
    ]);
  }

  componentDidMount() {
    that = this;
    this.groupsList();
    this.getStatus();
  }

  groupsList = () => {
    const that = this;
    const settings = {
      contentType,
      method: riskList.type,
      url: riskList.url,
    };

    function fn(res) {
      if (res && res.data) {
        that.setState({dataList: res.data});
        let arr = [];
        var urls = res.data;
        Promise.all(urls.map(url =>
          fetch(`${riskList1.url}${url.code}`).then(resp => resp.text())
          // fetch(`https://rcs.cashlending.ph/risk/rule/list/${url.code}`).then(resp => resp.text())
        )).then(texts => {
          texts.map(item => {
            arr.push(JSON.parse(item));
            if(arr.length == urls.length){
              that.setState({
                data: arr[that.state.type - 1].data,
                datas:arr,
                detailList: arr,
                originData: _.cloneDeep(arr[that.state.type - 1].data),
                typeOpt: that.toHeavy(arr,that.state.type),
              })
            }
          })
        });
      } else {
        console.log('请求下拉框失败');
      }
    }

    CL.clReqwest({settings, fn});
  }

  // 更改状态
  toggleApplied = (record) => {
    const that = this;

    confirm({
      title: '更改规则应用状态?',
      content: '确定修改该风控应用状态吗?',
      onOk() {
        that.setState({btnLoading: true});
        // 修改本地状态
        const data = _.map(that.state.data, (doc) => {
          if (doc.code === record.code) {
            doc.enable = !doc.enable;
          }
          return doc;
        });

        that.setState({data});
        // 吸怪数据库状态
        let status = record.enable ? '1' : '0';
        let ruleId = record.id;
        const dataCodes = _.map(that.state.dataList, (doc) => {
          if (doc.name === that.state.dataCode) {
            const settings = {
              contentType,
              method: toggleRiskStatus.type,
              url: toggleRiskStatus.url,
              data: JSON.stringify({
                group: doc.code,
                ruleId,
                status,
              }),
            };

            function fn(res) {
              that.setState({btnLoading: false});
              if (res.code == 200) {
                message.success('modify success');
                that.groupsList();
              }
            }

            CL.clReqwest({settings, fn});
          }
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  dragData = (data) => {
    this.setState({data});
  }

  toggleModal = (doc, type) => {
    this.setState({
      modal: !this.state.modal,
      current: _.cloneDeep(doc),
    });
  }

  toggleModals = (doc, type) => {
    this.setState({
      ruleId: doc ? doc.id : '',
      currents: type ? type : '',
      showModal: !this.state.showModal,
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

  handleOk = () => {
    let {current, originData} = this.state;
    const that = this;
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

    const valueList = _.map(current.thresholdValues, (item, index) => {
      return {value: item.value, id: item.id};
    });


    confirm({
      title: '修改阈值',
      content: '确定要修改阈值吗？',
      onOk() {
        that.setState({btnLoading: true});
        const dataCodes = _.map(that.state.dataList, (doc) => {
          if (doc.name === that.state.dataCode) {
            const settings = {
              contentType,
              method: thresholdValueRiskChange.type,
              url: thresholdValueRiskChange.url,
              data: JSON.stringify({
                group: doc.code,
                ruleId: current.id,
                valueList,
              }),
            };

            function fn(res) {
              that.setState({btnLoading: false});
              if (res.code == 200) {
                message.success('modify success');
                that.groupsList();
              }
            }

            CL.clReqwest({settings, fn});
          }
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
    this.setState({current: {}, modal: false});
  }

  //修改规则属性提交接口
  handleOk1() {
    const that = this;
    const currents = that.state.currents;
    const currentStatus = that.state.currentStatus;
    const settings = {
      contentType,
      method: riskControlUpdate.type,
      url: `${riskControlUpdate.url}${currents}/${currentStatus}`,
    };

    function fn(res) {
      if (res.code == '200') {
        that.setState({
          showModal: !that.state.showModal,
        });
        that.groupsList();
      } else {
        console.log('提交失败');
      }
    }

    CL.clReqwest({settings, fn});
  }

  getStatus = () => {
    const that = this;
    const settings = {
      contentType,
      method: riskControlList.type,
      url: riskControlList.url,
    };

    function fn(res) {
      if (res.code == '200') {
        that.setState({riskList: res.data});
      } else {
        console.log('请求失败');
      }
    }

    CL.clReqwest({settings, fn});
  }

  statusChange = (e) => {
    this.setState({currentStatus: e});
  }

  submit = () => {
    const that = this;
    const codeGroup = 1;
    const ruleIdList = _.map(that.state.data, (doc) => {
      return doc.id;
    });
    const oldOrder = _.map(that.state.originData, (doc) => {
      return doc.code;
    });

    if (ruleIdList.join(',') === oldOrder.join(',')) {
      message.error('你没有修改过风控顺序！');
      return;
    }


    confirm({
      title: '修改风控顺序',
      content: '确定要修改风控顺序吗？',
      onOk() {
        that.setState({btnLoading: true});
        const dataCodes = _.map(that.state.dataList, (doc) => {
          if (doc.name === that.state.dataCode) {
            that.setState({dataCodes: doc.code});
            const settings = {
              contentType,
              method: 'post',
              url: changeRiskOrder.url,
              data: JSON.stringify({
                group: doc.code,
                ruleIdList,
              }),
            };

            function fn(res) {
              that.setState({btnLoading: false});
              if (res.code == 200) {
                message.success('modify success');
                that.groupsList(that.state.dataCodes);
              }
            }

            CL.clReqwest({settings, fn});
          }
        })
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  getFormFields = (fields) => {
    const search = {};
    let data = this.state.searchData || this.state.data;
    if (fields.code === undefined && fields.type === undefined && fields.enable ===undefined) {
      this.setState({search:{}});
      this.groupsList();
      return;
    }

    let filterData = [];
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'code') {
          search[index] = doc;
          _.each(data, (item) => {
            if (item.code.indexOf(doc.toUpperCase()) > -1) {
              filterData.push(item);
            }
          });
        }

        if (index === 'type') {
          search[index] = doc;
          data = filterData.length ? filterData : data;
          filterData = [];
          _.each(data, (item) => {
            if (item.type.indexOf(doc) > -1) {
              filterData.push(item);
            }
          });
        }

        if (index === 'enable') {
          search[index] = doc;
          data = filterData.length ? filterData : data;
          filterData = [];
          _.each(data, (item) => {
            if (doc === 'Y' && item.enable) {
              filterData.push(item);
            } else if (doc === 'N' && !item.enable) {
              filterData.push(item);
            }
          });
        } else {
          search[index] = doc;
        }
      }
    });
    this.setState({
      data: filterData,
      searchData: data,
      search: search,
    });
  }


  tabChange = (e)=>{
    let data = that.state.detailList[e - 1].data;
    that.setState({
      type: e,
      search: {},
      data,
      originData: _.cloneDeep(that.state.detailList[e - 1].data),
      typeOpt: that.toHeavy(that.state.detailList,e),
      searchData:data,
    })
  }

  factoryNum = (list, code, bigList) => {
    if (this.isEmpty(list)) {
      return false;
    } else {
      return _.map(list, item => {
        return <Col span={8}>
          {item.summary}：<InputNumber min={0} max={1200} value={item.value} onChange={(...arg) => {
          this.onChange(...arg, bigList, item.name);
        }}/>
        </Col>;
      });
    }
  }


  isEmpty = ($obj) => {
    if (!$obj && $obj !== 0 && $obj !== '') return true;

    if (typeof $obj === "string") {
      $obj = $obj.replace(/\s*/g, "");

      if ($obj === '') return true;
    }

    return (Array.isArray($obj) && $obj.length === 0) || (Object.prototype.isPrototypeOf($obj) && Object.keys($obj).length === 0);
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

  onNextClick = (e, text) => {
    let that = this;
    let dataCode = text.target.outerText;
    that.setState({
      dataCode: dataCode,
    });
    sessionStorage.setItem("operateDataType", e);
  }

  toHeavy = (arr,num) =>{
    let obj = {};
    let typeAll = _.map(arr[num - 1].data, (doc) => {
      return ({name: doc.type + '', value: doc.type + ''})
    })
    typeAll = typeAll.reduce((cur,next) => {
      obj[next.value] ? "" : obj[next.value] = true && cur.push(next);
      return cur;
    },[]) //设置cur默认类型为数组，并且初始值为空的数组
    return typeAll;
  }

  renderBody() {
    const that = this;
    const {current} = that.state;
    const editStyle = {
      display: 'inlineBlock',
      fontSize: '18px',
      position: 'absolute',
      right: '5px',
      cursor: 'pointer',
      color: '#108ee9',
      top: '20%',
    };
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      width: '180px',
    };
    let columns = [
      {
        title: '策略代码',
        width: '10%',
        dataSource: 'code',
      },
      {
        title: '策略类型',
        width: '8%',
        dataSource: 'type',
      },
      {
        title: '策略内容',
        width: '19%',
        dataSource: 'description',
      },
      {
        title: '阈值',
        width: '15%',
        dataSource: 'thresholdValueString',
        render(index, record) {
          if (!record.thresholdValueString) {
            return '-'
          }
          return record.thresholdValueString;
        }
      },
      {
        title: '规则属性',
        width: '12%',
        dataSource: 'action',
        render(index, record) {
          return (
            <div style={{position: 'relative', width: '100%'}}>
              <a>{(record.action)}</a>
              <Icon
                type="down"
                style={editStyle}
                onClick={() => {
                  that.toggleModals(record, record.id);
                }}
              />
            </div>
          );
        },
      },
      {
        title: '应用阶段',
        width: '8%',
        dataSource: 'strategy',
      },
      {
        title: '应用时间',
        width: '10%',
        dataSource: 'applyTime',
        render(index, record) {
          if (!record.applyTime) {
            return '-'
          }
          return moment(record.applyTime).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: '在线状态',
        width: '6%',
        dataSource: 'enable',
        render(index, record) {
          return record.enable ? 'Y' : 'N';
        },
      },
      {
        title: '操作',
        width: '10%',
        dataSource: 'oper',
        render(index, record) {
          if (!CL.isRole('riskMs-Oper')) {
            return '';
          }
          const toggleStatus = record.enable ? '暂停' : '启动';
          return (
            <div>
              {_.values(record.thresholdValues).length ? (
                <div>
                  <Button type="primary" loading={that.state.btnLoading} onClick={() => {
                    that.toggleModal(record);
                  }}>更改阈值</Button>
                </div>
              ) : ''}
              <div style={{marginTop: '5px'}}>
                <Button type="danger" loading={that.state.btnLoading} onClick={() => {
                  that.toggleApplied(record);
                }}>{toggleStatus}</Button>
              </div>
            </div>
          );
        },
      },
    ];

    // 比较当前数据，与历史数据是否有却别，有的话添加样式
    const data = _.map(that.state.data, (doc) => {
      const odoc = _.find(that.state.originData, {code: doc.code});
      doc = _.omit(doc, ['thresholdModified', 'style']);

      if (JSON.stringify(doc) !== JSON.stringify(odoc)) {
        doc.thresholdModified = true;
        doc.style = {
          backgroundColor: '#ffeebc',
        };
      }
      return doc;
    });

    const settings = {
      data,
      columns,
      dragData: that.dragData,
    };

    const operation = [
      {
        id: 'code',
        type: 'text',
        label: '策略代码',
        placeholder: '请输入策略代码',
      },

      {
        id: 'type',
        type: 'select',
        label: '策略类型',
        placeholder: '请选择策略类型',
        options: that.state.typeOpt,
      },

      {
        id: 'enable',
        type: 'select',
        label: '在线状态',
        placeholder: '请选择在线状态',
        options: that.state.applyOpt,
      },
    ];


    const searchSettings = {
      columns: null,
      operation: operation,
      getFields: that.getFormFields,
      pageChange: null,
      tableLoading: false,
      search: that.state.search,
    };

    if (CL.isRole('riskMs-Oper')) {
      searchSettings.btn = [
        {
          title: '修改顺序',
          type: 'danger',
          fn: that.submit,
        },
      ];
    }

    return (
      <div>
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange} onTabClick={that.onNextClick}>
          {
            _.map(that.state.dataList, (doc, index) => {
              return (
                <TabPane tab={doc.name} key={index + 1}>
                  <CLlist settings={searchSettings}/>
                  <DragList {...settings} />
                </TabPane>
              )
            })
          }
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
              that.factoryNum(that.state.data.length == 0 ? [] : that.state.data[that.factory(that.state.data, current.code)].thresholdValues, current.code, that.state.data.length == 0 ? [] : that.state.data[that.factory(that.state.data, current.code)])
            }
          </Row>
        </Modal>
        <Modal
          title=""
          visible={that.state.showModal}
          onOk={() => {
            that.handleOk1();
          }}
          onCancel={() => {
            that.toggleModals();
          }}
          okText="Save"
          cancelText="Cancel"
        >
          <Row style={{marginTop: 20}}>
            <Col span={20}>
              <strong>规则属性 : </strong>
              <Select defaultValue="请选择" style={{width: 200}} onChange={that.statusChange}>
                {
                  that.state.riskList.map((doc) => {
                    return (<Option key="name" value={doc.code}>{doc.name}</Option>);
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

export default UserlevelA;
