import React from 'react';
import moment from 'moment';
import { Row, Col, Card, Icon, Input, Select, Button, DatePicker, } from 'antd';
// import Viewer from 'viewerjs';
import $ from 'jquery';
import JqueryMangifyMin from '../../assets/jquery';
import '../../assets/jquery.magnify';
import FontMagnify from '../../assets/css/font-awesome';
import CLComponent from './CLComponent.jsx';
import { CL } from '../tools/index';

const {Option} = Select;
const gridStyle = {
  width: '33.33%',
  textAlign: 'left',
};

class CLBlockList extends CLComponent {
  state = {
    showModal: false,
    url: '',
    data: this.props.settings.data,
    titleConfig: this.props.settings.titleConfig,
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'contentInfo',
      "showEdit",
      "editContent",
      "setDocOpt",
      "setDocInput",
      "setDocDate"
    ]);
  }

  componentWillReceiveProps(nextProps) {
    const that = this;
    if (!nextProps.settings.titleConfig) {
      let changed = false;
      if (nextProps.settings.data.length !== that.state.data.length) {
        that.setState({data: nextProps.settings.data});
        return;
      }
      
      //比较content是否有变化, 有变化则重新渲染
      _.each(nextProps.settings.data,  (item) => {
        let subItem = _.find(that.state.data, {title: item.title}) || {};
        if (item.type === 'text' && !_.isNull(item.content)  &&item.content !== subItem.content) {
          changed = true;
        }
      })

      if (changed) {
        that.setState({data: nextProps.settings.data})
      }
    }

    if (!nextProps.settings.titleConfig || !nextProps.settings.titleConfig.length) {
      return;
    }

    const titleConfig = _.map(nextProps.settings.titleConfig, function (item) {
      item.show = false;
      return item;
    })
    that.setState({titleConfig:titleConfig})

    //比较两次修改后的数据是否相同，如果不同，则reload组件
    let modified;
    _.each(nextProps.settings.data, function (doc) {
      const obj = _.find(that.state.data, {title: doc.title});
      if (obj.modified !== doc.modified) {
        modified = true;
      }

      _.each(that.state.data, function (subItem, index) {
        if (subItem.title === doc.title && subItem.check !== doc.check) {
          modified = true;
        }
      }) 
    });

    if (modified ) {
      that.setState({
        data: nextProps.settings.data,
        titleConfig: nextProps.settings.titleConfig,
        modifyHis: {}
      })
    }
  }

  showEdit (e, doc) {
    const that = this;

    //是否去加载远程数
    if (doc.loadDataByParams) {
      doc.loadDataByParams(that, doc);
    }

    const data = _.map(that.props.settings.data, function (item) {
      if (doc.title === item.title ) {
        item.eidting = true;
      } else {
        item.eidting = false;
      }
      return item;
    })

    //设定页面有过修改
    // CL.setEditFlag(that.props.settings)

    const titleConfig = _.map(that.state.titleConfig, function (item) {
      item.show = true;
      return item;
    })
    that.setState({data, titleConfig});
  }

  setDocOpt (e, item) {
    const that = this;
    let list = [];
    let originList = item.getList(); 
    if (!originList || !originList.length) {
      return list;
    }
    //根据输入，获取新的list
    _.each(originList, function (doc) {
      if (doc.name.toUpperCase().indexOf(e.toUpperCase()) > -1) {
        list.push({
          name: doc.name,
          value: doc.name
        })
      }
    });

    //设置新的list 到 dom上
    const data = _.map(that.state.data, function (doc) {
      if (doc.title === item.title ) {
        // doc.list = list;
        doc.editValue = e;
      }
      return doc;
    });
    that.setState({data: data});
  }

  setDocInput (e, item) {
    const that = this;
    e = e.target.value;
    //设定新的值到dom， 并把数据保存在state中
    const data = _.map(that.state.data, function (doc) {
      if (doc.title === item.title ) {
        doc.editValue = e;
      }
      return doc;
    });
    that.setState({data: data});
  }

  setDocDate (e, item) {
    const that = this;
    const data = _.map(that.state.data, function(doc) {
      if(doc.title === item.title) {
        doc.editValue = e;
      }
      return doc;
    })
    that.setState({ data: data });
  }

  editContent (doc) {
    const that = this;
    if (doc.editType === "select") {
      return (
        <Select
          mode="combobox"
          value={doc.editValue}
          placeholder={doc.editPlaceholder || "Please select"}
          style={{ width: "80%" }}
          defaultActiveFirstOption={false}
          showArrow={false}
          filterOption={false}
          onChange={(e)=> {
              this.setDocOpt(e, doc);
            }
          }
        >
          {(doc.list || doc.getList()).map((d, index) => <Option key={d.value}>{d.name}</Option>)}
        </Select>
      )
    }

    if (doc.editType === "input") {
      return (
        <Input  
          value={doc.editValue} 
          placeholder={doc.editPlaceholder || "Input text or number"}
          style={{ width: "80%" }}
          onChange={(...arg)=> {
              this.setDocInput(...arg, doc);
            }
          }
        />
      )
    }

    if (doc.editType === "date") {
      return (
      <DatePicker 
        allowClear={false} 
        label={doc.placeholder} 
        format={doc.format || 'YYYY-MM-DD'} 
        defaultValue={moment(doc.editValue)}
        onChange={(e,date)=> {
          this.setDocDate(date, doc);
        }
      }
        />
      )
    }
  }

  contentInfo(doc) {
    const that = this;
    let text;

    let contentColor;
    if (doc.editValue && doc.editValue !== doc.content) {
      contentColor = "modifing";
    } else if (doc.modified) {
      contentColor = "modified";
    } else {
      contentColor = "normal";
    }

    if (doc.type === 'text' || !doc.type) {
      if (doc.render) {
        text = doc.render();
      } else if (_.isUndefined(doc.content)) {
        text =   (<Icon type="loading" />);
      } else if (_.isNull(doc.content)) {
        text = (<Icon type="minus" />)
      } else {
        text = (<div className={contentColor}>{doc.editValue || doc.content}</div>);
      }
    }

    if (doc.type === 'img') {
        if(doc.url=='data:image/png;base64,null'){
            text = (<p>—</p>);
        }else{
            text = (
              // < img onClick={that.showModal} src={doc.url} alt="images" />
              <img data-magnify="gallery" data-src={doc.url} src={doc.url}/>
            );
        }
    }
    return text;
  }

  showModal(e) {
    const viewer = new Viewer(e.target, {});
  }

  render() {
    let {title, editFn } = this.props.settings;
    const that = this;
    const {titleConfig, data } = that.props.settings;
    if (titleConfig) {
      const length = titleConfig.length;
      const offsetSpan = length;
      title = (<div>
          <Row>
            <Col span="4">
              {title}
            </Col>
            <Col offset = {offsetSpan}>
              {
                titleConfig.map( function (doc) {
                  return doc.show ? (
                    <Button className="title-btn" key={doc.text} type={doc.btnType} onClick={(...arg) => {
                      doc.fn(...arg, that.state.data, that)
                    }}>{doc.text}</Button>
                  ) : ''
                })
              }
            </Col>
          </Row>
      </div>)
    }


    return (
      <Card className="cl-block-list" title={title}>
        {
        data.length ? data.map((doc, index) => {
          return (
            <Card.Grid key={`cl-block-list${index}`} style={gridStyle}>
              <Row>
                <Col span={12} className="block-title">
                  {doc.check ? (<Icon type={doc.check} />) : ''} &nbsp;{doc.title}
                </Col>
                <Col span={12} className="block-body">
                  {doc.eidting ? that.editContent(doc) : that.contentInfo(doc)}
                  {doc.edit ? (<Icon type="edit" className="edit" onClick={(...arg) => {
                    that.showEdit(...arg, doc);
                  }} data-info={JSON.stringify(doc)}/>) : ''} 
                </Col>
              </Row>
            </Card.Grid>
          );
        }) : ''
      }
      </Card>
    );
  }
}
export default CLBlockList;