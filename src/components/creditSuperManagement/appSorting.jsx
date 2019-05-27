import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import { DragList, CLlist } from '../../../src/lib/component/index';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';
import { Button, Tabs, Input, Modal, Select, Icon, DatePicker, message, Row, Col, Checkbox, InputNumber, Radio } from 'antd';

const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;
const { TabPane } = Tabs;
const confirm = Modal.confirm;
const RadioGroup = Radio.Group;
let { goodsReordering, contentType, goodsList } = Interface;
let req;

class LoanUserRules extends CLComponent {
  state = {
    type: '2',
    data: [],
    originData: [],
    pagination: {
      total: 0,
      pageSize: 200,
      currentPage: 1,
    },
    showModal: false,
    modal: false,
    current: {},
    currentStatus: '',
    search: {},
    riskList: [],
    arr: [],
  };

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'dragData',
      'submit',
    ]);
  }

  componentDidMount() {
    // 分页
    const sessionPagination = sessionStorage.getItem('pagination');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }

    this.setState({ pagination: pagination});
    this.loadData( pagination);
  }

  loadData(page) {
    const that = this;
    let params = {
      pageRequestDto: {
        currentPage: page.currentPage || 1,
        limit: 200,
        sort: ['priority_level'],
        order: "asc"
      },
    };
    let settings = {
      contentType,
      method: goodsList.type,
      url: goodsList.url,
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
        let arr = [];
        _.each(res.response.rows, doc =>{
          if(doc.statusDesc == "Y"){
            arr.push(doc);
          }
        });
        that.setState({
          pagination: pagination,
          data: arr,
          originData: _.cloneDeep(arr),
        });
      }
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({ settings, fn });
  }
  dragData(data) {
    let arr = [];
    let origin = this.state.originData;
    _.each(data, (doc, index) => {
      if (doc.id !== origin[index].id) {
        arr.push({
          id: doc.id,
          priorityLevel: origin[index].priorityLevel,
        });
      }
    });
    this.setState({ data, arr });
  }


  submit() {
    const that = this;
    confirm({
      title: 'Save',
      content: `Whether to change the order?`,
      onOk() {
        that.setState({ btnLoading: true });
        let params = that.state.arr;
        let settings = {
          contentType,
          method: goodsReordering.type,
          url: goodsReordering.url,
          data: JSON.stringify(params)
        };

        function fn(res) {
          that.setState({ btnLoading: false });
          if (res.status == 'SUCCESS') {
            message.success('modify success');
            that.loadData(that.state.pagination);
          }
        }

        CL.clReqwest({ settings, fn });

      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  renderBody() {
    const that = this;
    const columns = [
      {
        title: 'Rank List',
        width: '50%',
        dataSource: 'text',
        render: function (text, record) {
          return text + 1;
        },
      },
      {
        title: 'Product',
        width: '50%',
        dataSource: 'name',
      },
    ];

    // 比较当前数据，与历史数据是否有却别，有的话添加样式
    let origin = that.state.originData;
    let arr = [];
    // let that = this;
    let data = _.map(this.state.data, (doc, index) => {
      if (doc.id !== origin[index].id) {
        doc.thresholdModified = true;
        doc.style = {
          backgroundColor: '#ffeebc'
        };
      } else {
        doc.style = {
          backgroundColor: ''
        };
      }
      return _.omit(doc, ['thresholdModified']);
    });

    const settings = { data, columns, dragData: that.dragData };

    const searchSettings = {
      columns: null,
      operation: false,
      getFields: false,
      pageChange: null,
      tableLoading: false,
      search: that.state.search,
    };
    if (CL.isRole('supermarket_Product_Rank')) {
      searchSettings.defaultbtn = [
        {
          title: 'Save',
          type: 'primary',
          fn: that.submit,
        },
      ];
    }

    return (
      <div>
        <CLlist settings={searchSettings}/>
        <DragList {...settings}/>
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

export default LoanUserRules;
