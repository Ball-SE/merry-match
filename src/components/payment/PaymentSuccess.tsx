import { useRouter } from "next/router";
import { BsBoxFill } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";
// import { supabase } from '@/lib/supabase/supabaseClient';
// import { useState, useEffect } from "react";

// interface SubscriptionData {
//     id: string;
//     user_id: string;
//     package_id: string;
//     stripe_subscription_id: string | null;
//     stripe_customer_id: string | null;
//     status: string;
//     current_period_start: string;
//     current_period_end: string;
//     cancel_at_period_end: boolean;
//     created_at: string;
// }

interface PaymentSuccessProps {
    packageName?: string;
    packagePrice?: number;
    packageCurrency?: string;
    packageInterval?: string;
    packageFeatures?: string[];
    startDate?: string;
    nextBilling?: string;
}

function PaymentSuccess(props: PaymentSuccessProps = {}) {
    const router = useRouter();
    // const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);

    // รับข้อมูลจาก props หรือ URL query parameters
    const {
        packageName: queryPackageName,
        packagePrice: queryPackagePrice,
        packageCurrency: queryPackageCurrency,
        packageInterval: queryPackageInterval,
        packageFeatures: queryPackageFeatures,
        startDate: queryStartDate,
        nextBilling: queryNextBilling
    } = router.query;

    // ใช้ข้อมูลจาก props ก่อน ถ้าไม่มีใช้จาก query parameters
    const packageName = props.packageName || (queryPackageName as string) || "Premium";
    const packagePrice = props.packagePrice || parseFloat(queryPackagePrice as string) || 149.00;
    const packageCurrency = props.packageCurrency || (queryPackageCurrency as string) || "THB";
    const packageInterval = props.packageInterval || (queryPackageInterval as string) || "month";
    const packageFeatures = props.packageFeatures || 
        (queryPackageFeatures ? JSON.parse(queryPackageFeatures as string) : [
            "Merry more than a daily limited",
            "Up to 50 Merry per day"
        ]);
    
    // สร้างวันที่อัตโนมัติถ้าไม่มีข้อมูล
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    const startDate = props.startDate || (queryStartDate as string) || today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
    
    const nextBilling = props.nextBilling || (queryNextBilling as string) || nextMonth.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        

    const handleBackToHome = () => {
        router.push('/');
    };

    const handleCheckMembership = () => {
        router.push('/package');
    };

     // ดึงข้อมูล subscription ล่าสุดจาก database
    //  useEffect(() => {
    //     const fetchLatestSubscription = async () => {
    //         const { data: { session } } = await supabase.auth.getSession();
    //         if (!session) return;

    //         const { data, error } = await supabase
    //             .from('subscriptions')
    //             .select('*')
    //             .eq('user_id', session.user.id)
    //             .order('created_at', { ascending: false })
    //             .limit(1)
    //             .single();

    //         if (data && !error) {
    //             setSubscriptionData(data);
    //         }
    //     };

    //     fetchLatestSubscription();
    // }, []);

    return (
        <div className=" bg-[#FCFCFE] py-8 sm:py-12 lg:py-20">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8 flex flex-row items-center justify-center">
                {/* Success Icon และ Message */}
                <div className={`max-w-3xl mb-8 sm:mb-12 transition-all duration-1000`}>
                    <div className="flex justify-left mb-4 sm:mb-6">
                        <div className="relative">
                                <FaCheckCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#EFC4E2]" />
                        </div>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-4">
                        <h1 className="text-2xl sm:text-lg font-SemiBold text-[#7B4429] mb-2">
                            PAYMENT SUCCESS
                        </h1>
                        <h2 className="text-xl sm:text-5xl font-ExtraBold text-[#A62D82] mb-2 sm:mb-4">
                            Welcome Merry Membership! Thank you for joining us
                        </h2>
                    </div>

                    {/* Action Buttons */}
                    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-left mt-8 sm:mt-12 px-4 transition-all duration-1000 delay-500`}>
                        <button
                            onClick={handleBackToHome}
                            className="button-ghost text-[#C70039] border-2 border-[#C70039] hover:bg-[#C70039] hover:text-white transition-all duration-300 w-full sm:w-auto sm:min-w-[160px] py-3 sm:py-2 cursor-pointer"
                        >
                            Back to Home
                        </button>
                        <button
                            onClick={handleCheckMembership}
                            className="button-primary bg-gradient-to-r from-[#C70039] to-[#FF1744] hover:from-[#A00030] hover:to-[#D01040] transition-all duration-300 w-full sm:w-auto sm:min-w-[160px] shadow-lg py-3 sm:py-2 cursor-pointer"
                        >
                            Check Membership
                        </button>
                    </div>
                </div>

                {/* Package Details Card */}
                <div className={`transition-all duration-1000 delay-300`}>
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-[#E4E6ED] overflow-hidden max-w-sm sm:max-w-md mx-auto">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#C70039] to-[#FF1744] px-6 sm:px-8 py-4 sm:py-6 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <BsBoxFill className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                <h3 className="text-lg sm:text-xl font-semibold">Merry Membership</h3>
                            </div>
                        </div>

                        {/* Package Info */}
                        <div className="p-6 sm:p-8">
                            <div className="text-center mb-6">
                                <div className="inline-block bg-gradient-to-r from-[#C70039] to-[#FF1744] text-white px-4 sm:px-6 py-2 rounded-full text-base sm:text-lg font-semibold mb-4">
                                    {packageName}
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-[#2A2E3F] mb-2">
                                    {packageCurrency} {(packagePrice / 100).toFixed(2)}
                                </div>
                                <div className="text-sm text-[#646C80]">
                                    /{packageInterval === 'month' ? 'Month' : packageInterval}
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-3 mb-6">
                                {packageFeatures.map((feature: string, index: number) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-[#C70039] rounded-full flex-shrink-0"></div>
                                        <span className="text-[#424C6B] text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Billing Info */}
                            <div className="border-t border-gray-200 pt-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-[#646C80]">Start Membership</span>
                                    <span className="text-sm font-semibold text-[#2A2E3F]">{startDate}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-[#646C80]">Next billing</span>
                                    <span className="text-sm font-semibold text-[#2A2E3F]">{nextBilling}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                

                
            </div>
        </div>
    );
}

export default PaymentSuccess;
