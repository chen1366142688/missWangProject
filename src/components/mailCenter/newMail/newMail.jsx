import React from 'react';
import {Steps, Button, Select, message} from 'antd';

const Step = Steps.Step;
import SetRecipient from './setRecipient';
import SetCron from './setCron';
import SetTemplate from './setTemplate';
import action from '../actions';

export default class NewMail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            current: 0,
            senderList: [],
            data: {}
        }
    }

    componentDidMount() {
        this.getSenderList();
        this.getMailDetail();
    }

    getSenderList = () => {
        action.getMailSenderList()
            .then((list) => {
                this.setState({
                    senderList: list
                })
            })
    };

    getMailDetail = () => {
        let id = this.props.match.params.id;
        action.getMailDetail(id)
            .then((data) => {
                let useRichTextTemplate = data.useRichTextTemplate;
                let templateType = useRichTextTemplate ? "defined" : (useRichTextTemplate === null ? "" : "remote");

                data.templateType = templateType;
                data.template = useRichTextTemplate ? data.richTextTemplate : data.remoteTemplate;

                data.cronStr = data.cron;
                this.setState({
                    data
                })
            })
    };

    getContents = () => {
        let current = this.state.current;

        if (current === 0) {
            return <div className="step-one-content">
                <span>set sender address:</span>
                <Select style={{width: 300, marginLeft: "30px"}} onChange={this.onSenderChoose}
                        value={this.state.data.senderId}>
                    {_.map(this.state.senderList, item => {
                        return <Select.Option key={item.id} value={item.id}>{item.address}</Select.Option>
                    })}

                </Select>
            </div>
        }

        if (current === 1) {
            return <SetRecipient setRecipient={this.setRecipient}
                                 detail={this.state.data}
                                 mailId={this.props.match.params.id}/>
        }

        if (current === 2) {
            return <SetCron setCron={this.setCron}
                            detail={this.state.data}
                            setCronType={this.setCronType}/>
        }

        if (current === 3) {
            return <SetTemplate detail={this.state.data}
                                setTemplateType={this.setTemplateType}
                                setTemplate={this.setTemplate}/>
        }
    };

    onSenderChoose = (e) => {
        let data = this.state.data;
        data.senderId = e;

        this.setState({
            data
        });
    };

    setRecipient = (recipientIds) => {
        let data = this.state.data;
        data.recipientIds = recipientIds;

        this.setState({
            data
        });
    };

    setCron = (cron, cronStr) => {
        let data = this.state.data;
        data.cron = cron;
        data.cronStr = cronStr;

        this.setState({
            data
        });
    };

    setCronType = (cronType) => {
        let data = this.state.data;
        data.cronType = cronType;

        this.setState({
            data
        });
    };

    setTemplateType = (type) => {
        let data = this.state.data;
        data.templateType = type;

        this.setState({
            data
        });
    };

    setTemplate = (template) => {
        let data = this.state.data;
        data.template = template;

        this.setState({
            data
        });
    };

    next = () => {
        let current = this.state.current;
        if (current === 0) {
            action.updateMail(this.props.match.params.id, {
                senderId: this.state.data.senderId
            })
                .then((res) => {
                    this.getMailDetail();
                    this.setState({
                        current: ++current
                    })
                })
        } else if (current === 1) {
            action.setIndividualRecipientMaps(this.props.match.params.id, this.state.data.recipientIds)
                .then((res) => {
                    this.getMailDetail();
                    this.setState({
                        current: ++current
                    })
                })
        } else if (current === 2) {
            // 处理cron, 将cron格式化成字符串
            let cronType = this.state.data.cronType;
            let cron = this.state.data.cron;
            let cronStr = "";
            if (cronType === "timing") {
                if (!cron.day || !cron.second) {
                    message.error("请完善信息！");
                    return;
                }
                cronStr = `${cron.second} ${cron.minute} ${cron.hour} ${cron.day} ${cron.month} ? ${cron.year}`;
            } else if (cronType === "cycle") {
                if (!cron.second) {
                    message.error("请完善信息！");
                    return;
                }
                if (!!cron.dayOfMonth) {
                    cronStr = `${cron.second} ${cron.minute} ${cron.hour} ${cron.dayOfMonth} * ?`;
                } else if (!!cron.dayOfWeek) {
                    cronStr = `${cron.second} ${cron.minute} ${cron.hour} ? * ${cron.dayOfWeek}`;
                } else if (cron.day === "*") {
                    cronStr = `${cron.second} ${cron.minute} ${cron.hour} * * ?`;
                }

            } else if (cronType === "defined") {
                if (!this.state.data.cronStr) {
                    message.error("请完善信息！");
                    return;
                }
                cronStr = this.state.data.cronStr;
            } else {
                message.error("请完善信息！");
                return;
            }

            cronStr += "-" + cronType;

            action.updateMail(this.props.match.params.id, {
                cron: cronStr
            })
                .then((res) => {
                    this.getMailDetail();
                    this.setState({
                        current: ++current
                    })
                })

        }
    };

    last = () => {
        let current = this.state.current;
        this.setState({
            current: --current
        })
    };

    save = () => {
        let template = this.state.data.template;
        if (!this.state.data.templateType || !template) {
            message.error("请完善信息！");
            return;
        }
        let data = {
            useRichTextTemplate: this.state.data.templateType === "defined" ? 1 : 0,
        };
        if (this.state.data.templateType === "defined") {
            data.richTextTemplate = template;
        } else if (this.state.data.templateType === "remote") {
            data.remoteTemplate = template;
        }
        action.updateMail(this.props.match.params.id, data)
            .then((res) => {
                this.back();
            })
    };

    back = () => {
        location.hash = "/uplending/mailcenter"
    };

    render(data) {
        return (
            <div className="NEW-MAIL">
                <Steps size="small" current={this.state.current}>
                    <Step title="set sender"/>
                    <Step title="set recipient"/>
                    <Step title="set time"/>
                    <Step title="set template"/>
                </Steps>
                <div className="steps-content">{this.getContents()}</div>
                <div className="steps-action">
                    {
                        this.state.current === 0
                        && [<Button type="default" onClick={this.back}>Back</Button>,
                            <Button style={{marginLeft: "15px"}} type="primary" onClick={this.next}>Next</Button>]
                    }
                    {
                        this.state.current < 3 && this.state.current > 0
                        && [<Button type="default" onClick={this.last}>Last</Button>,
                            <Button style={{marginLeft: "15px"}} type="primary" onClick={this.next}>Next</Button>]
                    }
                    {
                        this.state.current === 3
                        && [<Button type="default" onClick={this.last}>Last</Button>,
                            <Button style={{marginLeft: "15px"}} type="primary" onClick={this.save}>Save</Button>]
                    }
                </div>
            </div>
        );
    }
}

