import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, AsyncComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import _ from 'lodash';
import md5 from 'js-md5';
import { Button, DatePicker, Modal, Row, Col, Input, Select, InputNumber, Upload, Tabs, Icon, message } from 'antd';
import E from 'wangeditor';

const { Option } = Select;
const { contentType, sellerList, goodsList, goodsAdd, goodsModify, uploadLogo, goodsView } = Interface;
const { TextArea } = Input;
const { TabPane } = Tabs;
const Dragger = Upload.Dragger;
const confirm = Modal.confirm;
const AppSorting = AsyncComponent(() => import('./appSorting.jsx'));
class Specialrecord extends CLComponent {
  state = {
    search: {},
    operationType: [],
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    fileList: [],
    tableLoading: false,
    data: [],
    types: [
      { name: 'N', value: '0' },
      { name: 'Y', value: '1' },
    ],
    interest: [
      { name: 'day', value: 1 },
      { name: 'month', value: 2 },
    ],
    linkTypes: [
      { name: 'Google Play Link', value: '1' },
      { name: 'Other type link', value: '2' },
    ],
    previewVisible: false,
    previewImage: '',
    arr: [],
    teamworkState: '',
    productName: '',
    type: '1',
    isDisable: false,
    detail: {},
    modifyData: {},
    companyList: [],
    subStatus: '',

    editorContent: {__html: ""},
    title: null,
    banner: "",
    url: "",
    display: "block",
    realLogoUrl: '',
    productId: '',
    LogoUrl: '',
  }
  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'pageChage',
      'tabChange',
      'getFormFields',
      'newDocument',
      'handleCancel',
      'teamworkState',
      'productName',
      'onChange',
      'editContent',
      'checkContent',
      'Save',
      'saveAdd',
      'goodsView',
      'deleteBanner',
    ]);
  }


  componentDidMount() {
    const that = this;
    let type = sessionStorage.getItem('operateDataType') || '1';
    // 搜索条件
    const sessionSearch = sessionStorage.getItem('search');
    let search = this.state.search;
    if (sessionSearch) {
      search = JSON.parse(sessionSearch);
    }

    // 分页
    const sessionPagination = sessionStorage.getItem('pagination');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }

    that.setState({ search: search, pagination: pagination, type: type, subStatus: '' });
    this.loadData(this.state.search, this.state.pagination);
    this.companyList(this.state.pagination);
  }

  loadData(search, page) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      name: search.name,
      status: search.status,
      pageRequestDto: {
        currentPage: (page && page.currentPage) || 1,
        limit: (page && page.pageSize) || 10,
      },
    };
    const settings = {
      contentType,
      method: goodsList.type,
      url: goodsList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      if (res.response) {
        const pagination = {
          total: res.response.total,
          pageSize: res.response.limit,
          currentPage: res.response.currentPage,
        };
        sessionStorage.setItem('pagination', JSON.stringify(pagination));
        sessionStorage.setItem('search', JSON.stringify(search));

        that.setState({
          pagination: pagination,
          data: res.response.rows,
          search: search,
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  companyList() {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      pageRequestDto: {
        currentPage: 1,
        limit: 200,
      },
    };
    const settings = {
      contentType,
      method: sellerList.type,
      url: sellerList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      if (res.response) {
        let companyList = [];
        res.response.rows.map((doc,index) => {
          if (doc.status == '1') {
            companyList.push({
              name: doc.companyName,
              value: doc.id,
            });
          }

        })
        that.setState({ companyList: companyList, });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  emptyNotify = (name, value) => {
    let res = true;
    if(value == null || typeof value == "undefined"|| value === ""){
      confirm({
        title: `${name} should not be empty.`,
      });
      res = false;
    }
    return res;
  };

  validForm = (params) => {
    let res = true;
    res = !res ? res : this.emptyNotify('amountMax', params.amountMax);
    res = !res ? res : this.emptyNotify('amountMin', params.amountMin);
    res = !res ? res : this.emptyNotify('auditDesc', params.auditDesc);
    res = !res ? res : this.emptyNotify('interestRate', params.interestRate);
    res = !res ? res : this.emptyNotify('interestRateType', params.interestRateType);
    res = !res ? res : this.emptyNotify('link', params.link);
    res = !res ? res : this.emptyNotify('linkType', params.linkType);
    res = !res ? res : this.emptyNotify('loanCount', params.loanCount);
    res = !res ? res : this.emptyNotify('name', params.name);
    res = !res ? res : this.emptyNotify('productDesc', params.productDesc);
    res = !res ? res : this.emptyNotify('qualificationDesc', params.qualificationDesc);
    res = !res ? res : this.emptyNotify('sellerId', params.sellerId);
    res = !res ? res : this.emptyNotify('status', params.status);
    res = !res ? res : this.emptyNotify('synopsis', params.synopsis);
    res = !res ? res : this.emptyNotify('termMax', params.termMax);
    res = !res ? res : this.emptyNotify('termMin', params.termMin);
    return res;
  };
  saveAdd(page) {
    const that = this;
    const { detail, modifyData } = that.state;
    that.setState({ tableLoading: true });
    // 新增
    if (that.state.subStatus === '1') {
      let params = {
        pageRequestDto: {
          currentPage: 1,
          limit: 10,
        },
      };
      params = _.extend(params, detail);
      params.interestRate = params.rate;
      delete params.rate;

      let validRes = this.validForm(params);
      if (!validRes) {
        return;
      }

      const settings = {
        contentType,
        method: goodsAdd.type,
        url: goodsAdd.url,
        data: JSON.stringify(params),
      };

      function fn(res) {
        if (res.code == null) {
          that.setState({ tableLoading: false, newDocument: false });
          that.uploadContentImg(that.state.file, res.response);
        } else if (res.code !== null && res.msg == '未知错误') {
          message.error(res.msg);
        } else {
          message.error('The  name already exists, please input again');
        }
      }
      CL.clReqwest({ settings, fn });

    } else if (that.state.subStatus === '2') {
      // 编辑
      let params = {
        id: that.state.productId,
      };
      params = _.extend(params, modifyData);
      params.interestRate = params.rate;
      detail.interestRate = detail.rate
      delete params.rate;

      let validRes = this.validForm(detail);
      if (!validRes) {
        return;
      }
      const settings = {
        contentType,
        method: goodsModify.type,
        url: goodsModify.url,
        data: JSON.stringify(params),
      };

      function fn(res) {
        if(res.mas !== null && res.code == '0207'){
          message.error('The  name already exists, please input again.')
          that.setState({ tableLoading: false });
        }else{
          that.setState({ tableLoading: false, newDocument: false });
          that.uploadContentImg(that.state.file, that.state.productId);
          that.loadData(that.state.pagination);
        }
      }

      CL.clReqwest({ settings, fn });
    } else {
      console.log('这是查看');
      that.setState({
        tableLoading: false,
        newDocument: false,
      });
    }
  }

  saveAdds(imgName, id) {
    const that = this;
    let params = {
      pageRequestDto: {
        currentPage: 1,
        limit: 10,
      },
      logoUrl: imgName,
      id: id,
    };

    const settings = {
      contentType,
      method: goodsModify.type,
      url: goodsModify.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      if(res.status == "SUCCESS"){
        message.success('Save success');
        that.loadData(that.state.pagination);
      }else if(res.code === "0207"){
        message.error(res.msg);
      }else{
        message.error('提交失败');
      }
      that.setState({ tableLoading: false, newDocument: false });
    }

    CL.clReqwest({ settings, fn });
  }

  deleteBanner () {
    this.setState({ realLogoUrl: '' });
  }

  uploadContentImg = (file, id) => {
    if(file){

      let read = new FileReader();
      const that = this;
      read.that = that;
      read.uploadLogo = uploadLogo;
      read.md5 = md5;
      read.CL = CL;
      const newfile = new File([file], new Date().getTime() + '.jpg', { type: 'image/jpeg' }); //修改文件的名字
      read.readAsArrayBuffer(file);
      read.file = newfile;
      read.onloadend = function (e) {
        let { md5, uploadLogo, that, CL, file } = this;
        let formData = new FormData();
        formData.append('file', file);
        let Xmd5 = md5.base64(e.target.result);
        let uploadSettings = {
          method: 'post',
          timeout: 600000,
          url: uploadLogo.url,
          processData: false,
          data: formData,
          withCredentials: true,
          headers: {
            'X-md5': Xmd5,
            id,
          },
        };

        function fn(res) {
          that.saveAdds(res.response, id);
        }

        CL.clReqwest({ settings: uploadSettings, fn });
      };
    }
  };

  Save(e) {
    const that = this;
    confirm({
      title: 'Whether to do ? ',
      onOk() {
        that.saveAdd();
      }
    });
  }

  tabChange(e) {
    const that = this;
    that.setState({
      type: e,
    });
    sessionStorage.setItem('operateDataType', e);
  }

  newDocument(e) {
    this.setState({
      newDocument: true,
      detail: {},
      subStatus: '1'
    });
  }

  teamworkState(e) {
    const that = this;
    that.setState({
      teamworkState: e,
    });
  }

  productName(e) {
    const that = this;
    that.setState({
      productName: e.target.value,
    });
  }

  editContent(e, status) {
    this.setState({
      newDocument: true,
      isDisable: false,
      subStatus: '2',
      productId: e.id,
    });
    this.goodsView(e.id);
  }

  checkContent(e) {
    this.setState({
      newDocument: true,
      isDisable: true,
      subStatus: '3',
      productId: e.id,
    });
    this.goodsView(e.id);
  }

  goodsView(id) {
    const that = this;
    that.setState({ tableLoading: true });
    const settings = {
      contentType,
      method: goodsView.type,
      url: goodsView.url,
      data: JSON.stringify({ id }),
    };

    function fn(res) {
      let detail = res.response;
      if (detail.dRate === 0 && detail.dRate !== null) {
        detail.rate = '0';
        detail.interestRateType = 1;
      } else if (detail.mRate === 0 && detail.mRate !== null) {
        detail.rate = '0';
        detail.interestRateType = 2;
      } else if (detail.dRate !== 0 && detail.dRate !== null) {
        detail.rate = detail.dRate;
        detail.interestRateType = 1;
      }else if (detail.mRate !== 0 && detail.mRate !== null) {
        detail.rate = detail.mRate;
        detail.interestRateType = 2;
      }
      that.setState({
        realLogoUrl: res.response.realLogoUrl,
        tableLoading: false,
        newDocument: true,
        detail: res.response,
      });
    }
    CL.clReqwest({ settings, fn });
  }

  onChange(e, target) {
    let modifyData = this.state.modifyData;
    modifyData[target] = e;
    let detail = this.state.detail;
    if (target == 'rate') {
      detail[target] = e || '0';
      modifyData['interestRateType'] = detail.interestRateType;
    } else {
      detail[target] = e;

    }
    if (target == 'synopsis') {
      if (e.length >= 80) {
        message.error('Limit 80 characters, exceeded limit');
      }
    }
    if (target == 'productDesc' || target == 'qualificationDesc' || target == 'auditDesc') {
      if (e.length >= 300) {
        message.error('Limit 300 characters, exceeded limit');
      }
    }
    this.setState({ detail, modifyData });
  }

  handleCancel() {
    const that = this;
    that.setState({
      newDocument: false,
      isDisable: false,
      detail: {},
      subStatus: '',
      realLogoUrl: '',
    });
  }

  // handleChange = ({ fileList }) => this.setState({ fileList })



  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        search[index] = doc;
      }
    });
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({ search: search, pagination: pagination });
    this.loadData(search, pagination);
  }


  pageChage(e, filters) { // list 切换页面
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };
    this.setState({ pagination: pagination });
    this.loadData(this.state.search, pagination);
  }
  renderBody() {
    const that = this;
    const { data } = that.state;
    const props = {
      name: 'file',
      multiple: false,
      uploading: that.state.imgLoading,
      customRequest: (info)=> {
        that.setState({
          file: info.file
        });
      }
    };
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const columns = [
      {
        title: 'Product',
        dataIndex: 'name',
        width: '12%',
        render: function (text, record) {
          return record.name;
        },
      },
      {
        title: 'Loan Range',
        dataIndex: 'amountMin',
        width: '12%',
        render(index, record) {
          return (
            <div>
              {record.amountMin} ~ {record.amountMax}
            </div>
          )
        },
      },
      {
        title: 'Period',
        dataIndex: 'termMin',
        width: '12%',
        render(index, record) {
          return (
            <div>
              {record.termMin} ~ {record.termMax}
            </div>
          )
        },
      },
      {
        title: 'Interest',
        dataIndex: 'dRate',
        width: '12%',
        render(index, record) {
          if (record.dRate == '0' && record.dRate !== null) {
            return '0%/Day';
          } else if (record.dRate) {
            return CL.cf(record.dRate * 100, 2) + '%/Day';
          } else if (record.mRate == '0' && record.mRate !== null) {
            return '0%/Month';
          } else if (record.mRate) {
            return CL.cf(record.mRate * 100, 2) + '%/Month';
          } else if (record.mRate == null || record.dRate == null) {
            return '-';
          }
        },
      },
      {
        title: 'On-line Status',
        dataIndex: 'statusDesc',
        width: '12%',
        render(index, record) {
          return record.statusDesc;
        },
      },
      {
        title: 'Created time/Updated time',
        dataIndex: 'createTime',
        width: '15%',
        render(index, record) {
          if (record.createTime && record.updateTime) {
            return <div>{record.createTime} / {record.updateTime}</div>;
          } else if (!record.createTime) {
            return record.updateTime;
          } else {
            return record.createTime;
          }
        },
      },
      {
        title: 'Created by/Updated by',
        dataIndex: 'remark',
        width: '12%',
      },
      {
        title: 'Operate',
        dataIndex: 'updateDate',
        render: function (text, record) {
          if ((_.indexOf(JSON.parse(sessionStorage.getItem('roles')), 'supermarket_Product') > -1)) {
            return (
              <div>
                <div>
                  <Button type="primary" onClick={() => {that.checkContent(record);}}>View</Button>
                </div>
                <div style={{ marginTop: 5 }}>
                  <Button type="primary" onClick={() => {that.editContent(record);}}>Edit</Button>
                </div>
              </div>
            );
          } else {
            return '-';
          }
        },
      },
    ];


    const operation = [
      {
        id: 'name',
        type: 'text',
        label: 'Product',
        placeholder: 'Please input',
      },
      {
        id: 'status',
        type: 'select',
        label: 'On-line Status',
        options: that.state.types,
        placeholder: 'Please select',
      },
    ];

    const settings = {
      data: data,
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      defaultbtn: [{
        title: 'New',
        type: 'primary',
        fn: that.newDocument,
      }],
    };

    return (
      <div className="Specialrecord" key="Specialrecord">
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>
          {
            <TabPane tab="Product List" key="1">
              <CLlist settings={settings} />
            </TabPane>
          }
          {
            <TabPane tab="App Ranking" key="2">
              <AppSorting />
            </TabPane>
          }
        </Tabs>
        <Modal
          title=""
          visible={that.state.newDocument}
          onOk={that.Save}
          onCancel={that.handleCancel}
          okText={'Save'}
          cancelText={'Cancel'}
          mask={true}
          maskClosable={false}
          width='1000px'
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={3} offset={1}>Company :</Col>
            <Col span={20}>
              <Select
                onChange={(e) => { that.onChange(e, 'sellerId'); }}
                style={{ width: 280 }}
                placeholder='Please select'
                disabled={that.state.isDisable}
                value={that.state.detail.sellerId}
              >
                {
                  that.state.companyList.map(doc => {
                    return (
                      <Option key={doc.value} value={doc.value}>{doc.name}</Option>
                    );
                  })
                }
              </Select>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={3} offset={1}>Product :</Col>
            <Col span={20}>
              <Input disabled={that.state.isDisable} maxLength={50} placeholder='Please input' style={{ width: 280 }} type="text" value={that.state.detail.name} onChange={(e) => { that.onChange(e.target.value, 'name'); }}/>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={3} offset={1}>Logo :</Col>
            <Col span={16} >
              {that.state.realLogoUrl ?
                (
                  <Row>
                    <Col span={22}><img style={{width: 100, height: 100 }} src={that.state.realLogoUrl} className="banner-img" alt="banner"/></Col>
                    <Col span={2}>
                      <Icon onClick={ that.deleteBanner} className="delete-banner" type="delete" />
                    </Col>
                  </Row>
                ) :
                (
                  <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                      <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text">Pull picture to here or click to upload.</p>
                    <p className="ant-upload-text">Size limit : 512x512 PX,less that 1M.</p>
                  </Dragger>
                )
              }
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={4}>loanable amount(₱) :</Col>
            <div style={{ float: 'left' }}>
              <span>
                <InputNumber style={{ width: 120 }} disabled={that.state.isDisable} value={that.state.detail.amountMin} placeholder='Please input' min={0} maxLength={10} onChange={(e) => { that.onChange(e, 'amountMin'); }} /> —
              </span>
              <span style={{displsy: 'inlin-block', margin: '0px 5px' }}>
                <InputNumber style={{ width: 120 }} disabled={that.state.isDisable} value={that.state.detail.amountMax} placeholder='Please input' min={0} maxLength={10} onChange={(e) => { that.onChange(e, 'amountMax'); }} />
              </span>
            </div>
            <Col span={6} offset={1}>Example: ₱3000 ~ ₱10000</Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={4}>Term(Day) :</Col>
            <div style={{ float: 'left' }}>
              <span>
                <InputNumber style={{ width: 120 }} disabled={that.state.isDisable} value={that.state.detail.termMin} placeholder='Please input' min={0} maxLength={10} onChange={(e) => { that.onChange(e, 'termMin'); }} /> days —
              </span>
              <span style={{ displsy: 'inlin-block', margin: '0px 5px' }}>
                <InputNumber style={{ width: 120 }} disabled={that.state.isDisable} value={that.state.detail.termMax} placeholder='Please input' min={0} maxLength={10} onChange={(e) => { that.onChange(e, 'termMax'); }} /> days
              </span>
            </div>
            <Col span={8} offset={1}>Example: 1~14</Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={4}>Interest :</Col>
            <div style={{ float: 'left' }}>
              <span>
                <InputNumber style={{ width: 120 }} disabled={that.state.isDisable} value={that.state.detail.rate} placeholder='Please input' min={0} max={9} onChange={(e) => { that.onChange(e, 'rate'); }} />
              </span>
              <span style={{ displsy: 'inlin-block', marginLeft: 5 }}>
                <Select
                  onChange={(e) => { that.onChange(e, 'interestRateType'); }}
                  style={{ width: 142 }}
                  value={that.state.detail.interestRateType}
                  disabled={that.state.isDisable}
                  placeholder='Please select'
                >
                  {
                    that.state.interest.map(doc => {
                      return (
                        <Option key={doc.value} value={doc.value}>{doc.name}</Option>
                      );
                    })
                  }
                </Select>
              </span>
            </div>
            <Col span={8} offset={1}>
              Example: 0.01/day
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={4}>Brief Introduction :</Col>
            <Col span={20}>
              <Input disabled={that.state.isDisable} maxLength={80} value={that.state.detail.synopsis} placeholder='Limit 80 characters' style={{ width: 280 }} type="text" onChange={(e) => { that.onChange(e.target.value, 'synopsis'); }}/>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={4}>Product Profile :</Col>
            <Col span={12}>
              <TextArea disabled={that.state.isDisable} maxLength={300} value={that.state.detail.productDesc} placeholder="Up to 300 characters; ending with \n to achieve line feeds effect in App." autosize={{ minRows: 2, maxRows: 6 }} onChange={(e) => { that.onChange(e.target.value, 'productDesc'); }} />
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={4}>Requirements :</Col>
            <Col span={12}>
              <TextArea disabled={that.state.isDisable} maxLength={300} value={that.state.detail.qualificationDesc} placeholder="Up to 300 characters; ending with \n to achieve line feeds effect in App." autosize={{ minRows: 2, maxRows: 6 }} onChange={(e) => { that.onChange(e.target.value, 'qualificationDesc'); }} />
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={4}>Verification Instructions :</Col>
            <Col span={12}>
              <TextArea disabled={that.state.isDisable} maxLength={300} value={that.state.detail.auditDesc} placeholder="Up to 300 characters; ending with \n to achieve line feeds effect in App." autosize={{ minRows: 2, maxRows: 6 }} onChange={(e) => { that.onChange(e.target.value, 'auditDesc'); }} />
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={4}>Link Type :</Col>
            <Col span={20}>
              <Select
                onChange={(e) => { that.onChange(e, 'linkType'); }}
                style={{ width: 280 }}
                placeholder='GooglePlay Link'
                disabled={that.state.isDisable}
                value={that.state.detail.linkType == 1 ? 'Google Play Link' : that.state.detail.linkType == 2 ? 'Other type Link' : that.state.detail.linkType }
              >
                {
                  that.state.linkTypes.map(doc => {
                    return (
                      <Option key={doc.value} value={doc.value}>{doc.name}</Option>
                    );
                  })
                }
              </Select>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={4}>Product Link :</Col>
            <Col span={20}>
              <Input disabled={that.state.isDisable} value={that.state.detail.link} placeholder='Please input' maxLength={200} style={{ width: 280 }} type="text" onChange={(e) => {that.onChange(e.target.value, 'link');}}/>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={4}>Number of borrowed :</Col>
            <Col span={20}>
              <Input disabled={that.state.isDisable} value={that.state.detail.loanCount} placeholder='Please input' maxLength={10} style={{ width: 280 }} type="text" onChange={(e) => { that.onChange(e.target.value, 'loanCount'); }}/>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={4} >On-line Status :</Col>
            <Col span={20}>
              <Select
                onChange={(e) => { that.onChange(e, 'status'); }}
                style={{ width: 280 }}
                placeholder='Please select'
                disabled={that.state.isDisable}
                value={that.state.detail.status == '0' ? 'N' : that.state.detail.status == '1' ? 'Y' : that.state.detail.status}
              >
                {
                  that.state.types.map(doc => {
                    return (
                      <Option key={doc.value} value={doc.value}>{doc.name}</Option>
                    );
                  })
                }
              </Select>
            </Col>
          </Row>
        </Modal>
      </div>
    );
  }

  render(data) {
    return (
      <QueueAnim className="animate-content">
        {this.renderBody()}
      </QueueAnim>
    );
  }
}
export default Specialrecord;
