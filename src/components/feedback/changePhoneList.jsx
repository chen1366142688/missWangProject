import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import {CLComponent} from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import {CLAnimate, CL} from '../../../src/lib/tools/index';
import {Interface} from '../../../src/lib/config/index';
import _ from 'lodash';
import { message, Modal, Tooltip,} from 'antd';
import ChangePhone from "Src/components/feedback/changePhone";
const confirm = Modal.confirm;
const {contentType,
  queryModifyMemberTelephoneRecordList,
  appMonitorProductVersionPacket
} = Interface;

class RepaymentFeedback extends CLComponent {
  state = {
    pagination: {
      total: 0,
      pageSize: 20,
      currentPage: 1,
    },
    tableLoading: false,
    newblackphone: false,
    search: {},
    data: [],
    AppName: [],
    disabled: true,
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getFormFields',
      'loadData',
      'pageChage',
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
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

    this.loadData(search, pagination);
    this.appList();
    this.setState({search: search, pagination: pagination});
  }

  loadData(search, page) {
    const that = this;
    that.setState({tableLoading: true});
    let parmes = {
      page:{
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize ||20,
      },
      startTime: search && search.beginTime,
      endTime: search && search.endTime,
    };

    const settings = {
      contentType,
      method: queryModifyMemberTelephoneRecordList.type,
      url: queryModifyMemberTelephoneRecordList.url,
      data: JSON.stringify(parmes),
    };

    function fn(res) {
      that.setState({tableLoading: false});
      if(res && res.data){
        let data = res.data.page;
        const pagination = {
          total: data.totalCount,
          pageSize: data.pageSize,
          currentPage: data.currentPage,
        };
        that.setState({
          data: data.result,
          pagination: pagination,
        });
      }
    }
    CL.clReqwest({settings, fn});
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (_.isArray(doc)) { // 判断为时间对象
          search.beginTime = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search.endTime = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else {
          search[index] = doc;
        }
      }
    });
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({search: search, pagination: pagination});
    this.loadData(search, pagination);
  }

  pageChage(e) { // list 切换页面
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };
    this.setState({pagination: pagination});
    this.loadData(this.state.search, pagination);
  }

  newblackList = () => {
    this.setState({newblackphone: true});
  }

  handleCancel = () => {
    this.setState({newblackphone: false});
  }

  appList = () => {
    const that = this;
    const settings = {
      contentType,
      method: appMonitorProductVersionPacket.type,
      url: appMonitorProductVersionPacket.url,
    };

    function fn(res) {
      let obj = [];
      if (res.data) {
        res.data.map((doc, index) => {
          obj.push({
            version: (doc.version).toString(),
            packetName: doc.packetName,
          });
        })
        that.setState({appVersionList: obj});
      }
    }

    CL.clReqwest({settings, fn});
  }

  getFieldsData = () => {
    let that = this;
    that.setState({newblackphone: false, tableLoading: false });
    that.loadData(that.state.search,that.state.pagination);
  }

  renderBody() {
    const that = this;
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      width: '300px',
    };
    const columns = [
      {
        title: 'Changed time',
        dataIndex: 'createTime',
        width: '13%',
        render: function (text, record) {
          return moment(record.createTime).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: 'APP',
        dataIndex: 'versionName',
        width: '12%',
      },
      {
        title: 'User Name',
        dataIndex: 'memberName',
        width: '12%',
      },

      {
        title: 'Old phone number',
        width: '13%',
        dataIndex: 'oldTelephoneNo',
      },

      {
        title: 'New phone number',
        width: '13%',
        dataIndex: 'newTelephoneNo',
      },

      {
        title: 'Changed by',
        width: '10%',
        dataIndex: 'operateName',
      },
      {
        title: 'Note',
        dataIndex: 'operateDesc',
        render: function (index, record) {
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.operateDesc} overlayStyle={{ wordWrap: 'break-word' }}>
                <p style={remarkStyle}>{record.operateDesc}</p>
              </Tooltip>
            </div>
          );
        },
      },
    ];

    const operation = [
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Add Time',
      },
    ];

    const data = this.state.data;

    const settings = {
      data: data,
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      btn: [{
        title: 'Change',
        type: 'primary',
        fn: that.newblackList,
      }],
    };

    return (
      <div className="Marketing-SMS-blacklist" key="Marketing-SMS-blacklist">
        <CLlist settings={settings}/>
        <Modal
          visible={that.state.newblackphone}
          onOk={that.Save}
          onCancel={that.handleCancel}
          footer={null}
        >
          <ChangePhone getFields={that.getFields} disabled getFieldsData={that.getFieldsData}/>
        </Modal>
      </div>
    );
  }

  render(data) {
    return (
      <QueueAnim className="animate-content">
        {this.renderBody() || null}
      </QueueAnim>
    );
  }
}

export default RepaymentFeedback;
