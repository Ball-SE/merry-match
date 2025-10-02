import Image from "next/image";
import { BsBoxFill } from "react-icons/bs";

interface PackageDetailsCardProps {
    packageName?: string;
    features?: string[];
    price?: number;
    currency?: string;
    interval?: string;
}

function PackageDetailsCard({ 
    packageName = "Package Name", 
    features = [],
    price = 0,
    currency = "THB",
    interval = "month"
}: PackageDetailsCardProps) {
    return (
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
                    <span className="text-xl font-semibold text-[#2A2E3F]">{packageName}</span>
                </div>
                
                <div className="space-y-3 mb-6 bg-[#FFFFFF] rounded-lg p-4">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Image src="/assets/ellipse.png" alt="Feature" width={5} height={5} />
                            <span className="text-[#424C6B] text-sm">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-base font-regular text-[#646D89]">
                            Price ({interval === 'month' ? 'Monthly' : interval})
                        </span>
                        <span className="text-xl font-semibold text-[#200009]">
                            {currency} {(price / 100).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PackageDetailsCard;