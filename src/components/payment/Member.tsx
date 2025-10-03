import { useUserSubscription } from "@/hooks/useUserSubscription";
import Image from "next/image";
import { useState } from "react";

interface BillingHistory {
    date: string;
    package: string;
    amount: string;
}

function Member() {
    const { subscription, loading, hasActiveSubscription } = useUserSubscription();
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Mock billing history - ในอนาคตจะดึงจาก API
    const billingHistory: BillingHistory[] = [
        { date: "01/08/2022", package: "Premium", amount: "THB 149.00" },
        { date: "01/07/2022", package: "Premium", amount: "THB 149.00" },
        { date: "01/06/2022", package: "Basic", amount: "THB 59.00" },
        { date: "01/05/2022", package: "Basic", amount: "THB 59.00" },
        { date: "01/04/2022", package: "Basic", amount: "THB 59.00" },
    ];

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const nextBillingDate = subscription?.current_period_end 
        ? formatDate(subscription.current_period_end)
        : "01/09/2022";

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-[#FCFCFE] min-h-screen py-12 px-4 sm:px-8 lg:px-24">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-[#7B4429] mb-2 tracking-wide">
                        MERRY MEMBERSHIP
                    </h2>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#A62D82]">
                        Manage your membership<br />and payment method
                    </h1>
                </div>

                {/* Merry Membership Package */}
                <div className="mb-10">
                    <h3 className="text-2xl font-semibold text-[#2A2E3F] mb-4">
                        Merry Membership Package
                    </h3>
                    
                    {hasActiveSubscription && subscription ? (
                        <div className="bg-gradient-to-r from-[#742138] to-[#A878BF] rounded-3xl shadow-lg p-6 sm:p-8 relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                {/* Package Info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Image 
                                            src="/assets/star.png" 
                                            alt="Package icon" 
                                            width={32} 
                                            height={32}
                                            className="object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-white mb-1">
                                            {subscription.package?.name || 'Premium'}
                                        </h4>
                                        <p className="text-white text-lg">
                                            THB {subscription.package?.price?.toFixed(2) || '0.00'} <span className="text-sm">/Month</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-row items-center gap-2">
                                    <Image src="/assets/checkbox-circle.png" alt="Feature" width={30} height={30} />
                                    <span className="text-white text-sm">Merry’ more than a daily limited</span>
                                </div>

                                {/* Features and Status */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                                    <div className="space-y-2">
                                        {subscription.package?.details?.slice(0, 2).map((detail, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Image 
                                                    src="/assets/checkbox-circle.png" 
                                                    alt="Check" 
                                                    width={18} 
                                                    height={18}
                                                />
                                                <span className="text-white text-sm">{detail}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-row sm:flex-col gap-3 sm:gap-2 items-center">
                                        <span className="bg-[#F3E4DD] text-[#B8653E] px-4 py-1.5 rounded-full text-sm font-semibold">
                                            Active
                                        </span>
                                        
                                    </div>
                                </div>
                            </div>

                            <div className="border-t-[1px] border-[#E4E6ED] mb-5 mt-5"></div>

                            <div className="flex flex-row sm:flex-col gap-3 sm:gap-2 justify-end items-end">
                                <button 
                                    onClick={() => setShowCancelModal(true)}
                                    className="text-white text-sm  hover:text-gray-200 transition-colors"
                                >
                                    Cancel Package
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8">
                            <p className="text-gray-600 text-center">
                                You don&apos;t have an active membership package.
                            </p>
                        </div>
                    )}
                </div>

                {/* Payment Method */}
                <div className="mb-10">
                    <h3 className="text-2xl font-semibold text-[#2A2E3F] mb-4">
                        Payment Method
                    </h3>
                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#F6F7FC] rounded-lg flex items-center justify-center">
                                    <Image 
                                        src="/assets/visa.png" 
                                        alt="Visa" 
                                        width={40} 
                                        height={40}
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Visa ending *9899</p>
                                    <p className="text-sm text-gray-500">Expire 04/2025</p>
                                </div>
                            </div>
                        </div>
                        <div className="border-t-[1px] border-[#E4E6ED] mb-5 mt-5"></div>
                        <div className="flex flex-row sm:flex-col gap-3 sm:gap-2 justify-end items-end">
                            <button className="text-[#C70039] font-semibold hover:text-[#A00030] transition-colors">
                                Edit Payment Method
                            </button>
                        </div>
                    </div>
                </div>

                {/* Billing History */}
                <div>
                    <h3 className="text-2xl font-semibold text-[#2A2E3F] mb-4">
                        Billing History
                    </h3>
                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                        <div className="mb-4 text-xl font-semibold text-[#646D89] border-b-1 pb-4 border-[#E4E6ED]">
                            Next billing: <span className="font-semibold text-[#646D89]">{nextBillingDate}</span>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <tbody className="">
                                    {billingHistory.map((item, index) => (
                                        <tr key={index} className="even:bg-[#F6F7FC] rounded-lg">
                                            <td className="py-4 px-2 text-[#646D89]">{item.date}</td>
                                            <td className="py-4 px-2 text-[#646D89]">{item.package}</td>
                                            <td className="py-4 px-2 text-right font-semibold text-[#191C77]">
                                                {item.amount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button className="text-[#C70039] font-semibold hover:text-[#A00030] transition-colors">
                                Request PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            Cancel Membership?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to cancel your membership? You will lose access to premium features at the end of your billing period.
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 button-ghost text-[#C70039] cursor-pointer"
                            >
                                Keep Membership
                            </button>
                            <button 
                                onClick={() => {
                                    // TODO: Implement cancel logic
                                    setShowCancelModal(false);
                                }}
                                className="flex-1 button-primary bg-[#C70039] cursor-pointer"
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Member;