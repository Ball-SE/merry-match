import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PackageDetailsCard from "./PackageDetailsCard";
import { supabase } from '@/lib/supabase/supabaseClient';
import Image from "next/image";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// PaymentForm component ที่ใช้ PaymentElement
function PaymentForm() {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [cardOwnerName, setCardOwnerName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // รับข้อมูล package จาก query parameters
    const {
        packageId,
        packageName,
        packagePrice,
        packageCurrency,
        packageInterval,
        packageDetails
    } = router.query;

    const features = packageDetails ? JSON.parse(packageDetails as string) : [];
    const price = packagePrice ? parseFloat(packagePrice as string) : 0;

    // สร้าง Payment Intent เมื่อ component load
    useEffect(() => {
        if (price > 0 && packageId) {
            createPaymentIntent();
        }
    }, [price, packageId]);

    const createPaymentIntent = async () => {
        try {
            const response = await fetch('/api/stripe/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: price,
                    currency: packageCurrency || 'thb',
                    packageId: packageId
                }),
            });

            const data = await response.json();
            setClientSecret(data.clientSecret);
        } catch (error) {
            console.error('Error creating payment intent:', error);
        }
    };

    const handleCancel = () => {
        window.history.back();
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ป้องกันการ submit หลายครั้ง
        if (isProcessing || loading) {
            return;
        }
        
        if (!stripe || !elements || !clientSecret) {
            alert('Payment not ready. Please try again.');
            return;
        }

        if (!cardOwnerName.trim()) {
            alert('Please enter card owner name.');
            return;
        }


        setLoading(true);
        setIsProcessing(true); // ป้องกันการกดซ้ำ

        try {
            // ใช้ confirmPayment แทน confirmCardPayment
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment/success`,
                    payment_method_data: {
                        billing_details: {
                            name: cardOwnerName, // ส่งชื่อเจ้าของบัตรไปด้วย
                            address: {
                                country: 'TH', // เพิ่มบรรทัดนี้
                                postal_code: '10110'
                            }
                        }
                    }
                },
                redirect: 'if_required', // ไม่ redirect ถ้าไม่จำเป็น
            });

            if (error) {
                console.error('Payment failed:', error);
                alert('Payment failed: ' + error.message);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log('Payment succeeded!', paymentIntent);
                await saveSubscription(paymentIntent.id);
                router.push({
                    pathname: '/payment/success',
                    query: {
                        packageName: packageName,
                        packagePrice: packagePrice,
                        packageCurrency: packageCurrency,
                        packageInterval: packageInterval,
                        packageFeatures: JSON.stringify(features)
                    }
                });
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setLoading(false);
            setIsProcessing(false); // รีเซ็ต state
        }
    };

    const saveSubscription = async (paymentIntentId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('No session found');
            }

            const response = await fetch('/api/subscriptions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    packageId: packageId,
                    paymentIntentId: paymentIntentId,
                    amount: price,
                    currency: packageCurrency || 'thb'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription');
            }
        } catch (error) {
            console.error('Error saving subscription:', error);
        }
    };

    return (
        <div className="mx-auto px-4 py-20">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PackageDetailsCard 
                        packageName={packageName as string}
                        features={features}
                        price={price}
                        currency={packageCurrency as string}
                        interval={packageInterval as string}
                    />

                    <div className="bg-white rounded-3xl shadow-lg border-2 border-[#E4E6ED] overflow-hidden">
                        <div className="bg-[#F6F7FC] px-8 py-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-[#646C80]">Credit Card</h3>
                                <div className="flex items-center gap-2">
                                    <Image src="/assets/visa.png" alt="Credit Card" width={40} height={40} />
                                    <Image src="/assets/mastercard.png" alt="Credit Card" width={40} height={40} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-8">
                            <form className="space-y-6" onSubmit={handlePaymentSubmit}>

                                {/* PaymentElement */}
                                {clientSecret && (
                                    <div>
                                        <label className="block text-base font-regular mb-2">
                                            Payment Information <span className="text-red-500">*</span>
                                        </label>
                                        <div className="border border-gray-300 rounded-lg p-4 space-y-4">

                                            {/* Card Owner Name Input - ย้ายมาอยู่ใน div เดียวกัน */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Card Owner <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={cardOwnerName}
                                                    onChange={(e) => setCardOwnerName(e.target.value)}
                                                    placeholder="Holder of Card"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C70039] focus:border-transparent"
                                                    required
                                                />
                                            </div>

                                        <PaymentElement
                                                options={{
                                                    layout: 'tabs',
                                                    fields: {
                                                        billingDetails: {
                                                            name: 'never', // ซ่อนชื่อใน PaymentElement เพราะเราใช้ input แยก
                                                            address: {
                                                                country: 'never',
                                                                postalCode: 'never'
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-gray-200 -mx-8 my-8"></div>
                                
                                <div className="flex gap-4 justify-between">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="button-ghost text-[#C70039] hover:bg-gray-50 transition-colors cursor-pointer"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="button-primary bg-[#C70039] hover:bg-[#A00030] transition-colors disabled:opacity-50"
                                        disabled={loading || !clientSecret || !stripe || isProcessing}
                                    >
                                        {loading || isProcessing ? 'Processing...' : 'Payment Confirm'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main Payment component
function Payment() {
    const router = useRouter();
    const [clientSecret, setClientSecret] = useState('');

    const { packageId, packagePrice, packageCurrency } = router.query;
    const price = packagePrice ? parseFloat(packagePrice as string) : 0;

    useEffect(() => {
        if (price > 0 && packageId && !clientSecret) {
            createPaymentIntent();
        }
    }, [price, packageId, clientSecret]);

    const createPaymentIntent = async () => {
        try {
            // เพิ่ม idempotency key
            const idempotencyKey = `${packageId}-${Date.now()}`;

            const response = await fetch('/api/stripe/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Idempotency-Key': idempotencyKey,
                },
                body: JSON.stringify({
                    amount: price,
                    currency: packageCurrency || 'thb',
                    packageId: packageId
                }),
            });

            const data = await response.json();
            setClientSecret(data.clientSecret);
        } catch (error) {
            console.error('Error creating payment intent:', error);
        }
    };

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#C70039',
            },
        },
        paymentMethodCreation: 'manual', // ควบคุมการสร้าง payment method
        defaultValues: {
            billingDetails: {
                address: {
                    country: 'TH' // กำหนดค่าเริ่มต้นเป็นไทย
                }
            }
        }
    };

    return (
        <div>
            {clientSecret && (
                <Elements stripe={stripePromise} options={options}>
                    <PaymentForm />
                </Elements>
            )}
        </div>
    );
}

export default Payment;