import React from 'react';
import {CLComponent} from 'Lib/component/index';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import moment from 'moment';
import ReactEcharts from 'echarts-for-react';

let {contentType, getAppNameList, realTimeOrderList} = Interface;
import {Button, Modal, DatePicker, message, Select} from 'antd';
import tableexport from 'tableexport';

let TB;

export default class RealTimeOrderMonitor extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            search: {
                date: moment(),
                timeInterval: '5'
            },
            loading: false,
            options: {
                flatformOpt: [],
                userOpt: [],
                timeIntervalOpt: []
            }
        }
    }

    componentDidMount() {
        this.loadData();
        this.flatformOptMth();
        this.userOptMth();
        this.timeIntervalOptMth();
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

    timeIntervalOptMth = () => {
        let options = this.state.options;
        options["timeIntervalOpt"] = [{
            name: "5分钟",
            value: '5'
        }, {
            name: "10分钟",
            value: '10'
        }, {
            name: "半小时",
            value: '30'
        }, {
            name: "1小时",
            value: '60'
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
        if (!search.date || !search.timeInterval) {
            message.warn("请选择时间和时间间隔！");
            return;
        }
        const settings = {
            contentType,
            method: realTimeOrderList.type,
            url: realTimeOrderList.url,
            data: JSON.stringify({
                version: search.version,
                isOlder: search.isOld * 1,
                minuteInterval: search.timeInterval,
                startTime: this.dealDate(search.date, true) * 1000,
                endTime: this.dealDate(search.date) * 1000
            })
        };

        this.setState({
            loading: true
        });

        function fn(res) {
            if (res && res.data) {
                if (search.date.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
                    let hour = moment().format("HH");
                    let minute = moment().format("mm");
                    let lastIdx = Math.ceil((hour * 60 + minute * 1) / search.timeInterval);
                    _.each(res.data, item => {
                        if (item.index >= lastIdx) {
                            item.applyNumOfOrder = null;
                            item.lastDayApplyNumOfOrder = null;
                            item.lastMonthDayApplyNumOfOrder = null;
                            item.lastWeekDayApplyNumOfOrder = null;
                            item.loanNumOfOrder = null;
                            item.lastDayLoanNumOfOrder = null;
                            item.lastMonthDayLoanNumOfOrder = null;
                            item.lastWeekDayLoanNumOfOrder = null;
                        }
                    })
                }
                _this.setState({
                    list: res.data,
                    loading: false
                });
            }
        }

        CL.clReqwest({settings, fn});
    };

    onClear = () => {
        this.setState({
            search: {}
        })
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
        let {search} = this.state;
        if (fields.dateRanger) {
            search.startDate = fields.dateRanger[0];
            search.endDate = fields.dateRanger[1];
        }
        search = _.assign(search, fields);

        this.setState({search});
        this.loadData(search);
    };

    getExportTableHead = () => {
        return [
            "时间", "申请单量", "昨日申请单量", "上月申请单量", "放款单量", "昨日放款单量", "上月放款单量"
        ]
    };

    handleReset = () => {
        let {search} = this.state;
        search.dateRanger = [];
        delete search.startDate;
        delete search.endDate;
        delete search.version;
        delete search.isOld;

        this.setState({search});
    };

    getOption = (list, typeApply) => {
        let xAxis = [],
            lines = typeApply ? ["申请单量", "昨日申请单量", "上周申请单量", "上月申请单量"] :
                ["放款单量", "昨日放款单量", "上周放款单量", "上月放款单量"];

        list = list || this.state.list;

        let data1 = [], data2 = [], data3 = [], data4 = [];

        _.each(list, item => {
            xAxis.push(item.timeStr);
            data1.push(typeApply ? item.applyNumOfOrder : item.loanNumOfOrder);
            data2.push(typeApply ? item.lastDayApplyNumOfOrder : item.lastDayLoanNumOfOrder);
            data3.push(typeApply ? item.lastMonthDayApplyNumOfOrder : item.lastMonthDayLoanNumOfOrder);
            data4.push(typeApply ? item.lastWeekDayApplyNumOfOrder : item.lastWeekDayLoanNumOfOrder);
        });

        let series = [{
            name: typeApply ? "昨日申请单量" : "昨日放款单量",
            type: 'line',
            data: data2,
            itemStyle: {
                normal: {
                    color: "#0071bf",
                    lineStyle: {
                        width: 1.5,
                        color: "#0071bf"
                    }
                }
            }
        }, {
            name: typeApply ? "上月申请单量" : "上月放款单量",
            type: 'line',
            data: data3,
            itemStyle: {
                normal: {
                    color: "#f8b13a",
                    lineStyle: {
                        width: 1.5,
                        color: "#f8b13a"
                    }
                }
            }
        }, {
            name: typeApply ? "上周申请单量" : "上周放款单量",
            type: 'line',
            data: data4,
            itemStyle: {
                normal: {
                    color: "#71cd5b",
                    lineStyle: {
                        width: 1.5,
                        color: "#71cd5b"
                    }
                }
            }
        }, {
            name: typeApply ? "申请单量" : "放款单量",
            type: 'line',
            data: data1,
            itemStyle: {
                normal: {
                    color: "#c2272f",
                    lineStyle: {
                        width: 2,
                        color: "#c2272f"
                    }
                }
            }
        }];

        let option = {
            title: {
                text: typeApply ? "实时申请单量" : "实时放款单量",
                left: 'center',
                top: 10
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: lines,
                x: 'center',
                y: 'bottom'
            },
            grid: {
                left: '3%',
                right: '4%',
                containLabel: true,
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAxis,
                axisLabel: {
                    interval: 5,
                    rotate: 40
                }
            },
            yAxis: {
                type: 'value'
            },
            series: series,
            lineStyle: {}
        };

        return option;
    };

    onDateChange = (e) => {
        let search = this.state.search;
        search.date = e;
        this.setState({
            search
        })
    };

    onTimeIntervalChange = (e) => {
        let search = this.state.search;
        search.timeInterval = e;
        this.setState({
            search
        })
    };

    onAppNameChange = (e) => {
        let search = this.state.search;
        search.version = e;
        this.setState({
            search
        })
    };

    onUserChange = (e) => {
        let search = this.state.search;
        search.isOld = e;
        this.setState({
            search
        })
    };

    render() {

        let th = this.getExportTableHead();

        const columns = [
            {
                title: "时间",
                dataIndex: "timeStr",
                width: "12%",
                key: "timeStr"
            },

            {
                title: "申请单量",
                dataIndex: "applyNumOfOrder",
                width: "12%",
                key: "applyNumOfOrder"
            },

            {
                title: "昨日申请单量",
                dataIndex: "lastDayApplyNumOfOrder",
                width: "12%",
                key: "lastDayApplyNumOfOrder"
            },

            {
                title: "上月申请单量",
                dataIndex: "lastMonthDayApplyNumOfOrder",
                width: "12%",
                key: "lastMonthDayApplyNumOfOrder"
            },

            {
                title: "放款单量",
                dataIndex: "loanNumOfOrder",
                width: "12%",
                key: "loanNumOfOrder"
            },

            {
                title: "昨日放款单量",
                dataIndex: "lastDayLoanNumOfOrder",
                width: "12%",
                key: "lastDayLoanNumOfOrder"
            },

            {
                title: "上月放款单量",
                dataIndex: "lastMonthDayLoanNumOfOrder",
                width: "12%",
                key: "lastMonthDayLoanNumOfOrder"
            }
        ];

        const settings = {
            data: this.state.list,
            columns: columns,
            getFields: this.getFormFields,
            pagination: false,
            tableLoading: this.state.loading,
            search: this.state.search,
            handleReset: this.handleReset,
        };

        return (
            <div className="daily-monitor">
                <div className="select-panel">
                    <p>
                        <span>日期：</span>
                        <DatePicker onChange={this.onDateChange} value={this.state.search.date}/>
                        <span style={{marginLeft: "50px"}}>统计时间间隔：</span>
                        <Select placeholder="Please select"
                                value={this.state.search.timeInterval}
                                onChange={this.onTimeIntervalChange}
                                allowClear
                                style={{width: 200}}>
                            {_.map(this.state.options.timeIntervalOpt, app => {
                                return <Option value={app.value}>{app.name}</Option>
                            })}
                        </Select>
                        <span style={{marginLeft: "50px"}}>平台：</span>
                        <Select placeholder="Please select"
                                value={this.state.search.version}
                                onChange={this.onAppNameChange}
                                allowClear
                                style={{width: 200}}>
                            {_.map(this.state.options.flatformOpt, app => {
                                return <Option value={app.value}>{app.name}</Option>
                            })}
                        </Select>
                        <span style={{marginLeft: "50px"}}>用户群体：</span>
                        <Select placeholder="Please select"
                                value={this.state.search.isOld}
                                onChange={this.onUserChange}
                                allowClear
                                style={{width: 200}}>
                            {_.map(this.state.options.userOpt, app => {
                                return <Option value={app.value}>{app.name}</Option>
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
                {
                    this.state.list.length > 0 &&
                    <ReactEcharts style={{marginTop: "15px"}} option={this.getOption(this.state.list, true)}/>
                }
                {
                    this.state.list.length > 0 &&
                    <ReactEcharts style={{marginTop: "15px"}} option={this.getOption(this.state.list, false)}/>
                }
                <div style={{marginTop: "20px"}}>
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
                                        <td>{record.timeStr}</td>
                                        <td>{record.applyNumOfOrder}</td>
                                        <td>{record.lastDayApplyNumOfOrder}</td>
                                        <td>{record.lastMonthDayApplyNumOfOrder}</td>
                                        <td>{record.loanNumOfOrder}</td>
                                        <td>{record.lastDayLoanNumOfOrder}</td>
                                        <td>{record.lastMonthDayLoanNumOfOrder}</td>
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