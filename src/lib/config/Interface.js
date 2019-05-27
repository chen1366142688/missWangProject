import _ from 'lodash';
import biInterface from './interface/biInterface';

const Interface = _.assign({
    contentType: 'application/json',


    /** ***登录接口******* */
    getTimeStamp: {
        url: '/system/timeStamp',
        type: 'get',
    },

    /** ***登录接口******* */
    dologin: {
        url: '/login/dologin',
        type: 'post',
        params: {
            loginName: 'loginName',
            password: 'password',
            timeStamp: 'timeStamp',
        },
    },

    /** ***登出接口******* */
    logout: {
        url: '/login/logout',
        type: 'POST',
    },

    /** ***获取权限接口******* */
    getOperateResources: {
        url: '/login/getOperateResources',
        type: 'POST',
    },

    /** ***获取贷前信息列表******* */
    getLoanAuditList: {
        url: '/application/list/v1',
        type: 'POST',
        params: {
            loanBasisInfo: {
                // "beginTime": 1510738422889,
                // "endTime": 1510738422889,
                // "examineStatus": 1,
                // "operatorNameMatching": "testoperatename",
                // "sex": 2
            },
            page: {
                // "currentPage": 1,
                // "pageSize": 20
            },
        },
    },

    /** ***获取申请信息详情******* */
    getLoanAuditDetail: {
        url: '/loanBasisInfo/getLoanAuditDetail/',
        type: 'GET',
        params: 'id',
    },

    /** ***审核******* */
    LoanAuditExamine: {
        url: '/loanBasisInfo/examine',
        type: 'POST',
        params: {
            comment: 'comment',
            id: 'appid',
            status: 'pass/prepass/fallback/refuse',
        },
    },
    /** ***未通过原因******* */
    notPassReasonList: {
        url: '/loanBasisInfo/notPassReasonList',
        type: 'get',
    },

    /** ***审核详情页取消申请提交接口******* */
    cancelException: {
        url: '/application/cancel/exception',
        type: 'post',
    },

    /** ***复审列表******* */
    getRevaluationList: {
        url: '/loanBasisInfo/getRevaluationList',
        type: 'POST',
        params: {
            loanBasisInfo: {
                // "beginTime": 1510738422889,
                // "endTime": 1510738422889,
                // "examineStatus": 1,
                // "operatorNameMatching": "testoperatename",
                // "sex": 2
            },
            page: {
                // "currentPage": 1,
                // "pageSize": 20
            },
        },
    },

    /** ***复审详情******* */
    getRevaluationDetail: {
        url: '/loanBasisInfo/getRevaluationDetail/',
        type: 'GET',
    },

    /** *****获取借款订单列表***** */
    getLoanOrderList: {
        url: '/loanOrderInfo/getLoanOrderList',
        type: 'POST',
        params: {
            // "loanBasisInfoJoinOrderInfo":
            //   {
            //     "beginTime":1510738422889,
            //     "endTime":1510738422889,
            //     "examineStatus":1,
            //     "operatorNameMatching":"testoperatename",
            //     "sex":1
            //   },
            //   "page": {
            //     "currentPage":1,
            //     "pageSize":20
            //   }
        },
    },

    /** ***获取借款订单明细******* */
    getLoanOrderDetail: {
        url: '/loanOrderInfo/getLoanOrderDetail/',
        type: 'GET',
    },

    /** ***借款录单列表******* */
    getBorrowEnterList: {
        url: '/borrowInput/getBorrowEnterList',
        type: 'post',
        params: {
            // "page":{"currentPage":1,"pageSize":20},
            // "paymentSerialRecord":{"status":1}
        },
    },

    /** ***借款录单操作******* */
    borrowInput: {
        url: '/borrowInput/entering',
        type: 'post',
        params: {
            // "date":"2017-11-20",
            // "payId":57
        },
    },

    /** ***获取还款录单列表******* */
    getSubmitRepaymentAmountList: {
        url: '/saveRepaymentAmount/getSubmitRepaymentAmountList',
        type: 'post',
        params: {
            // "page":{"currentPage":1,"pageSize":20},
            // "loanBasisInfo":{"examineStatus":6}
        },
    },

    /** ***获取还款录单明细******* */
    getSubmitRepaymentAmountDetail: {
        url: '/saveRepaymentAmount/getSubmitRepaymentAmountDetail/',
        type: 'GET',
        params: {
            // id: 259
        },
    },

    /** ***获取还款录单明细******* */
    repaymentLogs: {
        url: '/repaymentInputLogs/list',
        type: 'post',
        params: {
            // "repaymentInputLogs":{"applicationId":92},"page":{"currentPage":1,"pageSize":5}
        },
    },

    /** ***获取还款录单提交******* */
    saveRepaymentAmount: {
        url: '/saveRepaymentAmount/save',
        type: 'post',
        params: {
            // "applicationId":259,
            // "repaymentAmount":3200,
            // "repaymentTime":1511176126347
        },
    },


    /** ***获取用户反馈列表******* */
    getFeedbackList: {
        url: '/consultMessages/getFeedbackList',
        type: 'post',
        params: {
            // "page":{"currentPage":1,"pageSize":20},
            // "consultedUser":{"userName":"8618117912353","status":2}
        },
    },

    /** ***获取用户反馈详情******* */
    getFeedbackDetail: {
        url: '/consultMessages/getFeedbackDetail/',
        type: 'get',
        params: {
            // "id":9
        },
    },

    /** ***回复用户反馈******* */
    consultMessages: {
        url: '/consultMessages/save',
        type: 'post',
        params: {
            // "consultedUserId":9,
            // "message":"哇哈哈哈呀哇哈哈"
        },
    },

    /** ***获取用户人工反馈列表******* */
    repaymentFeedbackList: {
        url: '/consultMessages/getRepaymentFeedbackList',
        type: 'post',
    },

    /** ***获取管理人员列表******* */
    getPeopleManageList: {
        url: '/operator/getPeopleManageList',
        type: 'post',
        params: {
            // "page":{"currentPage":1,"pageSize":20},
            // "operator":{}
        },
    },


    /** ***获取管理人员详情******* */
    operatorDetails: {
        url: '/operator/edit/',
        type: 'get',
        params: {
            // "id": "1050024"
        },
    },

    /** ***修改。创建管理人员详情******* */
    createOrModifyOperator: {
        url: '/operator/create',
        type: 'post',
        params: {
            // "address":"address",
            // "companyName":"companyName",
            // "createTime":1511256088646,
            // "email":"email",
            // "fullName":"fullName",
            // "loginName":"loginName",
            // "mobile":"mobile",
            // "phone":"phone",
            // "sex":1,
            // "updateTime":1511256088646,
            // "status":1,
            // "password":"123456",
            // "confirmPassword":"123456"
        },
    },

    /** ***获取用户角色******* */
    getOperatorRole: {
        url: '/operator/getOperatorRole/',
        type: 'get',
        params: {
            // id: "1050025"
        },
    },

    /** ***保存用户角色******* */
    saveOperatorRole: {
        url: '/operator/saveRole',
        type: 'post',
        params: {
            // "userId":1050025,
            // "roleId":1505
        },
    },

    /** ***删除用户角色******* */
    deleteOperatorRole: {
        url: '/operator/deleteRole',
        type: 'post',
        params: {
            // "userId":1050025,
            // "roleId":1505
        },
    },

    /** ***修改密码******* */
    passwordModify: {
        url: '/operator/savePassWord',
        type: 'post',
        params: {
            // "confirmPassword":"123456",
            // "oldPassword":"654321",
            // "password":"123456"
        },
    },


    /** ***获取角色列表******* */
    getAuthRoleList: {
        url: '/authRole/getAuthRoleList',
        type: 'post',
        params: {
            // "page":{"currentPage":1,"pageSize":20},"authRole":{}
        },
    },

    /** ***删除角色******* */
    deleteAuthRole: {
        url: '/authRole/delete/',
        type: 'get',
        params: {
            // "id":1507
        },
    },

    /** ***查看角色信息******* */
    checkAuthRole: {
        url: '/authRole/check/',
        type: 'get',
        params: {
            // "id":1507
        },
    },


    /** ***查看角色信息******* */
    createOrModifyAuthRole: {
        url: '/authRole/create',
        type: 'post',
        params: {
            // "roleName":"testrolename",
            // "remark":"testremark"
        },
    },

    /** ***查看角色可分配权限******* */
    getResourceTree: {
        url: '/authRole/resourceTrees/',
        type: 'get',
        params: {
            // "id":"1505",
        },
    },

    /** ****保存角色相关联资源****** */
    saveUserResource: {
        url: '/authRole/saveResource',
        type: 'post',
        params: {
            // "id":"1505",
            // resource: '1,2,3,4,5,6,7'
        },
    },


    /** ****风控接口****** */
    getAuditMark: {
        url: '/audit/getAuditMark/',
        type: 'get',
        params: {
            // "id":"275"
        },
    },

    /** ****风控接口****** */
    getEvaMark: {
        url: '/riskControl/evaluation/',
        type: 'get',
        params: {
            // "id":"275"
        },
    },

    /** ****风控接口****** */
    getRevMark: {
        url: '/riskControl/revaluation/',
        type: 'get',
        params: {
            // "id":"275"
        },
    },

    // riskControlList: {
    //   url: '/rule/strategy/list',
    //   type: 'get',
    //   urlType: 'credit',
    // },
    riskControlList: {
        url: '/rule/actions',
        type: 'get',
        urlType: 'credit',
    },

    // riskControlUpdate: {
    //   url: '/rule/strategy/update/',
    //   type: 'POST',
    //   urlType: 'credit',
    // },
    riskControlUpdate: {
        url: '/rule/action/',
        type: 'POST',
        urlType: 'credit',
    },


    /** ****风控接口****** */
    getCreditCollectionList: {
        url: '/creditCollection/getList',
        type: 'post',
        params: {
            // "page":{"currentPage":1,"pageSize":20},
            // "loanBasisInfoJoinOrderInfo":{}
        },
    },

    getCreditCollectionListPhoneNumber: {
        url: '/creditCollection/getListPhoneNumber',
        type: 'post',
        params: {},
    },

    sendSMS: {
        url: '/creditCollection/sendSms',
        type: 'post',
    },

    /** ****保存角色相关联资源****** */
    monthlyCredit: {
        url: '/collection/monthly/list',
        type: 'post',
        urlType: 'report',
    },

  postLoanType: {
    url: '/dengesorder/dengesreport/postLoan/laon/type',
    type: 'get',
    urlType: 'report',
  },

    collectionRemark: {
        url: '/collection/remark/status',
        type: 'get',
        urlType: 'report',
    },
    collectHistoryLog: {
        url: '/collection/remark/list',
        type: 'post',
        urlType: 'report',
    },

    /** ****风控接口****** */
    getCreditCollectionDetails: {
        url: '/creditCollection/getDetail/',
        type: 'get',
        params: {
            // id: 72
        },
    },

    /** ****风控接口****** */
    saveCreditCollectionInfo: {
        url: '/creditCollection/save',
        type: 'post',
        params: {
            // "pressStatus":1,
            // "pressDescription":"testdescprition",
            // "id":"61"
        },
    },

    // /** ****风控接口****** */
    // saveOperateRecord: {
    //   url: '/loanBasisInfo/saveOperateRecord',
    //   type: 'post',
    //   params: {
    //     // "comment":"test operate record",
    //     // "id":"277"
    //   },
    // },

    /** ****用户详情申请记录****接口待修改** */
    getApplicationHistory: {
        url: '/application/applicationHistory',
        type: 'post',
        params: {
            loanApplicationInfo: {memberId: 92},
            page: {currentPage: 1, pageSize: 5},
        },
    },

    /** ****用户列表****接口待修改** */
    getUserInformationList: {
        url: '/loanBasisInfo/getUserInformationList',
        type: 'POST',
        params: {
            loanBasisInfo: {
                // "beginTime": 1510738422889,
                // "endTime": 1510738422889,
                // "examineStatus": 1,
                // "operatorNameMatching": "testoperatename",
                // "sex": 2
            },
            page: {
                // "currentPage": 1,
                // "pageSize": 20
            },
        },
    },

    /** ****保存便签列表信息** */
    saveLoanNotes: {
        url: '/loanNotes/save',
        type: 'POST',
        params: {
            // applicationId: 333
            // appStatus: 90,
            // note: "12124"
        },
    },

    /** ****accountBalance** */
    accountBalance: {
        url: '/fundAccountingAmount/getFundAccountingAmountList',
        type: 'POST',
        params: {
            // {"fundAccountingAmount":{
            //   "collectDate":"2017-10-22",
            //   "orderFieldNextType":"ASC",
            //   "queryFields":[]
            // }}
        },
    },

    queryPayoutAccountBalance: {
        url: '/fundAccountingAmount/queryPayoutAccountBalance',
        type: 'get',
    },

    /** ****currentYield** */
    currentYield: {
        url: '/accountingTotalInfo/getAccountingTotalInfoList',
        type: 'POST',
    },
    currentYieldConservative: {
        url: '/current/yield/conservative/list',
        type: 'POST',   
    },

    /** ****expenseDetail** */
    expenseDetail: {
        url: '/accountingExpenseDetailInfo/getAccountingExpenseDetailInfoList',
        type: 'POST',
        params: {
            //   {"accountingDetailInfo":{
            //     "endDate":"2017-10-19","orderFieldNextType":"ASC",
            //     "queryFields":[],"startDate":"2017-10-17"},
            //     "page":{"currentPage":1,"endIndex":20,"firstPage":true,"lastPage":true,
            //   "nextPage":1,"pageCount":0,"pageSize":20,"previousPage":1,"startIndex":0,"totalCount":0,"unit":"条"}}
        },
    },

    /** ****incomeDetail** */
    incomeDetail: {
        url: '/accountingIncomeDetailInfo/getAccountingIncomeDetailInfoList',
        type: 'POST',
        params: {
            // {"accountingDetailInfo":{"orderFieldNextType":"ASC","queryFields":[]},
            // "page":{"currentPage":1,"endIndex":20,"firstPage":true,"lastPage":true,"nextPage":1,
            // "pageCount":0,"pageSize":20,"previousPage":1,"startIndex":0,"totalCount":0,"unit":"条"}}
        },
    },

    /** ****consumerDetail** */
    consumerDetail: {
        url: '/accountingIncomeDetailInfo/getAccountingIncomeDetailInfoList',
        type: 'POST',
        params: {
            // {"accountingDetailInfo":{"orderFieldNextType":"ASC","queryFields":[]},
            // "page":{"currentPage":1,"endIndex":20,"firstPage":true,"lastPage":true,"nextPage":1,
            // "pageCount":0,"pageSize":20,"previousPage":1,"startIndex":0,"totalCount":0,"unit":"条"}}
        },
    },

    /** ****联系人信息通话详情** */
    getAppInfoByMemberId: {
        url: '/application/applicationInfo',
        type: 'POST',
        params: {
            // {"memberId":81}
        },
    },

    Details: {

        getSameCompany: {
            url: '/temp/temp',
            type: 'get',
        },

        collectionTag: {
            url: '/creditCollection/collectionTag',
            type: 'get',
        },

        getLoanBasisiInfo: {
            url: '/loanBasisInfo/infoOfApp/',
            type: 'get',
        },

        getLoanContactInfo: {
            url: '/loanContactPerson/infoOfBasis',
            type: 'post',
            params: {
                // {"memberId":648,"id":1056}
            },
        },
        getUserData: {
            url: '/userData/infoOfBasis',
            type: 'post',
            params: {
                // {"memberId":648}
            },
        },
        getLoanOrderInfo: {
            url: '/loanOrderInfo/infoOfAppId',
            type: 'post',
            params: {
                // {"applicationId":6539}
            },
        },
        getFirstMessage: {
            url: '/personalNote/firstMessageTime',
            type: 'post',
            params: {
                // {"memberId":8023}
            },
        },
        getLastMessage: {
            url: '/personalNote/lastMessageTime',
            type: 'post',
            params: {
                // {"memberId":8023}
            },
        },
        getFirstCall: {
            url: '/personalCall/firstCallTime',
            type: 'post',
            params: {
                // {"memberId":8023}
            },
        },
        getLastCall: {
            url: '/personalCall/lastCallTime',
            type: 'post',
            params: {
                // {"memberId":8023}
            },
        },
        getPersonalCallRecordProp: {
            url: '/personalCall/personalCallRecordProp/',
            type: 'get',
        },
        getPersonalAppInstallInfo: {
            url: '/personalAppInstalled/infoOfMemberId',
            type: 'post',
            params: {
                // {"memberId":8023}
            },
        },
        getAddressBookInfo: { // postloandetails页面 Post-loan导航的通讯录接口
            url: '/contactPerson/infoOfMemberId',
            type: 'post',
            params: {
                // {"memberId":8023}
            },
        },
        deviceCheck: {
            url: '/memberDeviceMapping/deviceCheck',
            type: 'post',
            params: {
                // {"memberId":8023}
            },

        },
        totalPersonCount: {
            url: '/contactPerson/totalPersonCount',
            type: 'post',
            params: {
                // {"merberId":8023}
            },
        },
        getSensitivePersonCount: {
            url: '/contactPerson/totalSensitivePersonCount',
            type: 'post',
            params: {
                // {"merberId":8023}
            },
        },
        getOperateRecordHistory: {
            url: '/operateRecord/operateRecordHistory',
            type: 'post',
            params: {
                // {"merberId":8023}
            },
        },
        /** ****获取便签列表信息** */
        getLoanNotes: {
            url: '/loanNotes/getLoanNotes',
            type: 'POST',
            params: {
                // applicationId: 333
                // memberId: 90
            },
        },

        /** ****查询重复的用户** */
        repetitionUser: {
            url: '/loanBasisInfo/repetitionUser',
            type: 'POST',
            params: {
                // {"loanBasisInfo":{"notMemberId":92,"name":"测试 数据 回退2"}}
            },
        },

        /** ****获取审核详情页活体图片接口** */
        livingPhoto: {
            url: '/loanBasisInfo/living/photo/',
            type: 'get',
        },

        /** ****联系人信息通话详情** */
        contactAndCall: {
            url: '/personalCall/relationshipOfContactAndCall',
            type: 'POST',
            params: {
                // {"memberId":81,"telephone":"15108303835"}
            },
        },

        /** ****联系人信息通话详情** */
        contactAndMessage: {
            url: '/personalNote/relationshipOfContactAndNote',
            type: 'POST',
            params: {
                // {"memberId":81,"telephone":"15108303835"}
            },
        },

        /** ****获取催收状态** */
        orderPreStatus: {
            url: '/loanOrderInfo/pressStatus',
            type: 'get',
        },

        getOrderInfoByOrderId: {
            url: '/loanOrderInfo/infoOfOrderId',
            type: 'post',
            params: {
                // {"id":79}
            },
        },

        getCollectHistory: {
            url: '/collectHistoryLog/listOfOrderId',
            type: 'post',
            params: {
                // {"orderId": 82}
            },
        },
        getCollectHistoryV2: {
            url: '/collectHistoryLog/listOfMemberId',
            type: 'post',
            params: {
                // {"memberId": 82}
            },
        },

        /** ****获取借贷历史记录** */
        loanOrderHistory: {
            url: '/loanOrderInfo/listOfMemberId',
            type: 'post',
            // params: {"memberId":4497}
        },
        getAppListByContact: {
            url: '/loanBasisInfo/appListByContact',
            type: 'post',
        },
        loanBasisInfoShowFlow: {
            url: '/loanBasisInfo/show/flow/',
            type: 'get',
        },

    },

    /** ***上传图片接口******* */
    uploadImg: {
        url: '/file/save/public',
        type: 'post',
    },
    uploadImgModal: {
        url: '/creditCollection/discountOrder/upload',
        type: 'post',
    },

    uploadConsultImg: {
        url: '/consultMessages/picture/save',
        type: 'post',
    },

    getBannerList: {
        url: '/bannerManager/bannerList',
        type: 'post',
        // params: {"page":{"currentPage":0,"pageSize":10}}
    },

    bannerView: {
        url: '/bannerManager/bannerView/',
        type: 'get',
    },

    bannerSaveOrUpdate: {
        url: '/bannerManager/saveOrUpdate',
        type: 'post',
        // params: {"banner":"testbanner.com","title":"tell me why","type":1,"status":1,"editorContent":"bianji","url":"url123123123"}
    },
    // exceptionFinish: {
    //   url: "/application/close/exception/",
    //   type: 'get',
    // },
    exceptionFinish: {
        url: '/exception/close/info/save',
        type: 'post',
    },
    getResourcesTree: {
        url: '/authResource/resourceTrees',
        type: 'get',
    },

    saveSource: {
        url: '/authResource/save',
        type: 'post',
        // params: {"id":26,"resource":"test update resource","parentId":"3","remark":"test update resource"}
    },

    deleteResources: {
        url: '/authResource/delete/',
        type: 'get',
    },

  analysisList: {
    url: '/analysis/web/list',
    type: 'get',
    urlType: 'report',
  },

    accountingMonitor: {
        url: '/accountingMonitor/status',
        type: 'get',
    },

    collectionReport: {
        statisticsOverAll: {
            url: '/loanOrderInfo/statisticsOverAll',
            type: 'post',
        },
        statisticsNormal: {
            url: '/loanOrderInfo/statisticsNormal',
            type: 'post',
        },
        statisticsOverdue: {
            url: '/loanOrderInfo/statisticsOverdue',
            type: 'post',
        },
    },

    stageData: {
        memberStage: {
            url: '/stageData/memberStage',
            type: 'get',
        },
        orderStage: {
            url: '/stageData/orderStage',
            type: 'get',
        },
        applicationStage: {
            url: '/stageData/applicationStage',
            type: 'get',
        },
        applicationStage1: {
            url: '/stageData/new/applied/account',
            type: 'get',
        },
        applicationStage2: {
            url: '/stageData/applied/not/approve/account',
            type: 'get',
        },
    },

  /** ***获取贷前信息列表******* */
  analysisHistory: {
    url: '/analysis/app/history',
    type: 'get',
      urlType: 'report',
  },

  /** ***获取贷前信息列表******* */
  analysisToday: {
    url: '/analysis/app/today',
    type: 'get',
      urlType: 'report',
  },

  /** ***获取贷前信息列表******* */
  analysisAmount: {
    url: '/analysis/app/amount',
    type: 'get',
      urlType: 'report',
  },

    discountSave: {
        url: '/creditCollection/discountSave',
        type: 'post',
    },

    paymentSerialRecord: {
        url: '/paymentSerialRecord/list',
        type: 'post',
    },
    repaymentRecord: {
        url: '/repaymentRecord/list',
        type: 'post',
    },

    getRepaymentFeedbackDetail: {
        url: '/consultMessages/getRepaymentFeedbackDetail/',
        type: 'get',
    },

    getActualOutstandingBalance: {
        url: '/consultMessages/getActualOutstandingBalance',
        type: 'post',
    },

    consultMessagesWindow: {
        url: '/consultMessages/window/close/',
        type: 'get',
    },

    consultMessagesDiscountOrder: {
        url: '/consultMessages/discountOrder/apply',
        type: 'post',
    },

    discountOrderUpload: {
        url: '/consultMessages/discountOrder/upload',
        type: 'post',
    },


    orderMark: {
        url: '/loanOrderInfo/updateLoanOrderInfo',
        type: 'post',
    },
    // 提交催收申请打折内容
    discountOrder: {
        url: '/creditCollection/discountOrder/apply',
        type: 'post',
    },

    // 提交催收黑名单内容
    blackApply: {
        url: '/creditCollection/black/apply',
        type: 'post',
    },

    // 提交催收申请打折内容挂起接口
    discountOrderList: {
        url: '/creditCollection/discountOrder/list',
        type: 'post',
    },
    // 提交催收申请黑名单内容挂起接口
    blackOrderList: {
        url: '/creditCollection/black/list',
        type: 'post',
    },

    // 提交催收申请打折操作
    discountOrders: {
        url: '/creditCollection/discountOrder/operate',
        type: 'post',
    },

    // 提交催收申请黑名单操作
    blackOrders: {
        url: '/creditCollection/black/operate',
        type: 'post',
    },

    //        获取打折申请单状态        //
    // discountOrderLists: {
    //   url:'/creditCollection/discountOrder/statusList',
    //   type: 'get'
    // },
    //        获取黑名单申请单状态        //
    // blackOrderLists: {
    //   url:'/creditCollection/black/statusList',
    //   type: 'get'
    // },
    getDistanceInfo: {
        url: '/riskcontrolmetric/view',
        type: 'post',
    },

  operatorAndRole: {
    url: '/operator/operatorAndRole',
    type: 'post',
    // urlType: 'report',
  },

    nextNotReplay: {
        url: '/consultMessages/nextNotReplay',
        type: 'post',
    },

    getCityListIF: {
        url: '/city/list',
        type: 'get',
    },

    getBarangaysListIF: {
        url: '/city/barangays',
        type: 'post',
    },
    getUserInfoListIF: {
        url: '/loanBasisInfo/selective/listing',
        type: 'get',
    },
    modificationSave: {
        url: '/basis/modification/save',
        type: 'post',
    },


    modificationUpdate: {
        url: '/basis/modification/update',
        type: 'post',
    },

    modificationHis: {
        url: '/basis/modification/log',
        type: 'post',
    },

    occupationInfoList: {
        url: '/occupation/info/',
        type: 'get',
    },

    modificationLog: {
        url: '/contact/modification/log',
        type: 'post',
    },
    contactSave: {
        url: '/contact/modification/save',
        type: 'post',
    },

    // app最后使用时间， app最近使用次数
    userAppInfo: {
        url: '/creditCollection/access/info',
        type: 'post',
    },

    // 日活用户
    userActive: {
        url: '/member/access/active',
        type: 'post',
    },

    // 催收申请单的通讯
    creditAddressbook: {
        url: '/creditCollection/contactsDetails/',
        type: 'get',
    },

    creditAddressbookNew: {
        url: '/creditCollection/mobileContacts/',
        type: 'get',
    },

    // 催收申请单的通讯备注
    saveAddressbookDesc: {
        url: '/creditCollection/describe/',
        type: 'post',
    },

    // getPaymentCode: {
    //   url: '/loanMemberInfo/getByTelephone/',
    //   type: 'get',
    // },

    getByMemberIdCode: {
        url: '/loanMemberInfo/getByMemberId/',
        type: 'get',
    },

    fundTwoWeekSave: {
        url: '/disbursement/estimation/save',
        type: 'post',
    },

    fundEstimation: {
        url: '/disbursement/estimation/latest',
        type: 'get',
    },


    // 投资理财列表
    fundInverstList: {
        url: '/financial/funds/list',
        type: 'post',
    },

    // 投资理财明细
    fundInverstDetails: {
        url: '/financial/income/detail/list',
        type: 'post',
    },

    // 录入投资理财
    inputFundInvest: {
        url: '/financial/funds/save',
        type: 'post',
    },

    // 修改投资理财描述
    modifyFundInvestDesc: {
        url: '/financial/funds/modification',
        type: 'post',
    },

    // 获取催收人员列表
    getCollectorList: {
        url: '/creditCollection/collector/list',
        type: 'post',
    },

    // 催收分组添加
    collectorGroupAdd: {
        url: '/creditCollection/collectorGroup/add',
        type: 'post',
    },

    // 审核角色下拉值
    operatorRoleType: {
        url: '/creditCollection/operatorRole/type',
        type: 'get',
    },

    // 催收分组删除
    collectorGroupDelete: {
        url: '/creditCollection/collectorGroup/delete',
        type: 'post',
    },

    // 催收分组更新
    collectorGroupUpdate: {
        url: '/creditCollection/collectorGroup/update',
        type: 'post',
    },

    // 催收分组查找
    collectorGroupSelect: {
        url: '/creditCollection/collectorGroup/select',
        type: 'post',
    },

    // 给催收员设置分组
    collectorSetCollectorGroup: {
        url: '/creditCollection/collector/setCollectorGroup',
        type: 'post',
    },
    // 给催收员角色设置
    setCollectorRoleList: {
        url: '/creditCollection/collector/setCollectorRole',
        type: 'post',
    },

    // 给审核员设置分组
    setEvaluationGroup: {
        url: '/creditCollection/collector/setEvaluationGroup',
        type: 'post',
    },

    // saleManagement给审核员设置分组
    setSaleEvaluationGroup: {
        url: '/creditCollection/collector/setCallRetrieveGroup',
        type: 'post',
    },

    // 给审核员角色设置
    setEvaluationRoleList: {
        url: '/creditCollection/collector/setEvaluationRole',
        type: 'post',
    },

    // 获取审核人员列表
    getCollectorLists: {
        url: '/assessment/assessor/list',
        type: 'get',
    },
    // 获取管理员状态下拉列表
    operatorStatusList: {
        url: '/operator/status/list',
        type: 'get',
    },
    // 添加管理员接口
    operatorQuickCreate: {
        url: '/operator/quickCreate',
        type: 'post',
    },
    // 分类获取权限列表
    authRoleGroup: {
        url: '/authRole/group/',
        type: 'get',
    },
    getSaleManagementAdvisor: {
        url: '/call/sale/sale/type',
        type: 'get',
    },
    getSaleManagementLists: {
        url: '/call/sale/manage/list',
        type: 'get',
    },
    //= ==========================>//
    ordernumbers: {
        url: '/application/payoutDetails/',
        type: 'get',
    },
    //  应还款日延后
    restRepaymentTime: {
        url: '/loanOrderInfo/rest/repayment/time',
        type: 'post',
    },

    // 获取催收权限列表
    getCollectorRoleList: {
        url: '/creditCollection/collector/role/list',
        type: 'get',
    },

    // 分配催收权限
    saveCollectorRole: {
        url: '/assessment/role/list',
        type: 'get',
    },

    // 分单角色列表
    saleManagementRole: {
        url: '/call/sale/role/list',
        type: 'get',
    },
    // sendsms
    sendsmsPan: {
        url: '/creditCollection/judgeAddressBook',
        type: 'post',
    },

    // 测回分配弹窗
    saveCollectorRoles: {
        url: '/assessment/recycle/',
        type: 'post',
    },
    // 设置角色分配
    roleAssignment: {
        url: '/assessment/setRoles',
        type: 'post',
    },
    // 分单设置角色分配
    saleRoleAssignment: {
        url: '/call/sale/setRoles',
        type: 'post',
    },
    // 设置催收角色分配
    roleAssignments: {
        url: '/creditCollection/collector/resetRoles',
        type: 'post',
    },
    // 手动催收分单
    distributionListss: {
        url: '/creditCollection/overdueOrder/list',
        type: 'post',
    },

    // 获取审核分单列表
    distributionList: {
        url: '/assessment/dispatched/list',
        type: 'post',
    },

    // 获取审核分单列表
    callRetrieveDistributionList: {
        url: '/call/sale/distribution/list',
        type: 'post',
    },

    // 调整催收人员状态
    saveCollectorStatu: {
        url: '/creditCollection/collector/setStatus/',
        type: 'post',
    },
    saveCollectorStatus: {
        url: '/assessment/setAssessorStatus',
        type: 'post',
    },
    saveSaleRetrieveCollectorStatus: {
        url: '/assessment/setSaleStatus',
        type: 'post',
    },
    // 回收催收分单
    recallCollectOrder: {
        url: '/creditCollection/overdueOrder/recycle',
        type: 'post',
    },
    recallCollectOrders: {
        url: '/assessment/recycle/',
        type: 'post',
    },
    // 催收分单
    distributeCollectOrde: {
        url: '/creditCollection/overdueOrder/dispatch',
        type: 'post',
    },
    distributeCollectOrder: {
        url: '/assessment/dispatch/',
        type: 'post',
    },

    // 预付提现金额
    calculateInvestFund: {
        url: '/financial/funds/calculate',
        type: 'post',
    },

    // 未来三天或者五天 到期本息
    futherEstimationDays: {
        url: '/loanOrderInfo/estimation',
        type: 'post',
    },

    // 投资理财提现接口
    withdrawInvestFund: {
        url: '/financial/funds/withdraw',
        type: 'post',
    },

    // 未来十天到期的理财产品及投资收益
    investFutherDaysIncome: {
        url: '/financial/income/detail/expire',
        type: 'post',
    },

    // 未来十天到期的理财产品及投资收益
    riskList: {
        url: '/rule/groups',
        type: 'get',
        urlType: 'credit',
    },
    riskList1: {
        url: '/rule/list/',
        type: 'get',
        urlType: 'credit',
    },
    // 营销规则引擎1.0-4条规则
    marketingRuleList: {
        url: '/marketing/rule/list',
        type: 'get',
    },
    marketingRuleFlip: {
        url: '/marketing/rule/flip/',
        type: 'get',
    },
    marketingRuleThresholdValueUpdate: {
        url: '/marketing/rule/thresholdValue/update',
        type: 'post',
    },
    /** 备注通讯中状态* */
    TelephoneRecord: {
        url: '/telephone/audit/save',
        type: 'post',
    },

    // toggleRiskStatus: {
    //   url: '/rule/flip/',
    //   type: 'post',
    //   urlType: 'credit',
    // },
    toggleRiskStatus: {
        url: '/rule/status',
        type: 'post',
        urlType: 'credit',
    },

    // thresholdValueRiskChange: {
    //   url: '/rule/thresholdValue/update',
    //   type: 'post',
    //   urlType: 'credit',
    // },
    thresholdValueRiskChange: {
        url: '/rule/thresholdvalue',
        type: 'post',
        urlType: 'credit',
    },

    loginByAmeyo: {
        url: '/login/ameyo/auth ',
        type: 'post',
    },

    getOperateAmount: {
        url: '/fundAccountingAmount/activity/operation/amount',
        type: 'get',
    },

    auditListRemarkList: {
        url: '/telephone/audit/list',
        type: 'post',
    },

    auditListRemarkSave: {
        url: '/telephone/audit/save',
        type: 'post',
    },
    reminderInTwoHours: {
        url: '/telephone/audit/unconnected/remind',
        type: 'post',
    },


    //    风控表修改顺序    //
    // changeRiskOrder: {
    //   url: '/riskControl/rule/sort',
    //   type:'post'
    // },

    // changeRiskOrder: {
    //   url: '/rule/sort/v1',
    //   type: 'post',
    //   urlType: 'credit',
    // },
    changeRiskOrder: {
        url: '/rule/sort',
        type: 'post',
        urlType: 'credit',
    },

    //    审核数据报表    //
    getAuditData: {
        url: '/operateRecord/getAuditData',
        type: 'POST',
    },

    recallOrdersBatch: {
        url: '/assessment/batchRecycle',
        type: 'post',
    },

    dipatchOrdersBatch: {
        url: '/assessment/batchDispatch',
        type: 'post',
    },

    dipatchCallRetrieveOrdersBatch: {
        url: '/call/sale/batchDispatch',
        type: 'post',
    },

  // 运营周报总体业务数据
  getMonthBusinessReport: {
    url: '/analysis/app/getMonthBusinessReport',
    type: 'post',
    urlType: 'report',
  },

  // 运营周报本周业务数据
  getDayBusinessReport: {
    url: '/analysis/app/getDayBusinessReport',
    type: 'post',
    urlType: 'report',
  },

  // 运营周报日用户数据
  getDayUserReport: {
    url: '/analysis/app/getDayUserReport',
    type: 'post',
    urlType: 'report',
  },
  // 运营周报用户流失数据
  getDayUserDrainReport: {
    url: '/analysis/app/getDayUserDrainReport',
    type: 'post',
    urlType: 'report',
  },

  // 运营周报逾期当周数据
  getDayOverDueReport: {
    url: '/analysis/app/getDayOverDueReport',
    type: 'post',
    urlType: 'report',
  },
  // 周资金预算表-查看预算结果
  WeeklyFundBudget: {
    url: '/capital/budget/result/view',
    type: 'post',
  },

  // 周资金预算表-修改资金预算自变量
  BudgetaryIndependentVariable: {
    url: '/capital/budget/independent/variable/save',
    type: 'post',
  },

  // 周资金预算表-查看资金预算自变量
  ViewTheCapitalBudget: {
    url: '/capital/budget/independent/variable/view',
    type: 'post',
  },

  // 资金需求配置表-#查看未来资金需求表
  futureFundDemandTable: {
    url: '/capital/budget/future/fund/view',
    type: 'post',
  },

  // 资金需求配置表-#查看未来风险备付金需求表
  riskPaymentGold: {
    url: '/capital/budget/future/risk/reserve/view',
    type: 'post',
  },

  // 资金需求配置表-#查看资金需求配置因子表
  configurationFactorTable: {
    url: '/capital/budget/future/independent/variable/view',
    type: 'post',
  },


  // 资金需求配置表-#保存资金需求配置因子表并计算资金需求和风险备付金需求
  preservationOfCapitalAllocation: {
    url: '/capital/budget/future/independent/variable/save',
    type: 'post',
  },


  // 获取类型列表
  getTypeList: {
    url: '/consultMessages/typeList',
    type: 'get',
  },

  // 运营周报历史业务数据
  getWeekBusinessReport: {
    url: '/analysis/app/getWeekBusinessReport',
    type: 'post',
    urlType: 'report',
  },

  // 运营周报月用户数据
  getMonthUserReport: {
    url: '/analysis/app/getMonthUserReport',
    type: 'post',
    urlType: 'report',
  },

  // 运营周报逾期历史周数据
  getWeekOverDueReport: {
    url: '/analysis/app/getWeekOverDueReport',
    type: 'post',
    urlType: 'report',
  },

  // 获取全部文本
  getContentList: {
    url: '/consultMessages/contentAllList',
    type: 'get',
  },

  // 获取指定类型全部文本
  getContentListByTypeId: {
    url: '/consultMessages/contentTypeIdList',
    type: 'get',
  },

  // 添加类型
  typeInsert: {
    url: '/consultMessages/typeInsert',
    type: 'post',
  },

  // 修改类型
  typeSave: {
    url: '/consultMessages/typeSave',
    type: 'post',
  },

  // 删除类型
  typeDelete: {
    url: '/consultMessages/typeDelete',
    type: 'get',
  },


  // 添加内容
  contentInsert: {
    url: '/consultMessages/contentInsert',
    type: 'post',
  },

  // 修改内容
  contentSave: {
    url: '/consultMessages/contentSave',
    type: 'post',
  },

  // 删除内容
  contentDelete: {
    url: '/consultMessages/contentDelete',
    type: 'get',
  },

  // 获取短信内容
  showSms: {
    url: '/creditCollection/showSms',
    type: 'get',
  },

  creditLog: {
    url: '/creditCollection/creditLog',
    type: 'get',
  },

  dailyOrderRep: {
    url: '/dengesorder/dengesreport/',
    type: 'get',
    urlType: 'report',
  },

  sRepaymentDaily: {
    url: '/dengesorder/dengesreport/dailymustrepayment/',
    type: 'get',
    urlType: 'report',
  },

  repaymentDaily: {
    url: '/dengesorder/dengesreport/dailyrepayment/',
    type: 'get',
    urlType: 'report',
  },

  //    信审人员订单处理报表      //
  processingReport: {
    url: '/dengesorder/dengesreport/applyhandleinfo/',
    type: 'get',
    urlType: 'report',
  },
  //          信审人员放款逾期率情况报表              //
  examinerLoanoverdue: {
    url: '/dengesorder/dengesreport/examinerloanoverdue/',
    type: 'get',
    urlType: 'report',
  },

  //          月放款指标              //
  monthlypaymentindicator: {
    url: '/dengesorder/dengesreport/monthlypaymentindicator/',
    type: 'get',
    urlType: 'report',
  },

  // 贷后周报
  postLoanReportData: {
    url: '/dengesorder/dengesreport/postLoan/getReport/',
    type: 'post',
    urlType: 'report',
  },

  // 获取用户类型列表
  getUserTypeList: {
    url: '/dengesorder/dengesreport/postLoan/user/type',
    type: 'get',
    urlType: 'report'
  },

  //      新老客户放款表现——新客户        //..
  newcustomerLoaninfo: {
    url: '/dengesorder/dengesreport/newcustomerloaninfo/',
    type: 'get',
    urlType: 'report',
  },

  //      新老客户放款表现——所有客户        //..
  allcustomerloaninfo: {
    url: '/dengesorder/dengesreport/allcustomerloaninfo/',
    type: 'get',
    urlType: 'report',
  },

  //      新老客户放款表现——  老客户     //..
  oldcustomerLoaninfo: {
    url: '/dengesorder/dengesreport/oldcustomerloaninfo/',
    type: 'get',
    urlType: 'report',
  },
  orderDailyReport: {
    url: '/cashlending-report-restful/order/dengesreport',
    type: 'get',
    urlType: 'report',
  },
  messageList: {
    url: '/message/list',
    type: 'post',
    urlType: 'report',
  },
  networkList: {
    url: '/adjust/callback/log/network/list',
    type: 'get',
    // urlType: 'report',
  },

  trafficmonitortype: {
    url: '/adjust/callback/log/Traffic/monitor/data/type',
    type: 'get',
    // urlType: 'report',
  },

  callbackLogStatistics: {
    url: '/adjust/callback/log/statistics',
    type: 'post',
      urlType: 'report',
  },
  collectionGroup: {
    url: '/collection/group/list',
    type: 'get',
    urlType: 'report',
  },
  // 催收员报表
  getCollectorReport: {
    url: '/collectReport/getCollectorReport',
    type: 'get',
    urlType: 'report',
  },

  // 邀请好友数据接口
  getInvideFrendsData: {
    url: '/appMonitor/getInvideFrendsData',
    type: 'post',
    urlType: 'report',
  },
  // BT报表马甲包下拉框接口
  getProductVersion: {
    url: '/appMonitor/product/version/with/cashmore',
    type: 'get',
  },

    appMonitorProductVersionPacket: {
        url: '/appMonitor/product/version/packet/name',
        type: 'get',
    },

  // BT报表马甲包列表接口
  getVestBagData: {
    url: '/appMonitor/getVestBagData',
    type: 'post',
    urlType: 'report'
  },

    // DP账户变更放款校对
    getpayoutlist: {
        url: '/payout/account/list',
        type: 'post',
    },

    // DP放款实时校对
    getinvisibility: {
        url: '/payout/account/invisibility/amount',
        type: 'get',
    },

    // 推送消息发送页面App名称接口
    getProductVersionList: {
        url: '/appMonitor/getProductVersion',
        type: 'get',
    },

    // 推送消息发送页面列表加载接口
    operatingToolPushList: {
        url: '/operating/tool/push/list',
        type: 'POST',
    },

  // 推送消息发送页面用户状态下拉框接口
  operatingToolPushStatusLt: {
    url: '/operating/tool/push/status',
    type: 'get',
  },

  getDownloadInformation: {
    url: '/operating/tool/download/list',
    type: 'post',
  },

  sendTheSubmission: {
    url: '/operating/tool/push/user',
    type: 'post',
  },

  sendMessageToPhone: {
      url: '/operating/tool/msg/user',
      type: 'post',
  },

  // 推送消息查看历史记录
  toolPushHistory: {
    url: '/operating/tool/push/history',
    type: 'POST',
  },

  // 发送短信查看历史记录
  sendMessageHistory: {
    url: '/operating/tool/msg/history',
    type: 'POST',
  },

  // 电话销售功能展示列表
  callSaleClientList: {
    url: '/call/sale/client/list',
    type: 'POST',
  },

  callSaleClientReasonType: {
    url: '/call/sale/client/reason/type',
    type: 'get',
  },

  callSaleClientDeal: {
    url: '/call/sale/client/deal',
    type: 'POST',
  },

  callSaleSaleReuslt: {
    url: '/call/sale/sale/reuslt',
    type: 'POST',
  },

  callSaleAdviseAllType: {
    url: '/call/sale/advise/all/type',
    type: 'get',
    // 催收月报明细功能
  },
  collectionMonthlyDetailList: {
    url: '/collection/monthly/detail/list',
    type: 'POST',
    urlType: 'report',
  },

  // 催收员短信发送统计
  collectReportCreditSendReport: {
    url: '/collectReport/credit/send/report',
    type: 'POST',
  },

  // APP流失数据查询
  memberActionAnalyticAppLoseRate: {
    url: '/member/action/analytic/app/lose/rate',
    type: 'POST',
    urlType: 'report',
  },
  // APP流失数据版本号列表
  memberLoginLogProductVersionList: {
    url: '/member/login/log/product/version/list',
    type: 'get',
    urlType: 'report',
  },

  // 特殊操作类型列表
  appMonitorProductVersionCashmore: {
    url: '/appMonitor/product/version/with/cashmore',
    type: 'get',
  },

  // 特殊操作类型列表
  specialOperationLogType: {
    url: '/special/operation/log/type',
    type: 'get',
  },

  // 特殊操作记录列表
  specialOperationLogList: {
    url: '/special/operation/log/list',
    type: 'post',
  },

  callSaleCallData: {
    url: '/call/sale/call/data',
    type: 'post',
  },

  sellerList: {
    url: '/seller/list',
    type: 'post',
    urlType: 'markets',
  },

    sellerAdd: {
        url: '/seller/add',
        type: 'post',
        urlType: 'markets',
    },

    sellerModify: {
        url: '/seller/modify',
        type: 'post',
        urlType: 'markets',
    },

    goodsList: {
        url: '/goods/list',
        type: 'post',
        urlType: 'markets',
    },

    goodsAdd: {
        url: '/goods/add',
        type: 'post',
        urlType: 'markets',
    },

    goodsModify: {
        url: '/goods/modify',
        type: 'post',
        urlType: 'markets',
    },

    goodsReordering: {
        url: '/goods/reordering',
        type: 'post',
        urlType: 'markets',
    },

    goodsView: {
        url: '/goods/view',
        type: 'post',
        urlType: 'markets',
    },

    uploadLogo: {
        url: '/goods/upload/logo',
        type: 'post',
        urlType: 'markets',
    },

    addBuryPoint: {
        url: '/buriedpoint/trigger/add',
        type: 'post'
    },

    // 公司管理列表
    getCompanyList: {
        url: '/company/list',
        type: 'post',
        urlType: 'collection'
    },
    // 添加公司
    addCompany: {
        url: '/company/add',
        type: 'post',
        urlType: 'collection'
    },
    // 编辑公司
    editCompany: {
        url: '/company/modify',
        type: 'post',
        urlType: 'collection'
    },

    postLoanCreditorList: {
        url: '/dengesorder/dengesreport/postLoan/creditor/list',
        type: 'post',
        urlType: 'report',
    },

    loanBasisInfoDealFlow: {
        url: '/loanBasisInfo/deal/flow',
        type: 'post',
    },

    distributeCompanyOrder: {
        url: '/order/dispatch/company',
        type: 'post',
        urlType: 'collection'
    },

    getChannelList: {
        url: '/dataMonitor/channel/list',
        type: 'get',
        urlType: 'report',
    },

  getDailyMonitorList: {
      url: '/dataMonitor/channel/daily/list',
      type: 'post',
      urlType: 'report',
  },

  getFunnelMonitorAppDataList: {
      url: '/dataMonitor/channel/funnel/appDataList',
      type: 'post',
      urlType: 'report',
  },

  getFunnelMonitorAuditDataList: {
      url: '/dataMonitor/channel/funnel/auditDataList',
      type: 'post',
      urlType: 'report',
  },

  getFunnelMonitorRecoverDataList: {
      url: '/dataMonitor/channel/funnel/recoverDataList',
      type: 'post',
      urlType: 'report',
  },

  getPlatformWholeMonitorDataListOne: {
      url: '/dataMonitor/platform/whole/listOne',
      type: 'post',
      urlType: 'report',
  },

  getPlatformWholeMonitorDataListTwo: {
      url: '/dataMonitor/platform/whole/listTwo',
      type: 'post',
      urlType: 'report',
  },

  getPlatformWholeMonitorDataListThree: {
      url: '/dataMonitor/platform/whole/listThree',
      type: 'post',
      urlType: 'report',
  },
    couponManageUserList: {
        url: '/coupon/manage/user/list',
        type: 'post',
    },

    loanBasisInfoSaveFlow: {
        url: '/loanBasisInfo/save/flow',
        type: 'post',
    },

    couponManagePulldownList: {
        url: '/coupon/manage/pull-down/',
        type: 'get',
    },

    couponManageUserPulldownList: {
        url: '/coupon/manage/user/pull-down',
        type: 'get',
    },

    couponManageList: {
        url: '/coupon/manage/list',
        type: 'post',
    },

    //优惠卷活动界面下拉列表
    activityManagePulldown: {
        url: '/activity/manage/pull-down',
        type: 'get',
    },

    userPullDown: {
        url: '/coupon/manage/user/pull-down',
        type: 'get',
    },

    //优惠卷活动管理列表
    activityManageList: {
        url: '/activity/manage/list',
        type: 'post',
    },

    //优惠卷活动修改
    couponManageModify: {
        url: '/coupon/manage/modify',
        type: 'post',
    },

    //活动管理新增
    activityManageAdd: {
        url: '/activity/manage/add',
        type: 'post',
    },

    //活动管理修改
    activityManageModify: {
        url: '/activity/manage/modify',
        type: 'post',
    },

    addCoupon: {
        url: '/coupon/manage/add',
        type: "post"
    },

    editCoupon: {
        url: '/coupon/manage/modify',
        type: "post"
    },

    creditCollectionResetPassword: {
        url: '/creditCollection/reset/password/',
        type: "get"
    },

    couponManageCouponType: {
      url: '/coupon/manage/coupon/type',
      type: "get"
    },

    couponManageImportData: {
      url: '/coupon/manage/import/data',
      type: "post"
    },

    telephoneManagerQueryMemberInfo: {
      url: '/loanMemberInfo/queryMemberInfo',
      type: "post"
    },

    telephoneManagerModifyMemberTelephone: {
      url: '/telephone/manager/modifyMemberTelephone',
      type: "post"
    },

    appMonitorGetProductVersionList: {
      url: '/appMonitor/getProductVersion',
      type: "get"
    },


    queryModifyMemberTelephoneRecordList: {
      url: '/telephone/manager/queryModifyMemberTelephoneRecord',
      type: "post"
    },


    memberSmsSendCheckAddMemberSMSSendCheck: {
      url: '/memberSmsSendCheck/addMemberSMSSendCheck',
      type: "post",
      urlType: 'boReportStr'
    },

    memberSmsSendCheckQueryMemberSMSSendCheckRecord: {
      url: '/memberSmsSendCheck/queryMemberSMSSendCheckRecord',
      type: "post"
    },

    callSaleImportData: {
      url: '/call/sale/import/data',
      type: "post"
    },
    getBIAppLoginList: {
        url: '/biAppConversionRate/loginConversionRate/list',
        type: "post",
        urlType: 'biReport'
    },

    getBIAppApplicationList: {
        url: '/biAppConversionRate/applicationConversionRate/list',
        type: "post",
        urlType: 'biReport'
    },

    getAppNameList: {
        url: '/common/appName/list',
        type: "get",
        urlType: 'biReport'
    },
    operatingToolPushImportData: {
      url: '/operating/tool/push/import/data',
      type: "post"
    },

    operatingToolSmsImportData: {
      url: '/operating/tool/sms/import/data',
      type: "post"
    },
    getBIAppLoanList: {
        url: '/mainprocess/loan/list',
        type: "post",
        urlType: 'report'
    },
    getBIAppRepaymentList: {
        url: '/biAppConversionRate/applicationRepaymentConversionRate/list',
        type: "post",
        urlType: 'biReport'
    },
    getBIAppAuditList: {
        url: '/biAppConversionRate/applicationAuditConversionRate/list',
        type: "post",
        urlType: 'biReport'
    },
    getBIAppAuditRuleList: {
        url: '/biAppConversionRate/applicationAuditLevelConversionRate/list',
        type: "post",
        urlType: 'biReport'
    },
    getBIAppIndicatorList: {
        url: '/mainprocess/indicator/list',
        type: "post",
        urlType: 'report'
    },
    getGradeList: {
        url: '/common/riskControlLevel/list',
        type: "get",
        urlType: 'biReport'
    },
    getBINewRegisterList: {
        url: '/biNewRegisterRate/list',
        type: "post",
        urlType: 'biReport'
    },
    getBIMemberConversionRate: {
        url: '/biMemberConversionRate/queryKeepMemberConversionRate/list',
        type: "post",
        urlType: 'biReport'
    },
    getNewAddressBookInfo: {
        url: '/application/has/addressbook',
        type: 'get'
    },
    getNewAddressBookDetail: {
        url: '/application/addressbook/b/type',
        type: 'get'
    },
    getNewAddressBookSubmit: {
        url: '/application/submit/addressbook',
        type: 'post'
    },
    getApplicationType: {
        url: '/assessment/applicationType/list',
        type: 'get'
    },
    promotionList: {
        url: '/promotion/list',
        type: 'post'
    },
    promotionAddUser: {
        url: '/promotion/add/user',
        type: 'post'
    },
    //资金页面新增数据接口
    fundAccountingAmountChannelAccountList: {
        url: '/fundAccountingAmount/channel/account/list',
        type: 'get'
    },
    getBiOldRetailByMonth: {
        url: '/biOldRetail/month/list',
        type: 'post',
        urlType: 'biReport'
    },
    getBiOldRetailByWeek: {
        url: '/biOldRetail/week/list',
        type: 'post',
        urlType: 'biReport'
    },
    getBiOldRetailByDate: {
        url: '/biOldRetail/date/list',
        type: 'post',
        urlType: 'biReport'
    },
    getBiProductMainProcessList: {
        url: '/biMainProcessRate/productMain/list',
        type: 'post',
        urlType: 'biReport'
    },
    getBiLoanRiskLevelList: {
        url: '/biMainProcessRate/loanRiskLevel/list',
        type: 'post',
        urlType: 'biReport'
    },
    getRiskLevelList: {
        url: '/biMainProcessRate/riskLevel/list',
        type: 'get',
        urlType: 'biReport'
    },
    loanBasisInfoExamin: {
        url: '/application/applicant/saveVerification',
        type:'post'
    },
    applicationApplicantVerification: {
        url: '/application/applicant/verification',
        type: 'get'
    },
    mail:{
        getMailAccountList: {
            url: '/mailcenter/address/list',
            type: 'get',
        },
        addMailAccount: {
            url: '/mailcenter/address/new',
            type: 'post',
        },
        changeMailAccountStatus: {
            url: '/mailcenter/address/status',
            type: 'post',
        },
        delMailAccount: {
            url: '/mailcenter/address/del/<%= id%>',
            type: 'delete',
        },
        getMailList: {
            url: '/mailcenter/mail/list',
            type: 'get',
        },
        addMail: {
            url: '/mailcenter/mail/new',
            type: 'post',
        },
        delMail: {
            url: '/mailcenter/mail/del/<%= id%>',
            type: 'delete',
        },
        updateMail: {
            url: '/mailcenter/mail/update/<%= id%>',
            type: 'put',
        },
        getMailSenderList: {
            url: '/mailcenter/sender/list',
            type: 'get',
        },
        getMailDetail: {
            url: '/mailcenter/mail/detail/<%= id%>',
            type: 'get',
        },
        getMailRecipientList: {
            url: '/mailcenter/recipient/list',
            type: 'get',
        },
        setIndividualRecipientMaps: {
            url: '/mailcenter/recipient/map/<%= id%>',
            type: 'post',
        },
        getMailIndividualRecipientMapList:{
            url: '/mailcenter/individual/recipient/<%= id%>',
            type: 'get',
        },
        validMail: {
            url: '/mailcenter/mail/valid/<%= id%>',
            type: 'get'
        },
        startupMail: {
            url: '/mailcenter/mail/startup/<%= id%>',
            type: 'post'
        },
        stopMail: {
            url: '/mailcenter/mail/stop/<%= id%>',
            type: 'post'
        }
    },
    distributionListMarketing: {
        url: '/marketing-call/list/distribution',
        type: 'post',
    },
    marketingCallAllType: {
        url: '/marketing-call/all/type',
        type: 'get',
    },

    adviseReusltList: {
        url: '/marketing-call/list/advise-reuslt',
        type: 'post',
    },

    callDataList: {
        url: '/marketing-call/call/data',
        type: 'post',
    },

    callImportData: {
        url: '/marketing-call/import/data',
        type: 'post',
    },

    marketingCallcl: {
        url: '/marketing-call/sale-management/operation',
        type:'post',
    },
    marketingCallDispatch: {
        url: '/marketing-call/dispatch',
        type: 'post',
    },
    saleManagementList: {
        url: '/marketing-call/list/sale-management',
        type:'post'
    },
    realTimeOrderList: {
        url: '/biIndicatorMonitor/order/realTime',
        type: 'post',
        urlType: 'biReport'
    },
    //Unipay支付失败订单处理
    unipayTransactionList: {
        url: '/fund/unipay/transaction/log/failed/list',
        type: 'post',
    },
    alert: {
        getDatasourceList: {
            url: '/alert/datasource/list',
            type: 'get'
        },
        addDatasource: {
            url: '/alert/datasource/add',
            type: 'post'
        },
        delDatasource: {
            url: '/alert/datasource/del/',
            type: 'delete'
        },
        detailDatasource: {
            url: '/alert/datasource/detail/',
            type: 'get'
        },
        editDatasource: {
            url: '/alert/datasource/edit/',
            type: 'put'
        },
        getThresholdList: {
            url: '/alert/threshold/list',
            type: 'get'
        },
        addThreshold: {
            url: '/alert/threshold/add',
            type: 'post'
        },
        delThreshold: {
            url: '/alert/threshold/del/',
            type: 'delete'
        },
        detailThreshold: {
            url: '/alert/threshold/detail/',
            type: 'get'
        },
        editThreshold: {
            url: '/alert/threshold/edit/',
            type: 'put'
        },
        getAbnormalLogList: {
            url: '/alert/abnormallog/list',
            type: 'get'
        },
        checkAbnormalLog: {
            url: '/alert/abnormallog/check/',
            type: 'put'
        }
    },
    //App版本接口更改
    appConfigListAppName: {
        url: '/appConfig/list/AppName',
        type: 'get',
    },
    paymentSerialRecordRole: {
        url: '/paymentSerialRecord/getPaymentByStatus',
        type: 'post',
    },
    appConfigListPacketApp: {
        url: '/appConfig/list/packet-app',
        type: 'get',
    },
    //马甲包处理列表接口
    appConfigList: {
        url: '/appConfig/list',
        type: 'post',
    },
    //马甲包处理编辑
    appConfigOne: {
        url: '/appConfig/one',
        type: 'post',
    },
    //马甲包处理新增
    appConfigAdd: {
        url: '/appConfig/add',
        type: 'post',
    },
    //马甲包处理更新列表
    appConfigUpdateList: {
        url: '/appConfig/update/data',
        type: 'post',
    },
    //appName下拉列表
    appConfigAppNameList: {
        url: '/appConfig/list/AppName',
        type: 'get',
    },

    //催收页面小工具获取还款码
    creditToolreferenceNumber: {
        url: '/credit-tool/reference/number/',
        type: 'get',
    },
    //催收页面小工具获取分组
    creditToolListGroup: {
        url: '/credit-tool/list/group',
        type: 'get',
    },
    //催收页面小工具获得下载数据
    creditToolDownload: {
        url: '/credit-tool/download/',
        type: 'get',
    },
    creditToolExample: {
        url: '/credit-tool/example',
        type: 'get',
    },

    //营销工具页面接口
    //营销规则列表页
    rulePageList: {
        url: '/rule/page?',
        type: 'get',
        urlType: 'ams',
    },
    //开启开关接口
    ruleOn: {
        url: '/rule/on/',
        type: 'patch',
        urlType: 'ams',
    },
    //关闭开关接口
    ruleOff: {
        url: '/rule/off/',
        type: 'patch',
        urlType: 'ams',
    },
    //获取单条数据
    ruleListOne: {
        url: '/rule/',
        type: 'get',
        urlType: 'ams',
    },
    //编辑单条数据
    ruleListEdit: {
        url: '/rule/',
        type: 'patch',
        urlType: 'ams',
    },
    //add数据
    ruleListAdd: {
        url: '/rule/',
        type: 'post',
        urlType: 'ams',
    },
    // 发送记录页面列表接口
    notificationPage: {
        url: '/notification/page',
        type: 'get',
        urlType: 'ams',
    },
    //营销变量列表接口
    variableList: {
        url: '/variable/list',
        type: 'get',
        urlType: 'ams',
    },
    metricPageList: {
        url: '/metric/page?',
        type: 'get',
        urlType: 'bms',
    },
    typyOfId: {
        type: 'get',
        url: '/basis/modification/certificate-type/'
    },
    ruleActionLists: {
        type: 'get',
        url: '/rule/action/',
        urlType: 'ams',
    },
    ruleActionRules: {
        type: 'delete',
        url: '/rule/',
        urlType: 'ams',
    },
    ruleActionRulebc: {
        type: 'post',
        url: '/rule/action',
        urlType: 'ams',
    },
    ruleActionRuletc: {
        type: 'patch',
        url: '/rule/action',
        urlType: 'ams',
    },
    ruleActionRulese: {
        type: 'get',
        url: '/sender/list',
        urlType: 'ams',
    },
    ruleActionRulefile: {
        type: 'post',
        url: '/rule/file',
        urlType: 'ams',
    },
    rulePageListb: {
        type: 'get',
        url: '/rule/page?',
        urlType: 'bms',
    },
    metricListgz: {
        type: 'get',
        url: '/metric/list',
        urlType: 'bms',
    },
    ruleSavePost: {
        type: 'post',
        url: '/rule/',
        urlType: 'bms',
    },
    ruleSavePatch: {
        type: 'patch',
        url: '/rule/',
        urlType: 'bms',
    },
    ruleListGet: {
        type: 'get',
        url: '/rule/',
        urlType: 'bms',
    },
    notificationPageList: {
        type: 'get',
        url: '/notification/page?',
        urlType: 'bms',
    },
    ruleListGetT: {
        type: 'get',
        url: '/rule/list/',
        urlType: 'bms',
    },
    //新监控页面指标相关删除单条接口
    deleteMetric: {
        url: '/metric/',
        type: 'delete',
        urlType: 'bms',
    },
    //新监控页面指标相关编辑单条接口
    editMetric: {
        url: '/metric',
        type: 'post',
        urlType: 'bms',
    },
    //新监控页面规则相关删除接口
    deleterulePage: {
        url: '/rule/',
        type: 'delete',
        urlType: 'bms',
    },
    //新监控页面规则相关开启开关接口
    ruleOns: {
        url: '/rule/on/',
        type: 'patch',
        urlType: 'bms',
    },
    //新监控页面规则相关开启开关接口
    ruleOffs: {
        url: '/rule/off/',
        type: 'patch',
        urlType: 'bms',
    },
}, biInterface);


const str = '/msrestful';
// str = `/uplending-manager-restful`;

const reportStr = '/report-restful';
const marketStr = '/market';
const collectionStr = '/collection-rest';
const creditStr = '/risk';
const biReportStr = '/report-bi-restful';
const amsStr = '/ams';
const bmsStr = '/bms';

_.each(Interface, (doc, index) => {
    if (doc.url) {
        if (doc.urlType && doc.urlType == 'report') {
            doc.url = `${reportStr}${doc.url}`;
        } else if (doc.urlType && doc.urlType == 'markets') {
            doc.url = `${marketStr}${doc.url}`;
        } else if (doc.urlType && doc.urlType == 'collection') {
            doc.url = `${collectionStr}${doc.url}`;
        } else if (doc.urlType && doc.urlType == 'credit') {
            doc.url = `${creditStr}${doc.url}`;
        } else if (doc.urlType && doc.urlType == 'biReport') {
            doc.url = `${biReportStr}${doc.url}`;
        }else if (doc.urlType && doc.urlType == 'ams') {
            doc.url = `${amsStr}${doc.url}`;
        }else if (doc.urlType && doc.urlType == 'bms') {
            doc.url = `${bmsStr}${doc.url}`;
        } else {
            doc.url = `${str}${doc.url}`;
        }
    }

  if (_.isObject(doc) && !doc.url) {
    _.each(doc, (subItem, subIndex) => {
      if (_.isObject(subItem) && subItem.url) {
        if(index === "stageData"){
            subItem.url = `${reportStr}${subItem.url}`;
        }else{
            subItem.url = `${str}${subItem.url}`;
        }
      }

            doc[subIndex] = subItem;
        });
    }
    Interface[index] = doc;
});



export default Interface;
