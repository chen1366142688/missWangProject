import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import {Table, DatePicker, Button, message, Select, Modal} from 'antd';
import moment from 'moment';

const {Column, ColumnGroup} = Table;
const {RangePicker} = DatePicker;
let {contentType, getFunnelMonitorAppDataList, getFunnelMonitorAuditDataList, getFunnelMonitorRecoverDataList, getChannelList} = Interface;
import tableexport from 'tableexport';
let TB;

export default class Mylist extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            search: {},
            options: {
                appNameOpt: [{
                    key: "com.unipeso.phone",
                    value: "Cashlending"
                }, {
                    key: "com.unipeso.variant",
                    value: "Loanit"
                }, {
                    key: "com.unipeso.swakcash",
                    value: "SwakCash"
                }],
                networkList: []
            },
            startDate: null,
            endDate: null,
            startDateStr: new moment(),
            endDateStr: new moment(),
            hbStartDateStr: new moment().add(-1, 'd'),
            hbEndDateStr: new moment().add(-1, 'd'),
            loading: false,
            appList: [],
            app: "",
            showTableExport: false
        }
    }

    componentDidMount() {
        this.loadData();
        this.getNetworkListMth();
    }

    getFormFields = (fields) => {
        const pagination = this.state.pagination;
        pagination.currentPage = 1;

        this.setState({search: fields, pagination});
        this.loadData(fields, pagination);
    };

    pageChange = (e) => {
        let pagination = {
            currentPage: e.current,
            pageSize: e.pageSize,
            total: this.state.pagination.total
        };

        this.setState({pagination});
        this.loadData(this.state.search, pagination);

    };

    onDateChange = (e) => {
        let hbLength = (e[1].unix() - e[0].unix()) / (60 * 60 * 24) + 1;
        this.setState({
            month: null,
            startDate: e[0],
            endDate: e[1],
            startDateStr: e[0],
            endDateStr: e[1],
            hbStartDateStr: moment(e[0]).add(-hbLength, "d"),
            hbEndDateStr: moment(e[1]).add(-hbLength, "d")
        })
    };

    dealDate = (myDate, whetherStart) => {
        return myDate ? moment(myDate.format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix() :
            (moment(moment().format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix());
    };

    loadData = () => {
        let {startDateStr, endDateStr, hbStartDateStr, hbEndDateStr, app} = this.state;

        startDateStr = this.dealDate(startDateStr, true);
        endDateStr = this.dealDate(endDateStr);
        hbStartDateStr = this.dealDate(hbStartDateStr, true);
        hbEndDateStr = this.dealDate(hbEndDateStr);

        const settings = {
            contentType,
            method: getFunnelMonitorAppDataList.type,
            url: getFunnelMonitorAppDataList.url,
            data: JSON.stringify({
                startDate: startDateStr * 1000,
                endDate: endDateStr * 1000,
                appName: app || undefined
            }),
        };

        //请求环比数据
        const settingsHB = {
            contentType,
            method: getFunnelMonitorAppDataList.type,
            url: getFunnelMonitorAppDataList.url,
            data: JSON.stringify({
                startDate: hbStartDateStr * 1000,
                endDate: hbEndDateStr * 1000,
                appName: app || undefined
            }),
        };

        this.setState({
            loading: true
        });

        Promise.all([CL.clReqwestPromise(settings),
            CL.clReqwestPromise(settingsHB)])
            .then((res) => {
                if (res[0].code == 200 && res[0] && res[0].data) {
                    let fields = ["mainChannel", "registeredNumOfPeople", "startUpApplyNumOfPeople", "startUpApplyNumOfPeoRate", "completeMtNumOfPeople",
                        "completeMtNumOfPeoRate", "applyNumOfPeople", "applyNumOfPeoRate", "registerApplyRate"];

                    if (res[1].data) {
                        let list = _.map(res[0].data, item => _.pick(item, fields));
                        _.each(list, item => {
                            let hb = _.find(res[1].data, itr => {
                                return itr.mainChannel == item.mainChannel;
                            });

                            _.each(hb, (value, key) => {
                                if (typeof value == "number" && _.findIndex(fields, item => {
                                        return item === key
                                    }) > -1) {
                                    item[key + "Rate"] = Math.round((item[key] - value) / (value || 1) * 10000) / 100;
                                }
                            })
                        })
                        this.setState({list})
                    }

                    this.auditDataList(startDateStr, endDateStr, hbStartDateStr, hbEndDateStr, app);
                } else {
                    message.error("获取漏斗监控列表失败！");
                }
            })
    };

    getNetworkListMth = () => {
        const settings = {
            contentType,
            method: getChannelList.type,
            url: getChannelList.url
        };

        CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.code == 200) {
                    let options = this.state.options;
                    options.networkList = _.map(res.data, (item) => {
                        return {
                            key: item,
                            value: item
                        }
                    });
                    this.setState({options})
                }
            })
    };

    auditDataList = (startDateStr, endDateStr, hbStartDateStr, hbEndDateStr, app) => {
        const settings = {
            contentType,
            method: getFunnelMonitorAuditDataList.type,
            url: getFunnelMonitorAuditDataList.url,
            data: JSON.stringify({
                startDate: startDateStr * 1000,
                endDate: endDateStr * 1000,
                appName: app || undefined
            }),
        };
        //请求环比数据
        const settingsHB = {
            contentType,
            method: getFunnelMonitorAuditDataList.type,
            url: getFunnelMonitorAuditDataList.url,
            data: JSON.stringify({
                startDate: hbStartDateStr * 1000,
                endDate: hbEndDateStr * 1000,
                appName: app || undefined
            }),
        };

        Promise.all([CL.clReqwestPromise(settings),
            CL.clReqwestPromise(settingsHB)])
            .then((res) => {
                if (res[0].code == 200 && res[0] && res[0].data) {
                    let list = this.state.list;
                    if (res[1].data) {
                        let fields = ["riskCtPassNumOfOrder", "riskCtRefuseNumOfOrder", "riskCtPassRate", "personAuditNum", "personAuditPassNum",
                            "personAuditPassRate", "loanNumOfPeople", "loanNumOfOrder", "loanAmount"];

                        _.each(res[0].data, item => {
                            let old = _.find(list, child => {
                                return child.mainChannel === item.mainChannel;
                            });

                            let hb = _.find(res[1].data, itr => {
                                return itr.mainChannel === item.mainChannel;
                            });

                            _.each(item, (value, key) => {
                                if (_.findIndex(fields, item => {
                                        return item === key
                                    }) > -1)
                                    old[key] = value;
                            });

                            _.each(hb, (value, key) => {
                                if (typeof value == "number" && _.findIndex(fields, item => {
                                        return item === key
                                    }) > -1) {
                                    old[key + "Rate"] = Math.round((item[key] - value) / (value || 1) * 10000) / 100;
                                }
                            });
                        })
                    }
                    this.setState({
                        list
                    })

                    this.recoverDataList(startDateStr, endDateStr, hbStartDateStr, hbEndDateStr, app);
                } else {
                    message.error("获取漏斗监控列表失败！");
                }
            })
    };

    recoverDataList = (startDateStr, endDateStr, hbStartDateStr, hbEndDateStr, app) => {
        const settings = {
            contentType,
            method: getFunnelMonitorRecoverDataList.type,
            url: getFunnelMonitorRecoverDataList.url,
            data: JSON.stringify({
                startDate: startDateStr * 1000,
                endDate: endDateStr * 1000,
                appName: app || undefined
            }),
        };
        //请求环比数据
        const settingsHB = {
            contentType,
            method: getFunnelMonitorRecoverDataList.type,
            url: getFunnelMonitorRecoverDataList.url,
            data: JSON.stringify({
                startDate: hbStartDateStr * 1000,
                endDate: hbEndDateStr * 1000,
                appName: app || undefined
            }),
        };

        Promise.all([CL.clReqwestPromise(settings),
            CL.clReqwestPromise(settingsHB)])
            .then((res) => {
                if (res[0].code == 200 && res[0] && res[0].data) {
                    let list = this.state.list;
                    if (res[1].data) {
                        let fields = ["firstOverdueNumOfOrder", "firstOverdueRate", "overdue3Days", "overdue7Days", "overdue14Days",
                            "overdue21Days", "overdue30Days", "payBackPAndI", "overduePAndI", "recoverPAndI", "overdueRecoverRate",
                            "overdue3DaysPAndI", "overdue3DaysPAndIRate", "overdue10DaysPAndI", "overdue10DaysPAndIRate", "overdue30DaysPAndI",
                            "overdue30DaysPAndIRate", "overdue60DaysPAndI", "overdue60DaysPAndIRate"];

                        _.each(res[0].data, item => {
                            let old = _.find(list, child => {
                                return child.mainChannel === item.mainChannel;
                            });

                            let hb = _.find(res[1].data, itr => {
                                return itr.mainChannel === item.mainChannel;
                            });

                            _.each(item, (value, key) => {
                                if (_.findIndex(fields, item => {
                                        return item === key
                                    }) > -1)
                                    old[key] = value;
                            });

                            _.each(hb, (value, key) => {
                                if (typeof value == "number" && _.findIndex(fields, item => {
                                        return item === key
                                    }) > -1) {
                                    old[key + "Rate"] = Math.round((item[key] - value) / (value || 1) * 10000) / 100;
                                }
                            });
                        })
                    }

                    this.setState({
                        list,
                        loading: false
                    });
                } else {
                    message.error("获取漏斗监控列表失败！");
                }
            })

    }

    onClear = () => {
        this.setState({
            startDate: null,
            endDate: null,
            month: null
        })
    };

    handleMonth = (e) => {
        let start = moment(moment(e[0]).format('YYYY-MM-01 00:00:00')),
            end = moment(e[1].endOf('month').format("YYYY-MM-DD 23:59:59"));
        let hbLength = Math.ceil((end.unix() - start.unix()) / (60 * 60 * 24) + 1) - 1;
        this.setState({
            startDate: null,
            endDate: null,
            month: e,
            startDateStr: start,
            endDateStr: end,
            hbStartDateStr: moment(start).add(-hbLength, "d"),
            hbEndDateStr: moment(end).add(-hbLength, "d")
        })
    };

    onAppChange = (e) => {
        this.setState({
            app: e
        })
    };

    onChannelChange = (e) => {
        this.setState({
            mainChannel: e
        })
    };

    onDownload = (e) => {
        this.setState({ showTableExport: true });
        setTimeout(() => {
            TB = tableexport(document.querySelector('#ex-table'), { formats: ['csv', 'txt', 'xlsx'] });
        }, 100);
    };


    getExportTableHead = () =>{
        return [
            "主渠道", "注册人数", "开始申请人数","开始申请/注册", "完善资料人数", "完善资料/开始申请", "申请人数", "申请人数/完善资料", "注册申请率", "风控通过单数",
            "风控拒绝单数", "风控申请通过率", "人审单数", "人审通过单数", "人审申请通过率", "放款人数", "放款单数", "放款本金", "首逾订单数", "首逾率", "3天订单逾期率",
            "7天订单逾期率", "14天订单逾期率", "21天订单逾期率", "30天订单逾期率", "应还本息", "逾期本息", "催回本息", "逾期回收率", "逾期3天损失本息", "逾期3天损失率",
            "逾期10天损失本息", "逾期10天损失率", "逾期30天损失本息", "逾期30天损失率", "逾期60天损失本息", "逾期60天损失率"
        ]
    };

    handleCancel = () => {
        this.setState({showTableExport: false});
        if (TB) {
            TB.remove();
        }
    };

    render() {
        let {startDateStr, endDateStr} = this.state;
        startDateStr = startDateStr ? startDateStr.format("YYYYMMDD") : new moment().format("YYYYMMDD");
        endDateStr = endDateStr ? endDateStr.format("YYYYMMDD") : new moment().format("YYYYMMDD");

        let th = this.getExportTableHead();

        return (
            <div className="daily-monitor">
                <div className="select-panel">
                    <p>
                        <span>日期：</span>
                        <RangePicker
                            onChange={this.onDateChange}
                            value={[this.state.startDate, this.state.endDate]}
                        />
                        <span style={{marginLeft: "50px"}}>月筛选：</span>
                        <RangePicker
                            placeholder={['Start month', 'End month']}
                            format="YYYY-MM"
                            mode={['month', 'month']}
                            value={this.state.month}
                            onPanelChange={this.handleMonth}
                        />
                        <span style={{marginLeft: "50px"}}>App：</span>
                        <Select placeholder="Please select"
                                onChange={this.onAppChange}
                                style={{width: 200}}>
                            {_.map(this.state.options.appNameOpt, app => {
                                return <Option value={app.key}>{app.value}</Option>
                            })}
                        </Select>
                        <span style={{marginLeft: "50px"}}>渠道：</span>
                        <Select placeholder="Please select"
                                onChange={this.onChannelChange}
                                style={{width: 200}}>
                            {_.map(this.state.options.networkList, app => {
                                return <Option value={app.key}>{app.value}</Option>
                            })}
                        </Select>
                    </p>
                    <p className="daily-monitor-footer">
                        <Button type="primary" onClick={this.loadData} loading={this.state.loading}>Search</Button>
                        <Button type="default" onClick={this.onClear}>Clear</Button>
                        <Button type="default" onClick={this.onDownload}>Download</Button>
                    </p>
                </div>
                <p className="info-data">{`日期：${startDateStr} - ${endDateStr}
                 / 环比日期：${this.state.hbStartDateStr.format('YYYYMMDD')} - ${this.state.hbEndDateStr.format('YYYYMMDD')}`}</p>
                <Table dataSource={this.state.list}
                       bordered
                       scroll={{x: 4800, y: 450}}
                       pagination={false}>
                    <ColumnGroup title="App数据">
                        <Column
                            title="主渠道"
                            dataIndex="mainChannel"
                            key="mainChannel"
                            width={200}
                        />
                        <Column
                            title="注册人数"
                            dataIndex="registeredNumOfPeople"
                            key="registeredNumOfPeople"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['registeredNumOfPeopleRate'] < 0 ? "green-label" :
                                           (data['registeredNumOfPeopleRate'] > 5 ? "red-label" : "")}>{data['registeredNumOfPeopleRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="开始申请人数"
                            dataIndex="startUpApplyNumOfPeople"
                            key="startUpApplyNumOfPeople"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['startUpApplyNumOfPeopleRate'] < 0 ? "green-label" :
                                           (data['startUpApplyNumOfPeopleRate'] > 5 ? "red-label" : "")}>{data['startUpApplyNumOfPeopleRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="开始申请/注册"
                            dataIndex="startUpApplyNumOfPeoRate"
                            key="startUpApplyNumOfPeoRate"
                            width={150}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}}
                                       class={data['startUpApplyNumOfPeoRateRate'] < 0 ? "green-label" :
                                           (data['startUpApplyNumOfPeoRateRate'] > 5 ? "red-label" : "")}>{data['startUpApplyNumOfPeoRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="完善资料人数"
                            dataIndex="completeMtNumOfPeople"
                            key="completeMtNumOfPeople"
                            width={150}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['completeMtNumOfPeopleRate'] < 0 ? "green-label" :
                                           (data['completeMtNumOfPeopleRate'] > 5 ? "red-label" : "")}>{data['completeMtNumOfPeopleRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="完善资料/开始申请"
                            dataIndex="completeMtNumOfPeoRate"
                            key="completeMtNumOfPeoRate"
                            width={170}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}}
                                       class={data['completeMtNumOfPeoRateRate'] < 0 ? "green-label" :
                                           (data['completeMtNumOfPeoRateRate'] > 5 ? "red-label" : "")}>{data['completeMtNumOfPeoRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="申请人数"
                            dataIndex="applyNumOfPeople"
                            key="applyNumOfPeople"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['applyNumOfPeopleRate'] < 0 ? "green-label" :
                                        (data['applyNumOfPeopleRate'] > 5 ? "red-label" : "")}>{data['applyNumOfPeopleRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="申请人数/完善资料"
                            dataIndex="applyNumOfPeoRate"
                            key="applyNumOfPeoRate"
                            width={170}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['applyNumOfPeoRateRate'] < 0 ? "green-label" :
                                        (data['applyNumOfPeoRateRate'] > 5 ? "red-label" : "")}>{data['applyNumOfPeoRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="注册申请率"
                            dataIndex="registerApplyRate"
                            key="registerApplyRate"
                            width={130}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['registerApplyRateRate'] < 0 ? "green-label" :
                                        (data['registerApplyRateRate'] > 5 ? "red-label" : "")}>{data['registerApplyRateRate'] || 0}%</p>]
                            }}
                        />
                    </ColumnGroup>
                    <ColumnGroup title="审核数据">
                        <Column
                            title="风控通过单数"
                            dataIndex="riskCtPassNumOfOrder"
                            key="riskCtPassNumOfOrder"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['riskCtPassNumOfOrderRate'] < 0 ? "green-label" :
                                        (data['riskCtPassNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['riskCtPassNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="风控拒绝单数"
                            dataIndex="riskCtRefuseNumOfOrder"
                            key="riskCtRefuseNumOfOrder"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['riskCtRefuseNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['riskCtRefuseNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['riskCtRefuseNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="风控申请通过率"
                            dataIndex="riskCtPassRate"
                            key="riskCtPassRate"
                            width={150}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['riskCtPassRateRate'] < 0 ? "green-label" :
                                        (data['riskCtPassRateRate'] > 5 ? "red-label" : "")}>{data['riskCtPassRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="人审单数"
                            dataIndex="personAuditNum"
                            key="personAuditNum"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['personAuditNumRate'] < 0 ? "green-label" :
                                        (data['personAuditNumRate'] > 5 ? "red-label" : "")}>{data['personAuditNumRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="人审通过单数"
                            dataIndex="personAuditPassNum"
                            key="personAuditPassNum"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['personAuditPassNumRate'] < 0 ? "green-label" :
                                        (data['personAuditPassNumRate'] > 5 ? "red-label" : "")}>{data['personAuditPassNumRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="人审申请通过率"
                            dataIndex="personAuditPassRate"
                            key="personAuditPassRate"
                            width={150}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['personAuditPassRateRate'] < 0 ? "green-label" :
                                        (data['personAuditPassRateRate'] > 5 ? "red-label" : "")}>{data['personAuditPassRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="放款人数"
                            dataIndex="loanNumOfPeople"
                            key="loanNumOfPeople"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['loanNumOfPeopleRate'] < 0 ? "green-label" :
                                        (data['loanNumOfPeopleRate'] > 5 ? "red-label" : "")}>{data['loanNumOfPeopleRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="放款单数"
                            dataIndex="loanNumOfOrder"
                            key="loanNumOfOrder"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['loanNumOfOrderRate'] < 0 ? "green-label" :
                                        (data['loanNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['loanNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="放款本金"
                            dataIndex="loanAmount"
                            key="loanAmount"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['loanAmountRate'] < 0 ? "green-label" :
                                        (data['loanAmountRate'] > 5 ? "red-label" : "")}>{data['loanAmountRate'] || 0}%</p>]
                            }}
                        />
                    </ColumnGroup>
                    <ColumnGroup title="还款数据">
                        <Column
                            title="首逾订单数"
                            dataIndex="firstOverdueNumOfOrder"
                            key="firstOverdueNumOfOrder"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['firstOverdueNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['firstOverdueNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['firstOverdueNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="首逾率"
                            dataIndex="firstOverdueRate"
                            key="firstOverdueRate"
                            width={100}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['firstOverdueRateRate'] < 0 ? "green-label" :
                                        (data['firstOverdueRateRate'] > 5 ? "red-label" : "")}>{data['firstOverdueRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="3天订单逾期率"
                            dataIndex="overdue3Days"
                            key="overdue3Days"
                            width={130}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['overdue3DaysRate'] < 0 ? "green-label" :
                                        (data['overdue3DaysRate'] > 5 ? "red-label" : "")}>{data['overdue3DaysRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="7天订单逾期率"
                            dataIndex="overdue7Days"
                            key="overdue7Days"
                            width={130}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['overdue7DaysRate'] < 0 ? "green-label" :
                                        (data['overdue7DaysRate'] > 5 ? "red-label" : "")}>{data['overdue7DaysRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="14天订单逾期率"
                            dataIndex="overdue14Days"
                            key="overdue14Days"
                            width={150}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['overdue14DaysRate'] < 0 ? "green-label" :
                                        (data['overdue14DaysRate'] > 5 ? "red-label" : "")}>{data['overdue14DaysRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="21天订单逾期率"
                            dataIndex="overdue21Days"
                            key="overdue21Days"
                            width={150}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['overdue21DaysRate'] < 0 ? "green-label" :
                                        (data['overdue21DaysRate'] > 5 ? "red-label" : "")}>{data['overdue21DaysRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="30天订单逾期率"
                            dataIndex="overdue30Days"
                            key="overdue30Days"
                            width={150}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['overdue30DaysRate'] < 0 ? "green-label" :
                                        (data['overdue30DaysRate'] > 5 ? "red-label" : "")}>{data['overdue30DaysRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="应还本息"
                            dataIndex="payBackPAndI"
                            key="payBackPAndI"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['payBackPAndIRate'] < 0 ? "green-label" :
                                        (data['payBackPAndIRate'] > 5 ? "red-label" : "")}>{data['payBackPAndIRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="逾期本息"
                            dataIndex="overduePAndI"
                            key="overduePAndI"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['overduePAndIRate'] < 0 ? "green-label" :
                                        (data['overduePAndIRate'] > 5 ? "red-label" : "")}>{data['overduePAndIRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="催回本息"
                            dataIndex="recoverPAndI"
                            key="recoverPAndI"
                            width={100}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['recoverPAndIRate'] < 0 ? "green-label" :
                                        (data['recoverPAndIRate'] > 5 ? "red-label" : "")}>{data['recoverPAndIRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="逾期回收率"
                            dataIndex="overdueRecoverRate"
                            key="overdueRecoverRate"
                            width={130}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['overdueRecoverRateRate'] < 0 ? "green-label" :
                                        (data['overdueRecoverRateRate'] > 5 ? "red-label" : "")}>{data['overdueRecoverRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="逾期3天损失本息"
                            dataIndex="overdue3DaysPAndI"
                            key="overdue3DaysPAndI"
                            width={150}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['overdue3DaysPAndIRate'] < 0 ? "green-label" :
                                        (data['overdue3DaysPAndIRate'] > 5 ? "red-label" : "")}>{data['overdue3DaysPAndIRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="逾期3天损失率"
                            dataIndex="overdue3DaysPAndIRate"
                            key="overdue3DaysPAndIRate"
                            width={130}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}}
                                       class={data['overdue3DaysPAndIRateRate'] < 0 ? "green-label" :
                                           (data['overdue3DaysPAndIRateRate'] > 5 ? "red-label" : "")}>{data['overdue3DaysPAndIRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="逾期10天损失本息"
                            dataIndex="overdue10DaysPAndI"
                            key="overdue10DaysPAndI"
                            width={170}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['overdue10DaysPAndIRate'] < 0 ? "green-label" :
                                        (data['overdue10DaysPAndIRate'] > 5 ? "red-label" : "")}>{data['overdue10DaysPAndIRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="逾期10天损失率"
                            dataIndex="overdue10DaysPAndIRate"
                            key="overdue10DaysPAndIRate"
                            width={150}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}}
                                       class={data['overdue10DaysPAndIRateRate'] < 0 ? "green-label" :
                                           (data['overdue10DaysPAndIRateRate'] > 5 ? "red-label" : "")}>{data['overdue10DaysPAndIRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="逾期30天损失本息"
                            dataIndex="overdue30DaysPAndI"
                            key="overdue30DaysPAndI"
                            width={170}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['overdue30DaysPAndIRate'] < 0 ? "green-label" :
                                        (data['overdue30DaysPAndIRate'] > 5 ? "red-label" : "")}>{data['overdue30DaysPAndIRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="逾期30天损失率"
                            dataIndex="overdue30DaysPAndIRate"
                            key="overdue30DaysPAndIRate"
                            width={150}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}}
                                       class={data['overdue30DaysPAndIRateRate'] < 0 ? "green-label" :
                                           (data['overdue30DaysPAndIRateRate'] > 5 ? "red-label" : "")}>{data['overdue30DaysPAndIRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="逾期60天损失本息"
                            dataIndex="overdue60DaysPAndI"
                            key="overdue60DaysPAndI"
                            width={170}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['overdue60DaysPAndIRate'] < 0 ? "green-label" :
                                        (data['overdue60DaysPAndIRate'] > 5 ? "red-label" : "")}>{data['overdue60DaysPAndIRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="逾期60天损失率"
                            dataIndex="overdue60DaysPAndIRate"
                            key="overdue60DaysPAndIRate"
                            width={150}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}}
                                       class={data['overdue60DaysPAndIRateRate'] < 0 ? "green-label" :
                                           (data['overdue60DaysPAndIRateRate'] > 5 ? "red-label" : "")}>{data['overdue60DaysPAndIRateRate'] || 0}%</p>]
                            }}
                        />
                    </ColumnGroup>
                </Table>
                <Modal
                    className="te-modal"
                    title="Download"
                    closable
                    visible={this.state.showTableExport}
                    width="100%"
                    style={{ top: 0 }}
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
                                    <tr key={index}>
                                        <td>{record.mainChannel}</td>
                                        <td>{record.registeredNumOfPeople}</td>
                                        <td>{record.startUpApplyNumOfPeople}</td>
                                        <td>{`${Math.ceil(record.startUpApplyNumOfPeoRate*10000)/100}%`}</td>
                                        <td>{record.completeMtNumOfPeople}</td>
                                        <td>{`${Math.ceil(record.completeMtNumOfPeoRate*10000)/100}%`}</td>
                                        <td>{record.applyNumOfPeople}</td>
                                        <td>{`${Math.ceil(record.applyNumOfPeoRate*10000)/100}%`}</td>
                                        <td>{`${Math.ceil(record.registerApplyRate*10000)/100}%`}</td>
                                        <td>{record.riskCtPassNumOfOrder}</td>
                                        <td>{record.riskCtRefuseNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.riskCtPassRate*10000)/100}%`}</td>
                                        <td>{record.personAuditNum}</td>
                                        <td>{record.personAuditPassNum}</td>
                                        <td>{`${Math.ceil(record.personAuditPassRate*10000)/100}%`}</td>
                                        <td>{record.loanNumOfPeople}</td>
                                        <td>{record.loanNumOfOrder}</td>
                                        <td>{record.loanAmount}</td>
                                        <td>{record.firstOverdueNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.firstOverdueRate*10000)/100}%`}</td>
                                        <td>{`${Math.ceil(record.overdue3Days*10000)/100}%`}</td>
                                        <td>{`${Math.ceil(record.overdue7Days*10000)/100}%`}</td>
                                        <td>{`${Math.ceil(record.overdue14Days*10000)/100}%`}</td>
                                        <td>{`${Math.ceil(record.overdue21Days*10000)/100}%`}</td>
                                        <td>{`${Math.ceil(record.overdue30Days*10000)/100}%`}</td>
                                        <td>{record.payBackPAndI}</td>
                                        <td>{record.overduePAndI}</td>
                                        <td>{record.recoverPAndI}</td>
                                        <td>{`${Math.ceil(record.overdueRecoverRate*10000)/100}%`}</td>
                                        <td>{record.overdue3DaysPAndI}</td>
                                        <td>{`${Math.ceil(record.overdue3DaysPAndIRate*10000)/100}%`}</td>
                                        <td>{record.overdue10DaysPAndI}</td>
                                        <td>{`${Math.ceil(record.overdue10DaysPAndIRate*10000)/100}%`}</td>
                                        <td>{record.overdue30DaysPAndI}</td>
                                        <td>{`${Math.ceil(record.overdue30DaysPAndIRate*10000)/100}%`}</td>
                                        <td>{record.overdue60DaysPAndI}</td>
                                        <td>{`${Math.ceil(record.overdue60DaysPAndIRate*10000)/100}%`}</td>
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
