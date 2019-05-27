import React from 'react';
import {Button, Select, DatePicker, TimePicker, InputNumber, Input} from 'antd';
import moment from 'moment';

let idx = 1;

export default class SetCron extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cron: {},
            sendType: "",
            timing: {
                date: null,
                time: null
            },
            cycle: {
                type: null
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        let cronStr = this.props.detail.cronStr;
        if (idx > 0 && !!cronStr) {
            let cron = {};
            let cronParams = cronStr.split("-")[0];
            let sendType = cronStr.split("-")[1];

            let arr = cronParams.split(" ");

            cron.second = arr[0];
            cron.minute = arr[1];
            cron.hour = arr[2];
            cron.day = arr[3];
            cron.dayOfMonth = arr[3];
            cron.month = arr[4];
            cron.dayOfweek = arr[5];
            cron.year = arr[6];

            let data = {
                cron, cronStr: cronParams, sendType
            };
            if (sendType === "cycle") {
                data.cycle = {};
                if (cron.dayOfweek.match(/^[0-9]{1,2}$/)) {
                    // dayOfWeek
                    data.cycle.type = "week";
                    data.cycle.weekDay = cron.dayOfweek;
                } else if (cron.dayOfMonth.match(/^[0-9]{1,2}$/) && cron.month === '*') {
                    // dayOfMonth
                    data.cycle.type = "month";
                    data.cycle.monthDate = cron.dayOfMonth;
                } else {
                    data.cycle.type = "day";
                }
                data.cycle.dailyTime = moment(`${cron.hour}:${cron.minute}:${cron.second}`, 'HH:mm:ss');
                this.props.setCron(cron, "");
            } else if (sendType === "timing") {
                data.timing = {};
                data.timing.date = moment(`${cron.year}-${cron.month}-${cron.day}`);
                data.timing.time = moment(`${cron.hour}:${cron.minute}:${cron.second}`, 'HH:mm:ss');
                this.props.setCron(cron, "");
            } else {
                this.props.setCron({}, cronParams);
            }
            this.props.setCronType(sendType);

            this.setState(data);
            idx--;
        }
    }

    onTypeChange = (e) => {
        this.setState({
            sendType: e,
            cron: {},
            cronStr: ""
        });

        this.props.setCron({}, "");
        this.props.setCronType(e);
    };

    onDateChange = (date, dateString) => {
        let timing = this.state.timing;
        timing.date = date;

        let cron = this.state.cron;
        cron.year = dateString.split('-')[0];
        cron.month = dateString.split('-')[1] * 1 + "";
        cron.day = dateString.split('-')[2] * 1 + "";

        this.setState({
            timing,
            cron
        });

        this.props.setCron(cron, "");
    };

    onTimeChange = (time, timeString) => {
        let timing = this.state.timing;
        timing.time = time;

        let cron = this.state.cron;
        cron.hour = timeString.split(':')[0] * 1 + "";
        cron.minute = timeString.split(':')[1] * 1 + "";
        cron.second = timeString.split(':')[2] * 1 + "";

        this.setState({
            timing,
            cron
        });

        this.props.setCron(cron, "");
    };

    onCycleTypeChange = (e) => {
        let cycle = {};
        cycle.type = e;
        this.setState({
            cycle,
            cron: {}
        });

        this.props.setCron({}, "");
    };

    onDailyTimeChange = (e) => {
        let cycle = this.state.cycle;
        cycle.dailyTime = e;

        let cron = this.state.cron;
        let timeString = e.format("HH-mm-ss");
        cron.day = "*";
        cron.hour = timeString.split('-')[0] * 1 + "";
        cron.minute = timeString.split('-')[1] * 1 + "";
        cron.second = timeString.split('-')[2] * 1 + "";

        this.setState({
            cycle,
            cron
        });

        this.props.setCron(cron, "");
    };

    onWeekDayChange = (e) => {
        let cycle = this.state.cycle;
        cycle.weekDay = e;

        let cron = this.state.cron;
        cron.dayOfWeek = e;

        this.setState({
            cycle,
            cron
        });

        this.props.setCron(cron, "");
    };

    onMonthDateChange = (e) => {
        let cycle = this.state.cycle;
        cycle.monthDate = e;

        let cron = this.state.cron;
        cron.dayOfMonth = e;

        this.setState({
            cycle,
            cron
        });

        this.props.setCron(cron, "");
    };

    onCronStrChange = (e) => {
        this.setState({
            cronStr: e.target.value
        });
        this.props.setCron({}, e.target.value);
    }

    render(data) {
        return (
            <div className="SET-CRON">
                <div className="send-type">
                    <p>send type: </p>
                    <Select style={{width: 300}} value={this.state.sendType} onChange={this.onTypeChange}>
                        <Select.Option key="timing" value="timing">定时邮件</Select.Option>
                        <Select.Option key="cycle" value="cycle">周期邮件</Select.Option>
                        <Select.Option key="defined" value="defined">自定义cron</Select.Option>
                    </Select>
                </div>
                {
                    this.state.sendType === "timing" &&
                    <div className="timing-task">
                        <p>set sender time: </p>
                        <DatePicker onChange={this.onDateChange} value={this.state.timing.date}/>
                        <TimePicker style={{marginLeft: '15px'}} onChange={this.onTimeChange}
                                    value={this.state.timing.time}/>
                    </div>
                }
                {
                    this.state.sendType === "cycle" &&
                    <div className="cycle-task">
                        <p>set sender cycle: </p>
                        <Select style={{width: 300}} value={this.state.cycle.type} onChange={this.onCycleTypeChange}>
                            <Select.Option key="day" value="day">每日</Select.Option>
                            <Select.Option key="week" value="week">每周</Select.Option>
                            <Select.Option key="month" value="month">每月</Select.Option>
                        </Select>
                        {
                            this.state.cycle.type === "day" && [
                                <p>time: </p>,
                                <TimePicker onChange={this.onDailyTimeChange}
                                            value={this.state.cycle.dailyTime}
                                            defaultOpenValue={moment('00:00:00', 'HH:mm:ss')}/>
                            ]
                        }
                        {
                            this.state.cycle.type === "week" && [
                                <p>day of week: </p>,
                                <Select style={{width: 300}}
                                        value={this.state.cycle.weekDay}
                                        onChange={this.onWeekDayChange}>
                                    <Select.Option key="1" value="2">星期一</Select.Option>
                                    <Select.Option key="2" value="3">星期二</Select.Option>
                                    <Select.Option key="3" value="4">星期三</Select.Option>
                                    <Select.Option key="4" value="5">星期四</Select.Option>
                                    <Select.Option key="5" value="6">星期五</Select.Option>
                                    <Select.Option key="6" value="7">星期六</Select.Option>
                                    <Select.Option key="7" value="1">星期日</Select.Option>
                                </Select>,
                                <TimePicker style={{marginLeft: '15px'}} onChange={this.onDailyTimeChange}
                                            value={this.state.cycle.dailyTime}
                                            defaultOpenValue={moment('00:00:00', 'HH:mm:ss')}/>
                            ]
                        }
                        {
                            this.state.cycle.type === "month" && [
                                <p>date of month: </p>,
                                <InputNumber style={{width: 100}}
                                             value={this.state.cycle.monthDate}
                                             formatter={value => `${value}日`}
                                             max={31}
                                             min={1}
                                             onChange={this.onMonthDateChange}/>,
                                <TimePicker style={{marginLeft: '15px'}} onChange={this.onDailyTimeChange}
                                            value={this.state.cycle.dailyTime}
                                            defaultOpenValue={moment('00:00:00', 'HH:mm:ss')}/>
                            ]
                        }
                    </div>
                }
                {
                    this.state.sendType === "defined" &&
                    <div className="timing-task">
                        <p>set cron: </p>
                        <Input style={{width: 350}}
                               value={this.state.cronStr}
                               onChange={this.onCronStrChange}/>
                    </div>
                }
            </div>
        );
    }
}