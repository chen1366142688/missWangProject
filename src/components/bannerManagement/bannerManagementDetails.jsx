import React from 'react';
import { Row, Col, Button, Radio, Select, Input, Upload, Icon, message, Modal} from 'antd';
import E from "wangeditor";
import {CLComponent} from '../../../src/lib/component/index';
import md5 from 'js-md5';
import { Interface } from '../../../src/lib/config/index';
import { CL } from '../../../src/lib/tools/index';
const {uploadImg, bannerSaveOrUpdate, bannerView, getBannerList, contentType} = Interface;
const Dragger = Upload.Dragger;
const confirm = Modal.confirm;
const Option = Select.Option;
let req;
class BannerManagementDetails extends CLComponent {
  state = {
    editorContent: {__html: ""},
    type: null,
    status: null,
    title: null,
    banner: "",
    url: "",
    display: "block",
    version: '',
    packetName: '',
    appNameList: [],
    packetNameList: [],
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      'loadData',
      'clickHandle',
      'uploadContentImg',
      'onChangeType',
      'onChangeStatus',
      'onChangeTitle',
      'onChangeUrl',
      'deleteBanner',
      'initEdit',
    ]);
  }

  componentDidMount() {
    const that = this;
    const id = this.props.match.params.id;
    if (parseInt(id)) {
      this.loadData(id);
    } else {
      if (that.state.type === "1" || !that.state.type) {
        that.initEdit();
      } else {
        that.setState({display: "none"});
      }
    }
    this.appMonitorProductVersionPacket();
  }

  initEdit (editorContent) {
    const that = this;
    const elem = this.refs.editorElem;
    const editor = new E(elem);
    editor.customConfig = {
      showLinkImg: true,
      uploadImgServer: uploadImg.url,
      uploadImgMaxLength: 1,
      uploadFileName: 'file',
      lang: {
        '设置标题': 'title',
        '文字颜色': "font color",
        '背景色': "background color",
        '对齐方式': "alignment",
        '正文': 'p',
        '链接文字': 'link text',
        '链接': 'link',
        '上传图片': 'upload image',
        '网络图片': 'online image',
        "插入": 'insert',
        "图片": "image ",
        '上传': 'upload',
        '创建': 'init',
        '靠左': "left",
        '靠右': 'right',
        "居中": 'center'
        // 还可自定添加更多
      },
      menus: [
        'head',  // 标题
        'bold',  // 粗体
        'italic',  // 斜体
        'underline',  // 下划线
        'strikeThrough',  // 删除线
        'foreColor',  // 文字颜色
        'backColor',  // 背景颜色
        'link',  // 插入链接
        'justify',  // 对齐方式
        'quote',  // 引用
        'image',  // 插入图片
        'undo',  // 撤销
        'redo'  // 重复
      ],
      customUploadImg: that.uploadContentImg,
      onchange:  html => {
        this.setState({
          editorContent: {__html: html}
        })
      }
    }
    editor.create();
    editor.txt.html(editorContent || that.state.editorContent.__html)
  }

  loadData(id) {
    const that = this;
    const settings = {
      contentType,
      method: bannerView.type,
      url: bannerView.url + id
    }

    function fn (res) {
      if (res.data) {
        const {banner, title, type, editorContent, url, status} = res.data;
        that.setState({
          banner,
          title,
          url,
          type: type.toString(),
          status: status.toString(),
          editorContent: {__html: editorContent},
        });
        if (type.toString() === "1") {
          that.initEdit(editorContent);
        }

      }
    }

    CL.clReqwest({settings, fn});
  }

  onChangeType (e) {
    const that = this;
    that.setState({type: e.target.value});
    if (e.target.value !== "1") {
      that.setState({display: "none"})
    } else {
      that.setState({display: "block"});
      that.initEdit();
    }
  }

  onChangeStatus (e) {
    this.setState({status: e});
  }
  onChangeappNameList = (e) => {
    let version, packetName;
    let versionArr = e.split('-');
    packetName = versionArr[0];
    version = versionArr[1];
    this.setState({ packetName: packetName, version: version, appPlatform: e });
  }
  appMonitorProductVersionPacket () {
    const that = this;
    that.setState({tableLoading: true});
    const params = {
      page: {
        currentPage: 1,
        pageSize: 10
      },
      search: {},
    }

    const settings = {
      contentType,
      method: 'post',
      url: getBannerList.url,
      data: JSON.stringify(params)
    }

    function fn (res) {
      that.setState({tableLoading: false});
      const data = res.data;
      if (data) {
        let appArr = res.data.packetNameList;
        let packetNameList = [];
        for(let key in appArr){
          packetNameList.push({
            name: appArr[key],
            value: appArr[key],
          });
        }
        that.setState({packetNameList})
      }
    }

    if (req) {
      req.abort();
    }
    req = CL.clReqwest({settings, fn});
  }
  onChangeTitle (e) {
    if (e && e.length > 100) {
      message.error("100 characters limited");
      return;
    }
    this.setState({title: e.target.value});
  }
  onChangeUrl (e) {
    this.setState({url: e.target.value});
  }

  uploadContentImg (files, insert, onSuccess) {
    let read = new FileReader();
    const that = this;
    read.that = that;
    read.uploadImg = uploadImg;
    read.md5 = md5;
    read.CL = CL;
    const newfile = new File([files[0]], new Date().getTime()+".jpg",{type:"image/jpeg"}); //修改文件的名字
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

  deleteBanner () {
    this.setState({banner: ""});
  }

  clickHandle() {
    const {banner, title, type, status, editorContent, url, packetName, version} = this.state;
    let id = this.props.match.params.id;

    if (!banner) {
      message.error("banner is required!");
      return;
    }

    if (!title) {
      message.error("Headline is required!");
      return;
    }

    if (!type) {
      message.error("Type is required!");
      return;
    }

    if (!status) {
      message.error("Status is required!");
      return;
    }
    if (!packetName) {
      message.error("packetName is required!");
      return;
    }

    if (type === "1" && !editorContent.__html) {
      message.error("Detail content is required.");
      return;
    }

    if (type === "2" && !url) {
      message.error("URL is required!");
      return;
    }

    if (!id) { //新建
      id = null;
    }

    const settings = {
      contentType,
      method: bannerSaveOrUpdate.type,
      url: bannerSaveOrUpdate.url,
      data: JSON.stringify({search: {
        banner,
        title,
        type,
        status,
        editorContent: editorContent.__html,
        url,
        id,
        version,
        packetName,
      }})
    }

    function fn (res) {
      if (res.data) {
        message.success("Save successful!");
        location.hash = "/uplending/bannermanagement";
      }
    }

    confirm({
      title: 'Notice ?',
      content: `Sure to save ?`,
      okText: "Save",
      cancelText: 'No',
      onOk() {
        submit({settings, fn})
      }
    });

    function submit ({settings, fn}) {
      CL.clReqwest({settings, fn});
    }


  }

  render () {
    const that = this;
    const props = {
      name: 'file',
      multiple: false,
      uploading: that.state.imgLoading,
      customRequest (info) {
        info.onSuccess = function (e) {
          that.setState({banner: e})
        }
        that.uploadContentImg([info.file], undefined, info.onSuccess)
      }
    };

    return (
      <div className="banner-management">
        <Row className="banner-management-group">
          <Col span={11} offset={1}>
            <Row>
              <Col span={4}>Headline:</Col>
              <Col span={20}><Input placeholder="Please input headline" onChange={that.onChangeTitle} value={that.state.title} /></Col>
            </Row>
            <br/>
            <Row>
              <Col span={4}>Banner:</Col>
              <Col span={20}>
                {that.state.banner ?
                  (
                    <Row>
                      <Col span={22}><img src={that.state.banner} className="banner-img" alt="banner"/></Col>
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
                      <p className="ant-upload-text">size suggest:** JPG PNG only,within 2MB.</p>
                    </Dragger>
                  )
                }
              </Col>
            </Row>
            <br/>
            <Row>
              <Col span={4}>Type:</Col>
              <Col span={20}>
                <Radio.Group onChange={that.onChangeType} value={that.state.type}>
                  <Radio value="1">Draft</Radio>
                  <Radio value="2">URL</Radio>
                </Radio.Group>
              </Col>
            </Row>
            <br/>
            <Row>
              <Col span={4}>Detail content:</Col>
              <Col span={20}>
                <div ref="editorElem" style={{display: that.state.display}}></div>
                {that.state.type === "1" || !that.state.type ? "":
                (<div><br/><Input placeholder="Please input URL" onChange={that.onChangeUrl} value={that.state.url} /></div>)}
              </Col>
            </Row>
            <br/>
            <Row>
              <Col span={4}>Status:</Col>
              <Col span={20}>
                <Select onChange={that.onChangeStatus} style={{ width: "100%" }} value={that.state.status}>
                  <Select.Option value="1">online</Select.Option>
                  <Select.Option value="2">offline</Select.Option>
                </Select>
              </Col>
            </Row>
            <br/>
            <Row>
              <Col span={4}>Packet name:</Col>
              <Col span={20}>
                <Select onChange={that.onChangeappNameList} style={{ width: "100%" }} value={that.state.packetName}>
                  {
                    that.state.packetNameList.map(doc => {
                      return (
                        <Option key={doc.value} value={doc.value}>{doc.name}</Option>
                      );
                    })
                  }
                </Select>
              </Col>
            </Row>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <Row>
              <Col offset={20} span={4}>
                <Button type="primary" onClick={that.clickHandle}> submit </Button>
              </Col>
            </Row>
          </Col>
          <Col span={10} offset={2}>
            <div className="mobile-monitor">
              <img src="/manager/src/assets/img/iphone6.png"  alt="iphone6" />
            </div>
            <div className="mobile-content" dangerouslySetInnerHTML={that.state.editorContent}>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default BannerManagementDetails;
