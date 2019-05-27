import React from 'react';
import tableexport from 'tableexport';
import { Button, Modal, Row, Input, message, Select, Table } from 'antd';
import { CLComponent } from '../../lib/component';
// import Css from '../../assets/css/components/smallTools/index.css';
import { Interface } from '../../../src/lib/config/index';
import { CL } from '../../lib/tools';
const { contentType, 
    creditToolreferenceNumber, 
    creditToolListGroup, 
    creditToolDownload, 
    creditToolExample 
} = Interface;

let TB;
let TC;
const Option = Select.Option;
class SmallTools extends CLComponent {
    constructor(props){
        super(props);
        this.state = {
            InputValue: '',
            visible: false,
            showTableExport: false,
            Downloadvisible: false,
            DownloadSample: false,
            ValueL: '',
            groupValue: '',
            data: [],
            downloadData: [
                {
                    group: '1',
                     remark: '1',
                      phone: '1', name:'1'
                }
            ],
            exampleList: [],
        }
    }

    componentDidMount(){
        this.groupList();
    }

    groupList() {
        let that = this;
        const settings = {
          contentType,
          method: creditToolListGroup.type,
          url: creditToolListGroup.url,
        };
    
        function fn(res) {
          if(res.data){
            let data = []; 
            var arr = res.data;
            for ( let i = 0; i < arr.length; i++){
                data.push({
                    name: arr[i],
                    value: arr[i],
                })
            }
            that.setState({data});
          }
        }
        CL.clReqwest({ settings, fn });
      }

    handleOk = () => {
        let that = this;
        if(that.state.InputValue == ''){
            message.error('Please enter your enquiry account number');
        }else{
            const settings = {
                contentType,
                method: creditToolreferenceNumber.type,
                url: creditToolreferenceNumber.url + that.state.InputValue,
            };
            function fn(res){
                if(res.data){
                    that.setState({Value: res.data, visible: true, InputValue: ''});
                }
            }
            CL.clReqwest({ settings, fn });
        }
    }

    onChangeInput = (e) => {
        this.setState({InputValue: e.target.value});
    }

    handleCancel = () => {
        this.setState({visible: false, showTableExport:false, Downloadvisible: false });
        if (TB){TB.remove();}
    }
    handleCancel1 = () => {
        this.setState({DownloadSample: false});
        if (TC){TC.remove();}
    }

    DownloadOk = () => {
        this.setState({Downloadvisible: true})
    }

    groupOk = () => {
        let that = this;
        if(that.state.groupValue == ''){
            message.error('Please select...');
        }else{
            message.info('Please later...');
            const settings = {
                contentType,
                mothed: creditToolDownload.type,
                url: creditToolDownload.url + that.state.groupValue,
            };
            function fn(res){
                if(res.data){
                    that.setState({downloadData: res.data });
                    that.download();
                }
            }
            CL.clReqwest({ settings,fn });
        }
    }

    
    download = () => {
        const that = this;
        that.setState({ showTableExport: true });
        setTimeout(() => {
        TB = tableexport(document.querySelector("#ex-table"), {formats: ['xlsx']});
        }, 100);
    }

    onGroupChange = (e) => {
        this.setState({ groupValue: e });
    }

    creditToolExample = () => {
        let that = this;
        message.info('Please later...');
        const settings = {
            contentType,
            mothed: creditToolExample.type,
            url: creditToolExample.url
        }
        function fn(res){
            if(res.data){
                that.setState({exampleList: res.data || []});
                that.DownloadSample();
            }
        }
        CL.clReqwest({ settings, fn });
    }

    DownloadSample = () => {
        const that = this;
        that.setState({ DownloadSample: true });
        setTimeout(() => {
        TC = tableexport(document.querySelector("#ex-table1"), {formats: ['xlsx']});
        }, 100);
    }

    render() {
        return (<div className='SmallTools'>
            <Row style={{margin: '10px 0 20px 50px'}}>
                <h4 span={24}>Tool 1: sercah repayment REFERENCE NUMBER with applciation No.</h4>
            </Row>
            <Row style={{marginLeft: 50}}>
                <h5 style={{display:'inline-block'}}>Applicaiton No.</h5>
                <span>
                    <Input onChange={this.onChangeInput} style={{width: 200,margin:'0 15px'}} />
                </span>
                <Button type="primary" onClick={this.handleOk}>Search</Button>
            </Row>
            <Row style={{border: '.2px dashed #000', margin: '40px 0 20px 50px', width: 429}}></Row>
            <Row style={{margin: '30px 0 30px 50px'}}>
                <h4 span={24}>Tool2: download data  for call center</h4>
            </Row>
            <Row style={{margin:'0 10px 10px 110px'}}>
                <Button type="primary" onClick={this.DownloadOk}>Download</Button>
            </Row>
            <Row style={{marginLeft: 50}}> Download today's newly distributed orders </Row>
            <Row style={{marginLeft: 135}} onClick={this.creditToolExample}> <a>Sample</a> </Row>
            <Modal
            title={null}
            className='smallTools'
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={null}
            >
                <h5>REFERENCE NUMBER</h5>
                <h5>{this.state.Value}</h5>
                <Button type="primary" onClick={this.handleCancel}>ok</Button>
            </Modal>
            <Modal
            title={null}
            className='smallTools'
            visible={this.state.Downloadvisible}
            onOk={null}
            onCancel={this.handleCancel}
            footer={null}
            >
                <h3>select a group</h3>
                <h5>Group: 
                    <Select placeholder="Please select"
                            onChange={this.onGroupChange}
                            style={{width: 200, marginLeft: 10}}>
                        {_.map(this.state.data, doc => {
                            return <Option value={doc.value}>{doc.name}</Option>
                        })}
                    </Select>
                </h5>
                <Button type="primary" onClick={this.groupOk}>ok</Button>
            </Modal>
            <Modal
                className="te-modal"
                title="Download"
                closable
                visible={this.state.showTableExport}
                width="100%"
                style={{ top: 0 }}
                onCancel={this.handleCancel}
                footer={[
                    <Button key="back" size="large" onClick={this.handleCancel}>Cancel</Button>,
                ]}
            >
                <table id="ex-table">
                    <thead></thead>
                    <tbody>
                    {this.state.downloadData.map((record, index) => {
                        return (<tr key={index}>
                            <td>{record.name}</td>
                            <td>{record.phone}</td>
                            <td>{record.remark}</td>
                            <td>{record.group}</td>
                        </tr>);
                    })}
                    </tbody>
                </table>
            </Modal>
            <Modal
                className="te-modal"
                title="Download"
                closable
                visible={this.state.DownloadSample}
                width="100%"
                style={{ top: 0 }}
                onCancel={this.handleCancel1}
                footer={[
                    <Button key="back" size="large" onClick={this.handleCancel1}>Cancel</Button>,
                ]}
            >
                <table id="ex-table1" border='1'>
                    <thead></thead>
                    <tbody>
                    {this.state.exampleList.map((record, index) => {
                        return (<tr key={index}>
                            <td>{record.name}</td>
                            <td>{record.phone}</td>
                            <td>{record.remark}</td>
                            <td>{record.group}</td>
                        </tr>);
                    })}
                    </tbody>
                </table>
            </Modal>
        </div>)
    }
}
export default SmallTools;