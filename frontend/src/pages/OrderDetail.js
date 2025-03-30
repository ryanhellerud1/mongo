import React from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';

const OrderDetail = () => {
  const { id: orderId } = useParams();
  
  return (
    <div className="order-detail">
      <h1 className="mb-4">Order {orderId}</h1>
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Order Details</Card.Title>
              <p>Order details will be displayed here.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <p>Order summary will be displayed here.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetail; 