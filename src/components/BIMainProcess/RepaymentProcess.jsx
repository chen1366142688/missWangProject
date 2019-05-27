import React from 'react';
import {CLComponent} from 'Lib/component/index';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import {Button, Modal} from 'antd';
import moment from 'moment';

let {contentType, getAppNameList, getBIAppRepaymentList} = Interface;
import tableexport from 'tableexport';

let TB;

export default class RepaymentProcess extends CLComponent {
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

                versionOpt: [],
                isoldOpt: [],
            },
            showTableExport: false
        }
    }

    componentDidMount() {
        this.loadData();
        this.versionOptMth();
        this.isoldOptMth();
    }

    versionOptMth = () => {
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
                options["versionOpt"] = list;
                _this.setState({options})
            }
        }

        CL.clReqwest({settings, fn});
    };
    isoldOptMth = () => {
        let options = this.state.options;
        options["isoldOpt"] = [{
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
            method: getBIAppRepaymentList.type,
            url: getBIAppRepaymentList.url,
            data: JSON.stringify({
                page: {
                    currentPage: search.page,
                    pageSize: search.pageSize
                },
                appVersion: search.version,
                newOrOldMemberFlag: search.isold * 1,
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
            TB = tableexport(document.querySelector('#ex-table-repayment-process'), {formats: ['csv', 'txt', 'xlsx']});
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
            "日期", "申请单数", "放款单数", "放款率", "到期单数", "首逾单数", "首逾率", "7天产品逾期单数", "7天产品首逾率", "14天产品逾期单数", "14天产品首逾率",
            "当前逾期单数", "当前逾期率", "逾期回收单数", "逾期回收率", "7天产品逾期回收数", "14天产品逾期回收数", "逾期第1天回收单数", "逾期第2天回收单数",
            "逾期第3天回收单数", "逾期第4天回收单数", "逾期第5天回收单数", "逾期第6天回收单数", "逾期第7天回收单数", "逾期第8天回收单数", "逾期第9天回收单数", "逾期第10天回收单数",
            "逾期10天以上回收单数", "S1回收单数", "S1回收率", "S2回收单数", "S2回收率", "M2回收单数", "M2回收率", "损失单数", "损失率", "7天产品损失单数", "7天产品损失率",
            "14天产品损失单数", "14天产品损失率", "平均回收周期(天)", "逾期10天以上平均回收周期(天)"
        ]
    };

    handleReset = () => {
        let {search} = this.state;
        search.page = 1;
        search.dateRanger = [];
        delete search.startDate;
        delete search.endDate;
        delete search.version;
        delete search.isold;

        this.setState({search});
    };

    render() {
        let th = this.getExportTableHead();

        const operation = [
            {
                id: "dateRanger",
                type: "rangePicker",
                label: "申请时间",
                placeholder: "ranger"
            },

            {
                id: "version",
                type: "select",
                label: "平台",
                placeholder: "Please select",
                options: this.state.options["versionOpt"]
            },

            {
                id: "isold",
                type: "select",
                label: "用户群体",
                placeholder: "Please select",
                options: this.state.options["isoldOpt"]
            },
        ];

        const columns = [
            {
                title: "日期",
                dataIndex: "date",
                width: "120px",
                render(text, data) {
                    return moment(text).format("YYYY-MM-DD")
                }
            },

            {
                title: "申请单数",
                dataIndex: "applicationCount",
                width: "120px"
            },

            {
                title: "放款单数",
                dataIndex: "paymentCount",
                width: "120px"
            },

            {
                title: "放款率",
                dataIndex: "paymentRate",
                width: "120px",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "到期单数",
                dataIndex: "expireCount",
                width: "120px"
            },

            {
                title: "首逾单数",
                dataIndex: "firstOverdueCount",
                width: "120px"
            },

            {
                title: "首逾率",
                dataIndex: "firstOverdueRate",
                width: "120px",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "7天产品逾期单数",
                dataIndex: "firstOverdue7daysPCount",
                width: "120px"
            },

            {
                title: "7天产品首逾率",
                dataIndex: "firstOverdue7daysPRate",
                width: "120px",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "14天产品逾期单数",
                dataIndex: "firstOverdue14daysPCount",
                width: "120px"
            },

            {
                title: "14天产品首逾率",
                dataIndex: "firstOverdue14daysPRate",
                width: "120px",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            // {
            //     title: "当前逾期单数",
            //     dataIndex: "overdueCount",
            //     width: "120px"
            // },
            //
            // {
            //     title: "当前逾期率",
            //     dataIndex: "overdueRate",
            //     width: "120px",
            //     render(text, data) {
            //         return `${Math.round(text * 10000) / 100}%`
            //     }
            // },

            {
                title: "逾期回收单数",
                dataIndex: "overdueRecycleCount",
                width: "120px"
            },

            {
                title: "逾期回收率",
                dataIndex: "overdueRecycleRate",
                width: "120px",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "7天产品逾期回收数",
                dataIndex: "overdueRecycle7daysPCount",
                width: "120px"
            },

            {
                title: "14天产品逾期回收数",
                dataIndex: "overdueRecycle14daysPCount",
                width: "120px"
            },

            {
                title: "逾期第1天回收单数",
                dataIndex: "overdueRecycle1daysCount",
                width: "120px"
            },

            {
                title: "逾期第2天回收单数",
                dataIndex: "overdueRecycle2daysCount",
                width: "120px"
            },

            {
                title: "逾期第3天回收单数",
                dataIndex: "overdueRecycle3daysCount",
                width: "120px"
            },

            {
                title: "逾期第4天回收单数",
                dataIndex: "overdueRecycle4daysCount",
                width: "120px"
            },

            {
                title: "逾期第5天回收单数",
                dataIndex: "overdueRecycle5daysCount",
                width: "120px"
            },

            {
                title: "逾期第6天回收单数",
                dataIndex: "overdueRecycle6daysCount",
                width: "120px"
            },

            {
                title: "逾期第7天回收单数",
                dataIndex: "overdueRecycle7daysCount",
                width: "120px"
            },

            {
                title: "逾期第8天回收单数",
                dataIndex: "overdueRecycle8daysCount",
                width: "120px"
            },

            {
                title: "逾期第9天回收单数",
                dataIndex: "overdueRecycle9daysCount",
                width: "120px"
            },

            {
                title: "逾期第10天回收单数",
                dataIndex: "overdueRecycle10daysCount",
                width: "120px"
            },

            {
                title: "逾期10天以上回收单数",
                dataIndex: "overdueRecycleMore10daysCount",
                width: "120px"
            },

            {
                title: "S1回收单数",
                dataIndex: "overdueRecycleS1Count",
                width: "120px"
            },

            {
                title: "S1回收率",
                dataIndex: "overdueRecycleS1Rate",
                width: "120px",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "S2回收单数",
                dataIndex: "overdueRecycleS2Count",
                width: "120px"
            },

            {
                title: "S2回收率",
                dataIndex: "overdueRecycleS2Rate",
                width: "120px",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "M2回收单数",
                dataIndex: "overdueRecycleM2Count",
                width: "120px"
            },

            {
                title: "M2回收率",
                dataIndex: "overdueRecycleM2Rate",
                width: "120px",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "损失单数",
                dataIndex: "delinquentCount",
                width: "120px"
            },

            {
                title: "损失率",
                dataIndex: "delinquentRate",
                width: "120px",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "7天产品损失单数",
                dataIndex: "delinquent7daysPCount",
                width: "120px"
            },

            {
                title: "7天产品损失率",
                dataIndex: "delinquent7daysPRate",
                width: "120px",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "14天产品损失单数",
                dataIndex: "delinquent14daysPCount",
                width: "120px"
            },

            {
                title: "14天产品损失率",
                dataIndex: "delinquent14daysPRate",
                width: "120px",
                render(text, data) {
                    return `${Math.round(text * 10000) / 100}%`
                }
            },

            {
                title: "平均回收周期(天)",
                dataIndex: "recycleAverageDay",
                width: "120px"
            },

            {
                title: "逾期10天以上平均回收周期(天)",
                dataIndex: "recycleMore10daysAverageDay",
                width: "120px"
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
            scroll: {
                x: 6000
            },
            btn: [
                {
                    title: 'Download',
                    fn: this.onDownload,
                },
            ],
        };

        return (
            <div className="repayment-process">
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
                    <table className="ex-table" id="ex-table-repayment-process" style={{width: "4000px"}}>
                        <colgroup>
                            <col width = '100px'/>
                        </colgroup>
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
                                        <td>{record.paymentCount}</td>
                                        <td>{`${Math.ceil(record.paymentRate * 10000) / 100}%`}</td>
                                        <td>{record.expireCount}</td>
                                        <td>{record.firstOverdueCount}</td>
                                        <td>{`${Math.ceil(record.firstOverdueRate * 10000) / 100}%`}</td>
                                        <td>{record.firstOverdue7daysPCount}</td>
                                        <td>{`${Math.ceil(record.firstOverdue7daysPRate * 10000) / 100}%`}</td>
                                        <td>{record.firstOverdue14daysPCount}</td>
                                        <td>{`${Math.ceil(record.firstOverdue14daysPRate * 10000) / 100}%`}</td>
                                        <td>{record.overdueCount}</td>
                                        <td>{`${Math.ceil(record.overdueRate * 10000) / 100}%`}</td>
                                        <td>{record.overdueRecycleCount}</td>
                                        <td>{`${Math.ceil(record.overdueRecycleRate * 10000) / 100}%`}</td>
                                        <td>{record.overdueRecycle7daysPCount}</td>
                                        <td>{record.overdueRecycle14daysPCount}</td>
                                        <td>{record.overdueRecycle1daysCount}</td>
                                        <td>{record.overdueRecycle2daysCount}</td>
                                        <td>{record.overdueRecycle3daysCount}</td>
                                        <td>{record.overdueRecycle4daysCount}</td>
                                        <td>{record.overdueRecycle5daysCount}</td>
                                        <td>{record.overdueRecycle6daysCount}</td>
                                        <td>{record.overdueRecycle7daysCount}</td>
                                        <td>{record.overdueRecycle8daysCount}</td>
                                        <td>{record.overdueRecycle9daysCount}</td>
                                        <td>{record.overdueRecycle10daysCount}</td>
                                        <td>{record.overdueRecycleMore10daysCount}</td>
                                        <td>{record.overdueRecycleS1Count}</td>
                                        <td>{`${Math.ceil(record.overdueRecycleS1Rate * 10000) / 100}%`}</td>
                                        <td>{record.overdueRecycleS2Count}</td>
                                        <td>{`${Math.ceil(record.overdueRecycleS2Rate * 10000) / 100}%`}</td>
                                        <td>{record.overdueRecycleM2Count}</td>
                                        <td>{`${Math.ceil(record.overdueRecycleM2Rate * 10000) / 100}%`}</td>
                                        <td>{record.delinquentCount}</td>
                                        <td>{`${Math.ceil(record.delinquentRate * 10000) / 100}%`}</td>
                                        <td>{record.delinquent7daysPCount}</td>
                                        <td>{`${Math.ceil(record.delinquent7daysPRate * 10000) / 100}%`}</td>
                                        <td>{record.delinquent14daysPCount}</td>
                                        <td>{`${Math.ceil(record.delinquent14daysPRate * 10000) / 100}%`}</td>
                                        <td>{record.recycleAverageDay}</td>
                                        <td>{record.recycleMore10daysAverageDay}</td>
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
