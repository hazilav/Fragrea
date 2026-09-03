'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/formatters';

type CheckoutStep = 1 | 2 | 3 | 4;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);

  // Form Fields for the 4 Steps
  const [formData, setFormData] = useState({
    // Step 1: Customer Information
    customerName: '',
    customerEmail: '',
    customerPhone: '',

    // Step 2: Shipping Address
    shippingAddress: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',

    // Step 3: Payment
    paymentMethod: 'Credit Card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validation functions for each step
  const validateStep1 = () => {
    if (!formData.customerName.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    if (!formData.customerEmail.trim() || !formData.customerEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!formData.customerPhone.trim()) {
      setError('Please enter your telephone number.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.shippingAddress.trim()) {
      setError('Please enter your street address.');
      return false;
    }
    if (!formData.city.trim()) {
      setError('Please enter your city.');
      return false;
    }
    if (!formData.state.trim()) {
      setError('Please enter your state or province.');
      return false;
    }
    if (!formData.postalCode.trim()) {
      setError('Please enter your postal or ZIP code.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep3 = () => {
    if (formData.paymentMethod === 'Credit Card') {
      if (!formData.cardNumber.trim()) {
        setError('Please enter your card number.');
        return false;
      }
      if (!formData.cardExpiry.trim()) {
        setError('Please enter card expiry date (MM/YY).');
        return false;
      }
      if (!formData.cardCvc.trim()) {
        setError('Please enter card CVC/CVV.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const goToNextStep = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3 && validateStep3()) setCurrentStep(4);
  };

  const handlePlaceOrder = async () => {
    setError('');

    if (items.length === 0) {
      setError('Your shopping bag is empty.');
      return;
    }

    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim(),
        country: formData.country.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
        shippingAddress: formData.shippingAddress.trim(),
        apartment: formData.apartment.trim() || undefined,
        postalCode: formData.postalCode.trim(),
        paymentMethod: formData.paymentMethod,
        // Zero-trust items: sending only ID, volume, and quantity.
        // The server calculates price and checks stock from the database!
        items: items.map((i) => ({
          productId: i.productId,
          volume: i.volume,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // If online payment, verify with payment abstraction layer on server
      if (formData.paymentMethod !== 'Private Courier Cash' && data.paymentIntent?.transactionId) {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.order.id,
            transactionId: data.paymentIntent.transactionId,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.success || !verifyData.verified) {
          throw new Error(
            verifyData.error || 'Payment could not be verified by the gateway.'
          );
        }
      }

      // Order created and server-verified successfully
      clearCart();
      router.push(`/order-success/${data.order.orderNumber}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred during order dispatch.');
    } finally {
      setLoading(false);
    }
  };

  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  if (mounted && items.length === 0) {
    return (
      <div className="min-h-screen bg-noir-950 text-ivory-100 py-24 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md border border-white/10 p-8 sm:p-12 bg-noir-900/60 shadow-2xl">
          <div className="w-16 h-16 rounded-full border border-white/10 mx-auto flex items-center justify-center text-ivory-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-ivory-100">Your Bag is Empty</h1>
          <p className="text-xs text-ivory-400 font-light leading-relaxed">
            There are currently no items in your shopping bag. Explore our collection to add a flacon.
          </p>
          <Link
            href="/shop"
            className="inline-block w-full py-3.5 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-[0.22em] font-semibold transition-colors"
          >
            Shop Fragrances
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* ============================================================ */}
        {/* CHECKOUT HEADER & STEP INDICATOR */}
        {/* ============================================================ */}
        <div className="space-y-6 border-b border-white/10 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 block font-light">
                Maison Fragrea &bull; Secure Checkout
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif text-ivory-100 font-normal mt-1">
                CHECKOUT
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-ivory-400 font-light">
              <Lock className="w-3.5 h-3.5 text-gold-400" />
              <span>256-Bit Encrypted &bull; Server-Verified</span>
            </div>
          </div>

          {/* 4-Step Navigation Indicator */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 select-none">
            {[
              { step: 1, label: '1. CUSTOMER' },
              { step: 2, label: '2. SHIPPING' },
              { step: 3, label: '3. PAYMENT' },
              { step: 4, label: '4. REVIEW' },
            ].map(({ step, label }) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  if (step < currentStep) setCurrentStep(step as CheckoutStep);
                  else if (step === 2 && validateStep1()) setCurrentStep(2);
                  else if (step === 3 && validateStep1() && validateStep2()) setCurrentStep(3);
                  else if (step === 4 && validateStep1() && validateStep2() && validateStep3()) setCurrentStep(4);
                }}
                className={`py-2 text-left border-b-2 transition-all ${
                  currentStep === step
                    ? 'border-gold-400 text-gold-300'
                    : currentStep > step
                    ? 'border-emerald-500/60 text-emerald-400'
                    : 'border-white/10 text-ivory-500 hover:text-ivory-400'
                }`}
              >
                <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.16em] font-medium block truncate">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* CHECKOUT BODY: STEPS (LEFT) + STICKY SUMMARY (RIGHT) */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* ---------------------------------------------------------- */}
          {/* LEFT: STEP-BY-STEP FORM (7 COLUMNS) */}
          {/* ---------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-8">
            {/* STEP 1: CUSTOMER INFORMATION */}
            <div
              className={`p-6 sm:p-8 bg-noir-900/60 border transition-all ${
                currentStep === 1
                  ? 'border-gold-400/50 shadow-luxury'
                  : 'border-white/10 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h2 className="font-serif text-lg sm:text-xl text-ivory-100 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full border border-gold-400/40 text-gold-300 text-xs flex items-center justify-center font-mono">
                    1
                  </span>
                  CUSTOMER INFORMATION
                </h2>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[10px] uppercase tracking-widest text-gold-400 hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {currentStep === 1 ? (
                <div className="space-y-4 pt-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="e.g. Victoria Sterling"
                      className="w-full bg-noir-950 border border-white/15 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleChange}
                        placeholder="v.sterling@example.com"
                        className="w-full bg-noir-950 border border-white/15 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                        Telephone Number *
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleChange}
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-noir-950 border border-white/15 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Continue to Shipping</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 text-xs text-ivory-400 font-light space-y-1">
                  <p className="text-ivory-200 font-medium">{formData.customerName || '—'}</p>
                  <p>{formData.customerEmail} &bull; {formData.customerPhone}</p>
                </div>
              )}
            </div>

            {/* STEP 2: SHIPPING ADDRESS */}
            <div
              className={`p-6 sm:p-8 bg-noir-900/60 border transition-all ${
                currentStep === 2
                  ? 'border-gold-400/50 shadow-luxury'
                  : 'border-white/10 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h2 className="font-serif text-lg sm:text-xl text-ivory-100 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full border border-gold-400/40 text-gold-300 text-xs flex items-center justify-center font-mono">
                    2
                  </span>
                  SHIPPING ADDRESS
                </h2>
                {currentStep > 2 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[10px] uppercase tracking-widest text-gold-400 hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {currentStep === 2 ? (
                <div className="space-y-4 pt-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                      Country / Region *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full bg-noir-950 border border-white/15 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 cursor-pointer font-light"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="France">France</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="Switzerland">Switzerland</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleChange}
                      placeholder="e.g. 740 Park Avenue"
                      className="w-full bg-noir-950 border border-white/15 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                      Apartment, Suite, Unit (Optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                      placeholder="e.g. Penthouse B"
                      className="w-full bg-noir-950 border border-white/15 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="New York"
                        className="w-full bg-noir-950 border border-white/15 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="NY"
                        className="w-full bg-noir-950 border border-white/15 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                        Postal / ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="10021"
                        className="w-full bg-noir-950 border border-white/15 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3.5 border border-white/15 text-ivory-300 text-xs uppercase tracking-[0.2em] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="px-8 py-3.5 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : currentStep > 2 ? (
                <div className="pt-4 text-xs text-ivory-400 font-light space-y-1">
                  <p className="text-ivory-200 font-medium">
                    {formData.shippingAddress} {formData.apartment && `(${formData.apartment})`}
                  </p>
                  <p>
                    {formData.city}, {formData.state} {formData.postalCode}, {formData.country}
                  </p>
                </div>
              ) : null}
            </div>

            {/* STEP 3: PAYMENT */}
            <div
              className={`p-6 sm:p-8 bg-noir-900/60 border transition-all ${
                currentStep === 3
                  ? 'border-gold-400/50 shadow-luxury'
                  : 'border-white/10 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h2 className="font-serif text-lg sm:text-xl text-ivory-100 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full border border-gold-400/40 text-gold-300 text-xs flex items-center justify-center font-mono">
                    3
                  </span>
                  PAYMENT
                </h2>
                {currentStep > 3 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-[10px] uppercase tracking-widest text-gold-400 hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {currentStep === 3 ? (
                <div className="space-y-5 pt-6">
                  {/* Method Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'Credit Card' })}
                      className={`p-4 border text-left flex items-center justify-between transition-all ${
                        formData.paymentMethod === 'Credit Card'
                          ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                          : 'border-white/10 bg-noir-950 text-ivory-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-gold-400" />
                        <span className="text-xs uppercase tracking-wider font-medium">Credit Card</span>
                      </div>
                      <span className="text-[10px] text-ivory-500">Visa, MC, Amex</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, paymentMethod: 'Private Courier Cash' })
                      }
                      className={`p-4 border text-left flex items-center justify-between transition-all ${
                        formData.paymentMethod === 'Private Courier Cash'
                          ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                          : 'border-white/10 bg-noir-950 text-ivory-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="w-4 h-4 text-gold-400" />
                        <span className="text-xs uppercase tracking-wider font-medium">Courier COD</span>
                      </div>
                      <span className="text-[10px] text-ivory-500">Settled at Delivery</span>
                    </button>
                  </div>

                  {/* Card Form */}
                  {formData.paymentMethod === 'Credit Card' && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder="4000 1234 5678 9010"
                          maxLength={19}
                          className="w-full bg-noir-950 border border-white/15 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                            Expiry Date (MM/YY) *
                          </label>
                          <input
                            type="text"
                            name="cardExpiry"
                            value={formData.cardExpiry}
                            onChange={handleChange}
                            placeholder="12/28"
                            maxLength={5}
                            className="w-full bg-noir-950 border border-white/15 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                            CVC / Security Code *
                          </label>
                          <input
                            type="password"
                            name="cardCvc"
                            value={formData.cardCvc}
                            onChange={handleChange}
                            placeholder="888"
                            maxLength={4}
                            className="w-full bg-noir-950 border border-white/15 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3.5 border border-white/15 text-ivory-300 text-xs uppercase tracking-[0.2em] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="px-8 py-3.5 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Review Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : currentStep > 3 ? (
                <div className="pt-4 text-xs text-ivory-400 font-light">
                  <p className="text-ivory-200 font-medium">
                    {formData.paymentMethod}{' '}
                    {formData.paymentMethod === 'Credit Card' &&
                      formData.cardNumber &&
                      `ending in •••• ${formData.cardNumber.slice(-4)}`}
                  </p>
                </div>
              ) : null}
            </div>

            {/* STEP 4: ORDER REVIEW */}
            <div
              className={`p-6 sm:p-8 bg-noir-900/60 border transition-all ${
                currentStep === 4
                  ? 'border-gold-400/50 shadow-luxury'
                  : 'border-white/10 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h2 className="font-serif text-lg sm:text-xl text-ivory-100 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full border border-gold-400/40 text-gold-300 text-xs flex items-center justify-center font-mono">
                    4
                  </span>
                  ORDER REVIEW
                </h2>
              </div>

              {currentStep === 4 && (
                <div className="space-y-6 pt-6 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-noir-950/60 p-4 border border-white/10">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-gold-400 block mb-1">
                        Dispatch Destination
                      </span>
                      <p className="text-ivory-200 font-medium">{formData.customerName}</p>
                      <p className="text-ivory-400 font-light">{formData.shippingAddress}</p>
                      <p className="text-ivory-400 font-light">
                        {formData.city}, {formData.state} {formData.postalCode}
                      </p>
                      <p className="text-ivory-400 font-light">{formData.customerPhone}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-gold-400 block mb-1">
                        Payment &amp; Verification
                      </span>
                      <p className="text-ivory-200 font-medium">{formData.paymentMethod}</p>
                      <p className="text-ivory-400 font-light">{formData.customerEmail}</p>
                      <p className="text-ivory-400 font-light mt-2 flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready for final authentication</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-ivory-400 font-light leading-relaxed">
                    By clicking <strong className="text-ivory-200">PLACE ORDER</strong>, your order
                    will be transmitted for private vault preparation and dispatched with our
                    white-glove courier guarantee.
                  </p>

                  <div className="pt-2 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-3.5 border border-white/15 text-ivory-300 text-xs uppercase tracking-[0.2em] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 py-4 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-[0.25em] font-semibold transition-all shadow-luxury hover:shadow-gold-subtle disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 btn-luxury"
                    >
                      {loading ? (
                        <span>Processing Order...</span>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>PLACE ORDER • {formatCurrency(total || subtotal + shipping)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* RIGHT: STICKY ORDER SUMMARY ON DESKTOP (5 COLUMNS) */}
          {/* ---------------------------------------------------------- */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="p-6 sm:p-8 bg-noir-900/80 border border-white/10 shadow-2xl space-y-6">
              <h2 className="font-serif text-lg text-ivory-100 border-b border-white/10 pb-4 tracking-wide flex items-center justify-between">
                <span>ORDER SUMMARY</span>
                <span className="text-xs uppercase tracking-widest text-gold-400 font-sans font-light">
                  {totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'}
                </span>
              </h2>

              {/* Products List */}
              <div className="space-y-4 max-h-72 overflow-y-auto divide-y divide-white/5 pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.volume}`}
                    className="pt-4 first:pt-0 flex gap-3.5 items-center"
                  >
                    <div className="relative w-14 h-16 bg-noir-950 border border-white/10 shrink-0 overflow-hidden">
                      <Image
                        src={
                          item.productImage ||
                          'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'
                        }
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-ivory-100 truncate">
                        {item.productName}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-gold-400 mt-0.5">
                        {item.volume} &bull; Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-serif text-ivory-200 shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Summary Calculations */}
              <div className="space-y-2.5 border-t border-white/10 pt-4 text-xs">
                {/* Quantity */}
                <div className="flex justify-between text-ivory-400 font-light">
                  <span>Total Quantity</span>
                  <span className="text-ivory-200 font-medium">{totalItemCount}</span>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between text-ivory-400 font-light">
                  <span>Subtotal</span>
                  <span className="text-ivory-200 font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-ivory-400 font-light">
                  <span>Shipping</span>
                  <span className="text-gold-400 font-light uppercase tracking-wider text-[11px]">
                    {shipping === 0 ? 'Complimentary Courier' : formatCurrency(shipping)}
                  </span>
                </div>

                {/* Total */}
                <div className="flex justify-between text-sm sm:text-base text-ivory-100 font-serif pt-3 border-t border-white/10">
                  <span className="uppercase tracking-widest text-xs font-sans font-normal text-ivory-300">
                    Total
                  </span>
                  <span className="text-lg text-gold-300 font-medium">
                    {formatCurrency(total || subtotal + shipping)}
                  </span>
                </div>
              </div>

              {/* PRIMARY CTA: PLACE ORDER */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-[0.25em] font-semibold transition-all shadow-luxury hover:shadow-gold-subtle disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-luxury"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>PLACE ORDER</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[10px] text-ivory-500 font-light space-y-1">
                <p>Private courier tracking dispatched to your email.</p>
                <p>Two 2ml discovery vials included complimentary.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
