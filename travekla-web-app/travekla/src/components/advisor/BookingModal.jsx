import React, { useState, useContext } from 'react';
import { Modal, Form, DatePicker, Input, Select, Button, message } from 'antd';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const BookingModal = ({ visible, onClose, advisor }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // 👇 This function handles the Payment
  const handlePayment = async (values) => {
    setLoading(true);

    try {
      // 1. Create Order on Backend
      const { data: order } = await axios.post('https://travekla-web-app.onrender.com/api/payments/create-order');

      // 2. Configure Razorpay Popup
      const options = {
        key: "rzp_test_YOUR_KEY_ID_HERE", // 👈 PASTE YOUR KEY ID HERE!
        amount: order.amount,
        currency: "INR",
        name: "Travekla",
        description: `Hiring ${advisor.name}`,
        order_id: order.id, // The Order ID from Backend
        handler: async function (response) {
            // 3. Payment Success! 
            message.success(`Payment Successful! Transaction ID: ${response.razorpay_payment_id}`);
            console.log("Payment Data:", response);
            
            // (Optional) Save booking to database here
            onClose(); 
        },
        prefill: {
            name: user?.username || "Guest",
            email: user?.email || "guest@example.com",
            contact: "9999999999"
        },
        theme: {
            color: "#1890ff"
        }
      };

      // 4. Open the Popup
      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (err) {
      console.error(err);
      message.error("Payment failed to start.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Hire ${advisor?.name || "Advisor"}`}
      open={visible} 
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <div className="text-gray-500 mb-4 text-sm">
        Rate: <span className="font-bold text-black">₹499/trip</span> • Expert Guidance
      </div>

      <Form layout="vertical" onFinish={handlePayment}>
        <Form.Item label="Where do you want to go?" name="destination" rules={[{ required: true }]}>
          <Input placeholder="e.g. Goa, Paris" />
        </Form.Item>

        <Form.Item label="Dates" name="dates" rules={[{ required: true }]}>
          <DatePicker.RangePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Budget" name="budget" rules={[{ required: true }]}>
          <Select placeholder="Select range">
            <Option value="low">₹10k - ₹30k</Option>
            <Option value="medium">₹30k - ₹1L</Option>
            <Option value="high">₹1L+</Option>
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={loading} size="large">
          Proceed to Pay ₹499
        </Button>
      </Form>
    </Modal>
  );
};

export default BookingModal;