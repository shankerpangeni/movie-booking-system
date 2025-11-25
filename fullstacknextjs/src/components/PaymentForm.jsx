"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";

export default function PaymentForm({ onSuccess, amount }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: "if_required",
            });

            if (error) {
                toast.error(error.message);
                setLoading(false);
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                toast.success("Payment successful!");
                onSuccess(paymentIntent.id);
            }
        } catch (err) {
            toast.error("Payment failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-white">Payment Details</h3>
                <div className="mb-4 text-gray-300">
                    <span className="text-sm">Total Amount:</span>
                    <div className="text-3xl font-bold text-red-500">${amount}</div>
                </div>
                <PaymentElement />
            </div>

            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Processing..." : `Pay $${amount}`}
            </button>

            <p className="text-xs text-gray-500 text-center">
                Your payment is secured by Stripe. Test card: 4242 4242 4242 4242
            </p>
        </form>
    );
}
