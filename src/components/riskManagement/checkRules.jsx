import React from "react";
import { CLComponent, CLForm } from "Lib/component/index";

export default class CheckRules extends CLComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.fillFields(this.props.datails);
  }

  componentWillReceiveProps(nextProps) {
    const _this = this;
    if (nextProps.datails !== this.props.datails) {
      setTimeout(function() {
        _this.fillFields(nextProps.datails);
      }, 100);
      _this.fillFields(nextProps.datails);
    } else {
      this.form.resetFields();
    }
  }

  resetFields = () => {
    const that = this;
    let datails = this.form.getFieldsValue();
    that.form.setFieldsValue(datails);
  };

  fillFields = datails => {
    console.log(datails);
  };

  getFields = (fields, that, err) => {
    this.props.getFields(fields, that, err);
  };

  getForm = form => {
    this.form = form;
  };

  render() {
    const options = [
      {
        type: "words",
        label: "短信内容",
        content: this.props.datails.message || "—",
        disabled: true
      },
      {
        type: "words",
        label: "推送标题",
        content: this.props.datails.pushTitle || "—",
        disabled: true
      },

      {
        type: "words",
        label: "推送内容",
        content: this.props.datails.pushContent || "—",
        disabled: true
      },

      {
        type: "words",
        label: "优惠券",
        content: this.props.datails.extra || "—",
        disabled: true
      },
      {
        type: "words",
        label: "创建时间",
        content: this.props.datails.createTime || "—",
        disabled: true
      },

      {
        type: "words",
        label: "创建人",
        content: this.props.datails.author || "—",
        disabled: true
      },

      {
        type: "words",
        label: "更新时间",
        content: this.props.datails.updateTime || "—",
        disabled: true
      },

      {
        type: "words",
        label: "更新人",
        content: this.props.datails.modifier || "—",
        disabled: true
      }
    ];
    const settings = {
      options: options,
      getFields: this.getFields,
      values: this.state.data,
      getForm: this.getForm,
      disableDefaultBtn: true
    };

    return (
      <div className="check-rules">
        <CLForm settings={settings} />
      </div>
    );
  }
}
