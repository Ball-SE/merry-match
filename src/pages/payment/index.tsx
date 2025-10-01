import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useState } from "react";
import Image from "next/image";
import { BsBoxFill } from "react-icons/bs";
import { useAuth } from '@/hooks/useAuth';

function PaymentPage() {
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardOwner: '',
        expiryDate: '',
        cvc: ''
    });

    const { isLoggedIn } = useAuth('/login');

    if (isLoggedIn === null) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        return <div>Redirecting to login...</div>;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancel = () => {
        // Navigate back to package page
        window.history.back();
    };

    const handlePaymentConfirm = () => {
        // Handle payment confirmation
        console.log('Payment confirmed with data:', formData);
        // Here you would typically send the payment data to your backend
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            
            <div className="mx-auto px-4 py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Side - Package Details */}
                        <div className="bg-[#F6F7FC] rounded-3xl p-8 shadow-lg h-fit border-2 border-[#E4E6ED]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center justify-center">
                                    <BsBoxFill className="w-6 h-6 text-[#FFB1C8]" />
                                </div>
                                <h2 className="text-xl font-semibold text-[#646D89]">Merry Membership</h2>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-base font-regular text-[#646D89]">Package</span>
                                    <span className="text-xl font-semibold text-[#2A2E3F]">Premium</span>
                                </div>
                                
                                <div className="space-y-3 mb-6 bg-[#FFFFFF] rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <Image src="/assets/ellipse.png" alt="Feature" width={5} height={5} />
                                        <span className="text-[#424C6B] text-sm">&quot;Merry&quot; more than a daily limited</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Image src="/assets/ellipse.png" alt="Feature" width={5} height={5} />
                                        <span className="text-[#424C6B] text-sm">Up to 70 Merry per day</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-regular text-[#646D89]">Price (Monthly)</span>
                                        <span className="text-xl font-semibold text-[#200009]">THB 149.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Payment Form */}
                        <div className="bg-white rounded-3xl shadow-lg border-2 border-[#E4E6ED] overflow-hidden">
                            <div className="bg-[#F6F7FC] px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-[#646C80]">Credit Card</h3>
                                    <div className="flex gap-2">
                                        <Image src="/assets/visa.png" alt="Visa" width={40} height={28} className="object-contain" />
                                        <Image src="/assets/mastercard.png" alt="Mastercard" width={48} height={28} className="object-contain" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-8">

                            <form className="space-y-6">
                                {/* Card Number */}
                                <div>
                                    <label htmlFor="cardNumber" className="block text-base font-regular mb-2">
                                        Card number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="cardNumber"
                                        name="cardNumber"
                                        placeholder="Number of card"
                                        value={formData.cardNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-colors"
                                    />
                                </div>

                                {/* Card Owner */}
                                <div>
                                    <label htmlFor="cardOwner" className="block text-base font-regular mb-2">
                                        Card owner <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="cardOwner"
                                        name="cardOwner"
                                        placeholder="Holder of card"
                                        value={formData.cardOwner}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-colors"
                                    />
                                </div>

                                {/* Expiry Date and CVC */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="expiryDate" className="block text-base font-regular mb-2">
                                            Expiry date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="expiryDate"
                                            name="expiryDate"
                                            placeholder="MM/YY"
                                            value={formData.expiryDate}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="cvc" className="block text-base font-regular mb-2">
                                            CVC/CVV <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="cvc"
                                            name="cvc"
                                            placeholder="x x x"
                                            value={formData.cvc}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
                            </form>
                            </div>
                            
                            {/* Border line that spans full width */}
                            <div className="border-t border-gray-200"></div>
                            
                            <div className="p-8">
                                <div className="flex gap-4 justify-between">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="button-ghost text-[#C70039] hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handlePaymentConfirm}
                                        className="button-primary bg-[#C70039] hover:bg-[#A00030] transition-colors"
                                    >
                                        Payment Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default PaymentPage;