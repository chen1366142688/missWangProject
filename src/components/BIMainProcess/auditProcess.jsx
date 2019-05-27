import React from 'react';
import {CLComponent} from 'Lib/component/index';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import moment from 'moment';

let {contentType, getAppNameList, getBIAppAuditList} = Interface;
import {Button, Modal} from 'antd';
import tableexport from 'tableexport';

let TB;

export default class AuditProcess extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            search: {
                page: 1,
                pageSize: 10
            },
            loading: false,
            pagination: {
                total: 0,
                page: 1,
                pageSize: 10
            },
            options: {
                flatformOpt: [],
                userOpt: [],
            }
        }
    }

    componentDidMount() {
        this.loadData();
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
            name: "新用户",
            value: '0'
        }, {
            name: "老用户",
            value: '1'
        }];
        this.setState({options});
    };

    dealDate = (myDate, whetherStart) => {
        return myDate ? moment(myDate.format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix() :
            (moment(moment().format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix());
    };

    loadData = (search, pagination) => {
        search = search || this.state.search;
        const _this = this;
        const settings = {
            contentType,
            method: getBIAppAuditList.type,
            url: getBIAppAuditList.url,
            data: JSON.stringify({
                page: {
                    currentPage: search.page,
                    pageSize: search.pageSize
                },
                appVersion: search.version,
                newOrOldMemberFlag: search.isOld * 1,
                startDate: search.startDate && this.dealDate(search.startDate, true) * 1000,
                endDate: search.endDate && this.dealDate(search.endDate) * 1000
            })
        };

        this.setState({
            loading: true
        })

        function fn(res) {
            if (res && res.data) {
                var id = 0;
                const pagination = _this.state.pagination;
                pagination.total = res.data.totalCount;
                _this.setState({list: res.data.result.map(item => {
                    item.id = id;
                    id++;
                    return item;
                }), loading: false});
            }
        }

        CL.clReqwest({settings, fn});
    };

    onDownload = (e) => {
        this.setState({showTableExport: true});
        setTimeout(() => {
            TB = tableexport(document.querySelector('#ex-table-audit-process'), {formats: ['csv', 'txt', 'xlsx']});
        }, 100);
    };

    handleCancel = () => {
        this.setState({showTableExport: false});
        if (TB) {
            TB.remove();
        }
    };


    getFormFields = (fields) => {
        let {search, pagination} = this.state;
        pagination.currentPage = 1;
        search.page = 1;
        if (fields.dateRanger) {
            search.startDate = fields.dateRanger[0];
            search.endDate = fields.dateRanger[1];
        }
        search = _.assign(search, fields);

        this.setState({search, pagination});
        this.loadData(search);
    };

    pageChange = (e) => {
        let pagination = {
            currentPage: e.current,
            pageSize: e.pageSize,
            total: this.state.pagination.total
        };
        let search = this.state.search;
        search.page = e.current;
        search.pageSize = e.pageSize;

        this.setState({search, pagination});
        this.loadData(search);
    };

    getExportTableHead = () => {
        return [
            "日期", "申请单数", "进入机审单数", "机审通过单数", "机审通过率", "机审拒绝单数", "机审拒绝率", "人审进入单数", "人审通过单数",
            "人审通过率", "人审拒绝单数", "人审拒绝率", "回退单数", "待审核单数"
        ]
    };

    handleReset = () => {
        let {search} = this.state;
        search.page = 1;
        search.dateRanger = [];
        delete search.startDate;
        delete search.endDate;
        delete search.version;
        delete search.isOld;

        this.setState({search});
    };

    render() {

        let th = this.getExportTableHead();

        const operation = [
            {
                id: "dateRanger",
                type: "rangePicker",
                label: "时间",
                placeholder: "ranger",

            },

            {
                id: "version",
                type: "select",
                label: "平台",
                placeholder: "Please select",
                options: this.state.options["flatformOpt"]
            },

            {
                id: "isOld",
                type: "select",
                label: "用户群体",
                placeholder: "Please select",
                options: this.state.options["userOpt"]
            },
        ];

        const columns = [
            {
                title: "日期",
                dataIndex: "date",
                width: "6%",
                render(text, data) {
                    return moment(text).format("YYYY-MM-DD")
                }
            },

            {
                title: "申请单数",
                dataIndex: "applicationCount",
                width: "7%"
            },

            {
                title: "进入机审单数",
                dataIndex: "sysAuditCount",
                width: "7%"
            },

            {
                title: "机审通过单数",
                dataIndex: "sysAuditPassCount",
                width: "7%"
            },

            {
                title: "机审通过率",
                dataIndex: "sysAuditPassRate",
                width: "7%",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "机审拒绝单数",
                dataIndex: "sysAuditRejectCount",
                width: "7%"
            },

            {
                title: "机审拒绝率",
                dataIndex: "sysAuditRejectRate",
                width: "7%",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "人审进入单数",
                dataIndex: "manualAuditCount",
                width: "7%"
            },

            {
                title: "人审通过单数",
                dataIndex: "manualAuditPassCount",
                width: "7%"
            },

            {
                title: "人审通过率",
                dataIndex: "manualAuditPassRate",
                width: "7%",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "人审拒绝单数",
                dataIndex: "manualAuditRejectCount",
                width: "7%"
            },

            {
                title: "人审拒绝率",
                dataIndex: "manualAuditRejectRate",
                width: "7%",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "回退单数",
                dataIndex: "rollbackCount",
                width: "7%"
            },

            {
                title: "待审核单数",
                dataIndex: "waitAuditCount",
                width: "7%"
            },
        ];

        const settings = {
            data: this.state.list,
            operation: operation,
            columns: columns,
            getFields: this.getFormFields,
            pagination: this.state.pagination || {},
            pageChange: this.pageChange,
            tableLoading: this.state.loading,
            search: this.state.search,
            handleReset: this.handleReset,
            btn: [
                {
                    title: 'Download',
                    fn: this.onDownload,
                },
            ]
        };

        return (
            <div className="audit-process">
                <CLList settings={settings}/>
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
                    <table className="ex-table" id="ex-table-audit-process">
                        <thead>
                        <tr>
                            {th.map((doc) => {
                                return (<th key={doc}>{doc}</th>);
                            })}
                        </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.list && this.state.list.map((record, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{moment(record.date).format("YYYY-MM-DD")}</td>
                                        <td>{record.applicationCount}</td>
                                        <td>{record.sysAuditCount}</td>
                                        <td>{record.sysAuditPassCount}</td>
                                        <td>{`${Math.ceil(record.sysAuditPassRate * 10000) / 100}%`}</td>
                                        <td>{record.sysAuditRejectCount}</td>
                                        <td>{`${Math.ceil(record.sysAuditRejectRate * 10000) / 100}%`}</td>
                                        <td>{record.manualAuditCount}</td>
                                        <td>{record.manualAuditPassCount}</td>
                                        <td>{`${Math.ceil(record.manualAuditPassRate * 10000) / 100}%`}</td>
                                        <td>{record.manualAuditRejectCount}</td>
                                        <td>{`${Math.ceil(record.manualAuditRejectRate * 10000) / 100}%`}</td>
                                        <td>{record.rollbackCount}</td>
                                        <td>{record.waitAuditCount}</td>
                                    </tr>
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
//
//
// moduleName: AuditProcess
// moduleClass: audit-process
// operation:
//     - {id: dateRanger, type: rangePickers, label: 时间, placeholder: ranger}
//     - {id: flatform, type: select, label: 平台, placeholder: 'Please select', optionsOfState: true}
//     - {id: user, type: select, label: 用户群体, placeholder: 'Please select', optionsOfState: true}
// columns:
//     - {title: 日期, dataIndex: dateOfLogin, width: 6%}
//     - {title: 申请单数, dataIndex: appNumOfActivation, width: 7%}
//     - {title: 进入机审单数, dataIndex: verificationCodeNumOfLogin, width: 7%}
//     - {title: 机审通过单数, dataIndex: passwordNumOfLogin, width: 7%}
//     - {title: 机审通过率, dataIndex: clickNumOfLogin, width: 7%}
//     - {title: 机审拒绝单数, dataIndex: startUpLoginConversionRate, width: 7%}
//     - {title: 机审拒绝率, dataIndex: noLoginNum, width:7%}
//     - {title: 人审进入单数, dataIndex: loginSuccessRate, width: 7%}
//     - {title: 人审通过单数, dataIndex: loginNumOfPerson, width: 7%}
//     - {title: 人审通过率, dataIndex: loginNoWayOrderNumOfPerson, width: 7%}
//     - {title: 人审拒绝单数, dataIndex: applySuccessNum, width: 7%}
//     - {title: 人审拒绝率, dataIndex: loginApplyConversionRate, width: 7%}
//     - {title: 回退单数, dataIndex: applySuccessNum, width: 7%}
//     - {title: 待审核单数, dataIndex: loginApplyConversionRate, width: 7%}
//

