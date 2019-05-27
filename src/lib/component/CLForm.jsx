import React from 'react';
import moment from 'moment';
import md5 from 'js-md5';
import CLComponent from './CLComponent.jsx';
import {CL} from '../tools/index';
import {Interface} from '../config/index';

const {contentType, uploadImg} = Interface;
import {
  Table,
  Form,
  Row,
  Col,
  Input,
  Button,
  Icon,
  InputNumber,
  Select,
  DatePicker,
  RangePicker,
  Checkbox,
  TreeSelect,
  Upload
} from 'antd';

const Dragger = Upload.Dragger;
const FormItem = Form.Item;
const {TextArea} = Input;

class ClForm extends CLComponent {
  constructor(props) {
    super(props);
    this.bindCtx([
      'handleSubmit',
      'handleReset',
      'getFields',
    ]);
  }

  state = {}

  componentDidMount() {
    this.props.settings.getForm && this.props.settings.getForm(this.props.form);
  }

  getFields(operation) {
    const formItemLayout = this.props.settings.formItemLayout || {
      labelCol: {
        xs: {span: 24},
        sm: {span: 6},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 8},
      },
    };

    const children = [];
    let formItem;
    const {getFieldDecorator} = this.props.form;
    const gfd = (doc) => {
      return getFieldDecorator(`${doc.id}`, {rules: doc.rules, initialValue: doc.initialValue});
    };

        for (let i = 0; i < operation.length; i++) {
            switch (operation[i].type) {
                case 'text':
                    formItem = (

                        <FormItem {...formItemLayout} label={`${operation[i].label}`}>
                            {gfd(operation[i])(
                                <Input type={operation[i].inputType} disabled={operation[i].disabled}
                                       placeholder={`${operation[i].placeholder}`} onChange={operation[i].onChange || (() => {})}/>,
                            )}
                            {operation[i].extra}
                        </FormItem>
                    );
                    break;

                case 'textarea':
                    formItem = (
                        <FormItem {...formItemLayout} label={`${operation[i].label}`}>
                            {gfd(operation[i])(
                                <TextArea type={operation[i].inputType} 
                                          autosize={operation[i].autosize?operation[i].autosize:{minRows: 2, maxRows: 6}}
                                          disabled={operation[i].disabled}
                                          placeholder={`${operation[i].placeholder}`}
                                          onChange={operation[i].onChange || (() => {})}
                                />,
                            )}
                            {operation[i].extra}
                        </FormItem>
                    );
                    break;

        case 'number':
          formItem = (
            <FormItem {...formItemLayout} label={`${operation[i].label}`}>
              {gfd(operation[i])(
                <InputNumber type={operation[i].inputType} disabled={operation[i].disabled}
                             placeholder={`${operation[i].placeholder}`}/>,
              )}
              {operation[i].extra}
            </FormItem>
          );
          break;

                case 'select':
                    formItem = (
                        <FormItem
                            {...formItemLayout}
                            label={`${operation[i].label}`}
                        >
                            {gfd(operation[i])(
                                <Select mode={operation[i].mode} disabled={operation[i].disabled}
                                        type={operation[i].inputType}
                                        onChange={operation[i].onChange || (() => {})}>
                                    {
                                        operation[i].options.map((doc, index) => {
                                            return (<Select.Option key={`${doc.id}${index}`}
                                                                   value={doc.value.toString()}>{doc.name}</Select.Option>);
                                        })
                                    }
                                </Select>,
                            )}
                            {operation[i].extra}
                        </FormItem>
                    );
                    break;

        case 'dateTime':
          formItem = (
            <FormItem {...formItemLayout} label={`${operation[i].label}`}>
              {gfd(operation[i])(
                <DatePicker label={operation[i].placeholder} disabled={operation[i].disabled}
                            type={operation[i].inputType}
                            format={operation[i].format || 'YYYY/MM/DD HH:mm'}/>,
              )}
              {operation[i].extra}
            </FormItem>
          );
          break;

        case 'rangePicker':
          formItem = (
            <FormItem {...formItemLayout} label={`${operation[i].label}`}>
              {gfd(operation[i])(
                <DatePicker.RangePicker
                  type={operation[i].inputType}
                  disabled={operation[i].disabled}
                  showTime
                  ranges={{
                    Today: [moment(), moment()],
                    'This Month': [moment(), moment().endOf('month')]
                  }}
                  format="YYYY/MM/DD HH:mm"
                />,
              )}
              {operation[i].extra}
            </FormItem>
          );
          break;

        case 'checkbox':
          formItem = (
            <FormItem {...formItemLayout} label={`${operation[i].label}`}>
              {gfd(operation[i])(
                <Checkbox disabled={operation[i].disabled} type={operation[i].inputType}>
                  {operation[i].placeholder}
                </Checkbox>,
              )}
              {operation[i].extra}
            </FormItem>
          );
          break;
        case 'treeSelect':
          formItem = (
            <FormItem {...formItemLayout} label={`${operation[i].label}`}>
              {gfd(operation[i])(
                <TreeSelect
                  disabled={operation[i].disabled}
                  allowClear
                  type={operation[i].inputType}
                  treeData={operation[i].treeData}
                  size="large"
                  showCheckedStrategy={TreeSelect.SHOW_ALL}
                  treeCheckable
                  placeholder={operation[i].placeholder}
                />,
              )}
              {operation[i].extra}
            </FormItem>
          );
          break;
          case 'words':
          formItem = (
              [<Col span={6} offset={4} style={{textAlign: 'left', marginBottom: '20px'}}>
                  <span>{`${operation[i].label + ' :' || ''}`}</span>
              </Col>,
                  <Col span={12} style={{textAlign: 'center', marginBottom: '20px'}}>
                      <span>{`${operation[i].content || ''}`}</span>
                  </Col>]
          );
          break;

        case 'upload':
          let that = this;
          let uploadContentImg = (files, insert, onSuccess) => {
            let read = new FileReader();
            const that = this;
            read.that = that;
            read.uploadImg = uploadImg;
            read.md5 = md5;
            read.CL = CL;
            const newfile = new File([files[0]], new Date().getTime() + ".jpg", {type: "image/jpeg"}); //修改文件的名字
            read.readAsArrayBuffer(files[0]);
            read.file = newfile;
            read.onloadend = function (e) {
              let {md5, uploadImg, that, CL, file} = this;
              let formData = new FormData();
              formData.append('file', file);
              let Xmd5 = md5.base64(e.target.result);

              let uploadSettings = {
                method: "post",
                timeout: 600000,
                url: uploadImg.url,
                processData: false,
                data: formData,
                withCredentials: true,
                headers: {
                  "X-md5": Xmd5
                }
              }

              function fn(res) {
                if (insert) {
                  insert(res.data);
                }

                if (onSuccess) {
                  onSuccess(res.data);
                }
              }

              CL.clReqwest({settings: uploadSettings, fn});
            };
          }
          const props = {
            name: 'file',
            multiple: false,
            customRequest(info) {
              uploadContentImg([info.file], undefined, function (e) {
                that.setState({
                  banner: e
                })

                resetFields({
                  [operation[i].id]: e
                })
              })
            }
          };
          let deleteBanner = () => {
            that.setState({
              banner: ""
            })
            resetFields({
              [operation[i].id]: ""
            })
          }

          let resetFields = (fields) => {
            let detail = that.props.form.getFieldsValue();
            detail = _.assign(detail, fields)
            setTimeout(()=>{
              that.props.form.setFieldsValue(detail)
            })
          };

          formItem = (
            <FormItem {...formItemLayout} label={`${operation[i].label}`}>
              {getFieldDecorator(`${operation[i].id}` )(
                that.state.banner || that.props.form.getFieldValue("backgroundUrl") ?
                  (
                    <Row>
                      <Col span={22}><img style={{width: 150, height: 150}}
                                          src={that.state.banner || that.props.form.getFieldValue("backgroundUrl")} className="banner-img"
                                          alt="banner"/></Col>
                      <Col span={2}>
                        <Icon onClick={deleteBanner} className="delete-banner" type="delete"/>
                      </Col>
                    </Row>
                  ) :
                  (
                    <Dragger {...props}>
                      <p className="ant-upload-drag-icon"><Icon type="inbox"/></p>
                      <p className="ant-upload-text">Pull picture to here or click to upload.</p>
                      <p className="ant-upload-text">size suggest:** JPG PNG only,within 1MB.</p>
                    </Dragger>
                  )
              )}
              {operation[i].extra}
            </FormItem>
          );
          break;
      }
      children.push(<Col span={24} key={i} style={{display: 'block'}}>{formItem}</Col>);
    }
    return children;
  }

  handleReset = () => {
    this.props.form.resetFields();
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const that = this;
    that.setState({
      loading: true,
    });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }

      that.props.settings.getFields(values, that, err);
    });
  }

  render() {
    const {settings} = this.props;
    let loading = false;

    if (!_.isUndefined(settings.btnloading)) {
      loading = settings.btnloading;
    }

    return (
      <div className="cl-form" key="cl-form">
        <Form
          className="ant-advanced-search-form cl-form"
          onSubmit={this.handleSubmit}
        >
          <Row gutter={2}>{this.getFields(settings.options)}</Row>
          <Row>
            <Col offset={4} span={8} style={{textAlign: 'left'}}>
              {settings.disableDefaultBtn ? null :
                [<Button type="primary" htmlType="submit" loading={loading}>save</Button>,
                  <Button style={{marginLeft: 8}} onClick={this.handleReset}>
                    Clear
                  </Button>]
              }
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

const CLForm = Form.create({
  mapPropsToFields(props) {
    const values = props.settings.values || {};
    const formSearch = {};
    _.each(values, (value, index) => {
      formSearch[index] = Form.createFormField({value: value});
    });

    return formSearch;
  },
})(ClForm);
export default CLForm;


/** * example
 let settings = [
 {
        id: 'usermobile',
        type: 'number',
        label: '用户查询',
        formType: 'textarea',
        placeholder: 'test',
        mode: "multiple",
        options: [
          {
            name: 1,
            value: 1
          },
          {
            name: "jhonyoung",
            value: "webdeveloper"
          },
        ],
        rules: [{ required: true, message: 'Please input website!' }]
      },
 {
        id: 'usermobile4',
        type: 'select',
        label: 'test5',
        formType: 'textarea',
        placeholder: 'test',
        options: [
          {
            name: 1,
            value: 1
          },
          {
            name: "jhonyoung",
            value: "webdeveloper"
          },
        ]
      },
 {
        id: 'usermobile2',
        type: 'text',
        label: 'test2',
        formType: 'textarea',
        placeholder: 'test'
      },
 {
        id: 'usermobile3',
        type: 'dateTime',
        label: 'test3',
        formType: 'textarea',
        placeholder: 'test'
      },
 {
        id: 'usermobile34',
        type: 'checkbox',
        label: 'test44',
        formType: 'textarea',
        placeholder: 'placeholder',
        value: "1231221"
      },
 ]
 ** */
