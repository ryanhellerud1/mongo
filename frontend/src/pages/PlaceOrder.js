import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import CheckoutSteps from '../components/CheckoutSteps';

const PlaceOrder = () => {
  return (
    <div className="place-order-page">
      <CheckoutSteps step1 step2 step3 step4 />
      
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Order Information</Card.Title>
              <p>Shipping, payment, and order items will be displayed here.</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <p>Order total and summary will be displayed here.</p>
              <div className="d-grid mt-3">
                <Button type="button" className="btn-block">
                  Place Order
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PlaceOrder; 