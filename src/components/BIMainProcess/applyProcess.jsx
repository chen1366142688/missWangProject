import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import CLList from 'Lib/component/CLlist.jsx';
import {Interface} from 'Lib/config/index';
import {Table, DatePicker, Button, message, Select, Modal, Pagination} from 'antd';
import moment from 'moment';

const {RangePicker} = DatePicker;
let {contentType, getAppNameList, getBIAppApplicationList} = Interface;
import tableexport from 'tableexport';

let TB;

export default class ApplyProcess extends CLComponent {
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
        if (typeof this.state.search.appVersion != "number" || !this.state.search.isOld) {
            message.warn("请选择平台和用户群体！");
            return;
        }
        const _this = this;
        const settings = {
            contentType,
            method: getBIAppApplicationList.type,
            url: getBIAppApplicationList.url,
            data: JSON.stringify({
                page: {
                    currentPage: search.page,
                    pageSize: search.pageSize
                },
                appVersion: search.appVersion,
                newOrOldMemberFlag: search.isOld * 1,
                startDate: search.startDate && this.dealDate(search.startDate, true) * 1000,
                endDate: search.endDate && this.dealDate(search.endDate) * 1000
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
            TB = tableexport(document.querySelector('#ex-table-apply-process'), {formats: ['csv', 'txt', 'xlsx']});
        }, 100);
    };

    getExportTableHead = (type) => {
        if (type == "0") {
            return []
        } else if (type == "1") {
            return ['日期', '产品选择首页曝光数', '基础页面曝光数', '基础信息页面跳转率', '职业信息曝光数', '职业信息页面跳转率', '支付信息曝光数', '支付信息页面跳转率',
                '费息页曝光数', '费息页跳转率', 'I got it点击数', 'I got it点击率', '提交申请成功数', '提交申请成功率', '开始申请-申请成功转化率'];
        } else if (type == "2") {
            return ['日期', '产品选择首页曝光数', '快速申请按钮点K击数', '目录页曝光数', '费息页曝光数', '费息页跳转率', 'I got it点击数', 'I got it点击率', '提交申请成功数',
                '提交申请成功率', '开始申请-申请成功转化率'];
        } else if (type == "3") {
            return ['日期', '产品选择首页曝光数', '目录页曝光数', '目录页跳转率', '证件信息曝光数', '证件信息页面跳转率', '基础页面曝光数', '基础信息页面跳转率', '职业信息曝光数',
                '职业信息页面跳转率', '支付信息曝光数', '支付信息页面跳转率', '费息页曝光数', '费息页跳转率', 'I got it点击数', 'I got it点击率', '提交申请成功数',
                '提交申请成功率', '开始申请-申请成功转化率'];
        } else if (type == "4") {
            return ['日期', '产品选择首页曝光数', '目录页曝光数', '目录页跳转率', '费息页曝光数', '费息页跳转率', 'I got it点击数', 'I got it点击率', '提交申请成功数',
                '提交申请成功率', '开始申请-申请成功转化率'];
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
        const settings = {
            data: this.state.list,
            columns: columns,
            getFields: this.getFormFields,
            pagination: this.state.pagination || {},
            pageChange: this.pageChange,
            tableLoading: this.state.loading,
            search: this.state.search,
            handleReset: this.handleReset,
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
                {/* <Table dataSource={this.state.list}
                       columns={columns}
                       bordered
                       pagination={false}
                       loading={this.state.loading}>
                </Table>
                <div style={{textAlign: "right", marginTop: "15px"}}>
                    <Pagination showSizeChanger current={this.state.pagination.page} onShowSizeChange={this.pageChange}
                                onChange={this.pageChange} total={this.state.pagination.total}/>
                </div> */}
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
    console.log('type-->',type);
    if (type == "0") {
        return []
    } else if (type == "1") {
        return [{
            title: '日期',
            dataIndex: 'date',
            width:'8%',
            render(text, data) {
                return moment(text).format("YYYY-MM-DD")
            }
        }, {
            title: '产品选择首页曝光数',
            width: '6%',
            dataIndex: 'firstPageExposures'
        }, {
            title: '基础页面曝光数',
            width: '6.5%',
            dataIndex: 'basePageExposures'
        }, {
            title: '基础信息页面跳转率',
            width: '6%',
            dataIndex: 'basePageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '职业信息曝光数',
            width: '6%',
            dataIndex: 'jobPageExposures'
        }, {
            title: '职业信息页面跳转率',
            width: '6.5%',
            dataIndex: 'jobPageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '支付信息曝光数',
            width: '6%',
            dataIndex: 'payPageExposures'
        }, {
            title: '支付信息页面跳转率',
            width: '6.5%',
            dataIndex: 'payPageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '费息页曝光数',
            width: '6%',
            dataIndex: 'feePageExposures'
        }, {
            title: '费息页跳转率',
            width: '6.5%',
            dataIndex: 'feePageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: 'I got it点击数',
            width: '6%',
            dataIndex: 'igotitClicks'
        }, {
            title: 'I got it点击率',
            width: '6%',
            dataIndex: 'igotitClickRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '提交申请成功数',
            width: '6%',
            dataIndex: 'submitApplicationSuccess'
        }, {
            title: '提交申请成功率',
            width: '6.5%',
            dataIndex: 'submitApplicationSuccessRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '开始申请-申请成功转化率',
            dataIndex: 'startApplicationSuccessConversionRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];
    } else if (type == "2") {
        return [{
            title: '日期',
            dataIndex: 'date',
            // width: 150,
            render(text, data) {
                return moment(text).format("YYYY-MM-DD")
            }
        }, {
            title: '产品选择首页曝光数',
            width:'9%',
            dataIndex: 'firstPageExposures'
        }, {
            title: '快速申请按钮点击数',
            width:'9%',
            dataIndex: 'quickApplicationButtonClicks'
        }, {
            title: '目录页曝光数',
            width:'9%',
            dataIndex: 'directoryPageExposures'
        }, {
            title: '费息页曝光数',
            width:'9%',
            dataIndex: 'feePageExposures'
        }, {
            title: '费息页跳转率',
            width:'9%',
            dataIndex: 'feePageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: 'I got it点击数',
            width:'9%',
            dataIndex: 'igotitClicks'
        }, {
            title: 'I got it点击率',
            width:'9%',
            dataIndex: 'igotitClickRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '提交申请成功数',
            width:'9%',
            dataIndex: 'submitApplicationSuccess'
        }, {
            title: '提交申请成功率',
            width:'9%',
            dataIndex: 'submitApplicationSuccessRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '开始申请-申请成功转化率',
            width:'9%',
            dataIndex: 'startApplicationSuccessConversionRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];
    } else if (type == "3") {
        return [{
            title: '日期',
            dataIndex: 'date',
            // width: 150,
            render(text, data) {
                return moment(text).format("YYYY-MM-DD")
            }
        }, {
            title: '产品选择首页曝光数',
            width:'5%',
            dataIndex: 'firstPageExposures'
        }, {
            title: '目录页曝光数',
            width:'5%',
            dataIndex: 'directoryPageExposures'
        }, {
            title: '目录页跳转率',
            width:'5%',
            dataIndex: 'directoryPageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '证件信息曝光数',
            width:'5%',
            dataIndex: 'identityInformaitonExposures'
        }, {
            title: '证件信息页面跳转率',
            width:'5%',
            dataIndex: 'identityInformaitonJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '基础页面曝光数',
            width:'5%',
            dataIndex: 'basePageExposures'
        }, {
            title: '基础信息页面跳转率',
            width:'5%',
            dataIndex: 'basePageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '职业信息曝光数',
            width:'5%',
            dataIndex: 'jobPageExposures'
        }, {
            title: '职业信息页面跳转率',
            width:'5%',
            dataIndex: 'jobPageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '支付信息曝光数',
            width:'5%',
            dataIndex: 'payPageExposures'
        }, {
            title: '支付信息页面跳转率',
            width:'5%',
            dataIndex: 'payPageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '费息页曝光数',
            width:'5%',
            dataIndex: 'feePageExposures'
        }, {
            title: '费息页跳转率',
            width:'5%',
            dataIndex: 'feePageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: 'I got it点击数',
            width:'5%',
            dataIndex: 'igotitClicks'
        }, {
            title: 'I got it点击率',
            width:'5%',
            dataIndex: 'igotitClickRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '提交申请成功数',
            width:'5%',
            dataIndex: 'submitApplicationSuccess'
        }, {
            title: '提交申请成功率',
            width:'5%',
            dataIndex: 'submitApplicationSuccessRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '开始申请-申请成功转化率',
            width:'5%',
            dataIndex: 'startApplicationSuccessConversionRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];
    } else if (type == "4") {
        return [{
            title: '日期',
            dataIndex: 'date',
            // width: 150,
            render(text, data) {
                return moment(text).format("YYYY-MM-DD")
            }
        }, {
            title: '产品选择首页曝光数',
            width:'9%',
            dataIndex: 'firstPageExposures'
        }, {
            title: '目录页曝光数',
            width:'9%',
            dataIndex: 'directoryPageExposures'
        }, {
            title: '目录页跳转率',
            width:'9%',
            dataIndex: 'directoryPageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '费息页曝光数',
            width:'9%',
            dataIndex: 'feePageExposures'
        }, {
            title: '费息页跳转率',
            width:'9%',
            dataIndex: 'feePageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: 'I got it点击数',
            width:'9%',
            dataIndex: 'igotitClicks'
        }, {
            title: 'I got it点击率',
            width:'9%',
            dataIndex: 'igotitClickRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '提交申请成功数',
            width:'9%',
            dataIndex: 'submitApplicationSuccess'
        }, {
            title: '提交申请成功率',
            width:'9%',
            dataIndex: 'submitApplicationSuccessRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '开始申请-申请成功转化率',
            width:'9%',
            dataIndex: 'startApplicationSuccessConversionRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];
    }
}