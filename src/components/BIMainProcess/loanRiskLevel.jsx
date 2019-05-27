import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import CLList from 'Lib/component/CLlist.jsx';
import {Interface} from 'Lib/config/index';
import {DatePicker, Button, message, Select, Modal, Radio} from 'antd';
import moment from 'moment';

const {RangePicker} = DatePicker;
let {contentType, getAppNameList, getBiLoanRiskLevelList, getRiskLevelList} = Interface;
import tableexport from 'tableexport';

const RadioGroup = Radio.Group;

let TB;

export default class LoanRiskLevel extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            search: {
                page: 1,
                pageSize: 10,
                totalOrDetail: 0
            },
            options: {
                flatformOpt: [],
                userOpt: [],
                riskLevelOpt: [],
                amountOpt: [{
                    key: 1000,
                    value: "1000p"
                }, {
                    key: 3000,
                    value: "3000p"
                }, {
                    key: 5000,
                    value: "5000p"
                }, {
                    key: 7000,
                    value: "7000p"
                }, {
                    key: 10000,
                    value: "10000p"
                }]
            },
            loading: false,
            startDate: null,
            endDate: null,
            appVersion: "",
            isOld: "",
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
        this.riskLevelOptMth();
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

    riskLevelOptMth = () => {
        const _this = this;
        const settings = {
            contentType,
            method: getRiskLevelList.type,
            url: getRiskLevelList.url
        };

        function fn(res) {
            if (res && res.data) {
                let list = [], options = _this.state.options;
                _.each(res.data, (item) => {
                    list.push({
                        value: item,
                        name: item
                    })
                })
                options["riskLevelOpt"] = list;
                _this.setState({options})
            }
        }

        CL.clReqwest({settings, fn});
    };

    getFormFields = (fields) => {
        const pagination = this.state.pagination;
        pagination.currentPage = 1;
        search.page = 1;

        this.setState({search: fields, pagination});
        this.loadData(fields);
    };

    pageChange = (page) => {
        let pagination = {
            currentPage: page.current,
            pageSize: page.pageSize,
            total: this.state.pagination.total
        };
        let search = this.state.search;
        search.page = page.current;
        search.pageSize = page.pageSize;
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
        const _this = this;
        const settings = {
            contentType,
            method: getBiLoanRiskLevelList.type,
            url: getBiLoanRiskLevelList.url,
            data: JSON.stringify({
                page: search.page,
                pageSize: search.pageSize,
                appVersion: search.appVersion,
                isOlder: search.isOld * 1,
                riskLevel: search.riskLevel,
                totalOrDetail: search.totalOrDetail,
                amount: search.amount,
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
            }
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
            list: []
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
            list: []
        })
    };

    onRiskLevelChange = (e) => {
        let {search, pagination} = this.state;
        search.riskLevel = e;
        search.page = 1;
        pagination.page = 1;
        this.setState({
            search,
            pagination,
            list: []
        })
    };

    onTotalOrDetailChange = (e) => {
        let {search, pagination} = this.state;
        search.totalOrDetail = e.target.value;
        search.page = 1;
        pagination.page = 1;
        this.setState({
            search,
            pagination,
            list: []
        })
    };

    onAmountChange = (e) => {
        let {search, pagination} = this.state;
        search.amount = e;
        search.page = 1;
        pagination.page = 1;
        this.setState({
            search,
            pagination,
            list: []
        })
    };

    onDownload = (e) => {
        this.setState({showTableExport: true});
        setTimeout(() => {
            TB = tableexport(document.querySelector('#ex-table-apply-process'), {formats: ['csv', 'txt', 'xlsx']});
        }, 100);
    };

    getExportTableHead = () => {
        return ['日期', '产品选择首页曝光数', '基础页面曝光数', '基础信息页面跳转率', '职业信息曝光数', '职业信息页面跳转率', '支付信息曝光数', '支付信息页面跳转率',
            '费息页曝光数', '费息页跳转率', 'I got it点击数', 'I got it点击率', '提交申请成功数', '提交申请成功率', '开始申请-申请成功转化率'];
    };

    getExportTableBody = (record, index) => {
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
    };

    handleCancel = () => {
        this.setState({showTableExport: false});
        if (TB) {
            TB.remove();
        }
    };

    render() {

        let columns = [{
            title: '日期',
            dataIndex: 'date',
            width: '7%',
            render(text, data) {
                return moment(text).format("YYYY-MM-DD")
            }
        }, {
            title: '风控等级',
            dataIndex: 'riskLevel',
            width: '4%',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '申请单数',
            dataIndex: 'applyNumOfOrder',
            width: '4%',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '通过单数',
            dataIndex: 'autitPassCount',
            width: '4%',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '通过率',
            width: '4%',
            render(text, data) {
                if (!data.applyNumOfOrder || typeof data.autitPassCount != "number") {
                    return "-";
                }
                return Math.ceil(data.autitPassCount * 10000 / data.applyNumOfOrder) / 100 + '%';
            }
        }, {
            title: '放款单数',
            dataIndex: 'loanNumOfOrder',
            width: '4%',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '放款成功率',
            width: '5%',
            render(text, data) {
                if (!data.autitPassCount || typeof data.loanNumOfOrder != "number") {
                    return "-";
                }
                return Math.ceil(data.loanNumOfOrder * 10000 / data.autitPassCount) / 100 + '%';
            }
        }, {
            title: '放款率',
            width: '5%',
            render(text, data) {
                if (!data.applyNumOfOrder || typeof data.loanNumOfOrder != "number") {
                    return "-";
                }
                return Math.ceil(data.loanNumOfOrder * 10000 / data.applyNumOfOrder) / 100 + '%';
            }
        }, {
            title: '到期单数',
            dataIndex: 'expireNumOfOrder',
            width: '4%',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '首逾单数',
            dataIndex: 'firstOverdue',
            width: '4%',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '首逾率',
            width: '4%',
            render(text, data) {
                if (!data.expireNumOfOrder || typeof data.firstOverdue != "number") {
                    return "-";
                }
                return Math.ceil(data.firstOverdue * 10000 / data.expireNumOfOrder) / 100 + '%';
            }
        }, {
            title: '当前逾期单数',
            dataIndex: 'currentFirstOverdue',
            width: '6%',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '当前逾期率',
            width: '5%',
            render(text, data) {
                if (!data.expireNumOfOrder || typeof data.currentFirstOverdue != "number") {
                    return "-";
                }
                return Math.ceil(data.currentFirstOverdue * 10000 / data.expireNumOfOrder) / 100 + '%';
            }
        }, {
            title: 'S1回收单数',
            dataIndex: 's1Repayment',
            width: '5%',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: 'S1回收率',
            width: '5%',
            render(text, data) {
                if (!data.currentFirstOverdue || typeof data.s1Repayment != "number") {
                    return "-";
                }
                return Math.ceil(data.s1Repayment * 10000 / data.currentFirstOverdue) / 100 + '%';
            }
        }, {
            title: 'S2回收单数',
            dataIndex: 's2Repayment',
            width: '5%',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: 'S2回收率',
            width: '5%',
            render(text, data) {
                if (!data.currentFirstOverdue || typeof data.s2Repayment != "number") {
                    return "-";
                }
                return Math.ceil(data.s2Repayment * 10000 / data.currentFirstOverdue) / 100 + '%';
            }
        }, {
            title: 'M2回收单数',
            dataIndex: 'm2Repayment',
            width: '5%',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: 'M2回收率',
            width: '5%',
            render(text, data) {
                if (!data.currentFirstOverdue || typeof data.m2Repayment != "number") {
                    return "-";
                }
                return Math.ceil(data.m2Repayment * 10000 / data.currentFirstOverdue) / 100 + '%';
            }
        }, {
            title: '损失单数',
            dataIndex: 'loseNumOrOrder',
            width: '5%',
            render(text, data) {
                return text || "-"
            }
        }, {
            title: '损失率',
            width: '5%',
            render(text, data) {
                if (!data.expireNumOfOrder || typeof data.loseNumOrOrder != "number") {
                    return "-";
                }
                return Math.ceil(data.loseNumOrOrder * 10000 / data.expireNumOfOrder) / 100 + '%';
            }
        }];

        let th = this.getExportTableHead();
        const settings = {
            data: this.state.list,
            columns: columns,
            getFields: this.getFormFields,
            pagination: this.state.pagination || {},
            pageChange: this.pageChange,
            tableLoading: this.state.loading,
            search: this.state.search,
            handleReset: this.handleReset,
            scroll: {x: "2000px"}
        };
        return (
            <div className="daily-monitor">
                <div className="select-panel">
                    <p>
                        <span>日期：</span>
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
                        <span style={{marginLeft: "50px"}}>风控等级：</span>
                        <Select placeholder="Please select"
                                mode="multiple"
                                value={this.state.search.riskLevel}
                                onChange={this.onRiskLevelChange}
                                style={{width: 200}}>
                            {_.map(this.state.options.riskLevelOpt, app => {
                                return <Option value={app.value}>{app.name}</Option>
                            })}
                        </Select>
                        <RadioGroup onChange={this.onTotalOrDetailChange}
                                    style={{marginLeft: "15px"}}
                                    value={this.state.search.totalOrDetail}>
                            <Radio value={1}>明细</Radio>
                            <Radio value={0}>合计</Radio>
                        </RadioGroup>
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
                    <p>
                        <span>借款金额：</span>
                        <Select placeholder="Please select"
                                value={this.state.search.amount}
                                onChange={this.onAmountChange}
                                style={{width: 200}}>
                            {_.map(this.state.options.amountOpt, app => {
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
                <div>
                    <CLList settings={settings}/>
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
                    <table className="ex-table" id="ex-table-apply-process">
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
                                    this.getExportTableBody(record, index)
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