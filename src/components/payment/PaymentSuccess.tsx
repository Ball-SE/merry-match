import { useRouter } from "next/router";
import { FaCheckCircle } from "react-icons/fa";
import Image from "next/image";

interface PaymentSuccessProps {
    packageName?: string;
    packagePrice?: number;
    packageCurrency?: string;
    packageInterval?: string;
    packageFeatures?: string[];
    packageIcon?: string;
    startDate?: string;
    nextBilling?: string;
}

const renderIcon = (icon: string) => {
    // ถ้าไม่มี icon หรือเป็นค่าว่าง ให้ใช้ default icon
    if (!icon) {
        return (
            <Image 
                src="/assets/star.png"
                alt="Package icon"
                width={32}
                height={32}
                className="object-contain"
            />
        );
    }

    return (
        <Image 
            src={icon}
            alt="Package icon"
            width={32}
            height={32}
            className="object-contain"
            onError={(e) => {
                // ถ้าโหลดรูปไม่ได้ ให้ใช้ default icon
                const target = e.target as HTMLImageElement;
                target.src = '/assets/star.png';
            }}
        />
    );
};

function PaymentSuccess(props: PaymentSuccessProps = {}) {
    const router = useRouter();

    // รับข้อมูลจาก props หรือ URL query parameters
    const {
        packageName: queryPackageName,
        packagePrice: queryPackagePrice,
        packageCurrency: queryPackageCurrency,
        packageInterval: queryPackageInterval,
        packageFeatures: queryPackageFeatures,
        packageIcon: queryPackageIcon,
        startDate: queryStartDate,
        nextBilling: queryNextBilling
    } = router.query;

    // ใช้ข้อมูลจาก props ก่อน ถ้าไม่มีใช้จาก query parameters
    const packageName = props.packageName || (queryPackageName as string) || "Premium";
    const packagePrice = props.packagePrice || parseFloat(queryPackagePrice as string) || 149.00;
    const packageCurrency = props.packageCurrency || (queryPackageCurrency as string) || "THB";
    const packageInterval = props.packageInterval || (queryPackageInterval as string) || "month";
    const packageIcon = props.packageIcon || (queryPackageIcon as string) || "";
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
        router.push('/member');
    };

    return (
        <div className="bg-[#FCFCFE] py-8 sm:py-12 lg:py-20 ">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-center gap-8 lg:gap-12 max-w-7xl">
                {/* Success Icon และ Message */}
                <div className={`w-full lg:max-w-2xl order-1 lg:order-1`}>
                    <div className="flex justify-start mb-4 sm:mb-6">
                        <div className="relative">
                            <FaCheckCircle className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-[#EFC4E2]" />
                        </div>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                        <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-[#7B4429]">
                            PAYMENT SUCCESS
                        </h1>
                        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-[#A62D82] leading-tight">
                            Welcome Merry Membership! Thank you for joining us
                        </h2>
                    </div>

                    {/* Action Buttons - Desktop only */}
                    <div className="hidden lg:flex flex-row gap-3 sm:gap-4">
                        <button
                            onClick={handleBackToHome}
                            className="button-ghost text-[#95002B] bg-[#FFE1EA] w-full sm:w-auto sm:min-w-[160px] py-3 px-6 cursor-pointer rounded-full font-bold hover:bg-[#FFD1DD] transition-colors"
                        >
                            Back to Home
                        </button>
                        <button
                            onClick={handleCheckMembership}
                            className="button-primary bg-[#C70039] text-white w-full sm:w-auto sm:min-w-[160px] py-3 px-6 cursor-pointer rounded-full font-bold hover:bg-[#A0002E] transition-colors"
                        >
                            Check Membership
                        </button>
                    </div>
                </div>

                {/* Package Details Card */}
                <div className={`w-full lg:w-auto order-2 lg:order-2`}>
                    <div className="bg-gradient-to-r from-[#742138] to-[#A878BF] rounded-2xl sm:rounded-3xl shadow-xl border-2 border-[#E4E6ED] overflow-hidden max-w-sm mx-auto lg:mx-0">
                        {/* Package Info */}
                        <div className="p-6 sm:p-8">
                            {/* Icon */}
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mb-4 bg-[#F6F7FC] rounded-xl flex items-center justify-center">
                                {renderIcon(packageIcon)}
                            </div>

                            <div className="text-left mb-6">
                                <h3 className="text-white text-2xl sm:text-[32px] font-bold mb-2">
                                    {packageName}
                                </h3>
                                <div className="text-lg sm:text-xl font-semibold text-[#F4EBF2]">
                                    {packageCurrency} {packagePrice.toFixed(2)}
                                    <span className="text-sm sm:text-base font-normal text-[#F4EBF2]">
                                        /{packageInterval === 'month' ? 'Month' : packageInterval}
                                    </span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-3 mb-6">
                                {packageFeatures.map((feature: string, index: number) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <Image src="/assets/checkbox-circle.png" alt="Feature" width={20} height={20} className="mt-0.5 flex-shrink-0"/>
                                        <span className="text-[#F4EBF2] text-sm sm:text-base">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Billing Info */}
                            <div className="border-t border-white/30 pt-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs sm:text-sm text-[#F4EBF2]">Start Membership</span>
                                    <span className="text-xs sm:text-sm font-semibold text-[#FFFFFF]">{startDate}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs sm:text-sm text-[#F4EBF2]">Next billing</span>
                                    <span className="text-xs sm:text-sm font-semibold text-[#FFFFFF]">{nextBilling}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Mobile only (below card) */}
                <div className="flex lg:hidden flex-row gap-3 w-full order-3 lg:order-3">
                    <button
                        onClick={handleBackToHome}
                        className="button-ghost text-[#95002B] bg-[#FFE1EA] flex-1 py-3 px-6 cursor-pointer rounded-full font-bold hover:bg-[#FFD1DD] transition-colors"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={handleCheckMembership}
                        className="button-primary bg-[#C70039] text-white flex-1 py-3 px-6 cursor-pointer rounded-full font-bold hover:bg-[#A0002E] transition-colors"
                    >
                        Check Membership
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccess;
