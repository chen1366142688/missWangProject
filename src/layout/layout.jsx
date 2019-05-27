
/**
 * Created by jhonyoung on 2017/10/29.
 * 一级页面
 */
import React from 'react';
import { HashRouter as Router, Route, Switch} from 'react-router-dom';
import {CLComponent, AsyncComponent} from '../../src/lib/component/index';
import enUS from 'antd/lib/locale-provider/en_US';
import { LocaleProvider } from "antd"; //国际化


const Login = AsyncComponent(() => import("./login.jsx"));
const Content = AsyncComponent(() => import("./content.jsx"));

class Layout extends CLComponent {
  render () {
    return (
      <LocaleProvider locale={enUS}>
      <Router>
        <Switch>
          <Route key="layoutContent" path={`/uplending`} component={Content} />
          <Route key="login" path={'/' || '/login'} component={Login} />
        </Switch>
      </Router>
      </LocaleProvider>
    )
  }
}
export default Layout;