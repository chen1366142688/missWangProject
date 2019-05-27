import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import {CLComponent} from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import {CLAnimate, CL, SessionManagement} from '../../../src/lib/tools/index';
import {Interface} from '../../../src/lib/config/index';
import DashboardNew from './dashboardNew';
import _ from 'lodash';
import {
  Button,
  Icon,
  Modal,
  Row,
  Col,
  Tabs,
  Upload,
  Checkbox,
  Select,
  Input,
  InputNumber,
  message,
  DatePicker,
  List
} from 'antd';

const TabPane = Tabs.TabPane;
const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;
const confirm = Modal.confirm;
const {TextArea} = Input;
let req;

const {
  contentType,
  callRetrieveDistributionList,
  saveSaleRetrieveCollectorStatus,
  recallOrdersBatch,
  dipatchCallRetrieveOrdersBatch,
  collectorGroupSelect,
  collectorGroupAdd,
  collectorGroupDelete,
  collectorGroupUpdate,
  setSaleEvaluationGroup,
  operatorRoleType,
  getSaleManagementAdvisor,
  getSaleManagementLists,
  saleManagementRole,
  saleRoleAssignment,
  operatorStatusList,
  operatorQuickCreate,
  authRoleGroup,
  creditCollectionResetPassword,
  callSaleImportData,
  callSaleAdviseAllType
} = Interface;

const sessionCode = SessionManagement.getStorageList().callRetrieveManagement.distributionDashboard;

class CallRetrieveManagement extends CLComponent {
  state = {
    data1: [],
    data2: [],
    options: {
      status: [],
    },
    typeNameList: [],
    type: '1',
    roleMdal: false,
    statusModal: false,
    dispatchModal: false,
    recoveryModal: false,
    uploadModal: false,
    current: {},
    statusOptions: [],
    startTime: '',
    endTime: '',
    selectedRowKeys: [],
    calculation: {},
    dispatchDays: 0,
    collectorName: '',
    roleOptionsTwo: [],
    roleOptions: [],
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    sorter: {
      sortFieldType: 2,
      sortType: 1,
    },
    search: {},
    rolesList: [],
    rolesAllList: [],
    dispathedStatus: [
      {name: 'Distribution', value: 'true'},
      {name: 'Undistribution', value: 'false'},
    ],
    managerTypeModal: false,
    managerTypeModal2: false,
    addTypeModal: false,
    statusOptions1: [],
    statusOptions2: [],
    addTypeTemp: '',
    groupAllList: [],
    RoleOptions: [],
    SexList: [
      {name: 'Male', value: 2},
      {name: 'Female', value: 1},
    ],
    loginName: '',
    sex: '',
    fullName: '',
    roles: [],
    paramsList: {},
    fileList: [],
    couponManage: [],
  };

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'tabChange',
      'getFormFields',
      'pageChage',
      'handleCancel',
      'handleCancle',
      'showModal',
      'checkboxChange',
      'statusChange',
      'handleOk',
      'startTimeChange',
      'endTimeChange',
      'selectKeyChange',
      'collectorChange',
      'dispatchDaysChange',
      'showTypeModal',
      'handleTypeAdd',
      'editType',
      'handleAddTypeOk',
      'handleTempTypeChange',
      'loadTypeContentData',
      'handleTypeDelete',
      'handleUpdateTypeOk',
      'handleTempTypeUpdateChange',
      'statusChange1',
      'statusChange2',
      'loadTypeContentData1',
      'showTypeModal2',
      'operatorQuickCreate',
    ]);
  }

  componentDidMount() {
    const that = this;
    const e = sessionStorage.getItem('operateDataType') || '1';
    this.setState({
      type: e,
    });

    this.loadAdvisor();
    this.loadData();
    this.loadData2(this.state.search, this.state.pagination, this.state.sorter);
    this.loadData3();
    this.loadTypeContentData();
    this.loadTypeContentData1();
    this.operatorStatusList();
    this.authRoleGroup();
    this.callSaleAdviseAllType();
  }

  componentWillUnmount() {
    SessionManagement.destroySession(sessionCode);
  }

  // 加载列表数据数据
  loadData(search, page, sorter) {
    const that = this;
    that.setState({tableLoading: true});
    const settings = {
      contentType,
      method: getSaleManagementLists.type,
      url: getSaleManagementLists.url
    };

    function fn(res) {
      that.setState({tableLoading: false});

      const roles = [];
      const allRoles = [];

      _.each(res.data, (doc) => {
        if (doc.statusString === '正常') {
          doc.statusString = 'normal';
          roles.push({
            name: doc.fullName,
            value: doc.id.toString(),
          });
        } else if (doc.statusString === '休息') {
          doc.statusString = 'rest';
        }
        // })
        allRoles.push({
          name: doc.fullName,
          value: doc.id.toString(),
        });
      });
      that.setState({
        data1: res.data,
        rolesList: roles
      });
    }

    CL.clReqwest({
      settings,
      fn,
    });
  }

  loadAdvisor = () => {
    const that = this;
    that.setState({tableLoading: true});
    const settings = {
      contentType,
      method: getSaleManagementAdvisor.type,
      url: getSaleManagementAdvisor.url
    };

    function fn(res) {
      that.setState({tableLoading: false});

      const allRoles = [];

      _.each(res.data, (doc) => {
        allRoles.push({
          name: doc.loginName,
          value: doc.id.toString(),
        });
      });
      that.setState({
        rolesAllList: allRoles,
      });
    }

    CL.clReqwest({
      settings,
      fn,
    });
  };

  // 加载列表数据数据
  loadData2(search, page, sorter) {
    const that = this;
    that.setState({tableLoading: true});
    const settings = {
      contentType,
      method: callRetrieveDistributionList.type,
      url: callRetrieveDistributionList.url,
      data: JSON.stringify({
        page: {
          currentPage: page.currentPage,
          pageSize: page.pageSize
        },
        ...search,
      }),
    };

    function fn(res) {
      if (res && res.data) {
        const pagination = _.extend(page, {
          total: res.data.page.totalCount,
          pageSize: res.data.page.pageSize
        });

        SessionManagement.setSessionBatch(sessionCode, {
          pagination,
          search,
          sorter
        });

        that.setState({tableLoading: false});
        that.setState({
          data2: res.data.page.result,
          pagination,
        });
      }
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({
      settings,
      fn,
    });
  }

  // loadData3
  // 获取第一个Operate弹窗的复选值
  loadData3(search, page, sorter) {
    const that = this;
    that.setState({tableLoading: true});
    const settings = {
      contentType,
      method: saleManagementRole.type,
      url: saleManagementRole.url,
      // data: JSON.stringify(params)
    };

    // debugger;
    function fn(res) {
      that.setState({tableLoading: false});
      let roleOptions = [];
      const arr = new Array();
      if (res.data) {
        roleOptions = res.data.map((doc) => {
          doc.roleName = doc.roleName.toString();
          arr.push(doc.roleName);
          return doc;
        });
        that.setState({roleOptionsTwo: arr});
      }

      const roles = [];
      const allRoles = [];

      _.each(res.data, (doc) => {
        if (doc.statusString === '正常') {
          doc.statusString = 'statusString';
          roles.push({
            name: doc.fullName,
            value: doc.id.toString(),
          });
        }

        allRoles.push({
          name: doc.fullName,
          value: doc.id.toString(),
        });
      });

      that.setState({
        roleOptions: roleOptions,
      });
    }

    CL.clReqwest({
      settings,
      fn,
    });
  }

  // 获取管理员状态下拉列表
  operatorStatusList = () => {
    const that = this;
    const settings = {
      contentType,
      method: operatorStatusList.type,
      url: operatorStatusList.url,
    };

    function fn(res) {
      if (res.data) {
        let sopt = [];
        if (res && res.data) {
          sopt = res.data.map((doc) => {
            doc.type = doc.type.toString();
            if (doc.typeName === '正常') {
              doc.name = 'normal';
            } else if (doc.typeName === '休息') {
              doc.name = 'rest';
            } else if (doc.typeName === '冻结') {
              doc.name = 'Freeze';
            }
            return doc;
          });
        }
        that.setState({statusOptions: sopt});
      }
    }

    CL.clReqwest({settings, fn});
  }

  // 分类获取权限列表
  authRoleGroup = () => {
    const that = this;
    const settings = {
      contentType,
      method: authRoleGroup.type,
      url: authRoleGroup.url + `callretrieve`,
    };

    function fn(res) {
      if (res.data) {
        that.setState({RoleOptions: res.data});
      }
    }

    CL.clReqwest({settings, fn});
  };


  // 切换tab
  tabChange(e) {
    this.setState({
      type: e,
      search: {},
      selectedRowKeys: [],
    });

    if (e === '1') {
      this.loadData();
      this.loadData3();
    } else if (e === '2') {
      const {pagination, sorter, search} = SessionManagement.getSession(sessionCode);
      this.setState({search});
      this.loadData2(search || this.state.search, pagination || this.state.pagination, sorter || this.state.sorter);
      this.loadTypeContentData();
    }
    // this.loadRoleData();
    sessionStorage.setItem('operateDataType', e);
  }

  // 获取搜索项
  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        search[index] = doc;
      }
    });

    const pagination = this.state.pagination;
    pagination.currentPage = 1;

    this.setState({
      search: search,
      pagination: pagination,
    });
    this.loadData2(search, pagination, this.state.sorter);
  }

  // 显示弹窗
  showModal(target, current) {
    if (_.indexOf(['dispatchModal', 'recoveryModal'], target) > -1) {
      if (!this.state.selectedRowKeys || !this.state.selectedRowKeys.length) {
        message.error('you must select at least one data');
        return;
      }
      this.selectKeyOper({type: target});
    }

    const arr = [];
    if (target === 'roleMdal') {
      this.state.roleOptions.map((doc) => {
        if (_.indexOf(doc.label) > -1) {
          arr.push(doc.roleName);
        }
      });
      this.setState({
        currentChecked: arr,
      });
    }

    this.setState({
      [target]: true,
      current: current || {},
    });
  }

  // 隐藏弹窗
  handleCancel(target) {
    this.setState({
      [target]: false,
      calculation: {},
    });
  }

  // 设定催收员权限
  checkboxChange(e) {
    this.setState({currentChecked: e});
  }

  // 设定催收员状态
  statusChange(e) {
    this.setState({currentStatus: e});
  }

  // 设定请假开始日期
  startTimeChange(e) {
    this.setState({startTime: new Date(e.format('YYYY-MM-DD HH:mm:ss')).getTime()});
  }

  // 设定请假截止日期
  endTimeChange(e) {
    this.setState({endTime: new Date(e.format('YYYY-MM-DD HH:mm:ss')).getTime()});
  }

  selectKeyChange(e) {
    this.setState({selectedRowKeys: e});
  }

  collectorChange(e) {
    this.setState({collectorName: e});
  }

  dispatchDaysChange(e) {
    this.setState({dispatchDays: e});
  }

  statusChange1(e) {
    this.setState({currentStatus1: e});
  }

  statusChange2(e) {
    this.setState({currentStatus2: e});
  }

  showTypeModal() {
    this.setState({managerTypeModal: true});
  }

  showTypeModal2() {
    this.setState({managerTypeModal2: true});
  }

  handleCancle() {
    this.setState({
      managerTypeModal: false,
      managerTypeModal2: false,
      addTypeModal: false,
      updateTypeModal: false,
      managerContentModal: false,
      addContentModal: false,
      updateContentModal: false,
      statusModals: false,
      statusModals1: false,
      createAccountModal: false,
      paramsList: {},
      uploadModal: false,
      tableLoading: false,
      fileList: [],
    });
  }

  loadTypeContentData1() {
    const that = this;
    const settings = {
      contentType,
      method: operatorRoleType.type,
      url: operatorRoleType.url,
    };

    function fn(res) {
      let arr = [];
      if (res.data) {
        arr = res.data.map((doc) => {
          doc.name = doc.typeName;
          return doc;
        });
      }
      that.setState({
        // typeList1: res.data,
        statusOptions2: res.data,
      });
    }

    CL.clReqwest({
      settings,
      fn,
    });
  }

  emptyNotify = (name, value) => {
    let res = true;
    if (value == null || typeof value == "undefined" || value === []) {
      confirm({
        title: `${name} is required.`,
      });
      res = false;
    }
    return res;
  };
  validForm = (params) => {
    let res = true;
    res = !res ? res : this.emptyNotify('loginName', params.loginName);
    res = !res ? res : this.emptyNotify('fullName', params.fullName);
    res = !res ? res : this.emptyNotify('sex', params.sex);
    res = !res ? res : this.emptyNotify('roles', params.roles);
    return res;
  };

  operatorQuickCreate() {
    const that = this;
    let params = {password: '123456',};
    params = _.extend(params, that.state.paramsList);
    let validRes = that.validForm(params);
    if (!validRes) {
      return;
    }
    confirm({
      content: 'Whether to do?',
      onOk() {
        let params = {password: '123456',};
        params = _.extend(params, that.state.paramsList);
        const settings = {
          contentType,
          method: operatorQuickCreate.type,
          url: operatorQuickCreate.url,
          data: JSON.stringify(params),
        };

        function fn(res) {
          that.setState({createAccountModal: false, paramsList: {}});
          that.loadData();
        }

        CL.clReqwest({settings, fn});
      },
    });
  }

  onChange = (e, target) => {
    let paramsList = this.state.paramsList;
    let eValue = typeof e == 'string' ? _.trim(e) : e;
    paramsList[target] = eValue;
    this.setState({paramsList});
  }
  createAccountModal = () => {
    this.setState({createAccountModal: true});
  }

  handleAddTypeOk(e) {
    const that = this;
    if (this.state.addTypeTemp == null) {
      message.error('message is empty!');
    } else {
      const settings = {
        contentType,
        method: collectorGroupAdd.type,
        url: collectorGroupAdd.url,
        data: JSON.stringify({
          name: this.state.addTypeTemp,
          groupType: 3,
        }),
      };

      function fn(res) {
        if (res.data) {
          message.info(res.result);
          that.loadTypeContentData();
          that.handleCancleWithParams({addTypeModal: false});
        }
      }

      CL.clReqwest({settings, fn,});
    }
  }

  handleTempTypeChange(e) {
    this.setState({addTypeTemp: e.target.value});
  }

  handleTempTypeUpdateChange(e) {
    this.setState({updateTypeTemp: e.target.value});
  }

  handleTypeDelete(e) {
    const that = this;
    confirm({
      title: 'delete',
      content: 'Whether or not to delete ?',
      onOk() {
        const settings = {
          contentType,
          method: collectorGroupDelete.type,
          url: collectorGroupDelete.url,
          data: JSON.stringify({
            id: e.id,
            groupType: 2,
          }),
        };

        function fn(res) {
          if (res.data) {
            message.info(res.result);
            that.loadData();
            that.loadTypeContentData();
            that.handleCancle();
          }
        }

        CL.clReqwest({
          settings,
          fn,
        });

        console.log('you click submit button');
      },
      onCancel() {
        console.log('you click cancle button');
      },
    });
  }

  handleCancleWithParams(e) {
    this.setState(e);
  }

  handleTypeAdd(e) {
    this.setState({addTypeModal: true});
  }

  editType(e) {
    this.setState({
      addTypeModal: false,
      updateTypeModal: true,
      updateTypeId: e.id,
      updateTypeName: e.name,
      updateTypeTemp: e.name,
    });
  }

  // 获取弹窗列表
  loadTypeContentData() {
    const that = this;
    const settings = {
      contentType,
      method: collectorGroupSelect.type,
      url: collectorGroupSelect.url,
      data: JSON.stringify({groupType: 3}),
    };

    function fn(res) {
      let arr = [];
      if (res.data) {
        arr = res.data.map((doc) => {
          doc.name = doc.name.toString();
          return doc;
        });
      }
      const allGroup = [];
      _.each(res.data, (doc) => {
        allGroup.push({
          name: doc.name,
          value: doc.id.toString(),
        });
      });
      that.setState({
        typeList: res.data,
        statusOptions1: arr,
        groupAllList: allGroup,
      });
    }

    CL.clReqwest({
      settings,
      fn
    });
  }

  handleUpdateTypeOk(e) {
    const that = this;
    if (that.state.updateTypeTemp == null) {
      message.error('type value can not be null!');
    } else {
      // 弹窗修改类型弹窗提交接口
      const settings = {
        contentType,
        method: collectorGroupUpdate.type,
        url: collectorGroupUpdate.url,
        data: JSON.stringify({
          name: this.state.updateTypeTemp,
          id: this.state.updateTypeId,
          groupType: 3,
        }),
      };

      function fn(res) {
        if (res.data) {
          message.info(res.result);
          that.loadTypeContentData();
          that.handleCancleWithParams({updateTypeModal: false});
        }
      }

      CL.clReqwest({
        settings,
        fn
      });
    }
  }

  // list 切换页面
  pageChage(e, filters, sorter) {
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };

    const SORTDIC = {
      applicationTime: 2,
      memberRegisterDate: 1,
      descend: 1,
      ascend: 2,
      sRepaymentTime: 3,
      fRepaymentTime: 4,
      overdueDays: 5,
    };

    const sorterClient = {
      sortFieldType: SORTDIC[sorter.field] || 3,
      sortType: SORTDIC[sorter.order] || 1,
    };

    this.setState({
      pagination: pagination,
      sorter: sorterClient,
    });
    this.loadData2(this.state.search, pagination, sorterClient);
  }

  // 弹窗确定按钮
  handleOk(type) {
    const that = this;
    const {
      currentChecked, currentStatus, currentStatus1, currentStatus2, startTime, endTime, current, calculation, dispatchDays, collectorName, selectedRowKeys,
    } = that.state;
    let settings;
    let fn;

    if (type === 'roleMdal') { // 更新用户权限
      if (!currentChecked || !currentChecked.length) {
        message.error('You must pick at least one role');
        return;
      }

      confirm({
        title: 'Do you Want to save these roles?',
        content: 'sure to save roles for user',
        onOk() {
          const rolesArray = new Array();
          for (const x in that.state.roleOptions) {
            for (const y in that.state.currentChecked) {
              if (that.state.roleOptions[x].roleName == that.state.currentChecked[y]) {
                rolesArray.push(that.state.roleOptions[x].id);
              }
            }
          }

          // console.log(rolesArray)
          settings = {
            contentType,
            method: saleRoleAssignment.type,
            url: saleRoleAssignment.url,
            data: JSON.stringify({
              operatorId: current.id,
              roles: rolesArray,
            }),
          };
          fn = function (res) {
            if (res && res.data) {
              that.setState({roleMdal: false});
              message.success('Save success');
              that.loadData();
            }
          };
          CL.clReqwest({
            settings,
            fn,
          });
          // that.submitData(settings, fn)
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    } else if (type === 'statusModal') { // 更新yo用户状态
      if (currentStatus === current.status) {
        message.error('You haven\'t changed the status');
        return;
      }

      if (currentStatus === '3') { // this is normal
        if (!startTime) {
          message.error('The date from the start of the holiday cannot be empty!');
          return;
        }
        if (!endTime) {
          message.error('The end of the holiday must not be empty!');
          return;
        }
      }
      // debugger;
      confirm({
        title: 'Do you Want to save these status?',
        content: 'sure to save status for user',
        onOk() {
          settings = {
            contentType,
            method: saveSaleRetrieveCollectorStatus.type,
            url: saveSaleRetrieveCollectorStatus.url,
            data: JSON.stringify({
              operatorId: current.id,
              startTime: startTime,
              endTime: endTime,
              status: currentStatus,
            }),
          };

          fn = function (res) {
            if (res && res.data) {
              that.loadData();
              that.setState({statusModal: false});
              message.success('Save success');
            }
          };

          that.submitData(settings, fn,);
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    } else if (type === 'dispatchModal') { // 手工分配催收单
      if (!collectorName) {
        message.error('You nust pick a collector');
        return;
      }

      if (!selectedRowKeys || !selectedRowKeys.length) {
        message.error('Sorry, only one application can be dispatched at one time.！');
        return;
      }

      if (!calculation.allowed) {
        message.error('There is no data for modify');
        return;
      }

      confirm({
        title: 'Do you Want to distribute these orders?',
        content: 'sure to distribute these orders',
        onOk() {
          settings = {
            contentType,
            method: dipatchCallRetrieveOrdersBatch.type,
            url: dipatchCallRetrieveOrdersBatch.url,
            data: JSON.stringify({
              operatorId: collectorName,
              applicationIdList: calculation.valuable,
            }),
          };

          fn = function (res) {
            if (res && res.data) {
              that.loadData2(that.state.search, that.state.pagination, that.state.sorter);
              that.setState({
                dispatchModal: false,
                selectedRowKeys: [],
              });

              if (!res.data.length) {
                message.success('Operate success!');
              } else {
                message.error(`Operate success, but there are ${res.data.length} items failed because of roles`);
              }
            }
          };

          that.submitData(settings, fn);
        },

        onCancel() {
          console.log('Cancel');
        },
      });
    } else if (type === 'recoveryModal') { // 手动撤销分配
      if (!calculation.allowed) {
        message.error('There is no data for modify');
        return;
      }

      confirm({
        title: 'Do you Want to recall these data?',
        content: 'sure to recall these data',
        onOk() {
          settings = {
            contentType,
            method: recallOrdersBatch.type,
            url: `${recallOrdersBatch.url}`,
            data: JSON.stringify({
              applicationIdList: calculation.valuable,
            }),
          };
          fn = function (res) {
            if (res && res.data) {
              that.loadData2(that.state.search, that.state.pagination, that.state.sorter);
              that.setState({
                recoveryModal: false,
                selectedRowKeys: [],
              });
              message.success('Save success');
            }
          };

          that.submitData(settings, fn);
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    } else if (type === 'statusModal1') {
      confirm({
        title: '  Operate successfully?',
        content: 'The new password id 123456',
        onOk() {
          settings = {
            contentType,
            method: creditCollectionResetPassword.type,
            url: `${creditCollectionResetPassword.url}${current.id}`,
          };
          fn = function (res) {
            if (res && res.code == 200) {
              that.loadData();
              that.setState({statusModals: false});
            }
          };

          that.submitData(settings, fn);
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    } else if (type === 'statusModal2') {
      confirm({
        title: 'Do you Want to save these status?',
        content: 'sure to save status for user',
        onOk() {
          settings = {
            contentType,
            method: setSaleEvaluationGroup.type,
            url: setSaleEvaluationGroup.url,
            data: JSON.stringify({
              operatorId: current.id,
              code: currentStatus2,
              evaluationGroupId: currentStatus1,
            }),
          };
          fn = function (res) {
            if (res && res.data) {
              that.loadData();
              that.setState({statusModals1: false});
              message.success('Save success');
            }
          };

          that.submitData(settings, fn);
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    }
  }

  // 待修改
  selectKeyOper({type}) {
    const that = this;
    const {data2, selectedRowKeys} = that.state;
    const calculation = {
      allowed: 0,
      denied: 0,
      total: selectedRowKeys.length,
      valuable: [],
    };

    const TYPE = {
      dispatchModal: true,
      recoveryModal: false,
    };

    _.each(data2, (doc, index) => {
      if (_.indexOf(selectedRowKeys, doc.id) > -1) {
        if (doc.dispatched === TYPE[type]) {
          calculation.denied++;
        } else {
          calculation.allowed++;
          calculation.valuable.push(doc.id);
        }
      }
    });

    that.setState({calculation});
    return calculation;
  }

  submitData(settings, fn) {
    CL.clReqwest({
      settings,
      fn,
    });
  }

  handleReset = () => {
    this.setState({
      pagination: {},
      search: {}
    });
  };

  onCreate = () => {
    this.setState({uploadModal: true});
  };

  TypeContent = (e) => {
    if (e.target.value.length >= 30) {
      message.error('Limit 30 characters...')
    }
    this.setState({typeContent: e.target.value});
  };

  uploadSave = () => {
    const that = this;
    if (!that.state.info) {
      message.error('Excel is required');
    } else if (!that.state.typeContent) {
      message.error('type is required');
    } else {
      confirm({
        content: 'Whether to submit?',
        onOk() {
          that.setState({tableLoading: true});
          let formData = new FormData(that.state.info.file);
          formData.append('file', that.state.info.file);
          formData.append('name ', that.state.typeContent)
          const settings = {
            contentType,
            method: callSaleImportData.type,
            url: callSaleImportData.url,
            data: formData,
            processData: false,
          };

          function fn(res) {
            if (res && res.code === 200) {
              message.success('Operate successfully.' + res.data + ' users have been distributed');
              that.loadData2(that.state.search, that.state.pagination);
              that.setState({uploadModal: false, fileList: [], tableLoading: false});
            }
          }

          CL.clReqwest({settings, fn});
        }
      })
    }
  };

  onRemoves = (e) => {
    this.setState({fileList: [], info: {}});
  };

  customRequest = (info) => {
    const that = this;
    const fileList = that.state.fileList;
    if (info.file) {
      const reader = new FileReader();
      let imgUrlBase64 = reader.readAsDataURL(info.file);
      reader.onload = function (e) {
        info.file.url = reader.result;
        fileList.push(info.file);
        that.setState({info: info, fileList: fileList});
      };
    }
  };

  callSaleAdviseAllType = () => {
    const that = this;
    const settings = {
      contentType,
      method: callSaleAdviseAllType.type,
      url: callSaleAdviseAllType.url,
    };

    function fn(res) {
      if (res.data) {
        let arr = [];
        _.map(res.data.typeName,(doc)=>{
          arr.push({
            value: doc,
            name: doc,
          });
        })
        that.setState({typeNameList: arr});
      }
    }

    CL.clReqwest({settings, fn});
  }

  renderBody() {
    const that = this;
    let fileList = that.state.fileList;
    const uploadButton = (<Button><Icon type="upload"/> Upload Excel</Button>);
    const props = {
      listType: 'picture',
      defaultFileList: [...fileList],
      className: 'upload-list-inline',
      accept: ".xls,.xlsx",
      customRequest: that.customRequest,
      onRemove: that.onRemoves,
    };
    let settings = {
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      sessionCode,
      handleReset: this.handleReset
    };

    const {
      data1, data2, type, selectedRowKeys, roleOptions, groupAllList
    } = that.state;
    const roleArr = roleOptions.map((doc) => {
      return doc.label;
    });

    const columns1 = [
      {
        title: 'Group',
        dataIndex: 'callRetrieveName',
        width: '8%',
        render(text,record){
          if(!record.callRetrieveName){
            return '—'
          }
          return record.callRetrieveName
        }
      },
      {
        title: 'Group role',
        dataIndex: 'callRetrieveRoleType',
        render(text, record) {
          if (text == '2') {
            return 'Member';
          } else if (text == '1') {
            return 'Leader';
          }else{
            return '—'
          }
        },
        width: '8%',
      },
      {
        title: 'Auditor',
        dataIndex: 'loginName',
        width: '8%',
      },
      {
        title: 'Roles',
        dataIndex: 'roles',
        render(index, record) {
          return `${record.roles} `;
        },
        width: '10%',
      },

      {
        title: 'Status',
        dataIndex: 'statusString',
        width: '8%',
      },
      {
        title: 'Rest time',
        dataIndex: 'leaveStartDate',
        render(index, record) {
          if (record.leaveStartDate && record.leaveEndDate) {
            return `${moment(new Date(record.leaveStartDate))
              .format('YYYY.MM.DD HH:mm')} ~ ${moment(new Date(record.leaveEndDate))
              .format('YYYY.MM.DD HH:mm')}`;
          }
          return '—';
        },
        width: '10%',
      },
      {
        title: 'Operate',
        dataIndex: 'operation',
        render: function (index, record) {
          return [
            <Button
              value="default"
              onClick={() => that.showModal('roleMdal', record)}
            >Role setting</Button>,
            <Button
              value="default"
              onClick={() => that.showModal('statusModal', record)}
              style={{
                marginLeft: '5px',
                marginRight: '5px'
              }}
            >Status change</Button>,
            <Button value="default" style={{marginRight: '5px'}}
                    onClick={() => that.showModal('statusModals1', record)}>Group change</Button>,
            <Button value="default" onClick={() => that.showModal('statusModals', record)}>Reset password</Button>
          ];
        },
      },
    ];

    const operation1 = null;

    const columns2 = [
      {
        title: 'Call No',
        dataIndex: 'id',
        width: '10%',
      },
      {
        title: 'Type',
        dataIndex: 'typeName',
        width: '10%',
        render(index,record){
          if(!record.typeName){
            return '—';
          }else{
            return record.typeName;
          }
        }
      },
      {
        title: 'User Name',
        dataIndex: 'userName',
        width: '10%',
        render(index,record){
          if(!record.userName){
            return '—';
          }else{
            return record.userName;
          }
        }
      },
      {
        title: 'User Phone',
        dataIndex: 'userPhone',
        width: '10%',
        render(index,record){
          if(!record.userPhone){
            return '—';
          }else{
            return record.userPhone;
          }
        }
      },
      {
        title: 'APP',
        dataIndex: 'versionName',
        width: '10%',
        render(index,record){
          if(!record.versionName){
            return '—'; 
          }else{
            return record.versionName;
          }
        }
      },
      {
        title: 'Quit time',
        dataIndex: 'quitTime',
        width: '10%',
        render(index, record) {
          if(!record.quitTime){
            return '—'
          }
          return moment(index)
            .format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: 'Advisor',
        dataIndex: 'operatorName',
        width: '10%',
        render(index,record){
          if(!record.operatorName){
            return '—'; 
          }else{
            return record.operatorName;
          }
        }
      },
      {
        title: 'Group',
        dataIndex: 'groupName',
        width: '10%',
        render(index, record) {
          if (record.groupName == '——' || !record.groupName) {
            return '—';
          }
          return record.groupName;
        },
      },
      {
        title: 'Distributor',
        dataIndex: 'dispatchedByName',
        width: '10%',
        render(index, record) {
          return record.dispatchedByName || '—';
        },
      },
    ];


    const operation2 = [
      {
        id: 'callNo',
        type: 'text',
        label: 'CallNo',
        placeholder: 'Input Call No',
      },

      {
        id: 'operatorId',
        type: 'select',
        label: 'Advisor',
        options: that.state.rolesAllList,
        placeholder: 'Please select',
      },

      {
        id: 'groupId',
        type: 'select',
        label: 'Group',
        options: that.state.groupAllList,
        placeholder: 'Please select',
      },

      {
        id: 'typeName',
        type: 'select',
        label: 'Type',
        options: that.state.typeNameList,
        placeholder: 'Please select',
      },
    ];

    const rowSelection = {
      selectedRowKeys: that.state.selectedRowKeys,
      onChange: that.selectKeyChange,
    };

    const btn = [
      {
        title: 'Distribute',
        type: 'primary',
        fn: () => {
          that.showModal('dispatchModal');
        },
      }
    ];

    const btnTow = [
      {
        title: 'Upload',
        type: 'primary',
        fn: that.onCreate,
      }
    ];

    if (type === '1') {
      settings = _.extend(settings, {
        data: data1,
        columns: columns1,
        operation: operation1,
        pagination: false,
      });
    } else if (type === '2') {
      settings = _.extend(settings, {
        data: data2,
        columns: columns2,
        operation: operation2,
        btn,
        btnTow,
        rowSelection,
      });
    }
    return (
      <div className="call-retrieve-management" key="credit-collection">
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>
          <TabPane tab="Sale Management" key="1">
            <Row>
              <Col span={4} offset={15} className="title">
                <Button type="primary" visible={this.state.hasButton} onClick={this.showTypeModal2}>
                  Group Setting
                </Button>
              </Col>
              <Col span={4} className="title">
                <Button style={{marginLeft: '-40px'}} type="primary" visible={this.state.hasButton}
                        onClick={this.createAccountModal}>
                  Create account
                </Button>
              </Col>
            </Row>
            <CLlist settings={settings}/>
          </TabPane>
          {/* <TabPane tab="Distribution Dashboard" key="2">
            <CLlist settings={settings}/>
          </TabPane> */}
          <TabPane tab="Distribution Dashboard(New)" key="2">
            <DashboardNew />
          </TabPane>

        </Tabs>

        <Modal
          title="Role Management"
          visible={that.state.roleMdal}
          onOk={() => {
            that.handleOk('roleMdal');
          }}
          onCancel={() => {
            that.handleCancel('roleMdal');
          }}
          okText="Confirm"
          cancelText="Cancel"
          mask={false}
        >
          <Row style={{marginTop: 20}}>
            <Col span={8}>
              <strong>Username:</strong> {that.state.current.name}
            </Col>
            <Col span={8}>
              <strong>Status:</strong> {that.state.current.status}
            </Col>
          </Row>
          <Row style={{marginTop: 20}}>
            <Col span={24}>
              <CheckboxGroup options={that.state.roleOptionsTwo} onChange={that.checkboxChange}/>
            </Col>
          </Row>
        </Modal>

        <Modal
          title="Status Management"
          visible={that.state.statusModal}
          onOk={() => {
            that.handleOk('statusModal');
          }}
          onCancel={() => {
            that.handleCancel('statusModal');
          }}
          okText="Confirm"
          cancelText="Cancel"
          mask={false}
        >
          <Row style={{marginTop: 20}}>
            <Col span={8}>
              <strong>Username:</strong> {that.state.current.name}
            </Col>
            <Col span={8}>
              <strong>Status:</strong> {that.state.current.status}
            </Col>
          </Row>
          <Row style={{marginTop: 20}}>
            <Col span={10}>
              <strong>Status: </strong>
              <Select defaultValue={that.state.current.status} style={{width: 200}} onChange={that.statusChange}>
                {
                  that.state.statusOptions.map((doc) => {
                    return (<Option key={doc.name} value={doc.type}>{doc.name}</Option>);
                  })
                }
              </Select>
            </Col>
          </Row>
          <br/>
          <Row>
            {
              that.state.currentStatus && that.state.currentStatus === '3' ? (
                <div>
                  <Col span={10}>
                    <strong>Start time: </strong>
                    <DatePicker
                      showTime
                      allowClear={false}
                      format="YYYY-MM-DD HH:mm"
                      placeholder="Select Time"
                      onChange={that.startTimeChange}
                    />
                  </Col>
                  <Col span={10}>
                    <strong>End time: </strong>
                    <DatePicker
                      showTime
                      allowClear={false}
                      format="YYYY-MM-DD HH:mm"
                      placeholder="Select Time"
                      onChange={that.endTimeChange}
                    />
                  </Col>
                </div>
              ) : ''
            }
          </Row>
        </Modal>

        <Modal
          title="Dispatch"
          visible={that.state.dispatchModal}
          onOk={() => {
            that.handleOk('dispatchModal');
          }}
          onCancel={() => {
            that.handleCancel('dispatchModal');
          }}
          okText="Confirm"
          cancelText="Cancel"
          mask={false}
        >
          <Row style={{marginTop: 20}}>
            <Col span={6}>
              <strong>Total:</strong> {that.state.calculation.total}
            </Col>
          </Row>
          <Row style={{marginTop: 20}}>
            <Col span={12}>
              <strong>Select Auditor: </strong>
              <Select style={{width: 200}} onChange={that.collectorChange}>
                {
                  that.state.rolesAllList.map((doc) => {
                    return (<Option key={doc.name} value={doc.value}>{doc.name}</Option>);
                  })
                }
              </Select>
            </Col>
          </Row>
        </Modal>

        <Modal
          title="Recall"
          visible={that.state.recoveryModal}
          onOk={() => {
            that.handleOk('recoveryModal');
          }}
          onCancel={() => {
            that.handleCancel('recoveryModal');
          }}
          okText="Confirm"
          cancelText="Cancel"
          mask={false}
        >
          <Row style={{marginTop: 20}}>
            <Col span={6}>
              <strong>Total:</strong> {that.state.calculation.total}
            </Col>
            <Col span={6}>
              <strong style={{color: 'green'}}>Allowed:</strong> {that.state.calculation.allowed}
            </Col>
            <Col span={6}>
              <strong style={{color: 'red'}}>Denied:</strong> {that.state.calculation.denied}
            </Col>
          </Row>
        </Modal>
        <Modal
          title="Group Setting"
          visible={that.state.managerTypeModal2}
          onOk={that.handleCancle}
          onCancel={that.handleCancle}
          cancelText="Cancel"
          mask={false}
          style={{width: '2000px'}}
        >
          <Row style={{marginTop: 20}}>
            <Col>
              <List
                bordered
                dataSource={this.state.typeList}
                renderItem={item => (
                  <List.Item actions={[<a onClick={that.editType.bind(null, item)}>Rename</a>,
                    <a onClick={that.handleTypeDelete.bind(that, item)}>Delete</a>]}
                  >
                    {item.name}
                  </List.Item>)}
              />
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Button type="primary" onClick={this.handleTypeAdd}>New</Button>
            </Col>
          </Row>
        </Modal>
        <Modal
          title="New"
          visible={that.state.addTypeModal}
          onCancel={that.handleCancle}
          onOk={that.handleAddTypeOk}
          cancelText="cancle"
          okText="Confirm"
          mask={false}
          style={{width: '2000px'}}
        >
          <Row style={{marginTop: 20}}>
            <Col span={6}>
              <h4>Group name:</h4>
            </Col>
          </Row>

          <Row style={{marginTop: 20}}>
            <Col>
              <Input placeholder="please input type" onChange={that.handleTempTypeChange}/>
            </Col>
          </Row>
        </Modal>
        <Modal
          title="Notice"
          visible={that.state.statusModals}
          onOk={() => {
            that.handleOk('statusModal1');
          }}
          onCancel={that.handleCancle}
          okText="Yes"
          cancelText="No"
          mask={false}
        >
          <Row style={{marginTop: 20}}>
            <Col span={22}>
              <strong>Whether to reset the password to initial password ? </strong>
            </Col>
          </Row>
        </Modal>
        <Modal
          title=""
          visible={that.state.statusModals1}
          onOk={() => {
            that.handleOk('statusModal2');
          }}
          onCancel={that.handleCancle}
          okText="Confirm"
          cancelText="Cancel"
          mask={false}
        >
          <Row style={{marginTop: 20}}>
            <Col span={22}>
              <p style={{display: 'block', fontWeight: 'bold'}}> The user will be devided to new group and group role
                : </p>
              <span style={{display: 'inline-block', paddingRight: 35,}}>Group: </span>
              <Select
                defaultValue={that.state.current.status}
                style={{width: 200}}
                onChange={that.statusChange1}
              >
                {
                  that.state.statusOptions1.map((doc) => {
                    return (<Option key={doc.name} value={doc.id}>{doc.name}</Option>);
                  })
                }
              </Select>
            </Col>
          </Row>
          <Row style={{marginTop: 20}}>
            <Col span={22}>
              <span>Group Role: </span>
              <Select
                // defaultValue={that.state.current.status}
                style={{width: 200}}
                onChange={that.statusChange2}
              >
                {
                  that.state.statusOptions2.map((doc) => {
                    return (<Option key={doc.name} value={doc.type}>{doc.name}</Option>);
                  })
                }
              </Select>
            </Col>
          </Row>
        </Modal>
        <Modal
          title="Rename"
          visible={that.state.updateTypeModal}
          onCancel={that.handleCancle}
          onOk={that.handleUpdateTypeOk}
          cancelText="cancle"
          okText="save"
          mask={false}
          style={{width: '2000px'}}
        >
          <Row style={{marginTop: 20}}>
            <Col span={6}>
              <h4>Group name:</h4>
            </Col>
          </Row>

          <Row style={{marginTop: 20}}>
            <Col>
              <Input
                placeholder={that.state.updateTypeName}
                onChange={that.handleTempTypeUpdateChange}
                value={that.state.updateTypeTemp}
              />
            </Col>
          </Row>
        </Modal>
        <Modal
          title="New"
          visible={that.state.addTypeModal}
          onCancel={that.handleCancle}
          onOk={that.handleAddTypeOk}
          cancelText="cancle"
          okText="Confirm"
          mask={false}
          style={{width: '2000px'}}
        >
          <Row style={{marginTop: 20}}>
            <Col span={6}>
              <h4>Group name:</h4>
            </Col>
          </Row>

          <Row style={{marginTop: 20}}>
            <Col>
              <Input placeholder="please input type" onChange={that.handleTempTypeChange}/>
            </Col>
          </Row>
        </Modal>
        <Modal
          title="Rename"
          visible={that.state.updateTypeModal}
          onCancel={that.handleCancle}
          onOk={that.handleUpdateTypeOk}
          cancelText="cancle"
          okText="save"
          mask={false}
          style={{width: '2000px'}}
        >
          <Row style={{marginTop: 20}}>
            <Col span={6}>
              <h4>Group name:</h4>
            </Col>
          </Row>

          <Row style={{marginTop: 20}}>
            <Col>
              <Input
                placeholder={that.state.updateTypeName}
                onChange={that.handleTempTypeUpdateChange}
                value={that.state.updateTypeTemp}
              />
            </Col>
          </Row>
        </Modal>
        <Modal
          title=''
          visible={that.state.createAccountModal}
          onOk={that.operatorQuickCreate}
          onCancel={that.handleCancle}
          okText="Confirm"
          cancelText="Cancel"
          mask={false}
        >
          <Row style={{marginTop: 20}}>
            <Col span={4}>Account Name: </Col>
            <Col span={12} offset={1}>
              <Input
                onChange={(e) => {
                  that.onChange(e.target.value, 'loginName');
                }}
                value={that.state.paramsList.loginName}
              />
            </Col>
          </Row>
          <Row style={{marginTop: 20}}>
            <Col span={4}>Full name: </Col>
            <Col span={12} offset={1}>
              <Input
                onChange={(e) => {
                  that.onChange(e.target.value, 'fullName');
                }}
                value={that.state.paramsList.fullName}
              />
            </Col>
          </Row>
          <Row style={{marginTop: 20}}>
            <Col span={4}>Sex: </Col>
            <Col span={12} offset={1}>
              <Select
                style={{width: 328}}
                onChange={(e) => {
                  that.onChange(e, 'sex');
                }}
                value={that.state.paramsList.sex}
              >
                {
                  that.state.SexList.map((doc) => {
                    return (<Option key={doc.name} value={doc.value}>{doc.name}</Option>);
                  })
                }
              </Select>
            </Col>
          </Row>
          <Row style={{marginTop: 20}}>
            <Col span={4}>Role: </Col>
            <Col span={12} offset={1}>
              <Select
                style={{width: 328}}
                onChange={(e) => {
                  that.onChange(e, 'roles');
                }}
                value={that.state.paramsList.roles}
                mode='multiple'
              >
                {
                  that.state.RoleOptions.map((doc) => {
                    return (<Option key={doc.roleName} value={doc.id}>{doc.roleName}</Option>);
                  })
                }
              </Select>
            </Col>
          </Row>
        </Modal>
        <Modal
          visible={that.state.uploadModal}
          onOk={that.uploadSave}
          onCancel={that.handleCancle}
          okText="Save"
          cancelText="Cancel"
          mask={false}
          style={{width: '2000px'}}
          title="Upload users to call-retrieve"
        >
          <Row>
            <Col span={3} offset={1}><strong>user file :</strong></Col>
            <Col span={6} offset={1} style={{marginRight: 10}} key={Math.random()}>
              <Upload {...props} onChange={(e) => {
                that.onChange(e, 'fileList')
              }}>
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            </Col>
            <Col span={6} style={{paddingTop: 0}}>
              Only Excel,and only member_id in first column
            </Col>
          </Row>
          <Row style={{marginTop: 20}}>
            <Col span={3} offset={1}><strong>Type :</strong></Col>
            <Col span={16}>
              <TextArea placeholder="Limit 30 characters..." autosize={{minRows: 1}} onChange={that.TypeContent}/>
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

export default CallRetrieveManagement;