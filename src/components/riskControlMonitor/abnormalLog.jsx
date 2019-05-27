import React from 'react';
import {CLComponent} from 'Lib/component/index';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';

import {Button} from 'antd';

let {contentType, alert} = Interface;
let {getAbnormalLogList, checkAbnormalLog} = alert;

export default class AbnormalLog extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            search: {},
            loading: false,
            pagination: {
                total: 0,
                page: 1,
                pageSize: 10
            },
            options: {}
        }
    }

    componentDidMount() {
        this.loadData();
    }


    loadData = () => {
        const settings = {
            contentType,
            method: getAbnormalLogList.type,
            url: getAbnormalLogList.url
        };

        CL.clReqwestPromise(settings)
            .then((res) => {
                if (res && res.data) {
                    this.setState({
                        list: res.data
                    });
                }
            });
    };

    getFormFields = (fields) => {
        const pagination = this.state.pagination;
        pagination.currentPage = 1;

        this.setState({search: fields, pagination});
        this.loadData(fields, pagination);
    };

    check = (id) => {
        const _this = this;
        const settings = {
            contentType,
            method: checkAbnormalLog.type,
            url: checkAbnormalLog.url + id
        };

        CL.clReqwestPromise(settings)
            .then((res) => {
                if (res && res.data) {
                    _this.loadData();
                }
            });
    };

    render() {
        let _this = this;

        const columns = [
            {
                title: "规则名称",
                dataIndex: "ruleName",
                width: "18%"
            },
            {
                title: "规则类型",
                dataIndex: "ruleType",
                width: "10%"
            },
            {
                title: "邮件接收者",
                dataIndex: "recipients",
                width: "15%"
            },
            {
                title: "警报",
                dataIndex: "words",
                width: "45%"
            },
            {
                title: "操作",
                dataIndex: "resideCity",
                render(text, data) {
                    return data.checked ? "已确认" :
                        <Button type="primary" onClick={() => _this.check(data.id)}>确认</Button>;
                }
            },
        ];

        const settings = {
            data: this.state.list,
            operation: [],
            columns: columns,
            getFields: this.getFormFields,
            pagination: false,
            tableLoading: this.state.loading,
            search: this.state.search
        };

        return (
            <div className="abnormal-log">
                <CLList settings={settings}/>
            </div>
        )
    }
}
