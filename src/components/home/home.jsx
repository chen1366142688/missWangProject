import React from 'react';
import { Button } from 'antd';
import { Row, Col} from 'antd';
import { Line, Pie, Bar } from '../../lib/echarts/index'

class Home extends React.Component {
  render () {
    // const settings = {
    //   dom: "main", 
    //   width: "100%", 
    //   height:700, 
    //   title: 'test', 
    //   subtext:'hello, world', 
    //   xAxis: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 
    //   list: [
    //     {
    //       name: "jhon",
    //       data: [100, 200, 300, 120, 150, 160, 250, 32, 450, 280, ]
    //     },
    //     {
    //       name: "kenzi",
    //       data: [55, 32, 78, 52, 140, 160, 86, 83, 36, 18, ]
    //     },
    //     {
    //       name: "bruce",
    //       data: [33, 66, 89, 95, 120, 20, 48, 0, 36 ]
    //     }
    //   ], 
    //   dataZoom: {
    //     start: 0,
    //     end: 60
    //   }
    // }

    // const settings2 = {
    //   dom: "main2", 
    //   width: "100%", 
    //   height:400, 
    //   title: 'test', 
    //   subtext:'hello, world', 
    //   xAxis: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 
    //   list: [
    //     {
    //       name: "jhon",
    //       data: [100, 200, 300, 120, 150, 160, 250, 603, 450, 280, ],
    //       // areaStyle: {}
    //     },
    //     {
    //       name: "kenzi",
    //       data: [55, 32, 78, 52, 140, 160, 86, 83, 36, 18, ],
    //       // areaStyle: {}
    //     }
    //   ], 
    //   dataZoom: {
    //     start: 0,
    //     end: 60
    //   }
    // }

    // const settings3 = {
    //   dom: "main3", 
    //   width: "100%", 
    //   height:600, 
    //   title: 'test',
    //   name: "test-name", 
    //   subtext:'hello, world', 
    //   list: [
    //     {value:335, name:'直达'},
    //     {value:310, name:'邮件营销'},
    //     {value:234, name:'联盟广告'},
    //     {value:135, name:'视频广告'},
    //     {value:1048, name:'百度'},
    //     {value:251, name:'谷歌'},
    //     {value:147, name:'必应'},
    //     {value:102, name:'其他'}
    //   ],
    //   annular: true, //是否环形图
    // }

    return (
      <Row >
        <Col span={16} offset={4}>
          <h2>welcome to Cashlending Back-end Management System</h2>
        </Col>
      </Row>
    )
  }
}

export default Home;

