import React from 'react';
import {CLComponent} from 'Lib/component/index';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import {Button, Modal} from 'antd';
import moment from 'moment';

let {contentType, getAppNameList, getBIAppIndicatorList} = Interface;
import tableexport from 'tableexport';

let TB;


export default class IndicatorProcess extends CLComponent {
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
            },
            showTableExport: false
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

    loadData = (search) => {
        search = search || this.state.search;
        const _this = this;
        const settings = {
            contentType,
            method: getBIAppIndicatorList.type,
            url: getBIAppIndicatorList.url,
            data: JSON.stringify({
                page: search.page,
                pageSize: search.pageSize,
                version: search.version,
                isOlder: search.isOld,
                startTime: search.startDate && this.dealDate(search.startDate, true) * 1000,
                endTime: search.endDate && this.dealDate(search.endDate) * 1000
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
            TB = tableexport(document.querySelector('#ex-table-indicator-process'), {formats: ['csv', 'txt', 'xlsx']});
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
            "日期", "注册人数", "申请单数", "当天注册申请人数", "注册-申请转化率", "通过单数", "放款单数", "放款金额", "放款-件均",
            "到期单数", "首逾单数", "首逾率", "逾期回收单数", "逾期回收率", "损失单数", "损失率", "app卸载数"
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
                dataIndex: "dateStr",
                width: "6%",
                render(text, data) {
                    return moment(text).format("YYYY-MM-DD")
                }
            },

            {
                title: "注册人数",
                dataIndex: "registerNumOfPeople",
                width: "5%"
            },

            // {
            //     title: "登录人数",
            //     dataIndex: "loginNumOfPeople",
            //     width: "5%"
            // },

            {
                title: "申请单数",
                dataIndex: "applyNumOfOrder",
                width: "5%"
            },

            {
                title: "当天注册申请人数",
                dataIndex: "registedApplyNumOfPeople",
                width: "5%",
                render(text, data) {
                    return text || 0;
                }
            },

            {
                title: "注册-申请转化率",
                dataIndex: "registerApplyTransferRate",
                width: "5%",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "通过单数",
                dataIndex: "passNumOfOrder",
                width: "5%"
            },

            {
                title: "放款单数",
                dataIndex: "loanNumOfOrder",
                width: "5%"
            },

            {
                title: "放款金额",
                dataIndex: "loanNumOfAmount",
                width: "5%"
            },

            {
                title: "放款-件均",
                dataIndex: "averageAmount",
                width: "5%",
                render(text, data) {
                    return `${Math.round(text * 100) / 100}`
                }
            },

            {
                title: "到期单数",
                dataIndex: "expireNumOfOrder",
                width: "5%",
                render(text, data) {
                    return text || 0;
                }
            },

            {
                title: "首逾单数",
                dataIndex: "firstOverdueNumOfOrder",
                width: "5%",
                render(text, data) {
                    return text || 0;
                }
            },

            {
                title: "首逾率",
                dataIndex: "firstOverdueRate",
                width: "5%",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "逾期回收单数",
                dataIndex: "overdueRepaymentNumOfOrder",
                width: "5%",
                render(text, data) {
                    return text || 0;
                }
            },

            {
                title: "逾期回收率",
                dataIndex: "overdueRepapmentRate",
                width: "5%",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "损失单数",
                dataIndex: "overdueLoseNumOfOrder",
                width: "5%",
                render(text, data) {
                    return text || 0;
                }
            },

            {
                title: "损失率",
                dataIndex: "overdueLoseRate",
                width: "5%",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "app卸载数",
                dataIndex: "appUninstallNum",
                width: "5%",
                render(text, data) {
                    return text || 0;
                }
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
            <div className="indicator-process">
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
                    <table className="ex-table" id="ex-table-indicator-process">
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
                                        <td>{record.dateStr}</td>
                                        <td>{record.registerNumOfPeople}</td>
                                        <td>{record.applyNumOfOrder}</td>
                                        <td>{record.registedApplyNumOfPeople}</td>
                                        <td>{`${Math.ceil(record.registerApplyTransferRate * 10000) / 100}%`}</td>
                                        <td>{record.passNumOfOrder}</td>
                                        <td>{record.loanNumOfOrder}</td>
                                        <td>{Math.ceil(record.loanNumOfAmount * 100) / 100}</td>
                                        <td>{Math.ceil(record.averageAmount * 100) / 100}</td>
                                        <td>{record.expireNumOfOrder}</td>
                                        <td>{record.firstOverdueNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.firstOverdueRate * 10000) / 100}%`}</td>
                                        <td>{record.overdueRepaymentNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.overdueRepapmentRate * 10000) / 100}%`}</td>
                                        <td>{record.overdueLoseNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.overdueLoseRate * 10000) / 100}%`}</td>
                                        <td>{record.appUninstallNum}</td>
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


// moduleName: IndicatorProcess
// moduleClass: indicator-process
// operation:
//     - {id: dateRanger, type: rangePickers, label: 时间, placeholder: ranger}
//     - {id: flatform, type: select, label: 平台, placeholder: 'Please select', optionsOfState: true}
//     - {id: user, type: select, label: 用户群体, placeholder: 'Please select', optionsOfState: true}
// columns:
//     - {title: 日期, dataIndex: dateOfLogin, width: 6%}
//     - {title: 注册人数, dataIndex: appNumOfActivation, width: 6%}
//     - {title: 登录人数, dataIndex: verificationCodeNumOfLogin, width: 6%}
//     - {title: 申请单数, dataIndex: passwordNumOfLogin, width: 6%}
//     - {title: 通过单数, dataIndex: clickNumOfLogin, width: 6%}
//     - {title: 放款单数, dataIndex: startUpLoginConversionRate, width:6%}
//     - {title: 放款金额, dataIndex: noLoginNum, width:6%}
//     - {title: 放款-件均, dataIndex: loginSuccessRate, width: 6%}
//     - {title: 到期单数, dataIndex: loginNumOfPerson, width: 6%}
//     - {title: 首逾单数, dataIndex: loginNoWayOrderNumOfPerson, width: 6%}
//     - {title: 首逾率, dataIndex: applySuccessNum, width: 6%}
//     - {title: 逾期回收单数, dataIndex: loginApplyConversionRate, width: 6%}
//     - {title: 逾期回收率, dataIndex: applySuccessNum, width: 7%}
//     - {title: 损失单数, dataIndex: loginApplyConversionRate, width: 7%}
//     - {title: 损失率, dataIndex: loginApplyConversionRate, width: 7%}
//     - {title: 损失率	app卸载数, dataIndex: loginApplyConversionRate, width: 7%}
//
