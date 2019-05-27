/* eslint-disable no-unused-vars */
import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import tableexport from 'tableexport';

import { CLComponent, AsyncComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import Viewer from 'viewerjs';
import _ from 'lodash';
import { Button, Icon, Modal, Tooltip, Row, Col, Tabs, Input, message } from 'antd';

const PromiseToPay = AsyncComponent(() => import('./PromiseToPay.jsx'));
const OtherAppList = AsyncComponent(() => import('./otherAppList.jsx'));

const SmallTools =  AsyncComponent(() => import("./smallTools.jsx"));

const TabPane = Tabs.TabPane;
const { TextArea } = Input;

let TB;
let req;

const overdueDays = [
  {
    name: '0 day',
    value: 0,
  },
  {
    name: '1-3 day',
    value: 13,
  },
  {
    name: '4-7 day',
    value: 47,
  },
  {
    name: '8-15 day',
    value: 815,
  },
  {
    name: '16-30 day',
    value: 1630,
  },
  {
    name: 'more than 30 day',
    value: 30,
  },
];

const zoning = [
  {
    name: 'north',
    value: 4,
  },
  {
    name: 'south',
    value: 2,
  },
];

const {
  contentType,
  getCreditCollectionList,
  operatorAndRole,
  discountOrderList,
  discountOrders,
  blackOrders,
  blackOrderList,
  getCreditCollectionListPhoneNumber,
  getCompanyList
} = Interface;

class CreditCollection extends CLComponent {
  state = {
    showInputMessage: false,
    applyIdAndPhoneNumbers: [],
    selectedRowKeys: [],
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    paginations: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    blackPagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    discountPagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    sorter: {
      sortFieldType: 3,
      sortType: 1,
    },
    hasButton: false,
    hasButtons: false,
    tableLoading: false,
    search: {},
    blackSearch: {},
    discountSearch: {},
    options: {
      resideCity: [],
      status: [],
      repaymentStatus: [],
      overdueDays: overdueDays,
      collector: [],
    },
    blackOptions: {
      screenData: [],
    },
    discountOptions: {
      screenData: [],
      companyList: []
    },
    data: [],
    showTableExport: false,
    sumOfMoney: {},
    data2: [],
    data3: [],
    data4: [],
    operationpay: [],
    type: '1',
    abRemark: false,
    approve: false,
    reuse: false,
    ApproveText: '',
    ReuseText: '',

    approve1: false,
    reuse1: false,
    ApproveText1: '',
    ReuseText1: '',
    DiscountId: '',
    DiscountId1: '',
    reuseId1: '',
    reuseId: '',
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getFormFields',
      'getFormFieldsBlack',
      'getFormFieldsDiscount',
      'check',
      'loadData',
      'loadData3',
      'loadData4',
      'loadDataTab2',
      'pageChage',
      'pageChageBlack',
      'pageChageDiscount',
      'download',
      'handleCancel',
      'handleCancel1',
      'handleCanceld',
      'selectChange',
      'selectChangeBlack',
      'selectChangeDiscount',
      'tabChange',
      'setTimer',
      'getOperList',
      'showApproveModal',
      'showReuseModal',
      'ApproveOk',
      'ReuseOk',
      'setRemarkText',
      'setApproveText',
      'setReuseText',
      'showApproveModal1',
      'showReuseModal1',
      'ApproveOk1',
      'ReuseOk1',
      'setApproveText1',
      'setReuseText1',
      // "sendSMS",
      'disableShowMessage',
    ]);
  }

  showModal(e) {
    const viewer = new Viewer(e.target, {});
  }
  download(target) {
    const that = this;
    that.setState({ showTableExport: true });
    setTimeout(() => {
      TB = tableexport(document.querySelector("#ex-table"), {formats: ['csv','txt','xlsx']});
    }, 100);
  }

  disableShowMessage() {
    this.setState({ showInputMessage: false });
  }

  handleCancel() {
    const that = this;
    that.setState({
      abRemark: false,
      approve: false,
      reuse: false,
      showTableExport: false,
    });
    if (TB) {
      TB.remove();
    }
  }

  handleCancel1() {
    const that = this;
    that.setState({
      abRemark1: false,
      approve1: false,
      reuse1: false,
    });
  }

  // sendSMS(){
  //     const that = this;
  //     let search =that.state.search;
  //     let page = that.state.pagination;
  //     let sorter = that.state.sorter;
  //     _.each(search, function (doc, index) {
  //       if (_.isArray(doc) && doc.length === 0) {
  //           delete search[index];
  //       }
  //     });

  //     that.setState({tableLoading: true});
  //     let params = {
  //       page: {
  //         currentPage: page.currentPage || 1,
  //         pageSize: page.pageSize || 10
  //       },
  //       loanBasisInfoJoinOrderInfo: search || this.state.search,
  //     }
  //     if (sorter && !sorter.sortType) {
  //       sorter = {
  //         sortFieldType: 3,
  //         sortType: 1
  //       }
  //     }
  //     params = _.extend(params, sorter);
  //     const settings = {
  //       contentType,
  //       method: 'post',
  //       url: getCreditCollectionListPhoneNumber.url,
  //       data: JSON.stringify(params)
  //     }

  //     function setData (res) {
  //         that.state.showInputMessage = true;
  //         that.setState({
  //             tableLoading: false,
  //             showInputMessage:true,
  //             applyIdAndPhoneNumbers:res.data,
  //             })
  //     }
  //     req = CL.clReqwest({settings, fn: setData});
  // }
  handleCanceld() {
    const that = this;
    that.setState({ showTableExport: false });
    if (TB) {
      TB.remove();
    }
  }


  setRemarkText(e) {
    const that = this;
    if (that.state.isloanApply) {
      this.setState({ auditRemark: e.target.value });
    } else {
      this.setState({ remarkText: e.target.value });
    }
  }
  setApproveText(e) {
    const that = this;
    that.setState({ ApproveText: e.target.value });
  }
  setApproveText1(e) {
    const that = this;
    that.setState({ ApproveText1: e.target.value });
  }
  setReuseText(e) {
    const that = this;
    that.setState({ ReuseText: e.target.value });
  }
  setReuseText1(e) {
    const that = this;
    that.setState({ ReuseText1: e.target.value });
  }
  getOperList() {
    const that = this;
    const settings = {
      contentType,
      method: 'post',
      url: operatorAndRole.url,
      data: JSON.stringify({ roleIdRange: [1530, 1531, 1532, 1533, 1534, 1535, 1562, 1563] }),
    };

    function setCollectorOption(arr) {
      const arrUniq = [];
      arr.map((doc) => {
        if (_.findIndex(arrUniq, { value: doc.optId }) <= -1) {
          const obj = {};
          obj.name = doc.roleName;
          obj.value = doc.optId;
          arrUniq.push(obj);
        }
      });
      return arrUniq;
    }

    function fn(res) {
      if (res.data && res.data.userRole && res.data.userRole.length) {
        const options = that.state.options;
        options.collector = setCollectorOption(res.data.userRole) || [];
        that.setState({ options: options, operationpay:setCollectorOption(res.data.userRole)});// 第一个options
      }
    }

    CL.clReqwest({ settings, fn });
  }

  // 点击同意弹窗
  showApproveModal(e, doc) {
    this.setState({
      approve: true,
      DiscountId: doc.id,
    });
  }
  showApproveModal1(e, doc) {
    this.setState({
      approve1: true,
      DiscountId1: doc.id,
    });
  }
  // 点击拒绝弹窗              //
  showReuseModal(e, doc) {
    this.setState({
      reuse: true,
      reuseId: doc.id,
    });
  }
  showReuseModal1(e, doc) {
    this.setState({
      reuse1: true,
      reuseId1: doc.id,
    });
  }
  // 点击同意的确定
  ApproveOk(e) {
    const that = this;
    const DiscountId = that.state.DiscountId;
    const text = that.state.ApproveText;
    const params = {
      blackOrderApplicationId: DiscountId,
      operation: that.state.blackOptions.screenData[1].name,
      feedback: text,
    };
    const settings = { // 打折同意申请
      contentType,
      method: blackOrders.type,
      url: blackOrders.url,
      data: JSON.stringify(params),
    };
    function fn(res) {
      if (res.data) {
        message.success('save success');
        that.loadData3(that.state.blackSearch, that.state.blackPagination, that.state.sorter);
        that.handleCancel();
      }
    }
    CL.clReqwest({ settings, fn });
  }
  ApproveOk1(e) {
    const that = this;
    const DiscountId1 = that.state.DiscountId1;
    const text = that.state.ApproveText1;
    const params = {
      discountOrderApplicationId: DiscountId1,
      operation: that.state.discountOptions.screenData[1].name,
      feedback: text,
    };
    const settings = { // 打折同意申请
      contentType,
      method: discountOrders.type,
      url: discountOrders.url,
      data: JSON.stringify(params),
    };
    function fn(res) {
      if (res.data) {
        message.success('save success');
        that.loadData4(that.state.discountSearch, that.state.discountPagination, that.state.sorter);
        that.handleCancel1();
      }
    }
    CL.clReqwest({ settings, fn });
  }
  // 点击拒绝的确定
  ReuseOk(e) {
    const that = this;
    const reuseId = this.state.reuseId;
    const text = that.state.ReuseText;
    const params = {
      blackOrderApplicationId: reuseId,
      operation: that.state.blackOptions.screenData[2].name,
      feedback: text,
    };
    const settings = { // 打折拒绝申请
      contentType,
      method: blackOrders.type,
      url: blackOrders.url,
      data: JSON.stringify(params),
    };
    function fn(res) {
      if (res.data) {
        message.success('save success');
        that.loadData3(that.state.blackSearch, that.state.blackPagination, that.state.sorter);
        that.handleCancel();
      }
    }

    CL.clReqwest({ settings, fn });
  }
  ReuseOk1(e) {
    const that = this;
    const reuseId1 = this.state.reuseId1;
    const ReuseText1 = that.state.ReuseText1;
    const params = {
      discountOrderApplicationId: reuseId1,
      operation: that.state.discountOptions.screenData[2].name,
      feedback: ReuseText1,
    };
    const settings = { // 打折拒绝申请
      contentType,
      method: discountOrders.type,
      url: discountOrders.url,
      data: JSON.stringify(params),
    };
    function fn(res) {
      if (res.data) {
        message.success('save success');
        that.loadData4(that.state.discountSearch, that.state.discountPagination, that.state.sorter);
        that.handleCancel1();
      }
    }
    CL.clReqwest({ settings, fn });
  }

  // 页面进入的时候加载的函数
  componentDidMount() {
    const that = this;
    // 搜索条件credit
    let type = sessionStorage.getItem("operateDataType") || "1";
    this.setState({type: type})
    const sessionSearch = sessionStorage.getItem('search');
    let search = this.state.search;
    if (sessionSearch) {
      search = JSON.parse(sessionSearch);
    }
    // 搜索条件black
    const blackSearch = sessionStorage.getItem('blackSearch');
    let searchBlack = this.state.blackSearch;
    if (blackSearch) {
      searchBlack = JSON.parse(blackSearch);
    }
    // 搜索条件discount
    const discountSearch = sessionStorage.getItem('discountSearch');
    let searchDiscount = this.state.search;
    if (discountSearch) {
      searchDiscount = JSON.parse(discountSearch);
    }
    // 分页credit
    const sessionPagination = sessionStorage.getItem('pagination');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }
    // 分页prmisePay
    const sessionPaginations = sessionStorage.getItem('paginations');
    let paginations = this.state.paginations;
    if (sessionPaginations) {
      paginations = JSON.parse(sessionPaginations);
    }
    // 分页black
    const sessionPaginationBlack = sessionStorage.getItem('blackPagination');
    let blackPagination = this.state.blackPagination;
    if (sessionPaginationBlack) {
      blackPagination = JSON.parse(sessionPaginationBlack);
    }
    // 分页discount
    const sessionPaginationDiscount = sessionStorage.getItem('discountPagination');
    let discountPagination = this.state.discountPagination;
    if (sessionPaginationDiscount) {
      discountPagination = JSON.parse(sessionPaginationDiscount);
    }

    // 排序暂时都用的是同样的参数
    const sessionSorter = sessionStorage.getItem('sorter');
    let sorter = this.state.sorter;
    if (sessionSorter) {
      sorter = JSON.parse(sessionSorter);
    }
    this.setState({
      search: search,
      pagination: pagination,
      sorter: sorter,
      blackSearch: searchBlack,
      blackPagination: blackPagination,
      discountSearch: searchDiscount,
      discountPagination: discountPagination,
    });
    // 搜索和分页赋值到全局且请求4个tabbar的数据

    this.loadData(search, pagination, sorter);
    // setTimeout(() => {
    //   that.loadDataTab2(search, that.state.pagination, that.state.sorter);
    // }, 10000);
    setTimeout(() => {
      that.loadData3(that.state.blackSearch, that.state.blackPagination, that.state.sorter);
    }, 12000);
    setTimeout(() => {
      that.loadData4(that.state.discountSearch, that.state.discountPagination, that.state.sorter);
    }, 13000);

    if (this.state.type !== '3') { // 设定定时器
      this.setTimer();
    }
    that.getOperList();// 获取options内容
      this.getCompanyListMth();
  }

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
                    let discountOptions = this.state.discountOptions, options = this.state.options;
                    options.companyList = res.response.rows.map(item => {
                        return {
                            name: item.name,
                            value: item.id
                        }
                    }) || [];

                    //添加默认的数据
                    options.companyList.unshift({
                        name: "Unipeso",
                        value: "0"
                    })

                    discountOptions.companyList = options.companyList;

                    this.setState({
                        options,
                        discountOptions
                    })
                }
            });
    };
  // 定时器
  setTimer() {
    const that = this;
    // 定时拉取promise to pay 数据，仿造消息提醒
    this.timer = setInterval(() => {
      // that.loadDataTab2(that.state.search, that.state.pagination, that.state.sorter);
      that.loadData3(that.state.blackSearch, that.state.blackPagination, that.state.sorter);
      that.loadData4(that.state.discountSearch, that.state.discountPagination, that.state.sorter);
    }, 300000);
  }

  componentWillUnmount() { // 清除定时器
    this.timer && clearTimeout(this.timer);
  }

  loadData(search, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });
    // 兼容多选清空后，数组接口不支持的问题
    _.each(search, (doc, index) => {
      if (_.isArray(doc) && doc.length === 0) {
        delete search[index];
      }
    });

    let params = {
      page: {
        currentPage: page.currentPage,
        pageSize: page.pageSize,
      },
      // loanBasisInfoJoinOrderInfo: search || this.state.search,
      loanBasisInfoJoinOrderInfo: {
        applicationId: search.applicationId,
        certificateNo: search.certificateNo,
        collectorIdRange: search.collectorIdRange,
        endFRepaymentTime: search.endFRepaymentTime,
        endOverdueDays: search.endOverdueDays,
        endPromiseTime: search.endPromiseTime,
        endSRepaymentTime: search.endSRepaymentTime,
        memberNameMatching: search.memberNameMatching,
        memberPhone: search.memberPhone,
        repaymentStatus: search.repaymentStatus,
        startFRepaymentTime: search.startFRepaymentTime,
        startOverdueDays: search.startOverdueDays,
        startPromiseTime: search.startPromiseTime,
        startSRepaymentTime: search.startSRepaymentTime,
        companyId: search.companyId,
        appName: 'Cashlending',
      },
    };

    if (sorter && !sorter.sortType) {
      sorter = {
        sortFieldType: 3,
        sortType: 1,
      };
    }
    params = _.extend(params, sorter);
    const settings = {
      contentType,
      method: 'post',
      url: getCreditCollectionList.url,
      data: JSON.stringify(params),
    };

    function setData(res) {
      that.setState({ tableLoading: false });
      const data = res.data;
      if (data) {
        const pagination = {
          total: data.page.totalCount || '',
          pageSize: page.pageSize,
          currentPage: page.currentPage,
        };
        sessionStorage.setItem('pagination', JSON.stringify(pagination));
        sessionStorage.setItem('search', JSON.stringify(search));
        sessionStorage.setItem('sorter', JSON.stringify(sorter));

        const cityArr = [];
        // city 去重
        _.each(data.creditCity, (doc) => {
          const fn = _.find(cityArr, { creditName: doc.creditName });
          if (!fn) {
            cityArr.push(doc);
          }
        });

        const otherRepaymentStatus = CL.setOptions(data.specialStatus);
        that.setState({
          options: {
            status: CL.setOptions(data.pressStatus),
            resideCity: CL.setIdNameOptions(cityArr),
            overdueDays: overdueDays,
            repaymentStatus: CL.setOptions(data.repaymentStatus).concat(otherRepaymentStatus),
            collector: that.state.options.collector,
            companyList: that.state.options.companyList,
          },
          city: CL.setIdNameOptions(cityArr),
          ocity: CL.setIdNameOptions(data.creditCity),
          pagination: pagination,
          data: data.page.result || [],
          sumOfMoney: data.sumOfMoney || {},
        });
      }
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({ settings, fn: setData });
  }

  loadDataTab2(search, page, sorter, collectorld) {
    const that = this;
    const search2 = {
      endPromiseTime: new Date().getTime() + 30 * 60 * 1000,
      startPromiseTime: new Date('2019-01-01').getTime(),
      collectStatusRange: ['12'],
      repaymentStatus: '4',
      collectorId: collectorld,
    };

    const params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      },
      loanBasisInfoJoinOrderInfo: search2,
    };

    const settings = {
      contentType,
      method: 'post',
      url: getCreditCollectionList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false,});
      const data = res.data;
      if (data) {
        const pagination = {
          total: data.page.totalCount,
          pageSize: page.pageSize,
          currentPage: page.currentPage,
        };
          sessionStorage.setItem("pagination2", JSON.stringify(pagination));
          sessionStorage.setItem("search", JSON.stringify(search));
          sessionStorage.setItem("sorter", JSON.stringify(sorter));


        // const cityArr = [];
        // // city 去重
        // _.each(data.creditCity, (doc) => {
        //   const fn = _.find(cityArr, { creditName: doc.creditName });
        //   if (!fn) {
        //     cityArr.push(doc);
        //   }
        // });

        // const otherRepaymentStatus = CL.setOptions(data.specialStatus);

        that.setState({
          pagination2: pagination,
          data2: data.page.result || [],
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  loadData3(search, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });
    const params = {
      page: page.currentPage,
      pageSize: page.pageSize || 10,
      startDate: search.startDate || '',
      endDate: search.endDate || '',
      loanApplicationId: search.applicationId || '',
      status: search.status || '',
    };
    const settings = {
      contentType,
      method: blackOrderList.type,
      url: blackOrderList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      if (res.data) {
        const pagination = {
          total: res.data.total,
          pageSize: res.data.pageSize,
          currentPage: res.data.page,
        };
        sessionStorage.setItem('blackPagination', JSON.stringify(pagination));
        sessionStorage.setItem('blackSearch', JSON.stringify(search));
        const roles = [];
        _.each(res.data.statusList, (doc, index) => {
          roles.push({
            name: doc.string,
            value: doc.val,
            id: index,
            label: doc.string,
          });
        });
        that.setState({
          tableLoading: false,
          data3: res.data.blackOrderApplicationList,
          blackPagination: pagination,
          hasButton: res.data.hasButton,
          blackOptions: {
            screenData: roles,
          },
        });
        const result = res.data.blackOrderApplicationList;
        for (let i = 0; i < result.length; i++) {
          if (result[i].statusString == 'Pending') {
            const BlacklistApproval = document.querySelectorAll('.ant-tabs-tab')[3];
            if (BlacklistApproval) {
              BlacklistApproval.classList.add('twinkle');
            }
          }
        }
      }
    }
    if (req) {
      req.abort();
    }
    req = CL.clReqwest({ settings, fn });
  }

  loadData4(search, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });
    const params = {
      page: page.currentPage,
      pageSize: page.pageSize || 10,
      startDate: search.startDate || '',
      endDate: search.endDate || '',
      loanApplicationId: search.applicationId || '',
      status: search.status || '',
      companyId: search.companyId || '',
    };
    const settings = {
      contentType,
      method: discountOrderList.type,
      url: discountOrderList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      if (res.data) {
        const pagination = {
          total: res.data.total,
          pageSize: res.data.pageSize,
          currentPage: res.data.page,
        };
        sessionStorage.setItem('discountPagination', JSON.stringify(pagination));
        sessionStorage.setItem('discountSearch', JSON.stringify(search));
        const roles = [];
        _.each(res.data.statusList, (doc, index) => {
          roles.push({
            name: doc.string,
            value: doc.val,
          });
        });
        that.setState({
          tableLoading: false,
          data4: res.data.discountOrderApplicationList,
          discountPagination: pagination,
          hasButtons: res.data.hasButton,
          discountOptions: _.assign(that.state.discountOptions, {
            screenData: roles,
          })
        });
        const result = res.data.discountOrderApplicationList;
        for (let i = 0; i < result.length; i++) {
          if (result[i].statusString == 'Pending') {
            const DiscountApproval = document.querySelectorAll('.ant-tabs-tab')[4];
            if (DiscountApproval) {
              DiscountApproval.classList.add('twinkle');
            }
          }
        }
      }
    }
    if (req) {
      req.abort();
    }
    req = CL.clReqwest({ settings, fn });
  }

  // 切换tab
  tabChange(e) {
    const that = this;
    that.setState({
      type: e, //location.reload(e),
      tableLoading: true,
    });
    sessionStorage.setItem('operateDataType', e);

    if (e === '3') {
      // that.loadDataTab2({}, that.state.paginations, that.state.sorter);
      that.timer && clearTimeout(this.timer);
    } else if (e === '1') {
      that.loadData(that.state.search, that.state.pagination, that.state.sorter);
      that.setTimer();
    } else if (e === '4') {
      that.loadData3(that.state.blackSearch, that.state.blackPagination, that.state.sorter);
      that.timer && clearTimeout(this.timer);
      const BlacklistApproval = document.querySelectorAll('.ant-tabs-tab')[3];
      if (BlacklistApproval) { BlacklistApproval.classList = ''; }
    } else if (e === '5') {
      that.loadData4(that.state.discountSearch, that.state.discountPagination, that.state.sorter);
      that.timer && clearTimeout(this.timer);
      const DiscountApproval = document.querySelectorAll('.ant-tabs-tab')[4];
      if (DiscountApproval) { DiscountApproval.classList = ''; }
    }
  }
  // onselechChange事件
  selectChange(value, main) {
    const that = this;
    const arr = [2, 4];
    const opt = that.state.options;
    const search = that.state.search;
    if (arr.indexOf(parseInt(value)) > -1 && ['north', 'south'].indexOf(main.props.children) > -1) {
      opt.resideCity = _.filter(that.state.city, { zone: parseInt(value) });
      search.creditName = '';
      search.zone = value;
      that.setState({ options: opt, search: search });
    }
  }

  selectChangeBlack(value, main) {
    const that = this;
    const arr = [2, 4];
    const opt = that.state.blackOptions;
    const search = that.state.blackSearch;
    if (arr.indexOf(parseInt(value)) > -1 && ['north', 'south'].indexOf(main.props.children) > -1) {
      opt.resideCity = _.filter(that.state.city, { zone: parseInt(value) });
      search.creditName = '';
      search.zone = value;
      that.setState({ blackOptions: opt, blackSearch: search });
    }
  }

  selectChangeDiscount(value, main) {
    const that = this;
    const arr = [2, 4];
    const opt = that.state.discountOptions;
    const search = that.state.discountSearch;
    if (arr.indexOf(parseInt(value)) > -1 && ['north', 'south'].indexOf(main.props.children) > -1) {
      opt.resideCity = _.filter(that.state.city, { zone: parseInt(value) });
      search.creditName = '';
      search.zone = value;
      that.setState({ discountOptions: opt, discountSearch: search });
    }
  }

  getFormFields(fields) {
    const that = this;
    let search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'sRepaymentTime') {
          search.startSRepaymentTime = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search.endSRepaymentTime = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else if (index === 'fRepaymentTime') {
          search.startFRepaymentTime = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search.endFRepaymentTime = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else if (index === 'zone' && doc === '0') {
          search = search;
        } else if (index === 'promiseTime') {
          search.startPromiseTime = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search.endPromiseTime = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else {
          search[index] = doc;
        }
      }
    },
    );
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({ search: search, pagination: pagination });
    this.loadData(search, pagination, this.state.sorter);
  }

  getFormFieldspay = (fields) => {
    // let search = {};
    // search.collectorld=fields.collectorld;
    // const pagination2 = this.state.pagination2;
    // pagination2.currentPage = 1;
    // this.setState({ search: search, pagination2: pagination2,data2: [] });
    // this.loadDataTab2(search, pagination2, this.state.sorter,fields.collectorld);
  }

  getFormFieldsBlack(fields) {
    const that = this;
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'time') {
          search.startDate = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search.endDate = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else if (index === 'statescreening') {
          search.status = doc;
        } else {
          search[index] = doc;
        }
      }
    },
    );
    const pagination = that.state.blackPagination;
    pagination.currentPage = 1;
    this.setState({ blackSearch: search, blackPagination: pagination });
    this.loadData3(search, pagination, that.state.sorter);
  }

  getFormFieldsDiscount(fields) {
    const that = this;
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'time') {
          search.startDate = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search.endDate = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else if (index === 'statescreening') {
          search.status = doc;
        } else {
          search[index] = doc;
        }
      }
    },
    );
    const pagination = that.state.discountPagination;
    pagination.currentPage = 1;
    this.setState({ discountSearch: search, discountPagination: pagination });
    this.loadData4(search, pagination, that.state.sorter);
  }

  check(data) { // 点击按钮跳转
    const arr = location.hash.split('/');
    arr.pop();
    arr.push(`creditcollectionDetails/${data.orderId}/${data.applicationId}/${data.specialStatus || 0}/${data.lifetimeId || '0'}`);
    const str = arr.join('/');

    // 保存当前的搜索条件 以及分页
    sessionStorage.setItem('search', JSON.stringify(this.state.search));
    sessionStorage.setItem('pagination', JSON.stringify(this.state.pagination));
    const url = `${location.protocol}//${location.host}${location.pathname}${str}`;
    window.open(url);
    // location.hash = str;
  }

  pageChage(e, filters, sorter) { // list 切换页面
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

    this.setState({ pagination: pagination, sorter: sorterClient });
    this.loadData(this.state.search, pagination, sorterClient);
  }

  pageChageBlack(e, filters, sorter) { // black页面的list 切换页面
    const that = this;
    const blackPagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: that.state.blackPagination.total,
    };

    const SORTDIC = {
      applicationTime: 2,
      memberRegisterDate: 1,
      descend: 1,
      ascend: 2,
    };

    const sorterClient = {
      sortFieldType: SORTDIC[sorter.field] || 3,
      sortType: SORTDIC[sorter.order] || 1,
    };
    this.setState({ blackPagination: blackPagination, sorter: sorterClient });
    this.loadData3(that.state.blackSearch, blackPagination, sorterClient);
  }

  pageChageDiscount(e, filters, sorter) { // discountlist 切换页面
    const that = this;
    const discountPagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: that.state.discountPagination.total,
    };

    const SORTDIC = {
      applicationTime: 2,
      memberRegisterDate: 1,
      descend: 1,
      ascend: 2,
    };

    const sorterClient = {
      sortFieldType: SORTDIC[sorter.field] || 3,
      sortType: SORTDIC[sorter.order] || 1,
    };
    this.setState({ discountPagination: discountPagination, sorter: sorterClient });
    this.loadData4(that.state.discountSearch, discountPagination, sorterClient);
  }

  renderBody() {
    const that = this;
    let btn = false;
    if ((_.indexOf(JSON.parse(sessionStorage.getItem('roles')), 'downloadPermissions') > -1)) {
      btn = [
        {
          title: 'Download',
          type: 'danger',
          fn: that.download,
        },
      ];
    }
    const editStyle = {
      display: 'block',
      position: 'absolute',
      right: '15px',
      fontSize: '22px',
      top: '0px',
      color: '#108ee9',
      cursor: 'pointer',
    };

    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      width: '100px',
    };

    const columns = [
      {
        title: 'No',
        dataIndex: 'applicationId',
        width: '5%',
        render: function (text, record) {
          return (<a onClick={() => { that.check(record); }}>{record.applicationId}</a>);
        },
      },
      {
        title: 'Name',
        dataIndex: 'memberPhone',
        width: '10%',
        render: function (index, record) {
          return (<div>
          <div>{record.memberPhone}</div>
          <div>{record.name}</div>
          </div>);
          },
      },

      {
        title: 'Loan Time',
        dataIndex: 'createdTime',
        width: '7%',
        render(doc, data) {
          let time;
          if (data.arrivalDate) {
            time = moment(new Date(data.arrivalDate)).format('YYYY-MM-DD HH:mm');
          } else {
            time = moment(new Date(data.createdTime)).format('YYYY-MM-DD HH:mm');
          }
          return time;
        }, // 改为时间
      },

      {
        title: 'Outstanding Balance',
        dataIndex: 'remainAmount',
        width: '5%',
        render(index, data) {
          return CF.format(data.remainAmount, {});
        },
      },
      {
        title: 'Amount paid',
        dataIndex: 'alreadyRepaymentAmount',
        width: '5%',
        render(doc, data) {
          return CF.format(data.alreadyRepaymentAmount, {});
        },
      },

      {
        title: 'Repayment Due Time',
        dataIndex: 'sRepaymentTime',
        width: '7%',
        render(doc, data) {
          return moment(new Date(data.sRepaymentTime)).format('YYYY-MM-DD');
        },
        sorter: (a, b) => new Date(a.sRepaymentTime) - new Date(b.sRepaymentTime),
      },
      {
        title: 'Repayment Time',
        dataIndex: 'fRepaymentTime',
        width: '7%',
        render(doc, data) {
          if (data.fRepaymentTime) {
            return moment(new Date(data.fRepaymentTime)).format('YYYY-MM-DD');
          }
          return '-';
        },
        sorter: (a, b) => new Date(a.fRepaymentTime) - new Date(b.fRepaymentTime),
      },

      {
        title: 'Repayment Status',
        dataIndex: 'statusName',
        width: '8%',
        render: function (index, data) {
          const name = (_.find(that.state.options.repaymentStatus, { value: data.specialStatus || data.status }) || {}).name;
          if (data.status === 3 && data.specialStatus == 102) {
            return (<div>
              <Icon type="check-circle" />
              {name}
                    </div>);
          } else if ([1, 3].indexOf(data.status) < 0 && data.specialStatus == 101) { // 部分还款
            return (<div>
              <Icon type="close-circle" />
              {name}
                    </div>);
          } else if (data.status === 3) { // overdueClose
            return (<div>
              <Icon type="check-circle" />
              {data.statusName}
                    </div>);
          } else if (data.status === 4) { // 逾期未还
            return (<div>
              <Icon type="close-circle" />
              {data.statusName}
                    </div>);
          }
          return data.statusName;
        },
      },
      {
        title: 'Overdue Days',
        dataIndex: 'overdueDays',
        width: '5%',
        sorter: (a, b) => new Date(a.overdueDays) - new Date(b.overdueDays),
      },
      {
        title: 'Amount',
        dataIndex: 'overdueAmount',
        width: '6%',
        render(doc, data) {
          return CF.format(data.overdueAmount, {});
        },
      },

      {
        title: 'Principal',
        dataIndex: 'overduePrincipal',
        width: '5%',
        render(doc, data) {
          return CF.format(data.overduePrincipal, {});
        },
      },

      {
        title: 'Interest',
        dataIndex: 'overdueInterest',
        width: '5%',
        render(doc, data) {
          return CF.format(data.overdueInterest, {});
        },
      },
      {
        title: 'Late Payment Fee',
        dataIndex: 'overdueDelayTax',
        width: '5%',
        render(doc, data) {
          return CF.format(data.overdueDelayTax, {});
        },
      },
      {
        title: 'Overdue Fee',
        dataIndex: 'overduePayment',
        width: '5%',
        render(doc, data) {
          return CF.format(data.overduePayment, {});
        },
      },
      {
        title: 'Credit Collection Status',
        dataIndex: 'pressStatusName',
        width: '8%',
        render: function (index, record) {
          return (<div>
            <div>{record.pressStatusName || '-'}</div>
            <div>{record.promiseTime ? moment(new Date(record.promiseTime)).format('YYYY-MM-DD HH:mm') : '-'}</div>
          </div>);
        },
      },
      {
        title: 'Collector',
        dataIndex: 'collectorName',
        width: '5%',
        render(doc, data) {
          return <p><p>{data.collectorCompanyName || "-"}</p><p>{data.collectorName || '-'}</p></p>;
        },
      },
    ];

    const columnsBlack = [
      {
        title: 'No.',
        dataIndex: 'applicationId',
        width: '5%',
        render: function (text, record) {
          return (<a onClick={() => { that.check(record); }}>{record.applicationId}</a>);
        },
      },

      {
        title: 'Overdue days',
        dataIndex: 'overdueDays',
        width: '10%',
      },

      {
        title: 'Submit by',
        dataIndex: 'fromOperatorName',
        width: '10%',
        render: function (index, record) {
          return (
            <div>{record.fromOperatorName}</div>
          );
        },
      },
      {
        title: 'Submitted time',
        dataIndex: 'createdTime',
        width: '10%',
      },

      {
        title: 'Applying reason',
        dataIndex: 'reason',
        width: '10%',
        render: function (index, record) {
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.reason} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <a style={remarkStyle}>{record.reason}</a>
              </Tooltip>
            </div>
          );
        },
      },
      {
        title: 'Approved status',
        dataIndex: 'statusString',
        width: '10%',
      },
      {
        title: 'Operate',
        dataIndex: 'statusName',
        width: '10%',
        render: function (index, record) {
          if (that.state.hasButton) {
            if (record.statusString == 'Pending') {
              return (
                <div><br />
                  <p><Button type="primary" data-val={record.applicationId} onClick={(...arg) => { that.showApproveModal(...arg, record); }} loading={that.state.loading} name="Approve"> Approve </Button></p>
                  <p><Button type="primary" data-val={record.applicationId} onClick={(...arg) => { that.showReuseModal(...arg, record); }} loading={that.state.loading} name="Reuse"> Reuse </Button></p>
                </div>
              );
            }
            return '—';
          }
          return '—';
        },
      },
      {
        title: 'Operated time',
        dataIndex: 'handledTime',
        width: '10%',
        render(doc, data) {
          if (!data.handledTime) {
            return '—';
          }
          return data.handledTime;
        },
      },
      {
        title: 'Feedback',
        dataIndex: 'feedback',
        width: '10%',
        render: function (index, record) {
          if (!record.feedback) {
            return '—';
          }
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.feedback} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <a style={remarkStyle}>{record.feedback}</a>
              </Tooltip>
            </div>
          );
        },
      },
    ];

    const columnsDiscount = [
      {
        title: 'No.',
        dataIndex: 'applicationId',
        width: '7%',
        render: function (text, record) {
          return (<a onClick={() => { that.check(record); }}>{record.applicationId}</a>);
        },
      },

      {
        title: 'Overdue days',
        dataIndex: 'overdueDays',
        width: '7%',
      },

      {
        title: 'Discount amount',
        dataIndex: 'discountAmount',
        width: '8%',
        render: function (index, record) {
          if (record.discountAmount == '') {
            return '—';
          }
          return record.discountAmount;
        },
      },
      {
        title: 'Submit by',
        dataIndex: 'fromOperatorName',
        width: '7%',
        render: function (index, record) {
          return (
            <div>{record.fromOperatorName}</div>
          );
        },
      },
        {
            title: 'Company',
            dataIndex: 'companyName',
            width: '7%'
        },
      {
        title: 'Submitted time',
        dataIndex: 'createdTime',
        width: '7%',
      },

      {
        title: 'Applying reason',
        dataIndex: 'reason',
        width: '10%',
        render: function (index, record) {
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.reason} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <a style={remarkStyle}>{record.reason}</a>
              </Tooltip>
            </div>
          );
        },
      },

      {
        title: 'Proof of repayment',
        dataIndex: 'picture_urls',
        width: '14%',
        render: function (index, record) {
          if (record.picture_urls == '') {
            return '—';
          }
          return (
            <div>
              {record.picture_urls.map((name, index) => {
                    return (
                      (<img key={index} src={name} onClick={that.showModal} style={{ width: '30px', height: '30px', marginRight: '10px' }} />)
                    );
                  })
                }
            </div>
          );
        },
      },
      {
        title: 'Approved status',
        dataIndex: 'statusString',
        width: '9%',
      },

      {
        title: 'Operate',
        dataIndex: 'statusName',
        width: '9%',
        render: function (index, record) {
          if (that.state.hasButtons) {
            if (record.statusString == 'Pending') {
              return (
                <div>
                  <br />
                  <p><Button type="primary" data-val={record.applicationId} onClick={(...arg) => { that.showApproveModal1(...arg, record); }} loading={that.state.loading} name="Approve1"> Approve </Button></p>
                  <p><Button type="primary" data-val={record.applicationId} onClick={(...arg) => { that.showReuseModal1(...arg, record); }} loading={that.state.loading} name="Reuse1"> Reuse </Button></p>
                </div>
              );
            }
            return (
              <div>—</div>
            );
          }
          return (
            <div>—</div>
          );
        },
      },
      {
        title: 'Operated time',
        dataIndex: 'handledTime',
        width: '9%',
        render(doc, data) {
          if (!data.handledTime) {
            return '—';
          }
          return data.handledTime;
        },
      },
      {
        title: 'Feedback',
        dataIndex: 'feedback',
        render: function (index, record) {
          if (!record.feedback) {
            return '—';
          }
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.feedback} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <a style={remarkStyle}>{record.feedback}</a>
              </Tooltip>
            </div>
          );
        },
      },
    ];

    const rowClass = [];
    const data = _.map(that.state.data, (doc, index) => {
      if (doc.remainAmount < 0) {
        doc.remainAmount = 0;
      }

      if ((doc.status === 2 || doc.status === 4) && doc.alreadyRepaymentAmount > 0) {
        rowClass.push('yellow');
      } else {
        rowClass.push('normal');
      }
      return doc;
    });
    const data3 = _.map(that.state.data3, (doc, index) => {
      return doc;
    });
    const data4 = _.map(that.state.data4, (doc, index) => {
      return doc;
    });
    const { sumOfMoney = {}, data2 = [] } = that.state;

    const operation = [
      {
        id: 'applicationId',
        type: 'text',
        label: 'Application No',
        placeholder: 'Input Application No',
      },
      {
        id: 'memberPhone',
        type: 'text',
        label: 'User Name',
        placeholder: 'Please input user name',
      },
      {
        id: 'memberNameMatching',
        type: 'text',
        label: 'Real Name',
        placeholder: 'Input Real Name',
      },
      {
        id: 'certificateNo',
        type: 'text',
        label: 'ID No',
        placeholder: 'Please type credential number',
      },
      {
        id: 'sRepaymentTime',
        type: 'rangePicker',
        label: 'Repayment Due Time',
      },
      {
        id: 'fRepaymentTime',
        type: 'rangePicker',
        label: 'Repayment Time',
      },
      {
        id: 'collectStatusRange',
        type: 'select',
        label: 'Credit Collection Status',
        options: that.state.options.status,
        placeholder: 'Please select',
        mode: 'multiple',
      },
      {
        id: 'repaymentStatus',
        type: 'select',
        label: 'Repayment Status',
        options: that.state.options.repaymentStatus,
        placeholder: 'Please select',
      },
      {
        id: 'collectorIdRange',
        type: 'select',
        label: 'Collector',
        options: that.state.options.collector || [],
        placeholder: 'Please select',
        mode: 'multiple',
      },
      {
        id: 'promiseTime',
        type: 'rangePicker',
        label: 'Promise Date',
        placeholder: 'ranger',
      },
      {
        id: 'startOverdueDays',
        type: 'number',
        label: 'Overdue Days Start',
        placeholder: 'Start',
      },
      {
        id: 'endOverdueDays',
        type: 'number',
        label: 'Overdue Days End',
        placeholder: 'End',
      },
        {
            id: 'companyId',
            type: 'select',
            label: 'Company',
            placeholder: 'Please select',
            options: that.state.options.companyList || []
        }
    ];

    const operationBlack = [
      {
        id: 'applicationId',
        type: 'text',
        label: 'Application No.',
        placeholder: 'Input Application No',
      },
      {
        id: 'status',
        type: 'select',
        label: 'Approval status',
        options: that.state.blackOptions.screenData,
        placeholder: 'Please select',
      },
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Operated time',
        placeholder: 'Input Real Name',
      },
    ];
    const operationpay = [
      {
        id: 'collectorld',
        type: 'select',
        label: 'Collector',
        options: that.state.operationpay,
        placeholder: 'Please select',
      },
    ];

    const operationDiscount = [
      {
        id: 'applicationId',
        type: 'text',
        label: 'Application No.',
        placeholder: 'Input Application No',
      },
      {
        id: 'status',
        type: 'select',
        label: 'Approval status',
        options: that.state.discountOptions.screenData,
        placeholder: 'Please select',
      },
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Operated time',
        placeholder: 'Input Real Name',
      },
      {
          id: 'companyId',
          type: 'select',
          label: 'Company',
          placeholder: 'Please select',
          options: that.state.discountOptions.companyList
      }
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
      rowClass: rowClass,
      onSelect: that.selectChange,
      btn: btn,
    };

    const settings2 = _.clone(settings);
    settings2.data = data2 || [];
    settings2.operation = operationpay;
    settings2.pagination = that.state.pagination2 || {};
    settings2.search= that.state.search;
    settings2.getFields = that.getFormFieldspay;
    settings2.btn = null;
    const th = [
      'No',
      'Name',
      'Phone',
      'Loan Time',
      'Outstanding Balance',
      'Amount paid',
      'Repayment Due Time',
      'Repayment Time',
      'Repayment Status',
      'Overdue Days',
      'Amount',
      'Principal',
      'Interest',
      'Late Payment Fee',
      'Overdue Fee',
      'Credit Collection Status',
      'Collector',
    ];

    const settings3 = {
      data: data3.map((doc, index) => {
        doc.fromOperator = index;
        return doc;
      }),
      columns: columnsBlack,
      operation: operationBlack,
      getFields: that.getFormFieldsBlack,
      pagination: that.state.blackPagination,
      pageChange: that.pageChageBlack,
      tableLoading: that.state.tableLoading,
      search: that.state.blackSearch,
      onSelect: that.selectChangeBlack,
    };

    const settings4 = {
      data: data4.map((doc, index) => {
        doc.fromOperator = index;
        return doc;
      }),
      columns: columnsDiscount,
      operation: operationDiscount,
      getFields: that.getFormFieldsDiscount,
      pagination: that.state.discountPagination,
      pageChange: that.pageChageDiscount,
      tableLoading: that.state.tableLoading,
      search: that.state.discountSearch,
      onSelect: that.selectChangeDiscount,
    };

    // dom操作，添加闪烁
    const tab2 = document.querySelectorAll('.ant-tabs-tab')[2];
    if (tab2 && data2.length) {
      tab2.classList.add('twinkle');
    }

    // const sendSMSSettings  = {
    //         messageType:"User himself",
    //         confirmTitle:"Send SMS",
    //         showInputMessage:that.state.showInputMessage,
    //         applyIdAndPhoneNumbers:that.state.applyIdAndPhoneNumbers,
    //         disableShowMessage:that.disableShowMessage
    // }

    return (
      <div className="credit-collection" key="credit-collection">
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>
          <TabPane tab="Cashlending List" key="1">
            <CLlist settings={settings} tableexport={tableexport} />
            <Row>
              <Col span={23} offset={1} style={{ fontSize: '16px', color: '#108ee9' }}>
                <p>Total Amount: {sumOfMoney.sumOfOverdueAmount || 0 }</p>
                <p>Total Principal: {sumOfMoney.sumOfOverduePrincipal || 0 }</p>
                <p>Total Amount Paid: {sumOfMoney.sumOfAlreadyRepaymentAmount || 0 }</p>
              </Col>
            </Row>
            {/* <Row>
                <SendSMS settings={sendSMSSettings}></SendSMS>
             </Row> */}
          </TabPane>
          <TabPane tab="Other app List" key="2">
            <OtherAppList companyList={this.state.options.companyList}/>
          </TabPane>
          <TabPane tab="Promise To Pay" key="3" >
            <PromiseToPay settings={settings2} />
          </TabPane>
          <TabPane tab="Blacklist approval" key="4" >
            <CLlist settings={settings3} />
          </TabPane>
          <TabPane tab="Discount approval" key="5" >
            <CLlist settings={settings4} />
          </TabPane>
          <TabPane tab="Small tools" key="6" >
            <SmallTools />
          </TabPane>
        </Tabs>
        <Modal
          title="Notice"
          visible={that.state.approve}
          onOk={that.ApproveOk}
          onCancel={that.handleCancel}
          okText="Save"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={12}>
              <h4>You will pass the approval. Sure to do ?</h4>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col>
              <TextArea placeholder="Please input feedback (Optional) ..." autosize={{ minRows: 3, maxRows: 7 }} onChange={that.setApproveText} />
            </Col>
          </Row>
        </Modal>
        <Modal
          title="Notice"
          visible={that.state.reuse}
          onOk={that.ReuseOk}
          onCancel={that.handleCancel}
          okText="confirm"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={12}>
              <h4>The approval will be rejected. Sure to do ?</h4>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col>
              <TextArea placeholder="Please input feedback (Optional) ..." autosize={{ minRows: 3, maxRows: 7 }} onChange={that.setReuseText} />
            </Col>
          </Row>
        </Modal>

        <Modal
          title="Notice"
          visible={that.state.approve1}
          onOk={that.ApproveOk1}
          onCancel={that.handleCancel1}
          okText="Save"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={12}>
              <h4>You will pass the approval. Sure to do ?</h4>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col>
              <TextArea placeholder="Please input feedback (Optional) ..." autosize={{ minRows: 3, maxRows: 7 }} onChange={that.setApproveText1} />
            </Col>
          </Row>
        </Modal>
        <Modal
          title="Notice"
          visible={that.state.reuse1}
          onOk={that.ReuseOk1}
          onCancel={that.handleCancel1}
          okText="confirm"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={12}>
              <h4>The approval will be rejected. Sure to do ?</h4>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col>
              <TextArea placeholder="Please input feedback (Optional) ..." autosize={{ minRows: 3, maxRows: 7 }} onChange={that.setReuseText1} />
            </Col>
          </Row>
        </Modal>
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
          <table id="ex-table">
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
                    <td>{record.applicationId}</td>
                    <td>{record.name}</td>
                    <td>{record.memberPhone}</td>
                    <td>{moment(new Date(record.createdTime)).format('YYYY-MM-DD HH:mm')}</td>
                    <td>{CL.cf(record.remainAmount, 2)}</td>
                    <td>{CL.cf(record.alreadyRepaymentAmount, 2)}</td>
                    <td>{moment(record.sRepaymentTime).format('YYYY-MM-DD HH:mm')}</td>
                    <td>{record.fRepaymentTime ? moment(record.fRepaymentTime).format('YYYY-MM-DD HH:mm') : '-'}</td>
                    <td>{record.statusName}</td>
                    <td>{record.overdueDays}</td>
                    <td>{CL.cf(record.overdueAmount, 2)}</td>
                    <td>{CL.cf(record.overduePrincipal, 2)}</td>
                    <td>{CL.cf(record.overdueInterest, 2)}</td>
                    <td>{CL.cf(record.overdueDelayTax, 2)}</td>
                    <td>{CL.cf(record.overduePayment, 2)}</td>
                    <td>{record.pressStatusName || '-'}</td>
                    <td>{record.collectorName}</td>
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
      <QueueAnim className="animate-content" type={this.state.aniType}>
        {this.renderBody()}
      </QueueAnim>
    );
  }
}
export default CreditCollection;
