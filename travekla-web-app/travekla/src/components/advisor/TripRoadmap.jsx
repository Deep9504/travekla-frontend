import React from 'react';
import { Timeline, Card, Tag, Typography } from 'antd';
import { ClockCircleOutlined, HomeOutlined, CarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const TripRoadmap = ({ roadmapData }) => {
  return (
    <Card title={<Title level={4}>🗺️ Suggested Itinerary</Title>} style={{ borderRadius: 12 }}>
      <Timeline mode="left">
        {roadmapData.map((step, index) => (
          <Timeline.Item 
            key={index} 
            label={step.time}
            dot={step.type === 'travel' ? <CarOutlined style={{ fontSize: '16px' }} /> : null}
            color={step.type === 'stay' ? 'green' : 'blue'}
          >
            <Text strong>{step.title}</Text>
            <br />
            <Text type="secondary">{step.description}</Text>
            {step.cost && <div style={{ marginTop: 5 }}><Tag color="gold">Est. Cost: {step.cost}</Tag></div>}
          </Timeline.Item>
        ))}
        <Timeline.Item dot={<HomeOutlined style={{ fontSize: '16px' }} />} color="red">
          <Text strong>End of Trip</Text>
        </Timeline.Item>
      </Timeline>
    </Card>
  );
};

export default TripRoadmap;