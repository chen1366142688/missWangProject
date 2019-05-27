import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import CLList from 'Lib/component/CLlist.jsx';
import {Interface} from 'Lib/config/index';
import {Table, DatePicker, Button, message, Select, Modal, Spin} from 'antd';
import moment from 'moment';

const {RangePicker, MonthPicker} = DatePicker;
let {contentType, getAppNameList, getBINewRegisterList, getAppVersionList} = Interface;
import tableexport from 'tableexport';

let TB;

export default class RegisterApplyFunnel extends CLComponent {
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
                versionOpt: [],
                productOpt: [{
                    name: "3000",
                    value: "3000"
                }, {
                    name: "1000",
                    value: "1000"
                }]
            },
            selectLoading: false,
            loading: false,
            startDate: null,
            endDate: null,
            appVersion: null,
            hasProduct: false,
            type: 0,
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

    versionOptMth = (version, time) => {
        const _this = this;
        version = version || this.state.search.version;
        let endDate = time || this.state.search.vTime;

        if (version === null || version === undefined) {
            return
        }

        const settings = {
            contentType,
            method: getAppVersionList.type,
            url: getAppVersionList.url,
            data: JSON.stringify({
                version,
                endTime: endDate && this.dealDate(endDate) * 1000
            })
        };

        this.setState({
            selectLoading: true
        })

        function fn(res) {
            if (res && res.data) {
                let list = [], options = _this.state.options;
                _.each(res.data, (item) => {
                    list.push({
                        value: item,
                        name: item
                    })
                })
                options["versionOpt"] = list;
                _this.setState({options, selectLoading: false})
            }
        }

        CL.clReqwest({settings, fn});
    };

    getFormFields = (fields) => {
        const pagination = this.state.pagination;
        pagination.page = 1;

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
        search.startMonth = null;
        search.endMonth = null;
        search.vTime = e[1];
        this.versionOptMth(null, e[1]);
        this.setState({
            startDate: e[0],
            endDate: e[1],
            startMonth: null,
            endMonth: null,
            search
        })
    };

    onMonthChange = (e) => {
        let search = this.state.search;
        search.startMonth = e[0];
        search.endMonth = e[1];
        search.startDate = null;
        search.endDate = null;
        search.vTime = moment(e[1].format("YYYY-MM") + "-01 00:00:00").add(1, "months");
        this.versionOptMth(null, search.vTime);
        this.setState({
            startDate: null,
            endDate: null,
            startMonth: e[0],
            endMonth: e[1],
            search
        })
    };

    dealDate = (myDate, whetherStart) => {
        return myDate ? moment(myDate.format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix() :
            (moment(moment().format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix());
    };

    loadData = (search) => {
        search = search || this.state.search;
        if (typeof this.state.search.version != "number" || !this.state.search.appVersion) {
            message.warn("请选择平台和版本号！");
            return;
        }
        if (this.state.hasProduct && !this.state.search.product) {
            message.warn("请选择产品！");
            return;
        }
        const _this = this;
        const settings = {
            contentType,
            method: getBINewRegisterList.type,
            url: getBINewRegisterList.url,
            data: JSON.stringify({
                page: search.page,
                pageSize: search.pageSize,
                version: search.version,
                appVersion: search.appVersion,
                product: search.product ? search.product : undefined,
                isMonthly: search.startMonth ? 1 : 0,
                startMonth: search.startMonth && search.startMonth.format("YYYY-MM"),
                endMonth: search.endMonth && search.endMonth.format("YYYY-MM"),
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
                _.each(res.data.result, item => {
                    delete item.id
                })

                let list = [];
                if (!_this.state.search.startMonth) {
                    list = _.sortBy(res.data.result, function (item) {
                        return -moment(item.date).unix();
                    });
                } else {
                    list = _.sortBy(res.data.result, function (item) {
                        return -moment(item.month + "-01").unix();
                    });
                }
                _this.setState({list: list || [], loading: false, pagination});
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
            type: ""
        })
    };

    onAppNameChange = (e) => {
        let {search, pagination, options} = this.state;
        search.version = e;
        search.appVersion = [];
        search.page = 1;
        pagination.page = 1;
        options.versionOpt = [];
        this.versionOptMth(e);
        this.setState({
            search,
            pagination,
            list: [],
            options,
            hasProduct: this.hasProduct(e),
            type: this.getType(e, null, null)
        })
    };

    onAppVersionChange = (e) => {
        let {search, pagination} = this.state;
        if (e[e.length - 1] === "x") {
            search.appVersion = ["x"];
        } else if (e[0] === "x") {
            e.splice(0, 1);
            search.appVersion = e;
        } else {
            search.appVersion = e;
        }
        search.product = "";
        search.page = 1;
        pagination.page = 1;
        this.setState({
            search,
            pagination,
            list: [],
            hasProduct: this.hasProduct(null, search.appVersion),
            type: this.getType(null, search.appVersion, null)
        })
    };

    onProductChange = (e) => {
        let {search, pagination} = this.state;
        search.product = e;
        search.page = 1;
        pagination.page = 1;
        this.setState({
            search,
            pagination,
            list: [],
            type: this.getType(null, null, e)
        })
    };

    getType = (version, appVersion, product) => {
        version = version || this.state.search.version;
        appVersion = (appVersion || this.state.search.appVersion) && (appVersion || this.state.search.appVersion)[0];
        product = product || this.state.search.product;

        let vSplit = appVersion && appVersion.split('.');

        if (vSplit) {
            // cashlending版本号大于等于3.2.0
            let cRes = version === 0 &&
                (vSplit[0] * 1 > 3 || (vSplit[0] * 1 === 3 && vSplit[1] * 1 >= 2));

            if ((cRes || version === 3) && product === "3000") {
                return 2;
            }
            if ((cRes || version === 3) && product === "1000") {
                return 3;
            }
            if (version === 1 || version === 2) {
                return 4;
            }
            if (appVersion === "x") {
                return 1;
            }

            return 0;
        }
        return 0
    };

    hasProduct = (version, appVersion) => {
        version = version || this.state.search.version;
        appVersion = (appVersion || this.state.search.appVersion) && (appVersion || this.state.search.appVersion)[0];

        if (!appVersion || appVersion === "x") {
            return false;
        }

        return true;
    };

    onDownload = (e) => {
        this.setState({showTableExport: true});
        setTimeout(() => {
            TB = tableexport(document.querySelector('#ex-table-register-process'), {formats: ['csv', 'txt', 'xlsx']});
        }, 100);
    };

    getExportTableHead = (type) => {
        if (type == 0) {
            return []
        } else if (type == 1) {
            return ["日期", "注册用户数", "产品选择首页曝光数", "let's get cash点击数", "注册-点击开始申请转化率", "基础信息曝光数", "基础信息填写数",
                "基础信息完成数", "职业信息曝光数", "职业信息填写数", "职业信息完成数", "支付信息曝光数", "支付信息填写数", "支付信息完成数",
                "开始申请-资料完成转化率", "费息页曝光数", "I got it点击数", "资料完成-点击提交申请转化率", "提交申请数", "注册-申请转化率"];
        } else if (type == 2) {

            return ["日期", "注册用户数", "产品选择首页曝光数", "Apply点击数", "注册-点击开始申请转化率", "贷款额度期限选择页曝光数", "贷款额度期限选择页提交数",
                "础信息页面曝光数", "基础信息页面填写数", "基础信息页面完成数", "职业信息页面曝光数", "职业信息页面填写数", "职业信息页面完成数", "收款人信息页面曝光数",
                "收款人信息页面填写数", "收款人信息页面完成数", "开始申请-资料完成转化率", "费息页面曝光数", "I got it点击数", "资料完成-点击提交申请转化率",
                "提交申请数", "注册-申请转化率"];
        } else if (type == 3) {
            return ["日期", "注册用户数", "产品选择首页曝光数", "Apply点击数", "注册-点击开始申请转化率", "贷款额度期限选择页曝光数", "贷款额度期限选择页提交数", "收款人信息页面曝光数",
                "收款人信息页面填写数", "收款人信息页面完成数", "开始申请-资料完成转化率", "费息页曝光数", "I got it点击数", "资料完成-点击提交申请转化率", "提交申请数",
                "注册-申请转化率"];
        } else if (type == 4) {
            return ["日期", "注册用户数", "产品选择首页曝光数", "let's get cash点击数", "注册-点击开始申请转化率", "目录页曝光数", "目录页列表点击数", "证件信息曝光数",
                "证件信息填写数", "证件信息完成数", "基础信息曝光数", "基础信息填写数", "基础信息完成数", "职业信息曝光数", "职业信息填写数", "职业信息完成数", "支付信息曝光数",
                "支付信息填写数", "支付信息完成数", "目录页 I'm all done点击数", "开始申请-资料完成转化率", "费息页曝光数", "I got it点击数", "资料完成-点击提交申请转化率",
                "提交申请数", "注册-申请转化率"];
        }
    };

    getExportTableBody = (type, record, index) => {
        if (type == 0) {
            return <tr>
            </tr>
        } else if (type == 1) {
            return <tr key={index}>
                <td>{moment(record.date).format("YYYY-MM-DD")}</td>
                <td>{record.registerNumber}</td>
                <td>{record.firstPageExposures}</td>
                <td>{record.letgetcashClicks}</td>
                <td>{`${Math.ceil(record.letgetcashClickRate * 10000) / 100}%`}</td>
                <td>{record.basePageExposures}</td>
                <td>{record.basePageWrite}</td>
                <td>{record.basePageConfirm}</td>
                <td>{record.jobPageExposures}</td>
                <td>{record.jobPageWrite}</td>
                <td>{record.jobPageConfirm}</td>
                <td>{record.payPageExposures}</td>
                <td>{record.payPageWrite}</td>
                <td>{record.payPageConfirm}</td>
                <td>{`${Math.ceil(record.applicationInfoFinishRate * 10000) / 100}%`}</td>
                <td>{record.feePageExposures}</td>
                <td>{record.igotitClicks}</td>
                <td>{`${Math.ceil(record.applicationInfoFinishSubRate * 10000) / 100}%`}</td>
                <td>{record.applicationCount}</td>
                <td>{`${Math.ceil(record.registerApplicationRate * 10000) / 100}%`}</td>
            </tr>
        } else if (type == 2) {
            return <tr key={index}>
                <td>{moment(record.date).format("YYYY-MM-DD")}</td>
                <td>{record.registerNumber}</td>
                <td>{record.firstPageExposures}</td>
                <td>{record.letgetcashClicks}</td>
                <td>{`${Math.ceil(record.letgetcashClickRate * 10000) / 100}%`}</td>
                <td>{record.loanQuotaTermSelectionPageExposures}</td>
                <td>{record.loanQuotaTermSelectionPageSubmission}</td>
                <td>{record.basePageExposures}</td>
                <td>{record.basePageWrite}</td>
                <td>{record.basePageConfirm}</td>
                <td>{record.jobPageExposures}</td>
                <td>{record.jobPageWrite}</td>
                <td>{record.jobPageConfirm}</td>
                <td>{record.payPageExposures}</td>
                <td>{record.payPageWrite}</td>
                <td>{record.payPageConfirm}</td>
                <td>{`${Math.ceil(record.applicationInfoFinishRate * 10000) / 100}%`}</td>
                <td>{record.feePageExposures}</td>
                <td>{record.igotitClicks}</td>
                <td>{`${Math.ceil(record.applicationInfoFinishSubRate * 10000) / 100}%`}</td>
                <td>{record.applicationCount}</td>
                <td>{`${Math.ceil(record.registerApplicationRate * 10000) / 100}%`}</td>
            </tr>
        } else if (type == 3) {
            return <tr key={index}>
                <td>{moment(record.date).format("YYYY-MM-DD")}</td>
                <td>{record.registerNumber}</td>
                <td>{record.firstPageExposures}</td>
                <td>{record.letgetcashClicks}</td>
                <td>{`${Math.ceil(record.letgetcashClickRate * 10000) / 100}%`}</td>
                <td>{record.directoryPageExposures}</td>
                <td>{record.directoryPageListClicks}</td>
                <td>{record.identityPageExposures}</td>
                <td>{record.identityPageWrite}</td>
                <td>{record.identityPageConfirm}</td>
                <td>{record.basePageExposures}</td>
                <td>{record.basePageWrite}</td>
                <td>{record.basePageConfirm}</td>
                <td>{record.jobPageExposures}</td>
                <td>{record.jobPageWrite}</td>
                <td>{record.jobPageConfirm}</td>
                <td>{`${Math.ceil(record.applicationInfoFinishRate * 10000) / 100}%`}</td>
                <td>{record.feePageExposures}</td>
                <td>{record.igotitClicks}</td>
                <td>{`${Math.ceil(record.applicationInfoFinishSubRate * 10000) / 100}%`}</td>
                <td>{record.applicationCount}</td>
                <td>{`${Math.ceil(record.registerApplicationRate * 10000) / 100}%`}</td>
            </tr>
        } else if (type == 4) {
            return <tr key={index}>
                <td>{moment(record.date).format("YYYY-MM-DD")}</td>
                <td>{record.registerNumber}</td>
                <td>{record.firstPageExposures}</td>
                <td>{record.letgetcashClicks}</td>
                <td>{`${Math.ceil(record.letgetcashClickRate * 10000) / 100}%`}</td>
                <td>{record.loanQuotaTermSelectionPageExposures}</td>
                <td>{record.loanQuotaTermSelectionPageSubmission}</td>
                <td>{record.payPageExposures}</td>
                <td>{record.payPageWrite}</td>
                <td>{record.payPageConfirm}</td>
                <td>{`${Math.ceil(record.applicationInfoFinishRate * 10000) / 100}%`}</td>
                <td>{record.feePageExposures}</td>
                <td>{record.igotitClicks}</td>
                <td>{`${Math.ceil(record.applicationInfoFinishSubRate * 10000) / 100}%`}</td>
                <td>{record.applicationCount}</td>
                <td>{`${Math.ceil(record.registerApplicationRate * 10000) / 100}%`}</td>
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

        let columns = getColumnsList(this.state.type, !!this.state.startMonth, this.state.search.version === 3);

        let th = this.getExportTableHead(this.state.type);
        const settings = {
            data: this.state.list,
            columns: columns,
            getFields: this.getFormFields,
            pagination: false,
            pageChange: this.pageChange,
            tableLoading: this.state.loading,
            search: this.state.search,
            handleReset: this.handleReset,
            scroll: {x: 2000},
        };
        return (
            <div className="register-apply-funnel daily-monitor">
                <div className="select-panel">
                    <p>
                        <span>日期：</span>
                        <RangePicker onChange={this.onDateChange} value={[this.state.startDate, this.state.endDate]}/>
                        <span style={{marginLeft: "50px"}}>平台：</span>
                        <Select placeholder="Please select"
                                value={this.state.search.version}
                                onChange={this.onAppNameChange}
                                allowClear
                                style={{width: 200}}>
                            {_.map(this.state.options.flatformOpt, app => {
                                return <Select.Option key={app.value} value={app.value}>{app.name}</Select.Option>
                            })}
                        </Select>
                        <span style={{marginLeft: "50px"}}>版本号：</span>
                        <Select placeholder="Please select"
                                mode="multiple"
                                value={this.state.search.appVersion}
                                onChange={this.onAppVersionChange}
                                style={{width: 200}}
                                allowClear
                                notFoundContent={this.state.selectLoading ? <Spin size="small"/> : null}>
                            {_.map(this.state.options.versionOpt, app => {
                                return <Select.Option key={app.value} value={app.value}>{app.name}</Select.Option>
                            })}
                        </Select>
                        {

                            this.state.hasProduct && [<span style={{marginLeft: "50px"}}>产品：</span>,
                                <Select placeholder="Please select"
                                        value={this.state.search.product}
                                        onChange={this.onProductChange}
                                        allowClear
                                        style={{width: 200}}>
                                    {_.map(this.state.options.productOpt, app => {
                                        return <Select.Option key={app.value}
                                                              value={app.value}>{app.name}</Select.Option>
                                    })}
                                </Select>]
                        }
                    </p>
                    <p>
                        <span>月份：</span>
                        <RangePicker
                            placeholder={['Start month', 'End month']}
                            format="YYYY-MM"
                            value={[this.state.startMonth, this.state.endMonth]}
                            mode={["month", "month"]}
                            onPanelChange={this.onMonthChange}
                        />
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
                    <table className="ex-table" id="ex-table-register-process">
                        <thead>
                        <tr>
                            {th && th.map((doc) => {
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

let getColumnsList = (type, isMonthly, isCashToGo) => {
    if (type == "0") {
        return []
    } else if (type == "1") {

        return [{
            title: '日期',
            dataIndex: 'date',
            width: "6%",
            render(text, data) {
                return isMonthly ? data.month : moment(text).format("YYYY-MM-DD");
            }
        }, {
            title: '注册用户数',
            width: '5%',
            dataIndex: 'registerNumber'
        }, {
            title: '产品选择首页曝光数',
            width: '5%',
            dataIndex: 'firstPageExposures'
        }, {
            title: 'let\'s get cash点击数',
            width: '5%',
            dataIndex: 'letgetcashClicks'
        }, {
            title: '注册-点击开始申请转化率',
            width: '5%',
            className: 'columns-color-one',
            dataIndex: 'letgetcashClickRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '基础信息曝光数',
            width: '5%',
            dataIndex: 'basePageExposures'
        }, {
            title: '基础信息填写数',
            width: '5%',
            dataIndex: 'basePageWrite'
        }, {
            title: '基础信息完成数',
            width: '5%',
            dataIndex: 'basePageConfirm'
        }, {
            title: '职业信息曝光数',
            width: '5%',
            dataIndex: 'jobPageExposures'
        }, {
            title: '职业信息填写数',
            width: '5%',
            dataIndex: 'jobPageWrite'
        }, {
            title: '职业信息完成数',
            width: '5%',
            dataIndex: 'jobPageConfirm'
        }, {
            title: '支付信息曝光数',
            width: '5%',
            dataIndex: 'payPageExposures'
        }, {
            title: '支付信息填写数',
            width: '5%',
            dataIndex: 'payPageWrite'
        }, {
            title: '支付信息完成数',
            width: '5%',
            dataIndex: 'payPageConfirm'
        }, {
            title: '开始申请-资料完成转化率',
            width: '5%',
            className: 'columns-color-one',
            dataIndex: 'applicationInfoFinishRate',
            render(text, data) {
                return data.letgetcashClicks ? Math.ceil((data.payPageConfirm / data.letgetcashClicks) * 10000) / 100 + '%' : 0;
            }
        }, {
            title: '费息页曝光数',
            width: '5%',
            dataIndex: 'feePageExposures'
        }, {
            title: 'I got it点击数',
            width: '5%',
            dataIndex: 'igotitClicks'
        }, {
            title: '资料完成-点击提交申请转化率',
            width: '5%',
            className: 'columns-color-one',
            dataIndex: 'applicationInfoFinishSubRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '提交申请数',
            width: '5%',
            dataIndex: 'applicationCount'
        }, {
            title: '注册-申请转化率',
            width: '5%',
            className: 'columns-color-two',
            dataIndex: 'registerApplicationRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];
    } else if (type == "2") {

        return [{
            title: '日期',
            dataIndex: 'date',
            width: "6%",
            render(text, data) {
                return isMonthly ? data.month : moment(text).format("YYYY-MM-DD");
            }
        }, {
            title: '注册用户数',
            width: '4%',
            dataIndex: 'registerNumber'
        }, {
            title: '产品选择首页曝光数',
            width: '4%',
            dataIndex: 'firstPageExposures'
        }, {
            title: 'Apply点击数',
            width: '4%',
            dataIndex: 'letgetcashClicks'
        }, {
            title: '注册-点击开始申请转化率',
            width: '5%',
            className: 'columns-color-one',
            dataIndex: 'letgetcashClickRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '贷款额度期限选择页曝光数',
            width: '5%',
            className: isCashToGo ? 'hidden-column' : '',
            dataIndex: 'loanQuotaTermSelectionPageExposures'
        }, {
            title: '贷款额度期限选择页提交数',
            width: '5%',
            className: isCashToGo ? 'hidden-column' : '',
            dataIndex: 'loanQuotaTermSelectionPageSubmission'
        }, {
            title: '基础信息曝光数',
            width: '3%',
            dataIndex: 'basePageExposures'
        }, {
            title: '基础信息填写数',
            width: '3%',
            dataIndex: 'basePageWrite'
        }, {
            title: '基础信息完成数',
            width: '3%',
            dataIndex: 'basePageConfirm'
        }, {
            title: '职业信息曝光数',
            width: '3%',
            dataIndex: 'jobPageExposures'
        }, {
            title: '职业信息填写数',
            width: '3%',
            dataIndex: 'jobPageWrite'
        }, {
            title: '职业信息完成数',
            width: '3%',
            dataIndex: 'jobPageConfirm'
        }, {
            title: '收款人信息页面曝光数',
            width: '4%',
            dataIndex: 'payPageExposures'
        }, {
            title: '收款人信息页面填写数',
            width: '4%',
            dataIndex: 'payPageWrite'
        }, {
            title: '收款人信息页面完成数',
            width: '4%',
            dataIndex: 'payPageConfirm'
        }, {
            title: '开始申请-资料完成转化率',
            width: '5%',
            className: 'columns-color-one',
            dataIndex: 'applicationInfoFinishRate',
            render(text, data) {
                return data.letgetcashClicks ? Math.ceil((data.payPageConfirm / data.letgetcashClicks) * 10000) / 100 + '%' : 0;
            }
        }, {
            title: '费息页曝光数',
            width: '3%',
            dataIndex: 'feePageExposures'
        }, {
            title: 'I got it点击数',
            width: '4%',
            dataIndex: 'igotitClicks'
        }, {
            title: '资料完成-点击提交申请转化率',
            width: '5%',
            className: 'columns-color-one',
            dataIndex: 'applicationInfoFinishSubRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '提交申请数',
            width: '4%',
            dataIndex: 'applicationCount'
        }, {
            title: '注册-申请转化率',
            width: '4%',
            className: 'columns-color-two',
            dataIndex: 'registerApplicationRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];
    } else if (type == "3") {

        return [{
            title: '日期',
            dataIndex: 'date',
            width: "6%",
            render(text, data) {
                return isMonthly ? data.month : moment(text).format("YYYY-MM-DD");
            }
        }, {
            title: '注册用户数',
            width: '4%',
            dataIndex: 'registerNumber'
        }, {
            title: '产品选择首页曝光数',
            width: '4%',
            dataIndex: 'firstPageExposures'
        }, {
            title: 'let\'s get cash点击数',
            width: '4%',
            dataIndex: 'letgetcashClicks'
        }, {
            title: '注册-点击开始申请转化率',
            width: '4%',
            className: 'columns-color-one',
            dataIndex: 'letgetcashClickRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '贷款额度期限选择页曝光数',
            width: '3%',
            className: isCashToGo ? 'hidden-column' : '',
            dataIndex: 'loanQuotaTermSelectionPageExposures'
        }, {
            title: '贷款额度期限选择页提交数',
            width: '4%',
            className: isCashToGo ? 'hidden-column' : '',
            dataIndex: 'loanQuotaTermSelectionPageSubmission'
        }, {
            title: '收款人信息页面曝光数',
            width: '4%',
            dataIndex: 'payPageExposures'
        }, {
            title: '收款人信息页面填写数',
            width: '4%',
            dataIndex: 'payPageWrite'
        }, {
            title: '收款人信息页面完成数',
            width: '4%',
            dataIndex: 'payPageConfirm'
        }, {
            title: '开始申请-资料完成转化率',
            width: '4%',
            className: 'columns-color-one',
            dataIndex: 'applicationInfoFinishRate',
            render(text, data) {
                return data.letgetcashClicks ? Math.ceil((data.payPageConfirm / data.letgetcashClicks) * 10000) / 100 + '%' : 0;
            }
        }, {
            title: '费息页曝光数',
            width: '3%',
            dataIndex: 'feePageExposures'
        }, {
            title: 'I got it点击数',
            width: '4%',
            dataIndex: 'igotitClicks'
        }, {
            title: '资料完成-点击提交申请转化率',
            width: '4%',
            className: 'columns-color-one',
            dataIndex: 'applicationInfoFinishSubRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '提交申请数',
            width: '4%',
            dataIndex: 'applicationCount'
        }, {
            title: '注册-申请转化率',
            width: '4%',
            className: 'columns-color-two',
            dataIndex: 'registerApplicationRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];
    } else if (type == "4") {

        return [{
            title: '日期',
            dataIndex: 'date',
            width: "6%",
            render(text, data) {
                return isMonthly ? data.month : moment(text).format("YYYY-MM-DD");
            }
        }, {
            title: '注册用户数',
            width: '4%',
            dataIndex: 'registerNumber'
        }, {
            title: '产品选择首页曝光数',
            width: '4%',
            dataIndex: 'firstPageExposures'
        }, {
            title: 'Apply点击数',
            width: '4%',
            dataIndex: 'letgetcashClicks'
        }, {
            title: '注册-点击开始申请转化率',
            width: '4%',
            className: 'columns-color-one',
            dataIndex: 'letgetcashClickRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '目录页曝光数',
            width: '3%',
            dataIndex: 'directoryPageExposures'
        }, {
            title: '目录页列表点击数',
            width: '4%',
            dataIndex: 'directoryPageListClicks'
        }, {
            title: '证件信息曝光数',
            width: '4%',
            dataIndex: 'identityPageExposures'
        }, {
            title: '证件信息填写数',
            width: '4%',
            dataIndex: 'identityPageWrite'
        }, {
            title: '证件信息完成数',
            width: '4%',
            dataIndex: 'identityPageConfirm'
        }, {
            title: '基础信息曝光数',
            width: '5%',
            dataIndex: 'basePageExposures'
        }, {
            title: '基础信息填写数',
            width: '5%',
            dataIndex: 'basePageWrite'
        }, {
            title: '基础信息完成数',
            width: '5%',
            dataIndex: 'basePageConfirm'
        }, {
            title: '职业信息曝光数',
            width: '5%',
            dataIndex: 'jobPageExposures'
        }, {
            title: '职业信息填写数',
            width: '5%',
            dataIndex: 'jobPageWrite'
        }, {
            title: '职业信息完成数',
            width: '5%',
            dataIndex: 'jobPageConfirm'
        }, {
            title: '开始申请-资料完成转化率',
            width: '4%',
            className: 'columns-color-one',
            dataIndex: 'applicationInfoFinishRate',
            render(text, data) {
                return data.letgetcashClicks ? Math.ceil((data.payPageConfirm / data.letgetcashClicks) * 10000) / 100 + '%' : 0;
            }
        }, {
            title: '费息页曝光数',
            width: '3%',
            dataIndex: 'feePageExposures'
        }, {
            title: 'I got it点击数',
            width: '4%',
            dataIndex: 'igotitClicks'
        }, {
            title: '资料完成-点击提交申请转化率',
            width: '4%',
            className: 'columns-color-one',
            dataIndex: 'applicationInfoFinishSubRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '提交申请数',
            width: '4%',
            dataIndex: 'applicationCount'
        }, {
            title: '注册-申请转化率',
            width: '4%',
            className: 'columns-color-two',
            dataIndex: 'registerApplicationRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];
    }
}