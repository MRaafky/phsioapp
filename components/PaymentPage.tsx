import React, { useState } from 'react';

interface PaymentPageProps {
    onBack: () => void;
    onPaymentSuccess: () => void;
}

interface PricingPlan {
    id: string;
    name: string;
    price: number;
    duration: string;
    features: string[];
    popular?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
    {
        id: 'monthly',
        name: 'Monthly',
        price: 99000,
        duration: '/ month',
        features: [
            'Posture IQ Analysis',
            'TelePhysio Consultations',
            'Priority Support',
            'Advanced Exercise Plans',
            'Progress Analytics',
        ],
    },
    {
        id: 'quarterly',
        name: 'Quarterly',
        price: 249000,
        duration: '/ 3 months',
        features: [
            'Posture IQ Analysis',
            'TelePhysio Consultations',
            'Priority Support',
            'Advanced Exercise Plans',
            'Progress Analytics',
            '15% Savings',
        ],
        popular: true,
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: 799000,
        duration: '/ year',
        features: [
            'Posture IQ Analysis',
            'TelePhysio Consultations',
            'Priority Support',
            'Advanced Exercise Plans',
            'Progress Analytics',
            '33% Savings',
            'Exclusive Content',
        ],
    },
];

const PaymentPage: React.FC<PaymentPageProps> = ({ onBack, onPaymentSuccess }) => {
    const [selectedPlan, setSelectedPlan] = useState<string>('quarterly');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'creditcard' | 'gopay' | 'bank_transfer' | 'qris'>('creditcard');

    const handlePayment = async () => {
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            // In a real application, you would integrate with Midtrans or other payment gateway
            // For now, we'll just simulate a successful payment
            setIsProcessing(false);

            // Show success message
            alert('Payment successful! Welcome to Premium!');

            // Call the success callback
            onPaymentSuccess();
        }, 2000);
    };

    const selectedPlanData = PRICING_PLANS.find(p => p.id === selectedPlan);
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                    >
                        <i className="fas fa-arrow-left"></i>
                        <span>Back to Dashboard</span>
                    </button>

                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 mb-4 ring-4 ring-amber-200/50 shadow-lg">
                        <i className="fas fa-crown text-3xl text-white"></i>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                        Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500">Premium</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Unlock all premium features and take your physiotherapy journey to the next level
                    </p>
                </div>

                {/* Pricing Plans */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {PRICING_PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 ${selectedPlan === plan.id
                                    ? 'ring-4 ring-amber-400 shadow-2xl transform scale-105'
                                    : 'border-2 border-slate-200 hover:border-amber-300 hover:shadow-lg'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        MOST POPULAR
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-extrabold text-slate-900">
                                        {formatPrice(plan.price)}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm">{plan.duration}</p>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                                        <i className="fas fa-check-circle text-emerald-500 mt-0.5 flex-shrink-0"></i>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {selectedPlan === plan.id && (
                                <div className="absolute inset-0 ring-4 ring-amber-400 rounded-2xl pointer-events-none"></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Payment Method Selection */}
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Payment Method</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <button
                            onClick={() => setPaymentMethod('creditcard')}
                            className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'creditcard'
                                    ? 'border-amber-400 bg-amber-50'
                                    : 'border-slate-200 hover:border-amber-300'
                                }`}
                        >
                            <i className="fas fa-credit-card text-3xl mb-2 text-slate-700"></i>
                            <p className="text-xs font-semibold text-slate-700">Credit Card</p>
                        </button>

                        <button
                            onClick={() => setPaymentMethod('gopay')}
                            className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'gopay'
                                    ? 'border-amber-400 bg-amber-50'
                                    : 'border-slate-200 hover:border-amber-300'
                                }`}
                        >
                            <i className="fas fa-wallet text-3xl mb-2 text-slate-700"></i>
                            <p className="text-xs font-semibold text-slate-700">GoPay</p>
                        </button>

                        <button
                            onClick={() => setPaymentMethod('bank_transfer')}
                            className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'bank_transfer'
                                    ? 'border-amber-400 bg-amber-50'
                                    : 'border-slate-200 hover:border-amber-300'
                                }`}
                        >
                            <i className="fas fa-university text-3xl mb-2 text-slate-700"></i>
                            <p className="text-xs font-semibold text-slate-700">Bank Transfer</p>
                        </button>

                        <button
                            onClick={() => setPaymentMethod('qris')}
                            className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'qris'
                                    ? 'border-amber-400 bg-amber-50'
                                    : 'border-slate-200 hover:border-amber-300'
                                }`}
                        >
                            <i className="fas fa-qrcode text-3xl mb-2 text-slate-700"></i>
                            <p className="text-xs font-semibold text-slate-700">QRIS</p>
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-slate-50 rounded-xl p-6 mb-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Order Summary</h3>
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-600">Plan:</span>
                            <span className="font-semibold text-slate-900">{selectedPlanData?.name}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-600">Payment Method:</span>
                            <span className="font-semibold text-slate-900 capitalize">{paymentMethod.replace('_', ' ')}</span>
                        </div>
                        <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between">
                            <span className="font-bold text-slate-900">Total:</span>
                            <span className="font-bold text-2xl text-amber-600">
                                {selectedPlanData && formatPrice(selectedPlanData.price)}
                            </span>
                        </div>
                    </div>

                    {/* Payment Button */}
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                <i className="fas fa-spinner fa-spin"></i>
                                Processing Payment...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <i className="fas fa-lock"></i>
                                Proceed to Payment
                            </span>
                        )}
                    </button>

                    <p className="text-center text-xs text-slate-500 mt-4">
                        <i className="fas fa-shield-alt mr-1"></i>
                        Secure payment powered by Midtrans
                    </p>
                </div>

                {/* Trust Badges */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-slate-500 mb-4">Trusted by thousands of users</p>
                    <div className="flex justify-center gap-6 flex-wrap">
                        <div className="flex items-center gap-2 text-slate-400">
                            <i className="fas fa-shield-alt text-xl"></i>
                            <span className="text-sm">Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <i className="fas fa-lock text-xl"></i>
                            <span className="text-sm">SSL Encrypted</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <i className="fas fa-check-circle text-xl"></i>
                            <span className="text-sm">Money-back Guarantee</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
