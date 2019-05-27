import React from 'react';
import { Row, Col, Card} from 'antd';

class NotFound extends React.Component {
  render () {
    return (
      <div>
        <Row>
          <Col span={20} offset={3} >
            <div className="text">404</div>
          </Col>
        </Row>
        <Row>
          <Col span={20} offset={3}>
            <div className="text">not found this page</div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default NotFound;