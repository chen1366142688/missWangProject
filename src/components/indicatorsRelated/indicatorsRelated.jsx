import React from 'react';
import QueueAnim from 'rc-queue-anim';
import CLList from 'Lib/component/CLlist.jsx';
import { CLComponent } from '../../../src/lib/component/index';
import { Interface } from '../../../src/lib/config/index';
import { Button, message, Modal, Row, Col } from 'antd';
import { CL } from '../../lib/tools';
import AddRelated from './addRelated';
const { contentType, metricPageList, deleteMetric, editMetric, } = Interface;

const confirm = Modal.confirm;
let name = sessionStorage.getItem("loginName");
class IndicatorsRelated extends CLComponent {
    state = {
        disabled: false,
        detail: {},
        details:{},
        isEdit: false,
      pagination: {
        total: 0,
        pageSize: 10,
        currentPage: 1,
      },
    }
    constructor(props){
        super(props);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData(page) {
        let that = this;
        let currentPage = page ? page.currentPage : '1';
        let pageSize = page ? page.pageSize : '20';
        const settings = {
            contentType,
            method: 'get',
            // url: 'http://118.25.213.60:9099/metric/page?'+'currentPage='+currentPage+'&pageSize='+pageSize,
            url: metricPageList.url +'currentPage='+currentPage+'&pageSize='+pageSize,
            headers: {
                "CMS-ACCESS-TOKEN": name
            },
        }
        function fn(res){
            if(res && res.code == 200){
                let pagination = {
                    total: res.page.count,
                    pageSize: res.page.size,
                    currentPage: res.page.currentPage,
                }
                that.setState({
                    data: res.data,
                    pagination
                });
            }else{
                message.error(res.message);
            }
        }
        CL.clReqwest({settings,fn});
    }

    check = (e,data) => {
        this.setState({
            visibles: true,
            isEdit: true,
            disabled: true,
            details: data,
        });
    }

    Edit = (e,data) => {
        this.setState({
            visible: true,
            isEdit: true,
            disabled: false,
            id: data.id,
            detail: data,
        });
    }

    delete = (e,data) => {
        confirm({
            title: '是否确认删除?',
            onOk(){
                let settings = {
                    contentType,
                    method: 'delete',
                    // url: 'http://118.25.213.60:9099/metric/' + data.id,
                    url: deleteMetric.url + data.id,
                    headers: {
                        "CMS-ACCESS-TOKEN":name
                      }
                }
                function fn(res){
                    if(res && res.code == 200){
                        message.success('SUCCESS');
                        this.loadData(this.state.pagination);
                    }else{
                        message.error(res.message);
                    }
                }
                CL.clReqwest({settings, fn});
            }
        });
    }

    onCreate = () => {
        this.setState({
            visible: true,
            isEdit: false,
            disabled: false, 
            detail: {},
        });
    }

    handleCancel = () => {
        this.setState({
            visible: false,
            visibles: false,
            detail: null,
            isEdit: false,
        });
    }
    getFields = (fields) => {
        let _this = this;
        for(let i in fields) {
            fields[i] = typeof (fields[i]) == 'string' ? _.trim(fields[i]) : fields[i];
        }
        if(_this.state.isEdit){ //编辑
            confirm({
                title: '是否确认提交编辑?',
                onOk(){
                    let settings = {
                        contentType,
                        method: 'post',
                        // url: 'http://118.25.213.60:9099/metric',
                        url: editMetric.url,
                        data: JSON.stringify({
                            name: fields.name,
                            command: fields.command,
                            id: _this.state.id,
                        }),
                        headers: {
                            "CMS-ACCESS-TOKEN":name
                        }
                    }
                    function fn(res){
                        if(res && res.code == 200){
                            message.success('SUCCESS');
                            _this.loadData(_this.state.pagination);
                            _this.setState({visible: false});
                        }else{
                            message.error(res.message);
                        }
                    }
                    CL.clReqwest({settings, fn});
                }
            });
        }else{//新增
            confirm({
                title: '是否确认提交新增?',
                onOk(){
                    let settings = {
                        contentType,
                        method: 'post',
                        // url: 'http://118.25.213.60:9099/metric',
                        url: editMetric.url,
                        data: JSON.stringify({
                            name: fields.name,
                            command: fields.command,
                        }),
                        headers: {
                            "CMS-ACCESS-TOKEN":name
                          }
                    }
                    function fn(res){
                        if(res && res.code == 200){
                            message.success('SUCCESS');
                            _this.loadData(_this.state.pagination);
                            _this.setState({visible: false});
                        }else{
                            message.error(res.message);
                        }
                    }
                    CL.clReqwest({settings, fn});
                }
            });
        }
    }

    pageChage = (e) => {
        const pagination = {
          currentPage: e.current,
          pageSize: e.pageSize,
          total: this.state.pagination.total,
        };
        this.setState({pagination: pagination});
        this.loadData( pagination);
    }

    render(){
        const _this = this;
        const columns = [
            {
              title: 'ID',
              dataIndex: 'id',
              width: '10%',
            },
      
            {
              title: '名称',
              dataIndex: 'name',
              width: '10%',
            },
      
            {
              title: '指令',
              dataIndex: 'command',
              render(index, record){
                return record.command ? record.command : '-';
              }
            },
      
            {
              title: '创建者',
              dataIndex: 'author',
              width: '10%',
            },
      
            {
              title: '创建时间',
              dataIndex: 'createTime',
              width: '15%',
              render(index,record){
                  return record.createTime ? record.createTime : '-';
              }
            },
            {
              title: '操作',
              dataIndex: 'resideCity',
              width: '20%',
              render(text, data) {
                return (<div>
                    <Row>
                        <Col span={8}>
                            <Button onClick={(e) => {_this.check(e, data)}}>查看</Button>
                        </Col>
                        <Col span={8}>
                            <Button onClick={(e) => {_this.Edit(e,data)}}>修改</Button>
                        </Col>
                        <Col span={8}>
                            <Button onClick={(e) => {_this.delete(e,data)}}>删除</Button>
                        </Col>
                    </Row>
                </div>);
              },
            },
          ];
          const settings = {
            data: _this.state.data,
            operation: null,
            columns: columns,
            getFields: _this.getFormFields,
            pagination: _this.state.pagination || {},
            pageChange: _this.pageChage,
            tableLoading: _this.state.loading,
            search: _this.state.search,
            defaultbtn: [{
              title: '新增指标',
              fn: _this.onCreate,
            }],
          };
          return (
              <div className='IndicatorsRelated' key='IndicatorsRelated'>
                  <CLList settings={settings}/>
                  <Modal
                    title={`${ _this.state.isEdit ? '编辑' : '新增指标'} `}
                    visible={_this.state.visible}
                    onCancel={_this.handleCancel}
                    mask={true}
                    maskClosable={false}
                    footer={null}
                    >
                    <AddRelated
                        isEdit={_this.state.isEdit}
                        stateIsEdit={_this.state.stateIsEdit}
                        detail={_this.state.detail}
                        getFields={_this.getFields}
                        disabled={_this.state.disabled}
                    />
                    </Modal>
                    <Modal
                    title='查看指标'
                    visible={_this.state.visibles}
                    onCancel={_this.handleCancel}
                    mask={true}
                    maskClosable={false}
                    footer={null}
                    >
                    <Row>
                        <Col span={4} offset={1}>名称:</Col>
                        <Col span={18}>{_this.state.details.name}</Col>
                    </Row>
                    <Row style={{marginTop: 25}}>
                        <Col span={4} offset={1}>指令:</Col>
                        <Col span={18}>{_this.state.details.command}</Col>
                    </Row>
                    </Modal>
              </div>
          );
    }
}
export default IndicatorsRelated;