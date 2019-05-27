import React from 'react';
import {CLComponent, TableSorter} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import {Table, DatePicker, Button, message, Select, Modal, Pagination} from 'antd';
import moment from 'moment';

const {RangePicker} = DatePicker;
let {contentType, getAppNameList, getGradeList, getBIAppAuditRuleList} = Interface;
import tableexport from 'tableexport';

let TB;

export default class AuditRuleProcess extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            ruleList: [],
            search: {
                page: 1,
                pageSize: 10
            },
            options: {
                flatformOpt: [],
                userOpt: [],
                gradeOpt: []
            },
            loading: false,
            loadingRule: false,
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
        this.gradeOptMth();
        // this.loadFirstTable();
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

    gradeOptMth = () => {
        const _this = this;
        const settings = {
            contentType,
            method: getGradeList.type,
            url: getGradeList.url
        };

        function fn(res) {
            if (res && res.data) {
                let list = [], options = _this.state.options;
                _.each(res.data, (item) => {
                    list.push({
                        key: item.code,
                        value: item.name
                    })
                })
                options["gradeOpt"] = list;
                _this.setState({options})
            }
        }

        CL.clReqwest({settings, fn});
    };

    getFormFields = (fields) => {
        const pagination = this.state.pagination;
        pagination.page = 1;

        this.setState({search: fields, pagination});
        this.loadFirstTable(fields);
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
        this.loadFirstTable(search);

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

    loadFirstTable = (search) => {
        search = search || this.state.search;
        if (!this.state.search.isOld || !this.state.search.startDate || !this.state.search.endDate) {
            message.warn("请选择时间和用户群体！");
            return;
        }
        const _this = this;
        const settings = {
            contentType,
            method: getBIAppAuditRuleList.type,
            url: getBIAppAuditRuleList.url,
            data: JSON.stringify({
                page: {
                    currentPage: search.page,
                    pageSize: search.pageSize
                },
                appVersion: search.appVersion,
                newOrOldMemberFlag: search.isOld * 1,
                riskLevel: search.grade,
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
            list: [],
            type: this.getType(e)
        })
    };

    onGradeChange = (e) => {
        let {search, pagination} = this.state;
        search.grade = e;
        search.page = 1;
        pagination.page = 1;
        this.setState({
            search,
            pagination,
            list: []
        })
    };

    getType = (isOld) => {
        if (typeof isOld == "undefined") {
            return "0";
        } else if (isOld == 0) {
            return "1";
        } else if (isOld == 1) {
            return "2";
        }
    };

    onDownload = (e) => {
        this.setState({showTableExport: true});
        setTimeout(() => {
            TB = tableexport(document.querySelector('#ex-table'), {formats: ['csv', 'txt', 'xlsx']});
        }, 100);
    };

    getExportTableHead = (type) => {
        return ['日期', '申请总单数', '共债拒绝单数', '等级进入单数', '等级进入单占比', '等级-通过单数', '等级-通过率', '等级-拒绝单数',
            '等级-拒绝率', '等级-进入人审单数', '等级-进入人审占比'];

    };

    getExportTableBody = (type, record, index) => {
        return <tr key={index}>
            <td>{moment(record.date).format("YYYY-MM-DD")}</td>
            <td>{record.applicationCount}</td>
            <td>{record.applicationCommonProduceRejectCount}</td>
            <td>{record.applicationSysAuditCount}</td>
            <td>{`${Math.ceil(record.applicationSysAuditProportion * 10000) / 100}%`}</td>
            <td>{record.applicationSysAuditPassCount}</td>
            <td>{`${Math.ceil(record.applicationSysAuditPassRate * 10000) / 100}%`}</td>
            <td>{record.applicationSysAuditRejectCount}</td>
            <td>{`${Math.ceil(record.applicationSysAuditRejectRate * 10000) / 100}%`}</td>
            <td>{record.applicationManualAuditCount}</td>
            <td>{`${Math.ceil(record.applicationManualAuditProportion * 10000) / 100}%`}</td>
        </tr>
    };

    handleCancel = () => {
        this.setState({showTableExport: false});
        if (TB) {
            TB.remove();
        }
    };

    onSort = (tagList) => {
        debugger
    };

    render() {

        let columns = [{
            title: '日期',
            dataIndex: 'date',
            width: 150,
            render(text, data) {
                return moment(text).format("YYYY-MM-DD")
            }
        }, {
            title: '申请总单数',
            dataIndex: 'applicationCount'
        }, {
            title: '共债拒绝单数',
            dataIndex: 'applicationCommonProduceRejectCount'
        }, {
            title: '等级进入单数',
            dataIndex: 'applicationSysAuditCount'
        }, {
            title: '等级进入单占比',
            dataIndex: 'applicationSysAuditProportion',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '等级-通过单数',
            dataIndex: 'applicationSysAuditPassCount'
        }, {
            title: '等级-通过率',
            dataIndex: 'applicationSysAuditPassRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '等级-拒绝单数',
            dataIndex: 'applicationSysAuditRejectCount'
        }, {
            title: '等级-拒绝率',
            dataIndex: 'applicationSysAuditRejectRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '等级-进入人审单数',
            dataIndex: 'applicationManualAuditCount'
        }, {
            title: '等级-进入人审占比',
            dataIndex: 'applicationManualAuditProportion',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];

        let ruleColumns = getColumnsList(this.state.type);

        let th = this.getExportTableHead(this.state.type);

        let sorter = getSorter();

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
                        <span style={{marginLeft: "50px"}}>规则等级：</span>
                        <Select placeholder="Please select"
                                value={this.state.search.grade}
                                onChange={this.onGradeChange}
                                style={{width: 200}}>
                            {_.map(this.state.options.gradeOpt, app => {
                                return <Option value={app.key}>{app.value}</Option>
                            })}
                        </Select>
                    </p>
                    <p className="daily-monitor-footer">
                        <Button type="primary" onClick={() => this.loadFirstTable()}
                                loading={this.state.loading}>Search</Button>
                        <Button type="default" onClick={this.onClear}>Clear</Button>
                        <Button type="default" onClick={this.onDownload}>Download</Button>
                    </p>
                </div>
                <Table dataSource={this.state.list}
                       columns={columns}
                       bordered
                       pagination={false}
                       loading={this.state.loading}>
                </Table>
                <div style={{textAlign: "right", margin: "15px 15px 0 0"}}>
                    <Pagination current={this.state.pagination.page} onChange={this.pageChange}
                                total={this.state.pagination.total}/>
                </div>
                {/*{*/}
                {/*this.state.type == "1" && <TableSorter columns={sorter} onSort={this.onSort}/>*/}
                {/*}*/}
                {/*{*/}
                {/*this.state.type != "0" && <Table dataSource={this.state.ruleList}*/}
                {/*columns={ruleColumns}*/}
                {/*bordered*/}
                {/*pagination={false}*/}
                {/*loading={this.state.loadingRule}*/}
                {/*style={{marginBottom: "100px"}}>*/}
                {/*</Table>*/}

                {/*}*/}
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

let getSorter = () => {
    return [{
        column: "进入单数",
        dataIndex: "jobPageExposures",
        type: "asc",
        selected: false
    }, {
        column: "通过率",
        dataIndex: "payPageExposures",
        type: "asc",
        selected: false
    }, {
        column: "拒绝率",
        dataIndex: "feePageExposures",
        type: "asc",
        selected: true
    }, {
        column: "人审进入率",
        dataIndex: "feePageJumpRate",
        type: "asc",
        selected: false
    }];
}

let getColumnsList = (type) => {
    if (type == "0") {
        return []
    } else if (type == "1") {
        return [{
            title: '规则等级',
            dataIndex: 'date'
        }, {
            title: '规则代码',
            dataIndex: 'firstPageExposures'
        }, {
            title: '规则状态（实时）',
            dataIndex: 'basePageExposures'
        }, {
            title: '规则属性',
            dataIndex: 'basePageJumpRate'
        }, {
            title: '进入单数',
            dataIndex: 'jobPageExposures'
        }, {
            title: '通过单数',
            dataIndex: 'jobPageJumpRate'
        }, {
            title: '通过率',
            dataIndex: 'payPageExposures',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '拒绝单数',
            dataIndex: 'payPageJumpRate'
        }, {
            title: '拒绝率',
            dataIndex: 'feePageExposures',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '进入人审单数',
            dataIndex: 'feePageJumpRate'
        }, {
            title: '人审进入率',
            dataIndex: 'feePageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];
    } else if (type == "2") {
        return [{
            title: '规则等级',
            dataIndex: 'date'
        }, {
            title: '规则状态（实时）',
            dataIndex: 'basePageExposures'
        }, {
            title: '规则属性',
            dataIndex: 'basePageJumpRate'
        }, {
            title: '进入单数',
            dataIndex: 'jobPageExposures'
        }, {
            title: '通过单数',
            dataIndex: 'jobPageJumpRate'
        }, {
            title: '通过率',
            dataIndex: 'payPageExposures',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '拒绝单数',
            dataIndex: 'payPageJumpRate'
        }, {
            title: '拒绝率',
            dataIndex: 'feePageExposures',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '进入人审单数',
            dataIndex: 'feePageJumpRate'
        }, {
            title: '人审进入率',
            dataIndex: 'feePageJumpRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];
    }
}