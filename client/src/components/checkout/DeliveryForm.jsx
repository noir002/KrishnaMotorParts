import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

const DeliveryForm = ({ onSubmit, loading }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  const [errors, setErrors] = useState({});

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        // Use default address if available
        ...(user.addresses && user.addresses.length > 0 && user.addresses.find(addr => addr.isDefault) ? {
          street: user.addresses.find(addr => addr.isDefault).street || '',
          city: user.addresses.find(addr => addr.isDefault).city || '',
          state: user.addresses.find(addr => addr.isDefault).state || '',
          pincode: user.addresses.find(addr => addr.isDefault).pincode || ''
        } : {})
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone number must be 10 digits starting with 6-9';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
        Delivery Information
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="10-digit mobile number"
            required
          />
        </div>

        {/* Address Information */}
        <div className="border-t border-slate-300 dark:border-gray-600 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Delivery Address
          </h3>

          <Input
            label="Street Address"
            name="street"
            value={formData.street}
            onChange={handleChange}
            error={errors.street}
            placeholder="House/Flat number, Street name"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
              required
            />
            <Input
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              error={errors.state}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              error={errors.pincode}
              placeholder="6-digit pincode"
              required
            />
            <Input
              label="Landmark (Optional)"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              placeholder="Near landmark for easy delivery"
            />
          </div>
        </div>

        <div className="pt-6">
          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            className="w-full"
          >
            Continue to Payment
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DeliveryForm;