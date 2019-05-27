
/**
 * Created by jhonyoung on 2017/10/29.
 * 路由， 根据路由跳转到不同的组件，添加权限的控制
 */

import React from 'react';
import {
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import _ from 'lodash';
import com from '../components/index';
import Home from '../components/home/home.jsx';
import NotFound from '../components/404/404.jsx';
import { MenuConfig } from '../lib/config/index';

// 控制路由跳转,权限检查
const checkAuth = (pathname) => {
  let menu;
  let roles;
  let auth;

  MenuConfig.map((doc) => {
    return doc.children.map((subItem) => {
      if (pathname.indexOf(subItem.path) > -1) {
        menu = subItem;
      }
      return menu;
    });
  });

  if (pathname.indexOf('home') > -1) {
    return true;
  }

  if (menu) {
    roles = JSON.parse(sessionStorage.getItem('roles'));
    auth = (roles || []).indexOf(menu.role) > -1 ? true : false;
  } else {
    auth = true;
  }

  return auth;
};

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={
      (props) => {
        return checkAuth(props.location.pathname) ? (
          <Component {...props} />
    ) : (
      <Redirect to={{
        pathname: '/login',
        state: { from: props.location },
      }}
      />
    );
  }}
  />
);

export default function ClRouter() {
  return (
    <div className="content">
      <Switch>
        <PrivateRoute exact path="/uplending/home" component={Home} />
        {
          _.map(com, (component, index) => {
            if(component.routerName instanceof Array){
              return _.map(component.routerName, item=>{
                  return <PrivateRoute key={component.name} path={`/uplending/${item}`} component={component} />
                })
            }else{
              return (
                  <PrivateRoute key={component.name} path={`/uplending/${component.routerName || index.toLocaleLowerCase()}`} component={component} />
              );
            }
          })
        }
        <PrivateRoute path="*" component={NotFound} />
      </Switch>
    </div>
  );
}
