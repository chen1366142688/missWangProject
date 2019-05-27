
/**
 * Created by jhonyoung on 2017/10/29.
 * 导航框架，侧边栏，退出登录
 */
import React from 'react';
import { Layout, Menu, Breadcrumb, Icon, Dropdown, Col, Row, message} from 'antd';
import { CLComponent, AsyncComponent } from '../../src/lib/component/index';
import { CL } from '../../src/lib/tools/index';
import { Interface, MenuConfig } from '../../src/lib/config/index';
// import ClRouter from '../../src/router/ClRouter.jsx';
// import CLMenu from './sider.jsx';
const ClRouter = AsyncComponent(() => import("../../src/router/CLRouter.jsx"));
const CLMenu = AsyncComponent(() => import("./sider.jsx"));

const {contentType, logout} = Interface;
const { Header, Content, Sider, Footer } = Layout;

class CLContent extends CLComponent {
  state = {
    visible: false,
    login: true,
    collapsed: false,
  };

  constructor (props) {
    super(props);
    this.bindCtx([
      "handleVisibleChange",
      "handleLoginOut",
      "onCollapse"
    ]);
  }

  onCollapse = (collapsed) => {
    console.log(collapsed);
    this.setState({ collapsed });
  }

  handleLoginOut = (e) => {
    location.hash = '/login';
  }

  handleVisibleChange = (flag) => {
    this.setState({ visible: flag });
  }

  render () {
    let loginName = sessionStorage.getItem("loginName");
    //解决分辨率偏小引起的下拉菜单换行的bug
    const dpStyle = {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }

    const menu = (
      <Menu onClick={this.handleLoginOut}>
        <Menu.Item key="1">Sign Out</Menu.Item>
      </Menu>
    );

    let menuArr = [];
    const pathName = this.props.location.pathname;
    _.each(MenuConfig, function (item, index) {
      _.each(item.children, function (subItem, subIndex) {
        if (pathName.indexOf(subItem.path) > -1) {
          menuArr.push(item.name);
          menuArr.push(subItem.name);
        }
      })

    })

    return (
      <Layout className="layout">
        <Header className="layout-header">
        <Row>
          <Col  span={20} className="layout-title"> Cashlending Back-end Management System </Col>
          <Col span={3} style={dpStyle}>
            <Dropdown overlay={menu}
              onVisibleChange={this.handleVisibleChange}
              visible={this.state.visible}
            >
              <a className="ant-dropdown-link" href="javascript:;">
                Welcome, {loginName} <Icon type="down" />
              </a>
            </Dropdown>
          </Col>
        </Row>
        </Header>
        <Layout>
          <Sider className="layout-sider" collapsed={this.state.collapsed} onCollapse={this.onCollapse} collapsible>
            <CLMenu/>
          </Sider>
          <Content className="layout-content">
            <Breadcrumb className="layout-breadcrumb">
              {
                menuArr.map( function (doc, index) {
                  return (<Breadcrumb.Item key={index}>{doc}</Breadcrumb.Item>)
                })
              }
            </Breadcrumb>
            <ClRouter/>
          </Content>
        </Layout>
        <Footer className="layout-footer">www.cashlending.ph © 2017-2020</Footer>
      </Layout>
    )
  }
}

export default CLContent;



