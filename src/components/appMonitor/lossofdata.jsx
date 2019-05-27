import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import _ from 'lodash';
import { Button, Table, DatePicker } from 'antd';

const {
  contentType, memberActionAnalyticAppLoseRate, memberLoginLogProductVersionList,appMonitorProductVersionPacket
} = Interface;

class DataWaistcoat extends CLComponent {
  state = {
    search: {},
    appVersion: [],
    tableLoading: false,
    data: [],
    daysList: [
      { name: '1', value: '1' },
      { name: '2', value: '2' },
      { name: '3', value: '3' },
      { name: '4', value: '4' },
      { name: '5', value: '5' },
      { name: '6', value: '6' },
      { name: '7', value: '7' },
      { name: 'No limit', value: '30' },
    ],
    appName: [],
    versionList: [],
    b: '',
  }
  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'getFormFields',
      'appName',
      'versionList',
    ]);
  }


  componentDidMount() {
    const that = this;
    const sessionSearch = sessionStorage.getItem('search');
    let search = this.state.search;
    if (sessionSearch) {
      search = JSON.parse(sessionSearch);
    }
    // 默认值设置
    search.appName ? null:search.appName= 'Cashlending';
    search.packetName = "com.unipeso.phone";
    search.version = "0";
    this.setState({ search: search });
    this.loadData(search);
    this.appName();
    this.versionList();
  }

  loadData(search) {
    const that = this;
    that.setState({ tableLoading: true });
    const params = {
      registerDate: search.collectDate,
      daysAfterRegister: search.daysAfterRegister || 2,
      packetName: search.packetName,
      version: search.version,
    };

    const settings = {
      contentType,
      method: memberActionAnalyticAppLoseRate.type,
      url: memberActionAnalyticAppLoseRate.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      if (res.data) {
        sessionStorage.setItem('search', JSON.stringify(search));
        that.setState({
          data: res.data
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }
  versionList() {
    const that = this;
    const settings = {
      contentType,
      method: memberLoginLogProductVersionList.type,
      url: memberLoginLogProductVersionList.url,
    };

    function fn(res) {
      const versionList = [];
      if (res.data) {
        res.data.map((doc, index) => {
          versionList.push({
            name: doc,
            value: doc,
          });
        });
        that.setState({
          versionList: versionList,
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  appName() {
    const that = this;
    const settings = {
      contentType,
      method: appMonitorProductVersionPacket.type,
      url: appMonitorProductVersionPacket.url,
    };

    function fn(res) {
      const appNames = [];
      if (res.data) {
        res.data.map((doc, index) => {
          appNames.push({
            name: doc.versionName,
            value: doc.packetName + "-" + doc.version
          });
        });
        that.setState({
          appName: appNames,
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }

    getFormFields(fields) {
        const search = {}, stateParams = {};
        let obj = this.state.appName;

        _.each(fields, (doc, index) => {
            if (doc) {
                if (index === 'collectDate') { // 判断为时间对象
                    search.collectDate = new Date(doc.format('YYYY-MM-DD')).getTime();
                    search.a = doc.format('YYYY.MM.DD');
                    stateParams.collectDate = search.collectDate;
                    stateParams.a = search.a;
                } else if (index === "appName") {
                    let versionArr = fields.appName.split('-');
                    search.packetName = versionArr[0];
                    search.version = versionArr[1];
                    stateParams.appName = doc;
                } else {
                    search[index] = doc;
                    stateParams[index] = doc;
                }
            }
        });

        for (let i in obj) {
            if (stateParams.appName == obj[i].value) {
                stateParams.b = obj[i].name;
            }
        }
        this.setState({search: stateParams});
        this.loadData(search);
    }

  renderBody() {
    const that = this;
    const { data } = that.state;
    const columns = [
      {
        title: '页面名称',
        dataIndex: 'pageName',
        width: '20%',
        render(index, record) {
          return record.pageName;
        },
      },
      {
        title: '进入人数',
        dataIndex: 'enterNumber',
        width: '20%',
        render(index, record) {
          return record.enterNumber;
        },
      },
      {
        title: '提交人数',
        dataIndex: 'submitNumber',
        width: '20%',
        render(index, record) {
          return record.submitNumber;
        },
      },
      {
        title: '流失率',
        dataIndex: 'lossRate',
        width: '20%',
        render(index, record) {
          return CL.cf(record.lossRate * 100, 2) + '%';
        },
      },
    ];


    const operation = [
      {
        id: 'collectDate',
        type: 'dateTime',
        label: '注册日期',
        placeholder: 'ranger',
      },
      {
        id: 'daysAfterRegister',
        type: 'select',
        label: '注册后天数',
        options: that.state.daysList,
        placeholder: 'Please select',
      },
      {
        id: 'appName',
        type: 'select',
        label: 'App名称',
        options: that.state.appName,
        placeholder: 'Please select',
      },
      {
        id: 'appVersion',
        type: 'select',
        label: '注册App版本',
        options: that.state.versionList,
        placeholder: 'Please select',
      },
    ];

    const settings = {
      data: data,
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: false,
      pageChange: false,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      defaultdate: [
        { name: (that.state.search.b || 'Cashlending') + `/` + `注册日期 :  ` + (!that.state.search.a ? moment(new Date()).format('YYYY.MM.DD') : that.state.search.a) + `/` + `天数 : ` + (!that.state.search.daysAfterRegister ? '2' : that.state.search.daysAfterRegister) + `天` },
      ],
    };

    return (
      <div className="DataWaistcoat" key="DataWaistcoat">
        <CLlist settings={settings} />
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
export default DataWaistcoat;
