/**
 * Created by jhonyoung on 2017/10/29.
 * 组件导入，导出，按照业务功能区分

 */

import { AsyncComponent } from '../lib/component/index.js';

const LoanAudit = AsyncComponent(() => import('../components/loanAudit/loanAudit.jsx'));
const LoanAuditDetails = AsyncComponent(() => import('../components/loanAudit/loanAuditDetails.jsx'));
const EvaluationDispatch = AsyncComponent(() => import('../components/loanAudit/evaluationDispatch.jsx'));
const CallRetrieveManagement = AsyncComponent(() => import('../components/loanAudit/callRetrieveManagement.jsx'));

const Revaluation = AsyncComponent(() => import('../components/revaluation/revaluation.jsx'));
const RevaluationDetails = AsyncComponent(() => import('../components/revaluation/revaluationDetails.jsx'));

const PostLoan = AsyncComponent(() => import('../components/postLoan/postLoan.jsx'));
const PostLoanDetails = AsyncComponent(() => import('../components/postLoan/postLoanDetails.jsx'));

const InputOrder = AsyncComponent(() => import('../components/inputOrder/inputOrder.jsx'));
const InputOrderDetails = AsyncComponent(() => import('../components/inputOrder/inputOrderDetails.jsx'));

const Feedback = AsyncComponent(() => import('../components/feedback/feedback.jsx'));
const FeedbackDetails = AsyncComponent(() => import('../components/feedback/feedbackDetails.jsx'));

const RepaymentFeedback = AsyncComponent(() => import('../components/feedback/repaymentFeedback.jsx'));
const RepaymentFeedbackDetails = AsyncComponent(() => import('../components/feedback/repaymentFeedbackDetails.jsx'));

const PeopleManagement = AsyncComponent(() => import('../components/peoplemanagement/peopleManagement.jsx'));
const PeopleManagementDetails = AsyncComponent(() => import('../components/peoplemanagement/peopleManagementDetails.jsx'));

const PasswordModify = AsyncComponent(() => import('../components/passwordmodify/passwordModify.jsx'));

const AuthRoleManagement = AsyncComponent(() => import('../components/authrolemanagement/authrolemanagement.jsx'));
const AuthRoleManagementDetails = AsyncComponent(() => import('../components/authrolemanagement/authrolemanagementDetails.jsx'));

const CreditCollection = AsyncComponent(() => import('../components/creditCollection/creditCollection.jsx'));
const CreditCollectionDetails = AsyncComponent(() => import('../components/creditCollection/creditCollectionDetails.jsx'));
const CreditDispatch = AsyncComponent(() => import('../components/creditCollection/creditDispatch.jsx'));

const UserInformation = AsyncComponent(() => import('../components/userInformation/userInformation.jsx'));
const UserInformationDetails = AsyncComponent(() => import('../components/userInformation/userInformationDetails.jsx'));

const CollectorReport = AsyncComponent(() => import('../components/creditCollection/collectorReport.jsx'));

const CreditReport = AsyncComponent(() => import('../components/creditCollection/creditReport.jsx'));
const CreditReportWithTab = AsyncComponent(() => import('../components/creditCollection/creditReportWithTab.jsx'));
// const OperationData = AsyncComponent(() => import("../components/operationdata/operationdata.jsx"));
// const CollectionReport = AsyncComponent(() => import("../components/collectionReport/collectionReport.jsx"));
const RiskReport = AsyncComponent(() => import("../components/riskReport/riskReport.jsx"));


const FundManagement = AsyncComponent(() => import('../components/fundManagement/fundManagement.jsx'));
const BannerManagement = AsyncComponent(() => import('../components/bannerManagement/bannerManagement.jsx'));
const BannerManagementDetails = AsyncComponent(() => import('../components/bannerManagement/bannerManagementDetails.jsx'));
const ResourceManagement = AsyncComponent(() => import('../components/resourceManagement/resourceManagement.jsx'));
const OperationData = AsyncComponent(() => import('../components/operationdata/operationdata.jsx'));

const PaymentFailed = AsyncComponent(() => import('../components/paymentFailed/paymentFailed.jsx'));
const Test = AsyncComponent(() => import('../components/test/test.jsx'));
const RiskManagement = AsyncComponent(() => import('../components/riskManagement/riskManagement.jsx'));
const Marketrulesengine = AsyncComponent(() => import('../components/riskManagement/marketrulesengine.jsx'));

const OperatorMonthlyBD = AsyncComponent(() => import('../components/report/operatorMonthlyBD.jsx'));
const OperatorPastWeeklyBD = AsyncComponent(() => import('../components/report/operatorPastWeeklyBD.jsx'));
const operatorCurWeeklyBD = AsyncComponent(() => import('../components/report/operatorCurWeeklyBD.jsx'));

const operatorCurWeeklyBU = AsyncComponent(() => import('../components/report/operatorCurWeeklyBU.jsx'));

const OperatorReporterWithTab = AsyncComponent(() => import('../components/report/operatorReporterWithTab.jsx'));

const PromiseToPay = AsyncComponent(() => import('../components/creditCollection/PromiseToPay.jsx'));
const AdjustSearchTool = AsyncComponent(() => import('../components/adjustsearchtool/adjustSearchTool.jsx'));
const AppMonitor = AsyncComponent(() => import('../components/appMonitor/appMonitor.jsx'));
const Moneymonitor = AsyncComponent(() => import('../components/moneymonitor/moneymonitor.jsx'));
const Specialrecord = AsyncComponent(() => import('../components/moneymonitor/specialrecord.jsx'));
const Operatingtool = AsyncComponent(() => import('../components/operatingtool/operatingtool.jsx'));
const Operatingtoolhistory = AsyncComponent(() => import('../components/operatingtool/operatingtoolhistory.jsx'));
const OperatingToolSmsHistory = AsyncComponent(() => import('../components/operatingtool/operatingToolSmsHistory.jsx'));
const Callsale = AsyncComponent(() => import('../components/callsale/Client.jsx'));
const CallsaleNew = AsyncComponent(() => import('../components/callsaleNew/Client.jsx'));
const CooperationCompany = AsyncComponent(() => import('../components/creditSuperManagement/cooperationCompany.jsx'));
const CooperationProduct = AsyncComponent(() => import('../components/creditSuperManagement/cooperationProduct.jsx'));
const MonitorData = AsyncComponent(() => import('../components/monitorData/monitorData.jsx'));
const FunnelData = AsyncComponent(() => import('../components/monitorData/funnelData.jsx'));
const Demo = AsyncComponent(() => import('../components/demo/demo.jsx'));
const ActivityManagement = AsyncComponent(() => import('../components/activityManagement/activityManagement.jsx'));
const CouponManagement = AsyncComponent(() => import('../components/couponManagement/couponManagement.jsx'));
const MainProcess = AsyncComponent(() => import('../components/BIMainProcess/mainProcess.jsx'));
const BiMainProcess = AsyncComponent(() => import('../components/BIMainProcess/bimainProcess.jsx'));
const Promotion = AsyncComponent(() => import('../components/promotion/offlinePromotionOffline.jsx'));
const MailCenter = AsyncComponent(() => import('../components/mailCenter/mailCenter.jsx'));
const NewMail = AsyncComponent(() => import('../components/mailCenter/newMail/newMail.jsx'));

//风控警报
const Datasource = AsyncComponent(() => import('../components/riskControlMonitor/datasource.jsx'));
const AlertRules = AsyncComponent(() => import('../components/riskControlMonitor/alertRules.jsx'));
const AbnormalLog = AsyncComponent(() => import('../components/riskControlMonitor/abnormalLog.jsx'));
const IndicatorsRelated = AsyncComponent(() => import('../components/indicatorsRelated/indicatorsRelated.jsx'));
const NotifyRecord = AsyncComponent(() => import('../components/notifyRecord/notifyRecord.jsx'));
const RulesRelated = AsyncComponent(() => import('../components/rulesRelated/rulesRelated.jsx'));
const AddRelateds = AsyncComponent(() => import('../components/rulesRelated/addRelateds.jsx'));

LoanAuditDetails.routerName = 'loanauditdetails/:id/:type'; // 所有详情页重新指派路由添加id等
RevaluationDetails.routerName = 'revaluationDetails/:id';
PostLoanDetails.routerName = 'postLoanDetails/:id/:applicationId';
InputOrderDetails.routerName = 'inputOrderDetails/:id';
FeedbackDetails.routerName = 'feedbackDetails/:id';
RepaymentFeedbackDetails.routerName = 'repaymentFeedbackDetails/:id';
PeopleManagementDetails.routerName = 'peoplemanagementDetails/:id/:type';
AuthRoleManagementDetails.routerName = 'authrolemanagementDetails/:id/:type';
CreditCollectionDetails.routerName = 'creditcollectionDetails/:orderId/:applicationId/:specialStatus';
UserInformationDetails.routerName = 'userinformationDetails/:id/:userId';
BannerManagementDetails.routerName = 'BannerManagementDetails/:id';
NewMail.routerName = 'newmail/:id';

import {
    Home,
    IndicatorManagement,
    IndicatorQuery,
    RuleCreator,
    RuleDetail,
    RuleGroupManagement,
    RuleManagement,
    RulesForGroup,
    StrategyManagement,
    StrategyQuery,
    UserGroupManagement,
    SystemParams
} from 'risk-control-front-components-pro';

Home.routerName = 'riskhome';
RuleCreator.routerName = ['rulecreator', 'ruleeditor/:ruleId'];
RuleDetail.routerName = 'ruledetail/:ruleId';
RulesForGroup.routerName = 'rulesforgroup/:groupId';

export default {
  LoanAudit,
  LoanAuditDetails,
  Revaluation,
  RevaluationDetails,
  PostLoan,
  PostLoanDetails,
  InputOrder,
  InputOrderDetails,
  Feedback,
  FeedbackDetails,
  RepaymentFeedbackDetails,
  PeopleManagement,
  PeopleManagementDetails,
  PasswordModify,
  AuthRoleManagement,
  AuthRoleManagementDetails,
  CreditCollection,
  CreditCollectionDetails,
  UserInformation,
  UserInformationDetails,
  FundManagement,
  BannerManagement,
  BannerManagementDetails,
  ResourceManagement,
  OperationData,
  // CollectionReport,
  PaymentFailed,
  Test,
  CreditDispatch,
  RiskManagement,
  CreditReport,
  RiskReport,
  EvaluationDispatch,
  Demo,
  OperatorMonthlyBD,
  operatorCurWeeklyBD,
  OperatorPastWeeklyBD,
  OperatorReporterWithTab,
  operatorCurWeeklyBU,
  CreditReportWithTab,
  CollectorReport,
  PromiseToPay,
  AdjustSearchTool,
  AppMonitor,
  Moneymonitor,
  Specialrecord,
  Operatingtool,
  Operatingtoolhistory,
  OperatingToolSmsHistory,
  Callsale,
  CallsaleNew,
  CallRetrieveManagement,
  CooperationProduct,
  CooperationCompany,
  Marketrulesengine,
  MonitorData,
  ActivityManagement,
  CouponManagement,
  FunnelData,
  MainProcess,
  BiMainProcess,
  Home,
  IndicatorManagement,
  IndicatorQuery,
  RuleCreator,
  RuleDetail,
  RuleGroupManagement,
  RuleManagement,
  RulesForGroup,
  StrategyManagement,
  StrategyQuery,
  UserGroupManagement,
  SystemParams,
  Promotion,
  MailCenter,
  NewMail,
  Datasource,
  AlertRules,
  AbnormalLog,
  IndicatorsRelated,
  RulesRelated,
  NotifyRecord,
  AddRelateds
};

