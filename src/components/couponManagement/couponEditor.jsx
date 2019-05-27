import React from 'react';
import {CLComponent, CLForm} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import _ from 'lodash';
import {Interface} from 'Lib/config/index';
import moment from 'moment';

const {
    contentType, couponManagePulldownList, addCoupon, editCoupon, activityManageList,
} = Interface;

export default class CouponEditor extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            data: {},
            loading: false,
            options: {
                couponTypeOpt: [],
                sendWayOpt: [],
                activityOpt: [],
                versionList: [],
            },
            file: null,
        };
    }

    componentDidMount() {
        if (this.props.isEdit) {
            this.fillFields(this.props.detail);
        }
        this.activityOptMth();
        this.activitiesList();
    }

    componentWillReceiveProps(nextProps) {
        const _this = this;
        if (nextProps.isEdit && nextProps.detail !== this.props.detail) {
            setTimeout(() => {
                _this.fillFields(nextProps.detail);
            }, 100)
        } else if (!nextProps.isEdit) {
            this.form.resetFields();
        }
    }

    fillFields = (detail) => {
        detail && this.form.setFieldsValue({
            name: detail.name,
            couponType: detail.type + "",
            deductAmt: detail.deductAmt,
            totalQuantity: detail.totalQuantity,
            validDays: detail.validDays,
            getType: detail.getType + "",
            defDesc: detail.defDesc,
            getDay: detail.validBeginDate ? [moment(detail.validBeginDate), moment(detail.validEndDate)] : '',
            backgroundUrl: detail.backgroundUrl,
            activityId: detail.activityId + '',
            version: detail.version + '',
        });
    };

    activityOptMth = () => {
        const that = this;
        const settings = {
            contentType,
            method: couponManagePulldownList.type,
            url: couponManagePulldownList.url,
        };

        function fn(res) {
            if (res && res.data) {
                const couponTypeOpt = _.map(res.data.getTypes, (doc, index) => {
                    return {
                        value: index,
                        name: doc,
                    };
                });

                const sendWayOpt = _.map(res.data.types, (doc, index) => {
                    return {
                        value: index,
                        name: doc,
                    };
                });
                const versionList = _.map(res.data.version, (doc, index) => {
                    return {
                        value: index,
                        name: doc,
                    };
                });
                const options = that.state.options;
                options.couponTypeOpt = couponTypeOpt;
                options.sendWayOpt = sendWayOpt;
                options.versionList = versionList;
                that.resetFields();
                that.setState({options});
            }
        }

        CL.clReqwest({settings, fn});
    };

    resetFields = ()=>{
        const that = this;
        let detail = this.form.getFieldsValue();
        setTimeout(() => {
            that.form.setFieldsValue(detail);
        }, 100)
    };

    activitiesList = () => {
        const that = this;
        const params = {
            page: {
                currentPage: 1,
                pageSize: 20,
            },
            activity: {},
        };
        const settings = {
            contentType,
            method: activityManageList.type,
            url: activityManageList.url,
            data: JSON.stringify(params),
        };

        function fn(res) {
            if (res && res.data) {
                const couponOpt = _.map(res.data.result, (item) => {
                    return {
                        value: item.id,
                        name: `${item.id}-${item.name}`,
                    };
                });
                const options = that.state.options;
                options.activityOpt = couponOpt;
                that.resetFields();
                that.setState({ options, loading: false });
            }
        }

        CL.clReqwest({ settings, fn });
    };

    getFields = (fields, that, err) => {
        this.props.getFields(fields, that, err);
    }

    getForm = (form) => {
        this.form = form;
    };

    limitLengthValid = (rule, value, callback, limit) => {
        if (value && value.length > limit) {
            callback(`Limit ${limit} characters`);
        } else {
            callback();
        }
    };

    limitValueValid = (rule, value, callback, max, min) => {
        if (value && typeof max === 'number' && value > max) {
            callback(`The maximum cannot exceed ${max}`);
        } else if (value && typeof min === 'number' && value < min) {
            callback(`The minimum cannot below ${min}`);
        } else {
            callback();
        }
    };

    render() {
        const options = [
            {
                id: 'name',
                key: 'name',
                type: 'text',
                label: '券名称',
                placeholder: 'limit 30 charactors(will display on app)',
                rules: [{required: true, message: 'Please enter channel name!'},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 30)},
                ],
                disabled: this.props.disabled,
            },
            {
                id: 'couponType',
                key: 'couponType',
                type: 'select',
                label: '券类型',
                placeholder: 'Please select',
                options: this.state.options.sendWayOpt,
                disabled: this.props.disabled,
                rules: [{required: true, message: ''}],
            },
            {
                id: 'deductAmt',
                key: 'deductAmt',
                type: 'number',
                label: '券金额',
                placeholder: 'PHP',
                rules: [{required: true, message: ''},
                    {validator: (rule, value, callback) => this.limitValueValid(rule, value, callback, 1000000000, 0)}],
                disabled: this.props.disabled,
            },
            {
                id: 'totalQuantity',
                key: 'totalQuantity',
                type: 'number',
                label: '券量限制',
                placeholder: 'please input',
                rules: [{required: true, message: ''},
                    {validator: (rule, value, callback) => this.limitValueValid(rule, value, callback, 1000000000, 0)}],
                disabled: this.props.disabled,
            },
            {
                id: 'validDays',
                key: 'validDays',
                type: 'number',
                label: '有效期',
                placeholder: 'Days',
                rules: [{required: true, message: ''},
                    {validator: (rule, value, callback) => this.limitValueValid(rule, value, callback, 100000, 0)}],
                disabled: this.props.disabled,
            },
            {
                id: 'getType',
                key: 'getType',
                type: 'select',
                label: '发放方式',
                placeholder: 'Please select',
                options: this.state.options.couponTypeOpt,
                disabled: this.props.disabled,
                rules: [{required: true, message: ''}],
            },
            {
                id: 'getDay',
                key: 'getDay',
                type: 'rangePicker',
                label: '券领取时间',
                placeholder: 'Please select',
                disabled: this.props.disabled,
                rules: [{required: true, message: ''}],
            },
            {
                id: 'defDesc',
                key: 'defDesc',
                type: 'textarea',
                label: '描述',
                placeholder: 'Limit 100 charactors',
                rules: [{required: true, message: ''},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 100)},
                ],
                disabled: this.props.disabled,
            },
            {
                id: 'backgroundUrl',
                key: 'backgroundUrl',
                type: 'upload',
                label: '背景图',
                disabled: this.props.disabled,
            },
            // {
            //     id: 'version',
            //     key: 'version',
            //     type: 'select',
            //     label: 'App',
            //     placeholder: 'Please select',
            //     options: this.state.options.versionList,
            //     disabled: this.props.disabled,
            //     rules: [{required: true, message: ''}],
            //     // mode: 'multiple',
            // },
            {
                id: 'activityId',
                key: 'activityId',
                type: 'select',
                label: '活动(选填)',
                placeholder: 'Please select',
                options: this.state.options.activityOpt,
                disabled: this.props.disabled,
            },
        ];

        const settings = {
            options: options,
            getFields: this.getFields,
            values: this.state.data,
            getForm: this.getForm,
            disableDefaultBtn: this.props.disableDefaultBtn,
        };

        return (
            <div className="coupon-editor">
                <CLForm settings={settings}/>
            </div>
        );
    }
}
