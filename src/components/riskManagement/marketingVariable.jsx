import React from 'react';
import {CLComponent} from 'Lib/component/index';
import CLList from 'Lib/component/CLlist.jsx';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import { Tooltip } from 'antd';
const { contentType, variableList, } = Interface;
let name = sessionStorage.getItem("loginName");
export default class MarketingVariable extends CLComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      tableLoading: false,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    const that = this;
    that.setState({
      tableLoading: true,
    });
    const settings = {
      contentType,
      method: 'get',
      // url: 'http://118.25.213.60:9088/variable/list',
      url: variableList.url,
      headers: {
        "AMS-ACCESS-TOKEN":name
      }
    };
    function fn(res) {
      if (res) {
        that.setState({data: res.data || [], tableLoading: false,});
      }
    }
    CL.clReqwest({settings, fn});
  };

  render() {
    const _this = this;
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      maxWidth: '500px',
    };
    const columns = [
      {
        title: '变量名',
        dataIndex: 'value',
        width: '20%',
      },

      {
        title: '含义',
        dataIndex: 'name',
        width: '20%',
      },

      {
        title: '备注',
        dataIndex: 'description',
        render: function (index, record) {
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.description} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <p style={remarkStyle}>{record.description}</p>
              </Tooltip>
            </div>
          );
        },
      },
    ];

    const settings = {
      data: _this.state.data,
      operation: null,
      columns: columns,
      getFields: _this.getFormFields,
      pagination: false,
      pageChange: false,
      tableLoading: _this.state.tableLoading,
      search: _this.state.search,
    };

    return (
      <div className="MarketingVariable">
        <CLList settings={settings}/>
      </div>
    );
  }
}
