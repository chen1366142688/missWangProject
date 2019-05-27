import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import {Table, DatePicker, Button, message, Select, Modal, Pagination} from 'antd';
import moment from 'moment';

const {RangePicker} = DatePicker;
let {contentType, getAppNameList, getBiProductMainProcessList} = Interface;
import tableexport from 'tableexport';

let TB;

export default class ProductMain extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            search: {
                page: 1,
                pageSize: 10
            },
            options: {
                flatformOpt: [],
                userOpt: [],
            },
            loading: false,
            startDate: null,
            endDate: null,
            appVersion: "",
            isOld: "",
            type: "0",
            pagination: {
                total: 0,
                page: 1,
                pageSize: 10
            },
            showTableExport: false
        }
    }

    componentDidMount() {
        this.flatformOptMth();
        this.userOptMth();
    }

    flatformOptMth = () => {
        const _this = this;
        const settings = {
            contentType,
            method: getAppNameList.type,
            url: getAppNameList.url
        };

        function fn(res) {
            if (res && res.data) {
                let list = [], options = _this.state.options;
                _.each(res.data, (item) => {
                    list.push({
                        value: item.type,
                        name: item.typeName
                    })
                })
                options["flatformOpt"] = list;
                _this.setState({options})
            }
        }

        CL.clReqwest({settings, fn});
    };

    userOptMth = () => {
        let options = this.state.options;
        options["userOpt"] = [{
            value: "新用户",
            key: '0'
        }, {
            value: "老用户",
            key: '1'
        }];
        this.setState({options});
    };

    getFormFields = (fields) => {
        const pagination = this.state.pagination;
        pagination.page = 1;

        this.setState({search: fields, pagination});
        this.loadData(fields);
    };

    pageChange = (page) => {
        let pagination = {
            page: page,
            pageSize: this.state.pagination.pageSize,
            total: this.state.pagination.total
        };
        let search = this.state.search;
        search.page = page;

        this.setState({search, pagination});
        this.loadData(search);

    };

    onDateChange = (e) => {
        let search = this.state.search;
        search.startDate = e[0];
        search.endDate = e[1];
        this.setState({
            startDate: e[0],
            endDate: e[1],
            search
        })
    };

    dealDate = (myDate, whetherStart) => {
        return myDate ? moment(myDate.format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix() :
            (moment(moment().format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix());
    };

    loadData = (search) => {
        search = search || this.state.search;
        if (typeof this.state.search.appVersion != "number" || !this.state.search.isOld) {
            message.warn("请选择平台和用户群体！");
            return;
        }
        const _this = this;
        const settings = {
            contentType,
            method: getBiProductMainProcessList.type,
            url: getBiProductMainProcessList.url,
            data: JSON.stringify({
                page: search.page,
                pageSize: search.pageSize,
                version: search.appVersion,
                isOlder: search.isOld * 1,
                startTime: search.startDate && this.dealDate(search.startDate, true) * 1000,
                endTime: search.endDate && this.dealDate(search.endDate) * 1000
            })
        }

        this.setState({
            loading: true
        })

        function fn(res) {
            if (res && res.data) {
                let {pagination} = _this.state;
                pagination.total = res.data.totalCount;
                _this.setState({list: res.data.result || [], loading: false, pagination});
            }
        }

        CL.clReqwest({settings, fn});
    };

    onClear = () => {
        this.setState({
            startDate: null,
            endDate: null,
            search: {
                page: 1,
                pageSize: 10
            },
            type: "0"
        })
    };

    onAppNameChange = (e) => {
        let {search, pagination} = this.state;
        search.appVersion = e;
        search.page = 1;
        pagination.page = 1;
        this.setState({
            search,
            pagination,
            list: [],
            type: this.getType(e, this.state.search.isOld)
        })
    };

    onUserChange = (e) => {
        let {search, pagination} = this.state;
        search.isOld = e;
        search.page = 1;
        pagination.page = 1;
        this.setState({
            search,
            pagination,
            list: [],
            type: this.getType(this.state.search.appVersion, e)
        })
    };

    getType = (appVersion, isOld) => {
        if (typeof appVersion == "undefined" || typeof isOld == "undefined") {
            return "0";
        } else if (isOld == 0 && appVersion == 0) {
            return "1";
        } else if (isOld == 0 && appVersion != 0) {
            return "3";
        } else if (isOld == 1 && appVersion == 0) {
            return "2";
        } else if (isOld == 1 && appVersion != 0) {
            return "4";
        }
    };

    onDownload = (e) => {
        this.setState({showTableExport: true});
        setTimeout(() => {
            TB = tableexport(document.querySelector('#ex-table'), {formats: ['csv', 'txt', 'xlsx']});
        }, 100);
    };

    getExportTableHead = (type) => {
        if (type == "0") {
            return []
        } else if (type == "1") {
            return ["日期", "app安装数", "app激活数", "开始登录点击数", "登录成功数", "登录成功率", "登陆用户数", "登录且无在途订单用户数", "let's get cash点击数",
                "基础信息曝光数", "基础信息填写数", "基础信息完成数", "职业信息曝光数", "职业信息填写数", "职业信息完成数", "支付信息曝光数", "支付信息填写数", "支付信息完成数",
                "费息页曝光数", "I got it点击数", "提交申请数", "机审进入数", "机审通过数", "人审进入数	人审通过数", "审核通过数	放款订单数", "件均	平均借款期限(天)", "到期订单数",
                "首逾单数", "首逾率", "逾期回收单数", "逾期回收率", "损失单数", "损失率", "平均回收周期(天)"];
        } else if (type == "2") {
            return ["日期", "app激活数", "开始登录点击数", "登录成功数", "登录成功率", "登陆用户数", "登录且无在途订单用户数", "常规申请点击数",
                "快速申请点击数", "目录页曝光数", "费息页曝光数", "I got it点击数", "提交申请数", "机审进入数", "机审通过数", "人审进入数	人审通过数", "审核通过数	放款订单数", "件均	平均借款期限(天)", "到期订单数",
                "首逾单数", "首逾率", "逾期回收单数", "逾期回收率", "损失单数", "损失率", "平均回收周期(天)"];
        } else if (type == "3") {
            return ["日期", "app安装数", "app激活数", "开始登录点击数", "登录成功数", "登录成功率", "登陆用户数", "登录且无在途订单用户数", "let's get cash点击数", "目录页曝光数", "目录页列表点击数", "证件信息曝光数",
                "证件信息填写数", "证件信息完成数", "基础信息曝光数", "基础信息填写数", "基础信息完成数", "职业信息曝光数", "职业信息填写数", "职业信息完成数", "支付信息曝光数", "支付信息填写数", "支付信息完成数",
                "目录页 I'm all done点击率", "费息页曝光数", "I got it点击数", "提交申请数", "机审进入数", "机审通过数", "人审进入数	人审通过数", "审核通过数	放款订单数", "件均	平均借款期限(天)", "到期订单数",
                "首逾单数", "首逾率", "逾期回收单数", "逾期回收率", "损失单数", "损失率", "平均回收周期(天)"];
        } else if (type == "4") {
            return ["日期", "app激活数", "开始登录点击数", "登录成功数", "登录成功率", "登陆用户数", "登录且无在途订单用户数", "let's get cash点击数", "目录页曝光数", "目录页 I'm all done点击率", "费息页曝光数",
                "I got it点击数", "提交申请数", "机审进入数", "机审通过数", "人审进入数	人审通过数", "审核通过数	放款订单数", "件均	平均借款期限(天)", "到期订单数",
                "首逾单数", "首逾率", "逾期回收单数", "逾期回收率", "损失单数", "损失率", "平均回收周期(天)"];
        }
    };

    getExportTableBody = (type, record, index) => {
        if (type == "0") {
            return <tr>
            </tr>
        } else if (type == "1") {
            return <tr key={index}>
                <td>{moment(record.date).format("YYYY-MM-DD")}</td>
                <td>{record.firstPageExposures}</td>
                <td>{record.basePageExposures}</td>
                <td>{`${Math.ceil(record.basePageJumpRate * 10000) / 100}%`}</td>
                <td>{record.jobPageExposures}</td>
                <td>{`${Math.ceil(record.jobPageJumpRate * 10000) / 100}%`}</td>
                <td>{record.payPageExposures}</td>
                <td>{`${Math.ceil(record.payPageJumpRate * 10000) / 100}%`}</td>
                <td>{record.feePageExposures}</td>
                <td>{`${Math.ceil(record.feePageJumpRate * 10000) / 100}%`}</td>
                <td>{record.igotitClicks}</td>
                <td>{`${Math.ceil(record.igotitClickRate * 10000) / 100}%`}</td>
                <td>{record.submitApplicationSuccess}</td>
                <td>{`${Math.ceil(record.submitApplicationSuccessRate * 10000) / 100}%`}</td>
                <td>{`${Math.ceil(record.startApplicationSuccessConversionRate * 10000) / 100}%`}</td>
            </tr>
        } else if (type == "2") {
            return <tr key={index}>
                <td>{moment(record.date).format("YYYY-MM-DD")}</td>
                <td>{record.firstPageExposures}</td>
                <td>{record.quickApplicationButtonClicks}</td>
                <td>{record.directoryPageExposures}</td>
                <td>{record.feePageExposures}</td>
                <td>{`${Math.ceil(record.feePageJumpRate * 10000) / 100}%`}</td>
                <td>{record.igotitClicks}</td>
                <td>{`${Math.ceil(record.igotitClickRate * 10000) / 100}%`}</td>
                <td>{record.submitApplicationSuccess}</td>
                <td>{`${Math.ceil(record.submitApplicationSuccessRate * 10000) / 100}%`}</td>
                <td>{`${Math.ceil(record.startApplicationSuccessConversionRate * 10000) / 100}%`}</td>
            </tr>
        } else if (type == "3") {
            return <tr key={index}>
                <td>{moment(record.date).format("YYYY-MM-DD")}</td>
                <td>{record.firstPageExposures}</td>
                <td>{record.directoryPageExposures}</td>
                <td>{`${Math.ceil(record.directoryPageJumpRate * 10000) / 100}%`}</td>
                <td>{record.identityInformaitonExposures}</td>
                <td>{`${Math.ceil(record.identityInformaitonJumpRate * 10000) / 100}%`}</td>
                <td>{record.basePageExposures}</td>
                <td>{`${Math.ceil(record.basePageJumpRate * 10000) / 100}%`}</td>
                <td>{record.jobPageExposures}</td>
                <td>{`${Math.ceil(record.jobPageJumpRate * 10000) / 100}%`}</td>
                <td>{record.payPageExposures}</td>
                <td>{`${Math.ceil(record.payPageJumpRate * 10000) / 100}%`}</td>
                <td>{record.feePageExposures}</td>
                <td>{`${Math.ceil(record.feePageJumpRate * 10000) / 100}%`}</td>
                <td>{record.igotitClicks}</td>
                <td>{`${Math.ceil(record.igotitClickRate * 10000) / 100}%`}</td>
                <td>{record.submitApplicationSuccess}</td>
                <td>{`${Math.ceil(record.submitApplicationSuccessRate * 10000) / 100}%`}</td>
                <td>{`${Math.ceil(record.startApplicationSuccessConversionRate * 10000) / 100}%`}</td>
            </tr>
        } else if (type == "4") {
            return <tr key={index}>
                <td>{moment(record.date).format("YYYY-MM-DD")}</td>
                <td>{record.firstPageExposures}</td>
                <td>{record.directoryPageExposures}</td>
                <td>{`${Math.ceil(record.directoryPageJumpRate * 10000) / 100}%`}</td>
                <td>{record.feePageExposures}</td>
                <td>{`${Math.ceil(record.feePageJumpRate * 10000) / 100}%`}</td>
                <td>{record.igotitClicks}</td>
                <td>{`${Math.ceil(record.igotitClickRate * 10000) / 100}%`}</td>
                <td>{record.submitApplicationSuccess}</td>
                <td>{`${Math.ceil(record.submitApplicationSuccessRate * 10000) / 100}%`}</td>
                <td>{`${Math.ceil(record.startApplicationSuccessConversionRate * 10000) / 100}%`}</td>
            </tr>
        }
    };

    handleCancel = () => {
        this.setState({showTableExport: false});
        if (TB) {
            TB.remove();
        }
    };

    render() {

        let columns = getColumnsList(this.state.type);

        let th = this.getExportTableHead(this.state.type);

        return (
            <div className="daily-monitor">
                <div className="select-panel">
                    <p>
                        <span>时间：</span>
                        <RangePicker onChange={this.onDateChange} value={[this.state.startDate, this.state.endDate]}/>
                        <span style={{marginLeft: "50px"}}>平台：</span>
                        <Select placeholder="Please select"
                                value={this.state.search.appVersion}
                                onChange={this.onAppNameChange}
                                style={{width: 200}}>
                            {_.map(this.state.options.flatformOpt, app => {
                                return <Option value={app.value}>{app.name}</Option>
                            })}
                        </Select>
                        <span style={{marginLeft: "50px"}}>用户群体：</span>
                        <Select placeholder="Please select"
                                value={this.state.search.isOld}
                                onChange={this.onUserChange}
                                style={{width: 200}}>
                            {_.map(this.state.options.userOpt, app => {
                                return <Option value={app.key}>{app.value}</Option>
                            })}
                        </Select>
                    </p>
                    <p className="daily-monitor-footer">
                        <Button type="primary" onClick={() => this.loadData()}
                                loading={this.state.loading}>Search</Button>
                        <Button type="default" onClick={this.onClear}>Clear</Button>
                        <Button type="default" onClick={this.onDownload}>Download</Button>
                    </p>
                </div>
                <Table dataSource={this.state.list}
                       columns={columns}
                       bordered
                       scroll={{x: 5000}}
                       pagination={false}
                       loading={this.state.loading}>
                </Table>
                <div style={{textAlign: "right", marginTop: "15px"}}>
                    <Pagination current={this.state.pagination.page} onChange={this.pageChange}
                                total={this.state.pagination.total}/>
                </div>
                <Modal
                    className="te-modal"
                    title="Download"
                    closable
                    visible={this.state.showTableExport}
                    width="100%"
                    style={{top: 0}}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" size="large" onClick={this.handleCancel}>Cancel</Button>,
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
                            this.state.list.map((record, index) => {
                                return (
                                    this.getExportTableBody(this.state.type, record, index)
                                );
                            })
                        }
                        </tbody>
                    </table>
                </Modal>
            </div>
        )
    }
}

let getColumnsList = (type) => {
    if (type == "0") {
        return []
    } else if (type == "1") {
        return [{
            title: '日期',
            dataIndex: 'date',
            width: 150,
            render(text, data) {
                return moment(text).format("YYYY-MM-DD")
            }
        }, {
            title: '登录用户数',
            dataIndex: 'loginNumOfMember',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '登录且无在途订单用户数',
            dataIndex: 'loginExcludeProcessingNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: 'let\'s get cash点击数',
            dataIndex: 'letsGetCashClickNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '基础信息曝光数',
            dataIndex: 'baseInfoExposureNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '基础信息填写数',
            dataIndex: 'baseInfoInputNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '基础信息完成数',
            dataIndex: 'baseInfoComplateNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '职业信息曝光数',
            dataIndex: 'jobPageExposures',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '职业信息填写数',
            dataIndex: 'jobPageInputNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '职业信息完成数',
            dataIndex: 'jobPageComplateNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '支付信息曝光数',
            dataIndex: 'payPageExposures',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '支付信息填写数',
            dataIndex: 'payPageInputNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '支付信息完成数',
            dataIndex: 'payPageComplateNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '费息页曝光数',
            dataIndex: 'feePageExposures',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: 'I got it点击数',
            dataIndex: 'igotItClickNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '提交申请数',
            dataIndex: 'applyNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '审核通过数',
            render(text, data) {
                return data.sysAutitPassCount + data.manualAutitPassCount;
            }
        }, {
            title: '放款订单数',
            dataIndex: 'loanNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '件均',
            render(text, data) {
                if (!data.loanNumOfOrder || typeof data.loanAmount != "number") {
                    return "-";
                }
                return Math.round(data.loanAmount * 100 / data.loanNumOfOrder) / 100;
            }
        }, {
            title: '平均借款期限(天)',
            dataIndex: 'averageLoanLimitTime',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '到期订单数',
            dataIndex: 'expireNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '首逾单数',
            dataIndex: 'overdueNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '首逾率',
            render(text, data) {
                if (!data.expireNumOfOrder || typeof data.overdueNumOfOrder != "number") {
                    return "-";
                }
                return Math.round(data.overdueNumOfOrder * 10000 / data.expireNumOfOrder) / 100 + "%";
            }
        }, {
            title: '逾期回收单数',
            dataIndex: 'overdueRecoverNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '逾期回收率',
            render(text, data) {
                if (!data.overdueNumOfOrder || typeof data.overdueRecoverNum != "number") {
                    return "-";
                }
                return Math.round(data.overdueRecoverNum * 10000 / data.overdueNumOfOrder) / 100 + "%";
            }
        }, {
            title: '损失单数',
            dataIndex: 'loseNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '损失率',
            render(text, data) {
                if (!data.expireNumOfOrder || typeof data.loseNumOfOrder != "number") {
                    return "-";
                }
                return Math.round(data.loseNumOfOrder * 10000 / data.expireNumOfOrder) / 100 + "%";
            }
        }, {
            title: '平均回收周期(天)',
            dataIndex: 'averageRepaymentDay',
            render(text, data) {
                return text || "-"
            }
        }];
    } else if (type == "2") {
        return [{
            title: '日期',
            dataIndex: 'date',
            width: 150,
            render(text, data) {
                return moment(text).format("YYYY-MM-DD")
            }
        }, {
            title: '登录用户数',
            dataIndex: 'loginNumOfMember',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '登录且无在途订单用户数',
            dataIndex: 'loginExcludeProcessingNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '常规申请点击数',
            dataIndex: 'regularApplicationClicks',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '快速申请点击数',
            dataIndex: 'quickApplicationClicks',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '目录页曝光数',
            dataIndex: 'directoryPageExposure',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '目录页提交数',
            dataIndex: 'directoryPageSubmissions',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '费息页曝光数',
            dataIndex: 'feePageExposures',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: 'I got it点击数',
            dataIndex: 'igotItClickNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '提交申请数',
            dataIndex: 'applyNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '审核通过数',
            render(text, data) {
                return data.sysAutitPassCount + data.manualAutitPassCount;
            }
        }, {
            title: '放款订单数',
            dataIndex: 'loanNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '件均',
            render(text, data) {
                if (!data.loanNumOfOrder || typeof data.loanAmount != "number") {
                    return "-";
                }
                return Math.round(data.loanAmount * 100 / data.loanNumOfOrder) / 100;
            }
        }, {
            title: '平均借款期限(天)',
            dataIndex: 'averageLoanLimitTime',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '到期订单数',
            dataIndex: 'expireNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '首逾单数',
            dataIndex: 'overdueNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '首逾率',
            render(text, data) {
                if (!data.expireNumOfOrder || typeof data.overdueNumOfOrder != "number") {
                    return "-";
                }
                return Math.round(data.overdueNumOfOrder * 10000 / data.expireNumOfOrder) / 100 + "%";
            }
        }, {
            title: '逾期回收单数',
            dataIndex: 'overdueRecoverNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '逾期回收率',
            render(text, data) {
                if (!data.overdueNumOfOrder || typeof data.overdueRecoverNum != "number") {
                    return "-";
                }
                return Math.round(data.overdueRecoverNum * 10000 / data.overdueNumOfOrder) / 100 + "%";
            }
        }, {
            title: '损失单数',
            dataIndex: 'loseNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '损失率',
            render(text, data) {
                if (!data.expireNumOfOrder || typeof data.loseNumOfOrder != "number") {
                    return "-";
                }
                return Math.round(data.loseNumOfOrder * 10000 / data.expireNumOfOrder) / 100 + "%";
            }
        }, {
            title: '平均回收周期(天)',
            dataIndex: 'averageRepaymentDay',
            render(text, data) {
                return text || "-"
            }
        }];

    } else if (type == "3") {
        return [{
            title: '日期',
            dataIndex: 'date',
            width: 150,
            render(text, data) {
                return moment(text).format("YYYY-MM-DD")
            }
        }, {
            title: '登录用户数',
            dataIndex: 'loginNumOfMember',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '登录且无在途订单用户数',
            dataIndex: 'loginExcludeProcessingNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: 'let\'s get cash点击数',
            dataIndex: 'letsGetCashClickNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '目录页曝光数',
            dataIndex: 'directoryPageExposure',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '目录页列表点击数',
            dataIndex: 'directoryPageListClicks',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '证件信息曝光数',
            dataIndex: 'idinformationExposure',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '证件信息填写数',
            dataIndex: 'idinformationFilledIn',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '证件信息完成数',
            dataIndex: 'idinformationComplate',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '基础信息曝光数',
            dataIndex: 'baseInfoExposureNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '基础信息填写数',
            dataIndex: 'baseInfoInputNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '基础信息完成数',
            dataIndex: 'baseInfoComplateNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '职业信息曝光数',
            dataIndex: 'jobPageExposures',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '职业信息填写数',
            dataIndex: 'jobPageInputNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '职业信息完成数',
            dataIndex: 'jobPageComplateNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '支付信息曝光数',
            dataIndex: 'payPageExposures',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '支付信息填写数',
            dataIndex: 'payPageInputNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '支付信息完成数',
            dataIndex: 'payPageComplateNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '目录页 I\'m all done点击率',
            dataIndex: 'imAllDoneClicks',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '费息页曝光数',
            dataIndex: 'feePageExposures',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: 'I got it点击数',
            dataIndex: 'igotItClickNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '提交申请数',
            dataIndex: 'applyNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '审核通过数',
            render(text, data) {
                return data.sysAutitPassCount + data.manualAutitPassCount;
            }
        }, {
            title: '放款订单数',
            dataIndex: 'loanNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '件均',
            render(text, data) {
                if (!data.loanNumOfOrder || typeof data.loanAmount != "number") {
                    return "-";
                }
                return Math.round(data.loanAmount * 100 / data.loanNumOfOrder) / 100;
            }
        }, {
            title: '平均借款期限(天)',
            dataIndex: 'averageLoanLimitTime',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '到期订单数',
            dataIndex: 'expireNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '首逾单数',
            dataIndex: 'overdueNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '首逾率',
            render(text, data) {
                if (!data.expireNumOfOrder || typeof data.overdueNumOfOrder != "number") {
                    return "-";
                }
                return Math.round(data.overdueNumOfOrder * 10000 / data.expireNumOfOrder) / 100 + "%";
            }
        }, {
            title: '逾期回收单数',
            dataIndex: 'overdueRecoverNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '逾期回收率',
            render(text, data) {
                if (!data.overdueNumOfOrder || typeof data.overdueRecoverNum != "number") {
                    return 0;
                }
                return Math.round(data.overdueRecoverNum * 10000 / data.overdueNumOfOrder) / 100 + "%";
            }
        }, {
            title: '损失单数',
            dataIndex: 'loseNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '损失率',
            render(text, data) {
                if (!data.expireNumOfOrder || typeof data.loseNumOfOrder != "number") {
                    return "-";
                }
                return Math.round(data.loseNumOfOrder * 10000 / data.expireNumOfOrder) / 100 + "%";
            }
        }, {
            title: '平均回收周期(天)',
            dataIndex: 'averageRepaymentDay',
            render(text, data) {
                return text || "-"
            }
        }];
    } else if (type == "4") {
        return [{
            title: '日期',
            dataIndex: 'date',
            width: 150,
            render(text, data) {
                return moment(text).format("YYYY-MM-DD")
            }
        }, {
            title: '登录用户数',
            dataIndex: 'loginNumOfMember',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '登录且无在途订单用户数',
            dataIndex: 'loginExcludeProcessingNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: 'let\'s get cash点击数',
            dataIndex: 'letsGetCashClickNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '目录页曝光数',
            dataIndex: 'directoryPageExposure',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '目录页 I\'m all done点击率',
            dataIndex: 'imAllDoneClicks',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '费息页曝光数',
            dataIndex: 'feePageExposures',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: 'I got it点击数',
            dataIndex: 'igotItClickNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '提交申请数',
            dataIndex: 'applyNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '审核通过数',
            render(text, data) {
                return data.sysAutitPassCount + data.manualAutitPassCount;
            }
        }, {
            title: '放款订单数',
            dataIndex: 'loanNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '件均',
            render(text, data) {
                if (!data.loanNumOfOrder || typeof data.loanAmount != "number") {
                    return "-";
                }
                return Math.round(data.loanAmount * 100 / data.loanNumOfOrder) / 100;
            }
        }, {
            title: '平均借款期限(天)',
            dataIndex: 'averageLoanLimitTime',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '到期订单数',
            dataIndex: 'expireNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '首逾单数',
            dataIndex: 'overdueNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '首逾率',
            render(text, data) {
                if (!data.expireNumOfOrder || typeof data.expireNumOfOrder != "number") {
                    return "-";
                }
                return Math.round(data.overdueNumOfOrder * 10000 / data.expireNumOfOrder) / 100 + "%";
            }
        }, {
            title: '逾期回收单数',
            dataIndex: 'overdueRecoverNum',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '逾期回收率',
            render(text, data) {
                if (!data.overdueNumOfOrder || typeof data.overdueRecoverNum != "number") {
                    return "-";
                }
                return Math.round(data.overdueRecoverNum * 10000 / data.overdueNumOfOrder) / 100 + "%";
            }
        }, {
            title: '损失单数',
            dataIndex: 'loseNumOfOrder',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '损失率',
            render(text, data) {
                if (!data.expireNumOfOrder || typeof data.loseNumOfOrder != "number") {
                    return "-";
                }
                return Math.round(data.loseNumOfOrder * 10000 / data.expireNumOfOrder) / 100 + "%";
            }
        }, {
            title: '平均回收周期(天)',
            dataIndex: 'averageRepaymentDay',
            render(text, data) {
                return text || "-"
            }
        }];
    }
}