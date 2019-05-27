import React from 'react';
import QueueAnim from 'rc-queue-anim';
import CLList from 'Lib/component/CLlist.jsx';
import { CLComponent } from '../../../src/lib/component/index';
import { Interface } from '../../../src/lib/config/index';
import { Button, message, Modal, Row, Col, Switch, Form } from 'antd';
import { CL } from '../../lib/tools';
const { contentType, ruleOffs, ruleOns, deleterulePage, rulePageListb } = Interface;

const confirm = Modal.confirm;
let name = sessionStorage.getItem("loginName");
class RulesRelated extends CLComponent {
    state = {
        disabled: false,
        detail: {},
        isEdit: false,
        check: false,
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
            // url: 'http://118.25.213.60:9099/rule/page?'+'currentPage='+currentPage+'&pageSize='+pageSize,
            url: rulePageListb.url+'currentPage='+currentPage+'&pageSize='+pageSize,
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
            // visible: true,
            isEdit: true,
            disabled: true,
            check: true,
            detail: data,
            ruleId: data.id,
        });
        location.hash = `#/uplending/addRelateds?rule=${data.id}=1`
    }

    Edit = (e,data) => {
        this.setState({
            visible: true,
            isEdit: true,
            disabled: false,
            id: data.id,
            detail: data,
        });
        location.hash = `#/uplending/addRelateds?rule=${data.id}=2`
    }

    delete = (e,data) => {
        let that = this;
        confirm({
            title: '是否确认删除?',
            onOk(){
                let settings = {
                    contentType,
                    method: 'delete',
                    // url: 'http://118.25.213.60:9099/rule/' + data.id,
                    url: deleterulePage.url + data.id,
                    headers: {
                        "CMS-ACCESS-TOKEN":name
                      }
                }
                function fn(res){
                    if(res && res.code == 200){
                        message.success('SUCCESS');
                        that.loadData(that.state.pagination);
                    }else{
                        message.error(res.message);
                    }
                }
                CL.clReqwest({settings, fn});
            }
        });
    }

    onCreate = () => {
        location.hash = '#/uplending/addRelateds';
    }

    handleCancel = () => {
        this.setState({
            visible: false,
        });
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

    switchChange = (e,data) => {
        let idValue = data.id;
        if(e == true){
            const settings = {
                contentType,
                method: 'patch',
                // url: `http://118.25.213.60:9099/rule/on/`+idValue,
                url: ruleOns.url+idValue,
                headers: {
                "CMS-ACCESS-TOKEN":name
                }
            };
        
            function fn(res) {
                if (res && res.code == 200) {
                this.loadData(this.state.search,this.state.pagination);
                }
            }
            CL.clReqwest({settings, fn});
        }else if(e == false){
            const settings = {
                contentType,
                method: 'patch',
                // url: `http://118.25.213.60:9099/rule/off/`+idValue,
                url: ruleOffs.url+idValue,
                headers: {
                "CMS-ACCESS-TOKEN":name
                }
            };
            function fn(res) {
                if (res && res.code == 200) {
                this.loadData(this.state.search,this.state.pagination);
                }
            }
            CL.clReqwest({settings, fn});
        }
    }

    render(){
        const _this = this;
        const columns = [
            {
              title: 'ID',
              dataIndex: 'id',
              width: '7%',
            },
      
            {
              title: '名称',
              dataIndex: 'name',
              width: '8%',
            },
      
            {
              title: '报警方式',
              dataIndex: 'action',
              width: '7%',
              render(index, record){
                return record.action == 'E'?'邮件' : record.action == 'M'?'短信' : '-';
              }
            },
      
            {
              title: '邮箱',
              dataIndex: 'email',
              width: '11%',
              render(index,record){
                  return record.email? record.email : '-';
              }
            },
      
            {
              title: '手机号',
              dataIndex: 'telephone',
              width: '10%',
              render(index,record){
                  return record.telephone? record.telephone : '-';
              }
            },
      
            {
              title: '创建者',
              dataIndex: 'author',
              width: '8%',
            },
      
            {
              title: '创建时间',
              dataIndex: 'createTime',
              width: '12%',
              render(index,record){
                  return record.createTime ? record.createTime : '-';
              }
            },
            
            {
                title: '触发时间',
                dataIndex: 'cron',
                width: '12%',
                render(index,record){
                    return record.cron ? record.cron : '-';
                }
              },
      
            {
              title: '状态',
              dataIndex: 'state',
              width: '10%',
              render: function render(text, data) {
                  return (<div>
                    <Switch 
                      checkedChildren="开启" 
                      unCheckedChildren="关闭" 
                      defaultChecked={data.state == 'N'? false : true} 
                      onChange={(e) => {
                        _this.switchChange(e, data);
                      }}
                       />
                  </div>
                  );
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
              title: '新增规则',
              fn: _this.onCreate,
            }],
          };
          return (
              <div className='IndicatorsRelated' key='IndicatorsRelated'>
                  <CLList settings={settings}/>
              </div>
          );
    }
}
export default RulesRelated;