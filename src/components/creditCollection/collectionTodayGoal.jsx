import React from 'react';
import QueueAnim from 'rc-queue-anim';
import {CLComponent} from '../../../src/lib/component/index';
import moment from 'moment';
import CLList from '../../../src/lib/component/CLlist.jsx';
import {CL} from '../../../src/lib/tools/index';
import {Interface} from '../../../src/lib/config/index';
import _ from 'lodash';
import CF from 'currency-formatter';
import {Button, DatePicker} from 'antd';

const {contentType, postLoanCreditorList, getCompanyList, collectionGroup} = Interface;

class CollectionTodayGoal extends CLComponent {
  state = {
    data: [],
    stage: '',
    stageList: [
      {name: 'S1-1', value: '2'},
      {name: 'S1-2', value: '3'},
      {name: 'S2', value: '4'},
      {name: 'M2', value: '5'},
      {name: 'M3', value: '6'},
    ],
    options: {
      groupName: [],
      companyList: []
    },
    tableLoading: false,
    search: {},
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let search;
    let sessionSearch = sessionStorage.getItem('search');
    try {
      sessionSearch ? search = JSON.parse(sessionSearch) : null;
    }
    catch (e) {
      throw new Error('json parse error');
    }

    this.setState({search: search});
    this.getCompanyListMth();
    this.collectionGroup();
    this.loadTable(search || this.state.search);
  }

  getFormFields = (fields) => {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'collectDate') {
          search.collectDate = doc.format('YYYY-MM-DD HH:mm:ss');
        } else {
          search[index] = doc;
        }
      }
    });
    this.loadTable(search);
    this.setState({search});
  }

  loadTable = (search) => {
    let _this = this;
    this.setState({tableLoading: true});
    let params = {
      stage: search && search.stage,
      date: search && search.collectDate,
      companyId: search && search. companyId,
      groupId: search && search.groupId,
    };
    const settings = {
      contentType,
      method: postLoanCreditorList.type,
      url: postLoanCreditorList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      if (res && res.data) {
        const list = res.data;
        // 保存当前的搜索条件 以及分页
        sessionStorage.setItem('search', JSON.stringify(search));
        _this.setState({data: list, tableLoading: false});
      }
    }

    CL.clReqwest({settings, fn});
  };

  getCompanyListMth = () => {
    let settings = {
        contentType,
        method: getCompanyList.type,
        url: getCompanyList.url,
        data: JSON.stringify({
            pageRequestDto: {
                currentPage: 1,
                limit: 1000,
                order: 'desc',
                sort: ['id']
            }
        })
    };

    CL.clReqwestPromise(settings)
        .then((res) => {
            if (res.status === "SUCCESS") {
                let options = this.state.options;
                options.companyList = res.response.rows.map(item => {
                    return {
                        name: item.name,
                        value: item.id
                    }
                }) || [];
                options.companyList.unshift({
                    name: 'Unipeso',
                    value: 0
                })
                this.setState({
                    options
                })
            }
        });
  };

  collectionGroup = () => {
    const that = this;
    const settings = {
      contentType,
      method: 'get',
      url: collectionGroup.url,
    };

    function fn(res) {
      if (res && res.data){
        const roles = [];
        _.each(res.data, (doc, index) => {
          roles.push({
            name: doc.name,
            value: doc.id,
          });
        });
        that.setState({
          options: _.assign(that.state.options, {
            groupName: roles,
          })
        });
        const collectors1 = that.state.collectors1.concat(roles);
        const collectors = that.state.collectors.concat(roles);
        that.setState({ collectors1: collectors1, collectors: collectors});
      }
    }
    CL.clReqwest({ settings, fn});
  }

  render(data) {
    const columns = [
      {
        title: 'Stage',
        dataIndex: 'stageName',
        key: 'stageName',
        width: '14%',
      },
      {
        title: 'Collector',
        dataIndex: 'collectorName',
        key: 'collectorName',
        width: '14%',
      },
      {
        title: 'Task',
        dataIndex: 'task',
        key: 'task',
        width: '14%',
      },
      {
        title: 'Outcome',
        dataIndex: 'outcome',
        key: 'outcome',
        width: '14%',
      },
      {
        title: 'Unit',
        dataIndex: 'unit',
        key: 'unit',
        width: '14%',
      },
      {
        title: 'Outcome/Task (today)',
        dataIndex: 'todayScale',
        key: 'todayScale',
        width: '14%',
      },
      {
        title: 'Outcome/Task (month)',
        dataIndex: 'monthScale',
        key: 'monthScale',
      },
    ];

    const operation = [
      {
        id: 'stage',
        type: 'select',
        label: 'Stage',
        options: this.state.stageList,
        placeholder: 'Please select',
      },

      {
        id: 'collectDate',
        type: 'dateTime',
        label: '日期',
        placeholder: 'ranger',
      },

      {
        id: 'groupId',
        type: 'select',
        label: 'Group',
        options: this.state.options.groupName,
        placeholder: 'Please select',
      },
      {
          id: 'companyId',
          type: 'select',
          label: 'Company',
          placeholder: 'Please select',
          options: this.state.options.companyList || []
      }
    ];

    const settings = {
      data: this.state.data,
      operation: operation,
      columns: columns,
      getFields: this.getFormFields,
      pagination: false,
      pageChange: false,
      tableLoading: this.state.tableLoading,
      search: this.state.search
    };

    return (
      <QueueAnim className="animate-content">
        <div className="Collection-today-goal" key="Collection-today-goal">
          <CLList settings={settings}/>
        </div>
      </QueueAnim>
    );
  }
}

export default CollectionTodayGoal;
