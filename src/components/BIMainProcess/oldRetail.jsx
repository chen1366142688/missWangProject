import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import CLList from 'Lib/component/CLlist.jsx';
import {Interface} from 'Lib/config/index';
import {DatePicker, Button, message, Select, Modal, LocaleProvider} from 'antd';
import moment from 'moment';
import _ from 'lodash';
import ReactEcharts from 'echarts-for-react';
import ReactDom from 'react-dom';

const Option = Select.Option;

const {RangePicker, WeekPicker} = DatePicker;
let {contentType, getAppNameList, getBiOldRetailByMonth, getBiOldRetailByWeek, getBiOldRetailByDate} = Interface;
import tableexport from 'tableexport';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';

let TB;

let weekList = [];


for (let i = 1; i <= 52; i++) {
    weekList.push(i);
}

export default class OldRetail extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            search: {},
            options: {
                flatformOpt: [],
                timeOpt: [{
                    value: "month",
                    name: "月"
                }, {
                    value: "week",
                    name: "周"
                }, {
                    value: "day",
                    name: "日"
                }]
            },
            loading: false,
            appVersion: "",
            type: "month",
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

    getFormFields = (fields) => {
        this.setState({search: fields});
        this.loadData(fields);
    };

    pageChange = (page) => {
        let search = this.state.search;
        search.page = page.current;
        search.pageSize = page.pageSize;
        this.setState({search});
        this.loadData(search);

    };

    onDateChange = (e) => {
        let search = this.state.search;
        search.startDate = e[0];
        search.endDate = e[1];
        this.setState({
            search
        })
    };

    onMonthChange = (e) => {
        let search = this.state.search;
        search.startDate = e[0];
        search.endDate = e[1];
        this.setState({
            search
        })
    };

    onWeekChange = (start, end) => {
        let reg = /^[0-9]{4}-第([0-9]{1,2})周$/;
        let regYear = /^([0-9]{4})-第[0-9]{1,2}周$/;
        let startWeekDay = moment(moment().format("YYYY-01-01")).format('E');

        if (start) {
            let startYear = start && start.replace(regYear, '$1') * 1;
            start = (start && start.replace(reg, '$1') * 1) || this.state.weekStart;
            let yearStart = moment().set({
                "year": startYear,
                'month': 0,
                'date': 1
            });
            let startDate = start === 1 ? yearStart : yearStart.add({'days': (start - 1) * 7 - startWeekDay + 1});
            let search = this.state.search;
            search.startDate = startDate;
            this.setState({
                search,
                weekStart: start
            })
        }

        if (end) {
            let endYear = end && end.replace(regYear, '$1') * 1;
            end = (end && end.replace(reg, '$1') * 1) || this.state.weekEnd;
            let endDate = moment().set({
                "year": endYear,
                'month': 0,
                'date': 1
            }).add({'days': end * 7 - startWeekDay});
            let search = this.state.search;
            search.endDate = endDate;
            this.setState({
                search,
                weekEnd: end
            })

        }
    };

    onTypeChange = (e) => {
        this.setState({
            type: e,
            list: []
        })
    };

    dealDate = (myDate, whetherStart) => {
        return myDate ? moment(myDate.format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix() :
            (moment(moment().format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix());
    };

    loadData = (search) => {
        const _this = this;
        search = search || this.state.search;
        if (!this.state.search.startDate) {
            message.warn("请选择时间！");
            return;
        }
        let url = "", startTime = search.startDate, endTime = search.endDate;

        if (this.state.type === "week") {
            url = getBiOldRetailByWeek.url;
        }
        if (this.state.type === "day") {
            url = getBiOldRetailByDate.url;
        }
        if (this.state.type === "month") {
            url = getBiOldRetailByMonth.url;
            startTime = moment(startTime.format("YYYY-MM-01 00:00:00"));
            endTime = endTime.add({months: 1}).set({
                'date': 1,
                'hour': 0,
                'minute': 0,
                'second': 0
            }).subtract({seconds: 1});
        } else {
            startTime = startTime.set({
                'hour': 0,
                'minute': 0,
                'second': 0
            });
            endTime = endTime.set({
                'hour': 23,
                'minute': 59,
                'second': 59
            });
        }
        const settings = {
            contentType,
            method: 'post',
            url: url,
            data: JSON.stringify({
                version: search.appVersion,
                startTime: startTime && this.dealDate(startTime, true) * 1000,
                endTime: endTime && this.dealDate(endTime) * 1000
            })
        }

        this.setState({
            loading: true
        })

        function fn(res) {
            if (res && res.data) {
                let list = res.data || [];
                let newList = [];
                _.each(list, (item) => {
                    if (item.retailOldMemberCount != 0) {
                        newList.push(item);
                    }
                })
                _this.setState({list: newList, loading: false});
                _this.refreshEcharts(_this.state.type, newList);
            }
        }

        CL.clReqwest({settings, fn});
    };

    onClear = () => {
        this.setState({
            search: {
                startDate: null,
                endDate: null,

            },
            type: "month"
        })
    };

    onAppNameChange = (e) => {
        let {search} = this.state;
        search.appVersion = e;
        search.page = 1;
        this.setState({
            search,
            list: []
        })
    };

    onDownload = (e) => {
        this.setState({showTableExport: true});
        setTimeout(() => {
            TB = tableexport(document.querySelector('#ex-table-apply-process'), {formats: ['csv', 'txt', 'xlsx']});
        }, 100);
    };

    getExportTableHead = (type) => {
        if (type === "month") {
            return ['月份', '存量老用户', '存量-复贷放款', '存量复贷转化率', '存量老用户增长率', '新晋存量老用户', '新晋-复贷放款', '新晋复贷转化率'];
        } else if (type === "week") {
            return ['周次', '时间', '存量老用户', '存量-复贷放款', '存量复贷转化率', '存量老用户增长率', '新晋存量老用户', '新晋-复贷放款', '新晋复贷转化率'];
        } else if (type === "day") {
            return ['日期', '星期', '存量老用户', '存量-复贷放款', '存量复贷转化率', '存量老用户增长率', '新晋存量老用户', '新晋-复贷放款', '新晋复贷转化率'];
        } else {
            return []
        }
    };

    getExportTableBody = (type, record, index) => {
        if (type == "month") {
            return <tr key={index}>
                <td>{record.month}</td>
                <td>{record.retailOldMemberCount}</td>
                <td>{record.retailRepeatLoanCount}</td>
                <td>{`${Math.ceil(record.retailRepeatLoanRate * 10000) / 100}%`}</td>
                <td>{`${Math.ceil(record.retailIncreaseRate * 10000) / 100}%`}</td>
                <td>{record.newRetailOldMemberCount}</td>
                <td>{record.newRetailRepeatLoanCount}</td>
                <td>{`${Math.ceil(record.newRepeatRate * 10000) / 100}%`}</td>
            </tr>
        } else if (type == "week") {
            return <tr key={index}>
                <td>{`第${record.weekNum.toString().slice(4)}周`}</td>
                <td>{moment(record.startTime).format("YYYY/MM/DD") + "~" + moment(record.endTime).format("YYYY/MM/DD")}</td>
                <td>{record.retailOldMemberCount}</td>
                <td>{record.retailRepeatLoanCount}</td>
                <td>{`${Math.ceil(record.retailRepeatLoanRate * 10000) / 100}%`}</td>
                <td>{`${Math.ceil(record.retailIncreaseRate * 10000) / 100}%`}</td>
                <td>{record.newRetailOldMemberCount}</td>
                <td>{record.newRetailRepeatLoanCount}</td>
                <td>{`${Math.ceil(record.newRepeatRate * 10000) / 100}%`}</td>
            </tr>
        } else if (type == "day") {
            return <tr key={index}>
                <td>{moment(record.date).format("YYYY/MM/DD")}</td>
                <td>{getWeek(record.weekDay)}</td>
                <td>{record.retailOldMemberCount}</td>
                <td>{record.retailRepeatLoanCount}</td>
                <td>{`${Math.ceil(record.retailRepeatLoanRate * 10000) / 100}%`}</td>
                <td>{`${Math.ceil(record.retailIncreaseRate * 10000) / 100}%`}</td>
                <td>{record.newRetailOldMemberCount}</td>
                <td>{record.newRetailRepeatLoanCount}</td>
                <td>{`${Math.ceil(record.newRepeatRate * 10000) / 100}%`}</td>
            </tr>
        } else {
            return <tr>
            </tr>
        }
    };

    handleCancel = () => {
        this.setState({showTableExport: false});
        if (TB) {
            TB.remove();
        }
    };

    getOption = (type, list) => {

        list = list || this.state.list;

        let xAxis = [];
        _.each(list, item => {
            if (this.state.type === "month") {
                xAxis.push(item.month.slice(0, 4) + "年" + item.month.slice(4) + "月");
            }
            if (this.state.type === "week") {
                xAxis.push(`第${item.weekNum.toString().slice(4)}周`);
            }
            if (this.state.type === "day") {
                xAxis.push(moment(item.date).format('YYYY-MM-DD ddd'));
            }
        })

        let series = [{
            name: '存量复贷转化率',
            type: 'line',
            data: _.map(list, item => {
                return item.retailRepeatLoanRate * 100;
            })
        }, {
            name: '新晋复贷转化率',
            type: 'line',
            data: _.map(list, item => {
                return item.newRepeatRate * 100;
            })
        }];

        let option = {
            title: {
                text: "存量老用户复贷转化率和存量新晋老用户复贷转化率趋势",
                left: 'center',
                top: 10
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['存量复贷转化率', '新晋复贷转化率'],
                x: 'center',
                y: 'bottom'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '7%',
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
                    interval: 0,
                    rotate: 40
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} %'
                }
            },
            series: series
        };

        return option;
    };

    getOption2 = (type, list) => {

        list = list || this.state.list;

        let xAxis = [];
        _.each(list, item => {
            if (this.state.type === "month") {
                xAxis.push(item.month);
            }
            if (this.state.type === "week") {
                xAxis.push(`第${item.weekNum.toString().slice(4)}周`);
            }
            if (this.state.type === "day") {
                xAxis.push(moment(item.date).format('YYYY-MM-DD ddd'));
            }
        })

        let series = [{
            name: '存量老用户增长率',
            type: 'line',
            data: _.map(list, item => {
                return item.retailIncreaseRate * 100;
            })
        }];

        let option = {
            title: {
                text: "存量老用户增长趋势",
                left: 'center',
                top: 10
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['存量老用户增长率'],
                x: 'center',
                y: 'bottom'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '7%',
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
                    interval: 0,
                    rotate: 40
                }
            },
            yAxis: {
                type: 'value',
                scale: true,
                axisLabel: {
                    formatter: '{value} %'
                }
            },
            series: series
        };

        return option;
    };

    refreshEcharts = (type, list) => {
        ReactDom.unmountComponentAtNode(document.getElementById('echart-area1'));
        ReactDom.render(
            <ReactEcharts style={{marginTop: "15px"}} option={this.getOption(type, list)}/>,
            document.getElementById('echart-area1'),
        );
        ReactDom.unmountComponentAtNode(document.getElementById('echart-area2'));
        ReactDom.render(
            <ReactEcharts style={{marginTop: "15px"}} option={this.getOption2(type, list)}/>,
            document.getElementById('echart-area2'),
        );
    };

    render() {

        let columns = getColumnsList(this.state.type);

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
        };
        return (
            <div className="daily-monitor">
                <div className="select-panel">
                    <p>
                        <span>时间维度：</span>
                        <Select placeholder="Please select"
                                value={this.state.type}
                                onChange={this.onTypeChange}
                                style={{width: 200}}>
                            {_.map(this.state.options.timeOpt, app => {
                                return <Option value={app.value}>{app.name}</Option>
                            })}
                        </Select>
                        <span style={{marginLeft: "50px"}}>时间：</span>
                        {
                            this.state.type === "month" ?
                                <RangePicker
                                    placeholder={['Start month', 'End month']}
                                    format="YYYY-MM"
                                    mode={['month', 'month']}
                                    value={[this.state.search.startDate, this.state.search.endDate]}
                                    onPanelChange={this.onMonthChange}
                                /> :
                                (
                                    this.state.type === "week" ?
                                        [
                                            <LocaleProvider locale={zh_CN}>
                                                <WeekPicker onChange={(a, b) => this.onWeekChange(b)} format="YYYY-第w周"
                                                            placeholder="Select week"/>
                                            </LocaleProvider>,
                                            <span> 至 </span>,
                                            <LocaleProvider locale={zh_CN}>
                                                <WeekPicker onChange={(a, b) => this.onWeekChange(null, b)}
                                                            format="YYYY-第w周"
                                                            placeholder="Select week"/>
                                            </LocaleProvider>] :
                                        <RangePicker onChange={this.onDateChange}
                                                     value={[this.state.search.startDate, this.state.search.endDate]}/>
                                )
                        }
                        <span style={{marginLeft: "50px"}}>平台：</span>
                        <Select placeholder="Please select"
                                value={this.state.search.appVersion}
                                onChange={this.onAppNameChange}
                                allowClear
                                style={{width: 200}}>
                            {_.map(this.state.options.flatformOpt, app => {
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
                <div>
                    <CLList settings={settings}/>
                </div>
                <div id="echart-area1" style={{margin: "10px"}}>
                </div>
                <div id="echart-area2" style={{margin: "50px"}}>
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
                            this.state.list && this.state.list.map((record, index) => {
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

let getWeek = (weekDay) => {
    let weekTime = "";
    switch (weekDay) {
        case 2:
            weekTime = "星期一";
            break;
        case 3:
            weekTime = "星期二";
            break;
        case 4:
            weekTime = "星期三";
            break;
        case 5:
            weekTime = "星期四";
            break;
        case 6:
            weekTime = "星期五";
            break;
        case 7:
            weekTime = "星期六";
            break;
        case 1:
            weekTime = "星期日";
            break;
    }

    return weekTime;
};

let getColumnsList = (type) => {
    if (type === "month") {
        return [{
            title: '月份',
            dataIndex: 'month',
            width: '8%',
            render(text, data) {
                return text.slice(0, 4) + "年" + text.slice(4) + "月";
            }
        }, {
            title: '存量老用户',
            width: '12%',
            dataIndex: 'retailOldMemberCount'
        }, {
            title: '存量-复贷放款',
            width: '12%',
            dataIndex: 'retailRepeatLoanCount'
        }, {
            title: '存量复贷转化率',
            width: '12%',
            dataIndex: 'retailRepeatLoanRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '存量老用户增长率',
            width: '12%',
            dataIndex: 'retailIncreaseRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '新晋存量老用户',
            width: '12%',
            dataIndex: 'newRetailOldMemberCount'
        }, {
            title: '新晋-复贷放款',
            width: '12%',
            dataIndex: 'newRetailRepeatLoanCount'
        }, {
            title: '新晋复贷转化率',
            width: '12%',
            dataIndex: 'newRepeatRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];
    } else if (type === "week") {
        return [{
            title: '周次',
            dataIndex: 'weekNum',
            width: '8%',
            render(text, data) {
                return `第${text.toString().slice(4)}周`;
            }
        }, {
            title: '时间',
            dataIndex: 'date',
            width: '14%',
            render(text, data) {
                return moment(data.startTime).format("YYYY-MM-DD") + ' ~ ' + moment(data.endTime).format("YYYY-MM-DD");
            }
        }, {
            title: '存量老用户',
            width: '10%',
            dataIndex: 'retailOldMemberCount'
        }, {
            title: '存量-复贷放款',
            width: '10%',
            dataIndex: 'retailRepeatLoanCount'
        }, {
            title: '存量复贷转化率',
            width: '10%',
            dataIndex: 'retailRepeatLoanRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '存量老用户增长率',
            width: '10%',
            dataIndex: 'retailIncreaseRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '新晋存量老用户',
            width: '10%',
            dataIndex: 'newRetailOldMemberCount'
        }, {
            title: '新晋-复贷放款',
            width: '10%',
            dataIndex: 'newRetailRepeatLoanCount'
        }, {
            title: '新晋复贷转化率',
            dataIndex: 'newRepeatRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];
    } else if (type === "day") {
        return [{
            title: '日期',
            dataIndex: 'date',
            width: '8%',
            render(text, data) {
                return moment(text).format("YYYY-MM-DD");
            }
        }, {
            title: '星期',
            dataIndex: 'weekDay',
            width: '8%',
            render(text, data) {
                return getWeek(text);
            }
        }, {
            title: '存量老用户',
            width: '10%',
            dataIndex: 'retailOldMemberCount'
        }, {
            title: '存量-复贷放款',
            width: '10%',
            dataIndex: 'retailRepeatLoanCount'
        }, {
            title: '存量复贷转化率',
            width: '10%',
            dataIndex: 'retailRepeatLoanRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '存量老用户增长率',
            width: '10%',
            dataIndex: 'retailIncreaseRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }, {
            title: '新晋存量老用户',
            width: '10%',
            dataIndex: 'newRetailOldMemberCount'
        }, {
            title: '新晋-复贷放款',
            width: '10%',
            dataIndex: 'newRetailRepeatLoanCount'
        }, {
            title: '新晋复贷转化率',
            width: '12%',
            dataIndex: 'newRepeatRate',
            render(text, data) {
                return Math.ceil(text * 10000) / 100 + '%';
            }
        }];
    } else {
        return []
    }
}