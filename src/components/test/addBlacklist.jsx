import React from 'react';
import {CLComponent, CLForm} from 'Lib/component/index';
import { CL } from 'Lib/tools/index';
import _ from 'lodash';
import { Interface } from 'Lib/config/index';

let {contentType,exampleList} = Interface;

export default class MyForm extends CLComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      loading: false,
      options: {}
    }
  }

  componentDidMount() {

  }

  getFields = (fields) => {

  };

  limitLengthValid = (rule, value, callback, limit) => {
    if (value && value.length > limit) {
      callback(`Limit ${limit} characters`);
    } else {
      callback();
    }
  };

  limitValueValid = (rule, value, callback, max, min) => {
    if (value && typeof max === "number" && value > max) {
      callback(`The maximum cannot exceed ${max}`);
    } else if (value && typeof min === "number" && value < min) {
      callback(`The minimum cannot below ${min}`);
    } else {
      callback();
    }
  };

  render() {
    const options = [
      {
        id: "channelsName",
        type: "text",
        label: "App",
        placeholder: "Please select",
        rules: [{required: true, message: "Please enter App name!" }]
      },

      {
        id: "contractAmount",
        type: "text",
        label: "User's  phone number",
        placeholder: "639xxxxxxxxx",
        rules: [{required: true,
          message: "Invalid phone numbe! The phone number should start with 639 and be a 12-digit pure number",
          pattern:/^(639)\d{9}$/}]
      },

      {
        id: "description",
        type: "textarea",
        label: "Note",
        placeholder: "Please enter note!",
        rules: [
          {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 200)},
        ]
      },
    ];

    const settings = {
      options: options,
      getFields: this.getFields,
      values: this.state.data
    };

    return (
      <div className="my-form">
        <CLForm settings={settings}/>
      </div>
    )
  }
}
