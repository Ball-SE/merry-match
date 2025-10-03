import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import { usePackages } from '@/hooks/usePackages';

// แสดง icon จาก database โดยตรง
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

export default function Package() {
    const router = useRouter();
    const { packages, loading, error } = usePackages();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(3);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // เรียง packages ตามราคาจากน้อยไปมาก
    const sortedPackages = packages.sort((a, b) => a.price - b.price);
    
    // จำนวนการ์ดที่จะแสดงในแต่ละหน้าจอ
    const getCardsPerView = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 1024) return 3; // lg และขึ้นไป
            if (window.innerWidth >= 768) return 2;  // md
            return 1; // sm และลงมา
        }
        return 3;
    };

    // อัปเดตจำนวนการ์ดเมื่อขนาดหน้าจอเปลี่ยน
    useEffect(() => {
        const handleResize = () => {
            const newCardsPerView = getCardsPerView();
            setCardsPerView(newCardsPerView);
            setCurrentIndex(0); // รีเซ็ต index เมื่อขนาดหน้าจอเปลี่ยน
        };

        handleResize(); // เรียกครั้งแรกเมื่อ component mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const totalSlides = Math.max(0, sortedPackages.length - cardsPerView + 1);
    const showArrows = packages.length > cardsPerView;
    const isMobile = cardsPerView === 1; // ตรวจสอบว่าเป็น mobile หรือไม่

    const scrollToIndex = (index: number) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = container.scrollWidth / sortedPackages.length;
            container.scrollTo({
                left: cardWidth * index,
                behavior: 'smooth'
            });
        }
    };

    const handlePrevious = () => {
        const newIndex = Math.max(0, currentIndex - 1);
        setCurrentIndex(newIndex);
        scrollToIndex(newIndex);
    };

    const handleNext = () => {
        const newIndex = Math.min(totalSlides - 1, currentIndex + 1);
        setCurrentIndex(newIndex);
        scrollToIndex(newIndex);
    };

    const handleChoosePackage = (pkg: typeof packages[number]) => {
        // ส่งข้อมูล package ผ่าน query parameters
        router.push({
            pathname: '/payment',
            query: {
                packageId: pkg.id,
                packageName: pkg.name,
                packagePrice: pkg.price,
                packageCurrency: pkg.currency,
                packageInterval: pkg.billing_interval,
                packageDetails: JSON.stringify(pkg.details),
                packageIcon: pkg.icon
            }
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading packages: {error}</div>;
    }
    
    return (
        <div className=" mx-auto px-4 py-10">
            {/* Header Section */}
            <div className="sm:mb-12 sm:ml-46 mb-10">
                <p className="text-sm text-[#7B4429] uppercase tracking-wider mb-2">MERRY MEMBERSHIP</p>
                <h1 className="hidden sm:block text-4xl md:text-5xl font-bold text-[#A62D82] mb-4">
                    Be part of Merry Membership
                </h1>
                <h2 className="hidden sm:block text-4xl md:text-5xl font-bold text-[#A62D82]">
                    to make more Merry!
                </h2>
                <h3 className="sm:hidden text-4xl md:text-5xl font-bold text-[#A62D82]">
                    Join us and start matching 
                </h3>
            </div>

            {/* Pricing Cards */}
            {isMobile ? (
                // Mobile Layout - Grid แบบเดิม
                <div className="grid grid-cols-1 gap-8 max-w-7xl mx-auto mb-10">
                    {sortedPackages.map((pkg) => (
                        <div key={pkg.id} className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 relative flex flex-col">
                        <div className="text-left mb-6">
                            <div className="w-16 h-16 mb-4 bg-[#F6F7FC] rounded-xl flex items-center justify-center">
                                {renderIcon(pkg.icon)}
                            </div>
                            <h3 className="text-4xl font-bold text-[#411032] mb-2">{pkg.name}</h3>
                            <p className="text-xl font-bold text-[#2A2E3F]">
                                {pkg.currency} {pkg.price.toFixed(2)} 
                                <span className="text-base font-regular text-[#9AA1B9]">
                                    /{pkg.billing_interval}
                                </span>
                            </p>
                        </div>
                        
                        <div className="space-y-4 mb-8 flex-grow">
                            {pkg.details.map((detail, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Image src="/assets/checkbox-circle.png" alt="Feature" width={30} height={30} />
                                    <span className="text-gray-700">{detail}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto">
                            <div className="border-t-[1px] border-[#E4E6ED] mb-5"></div>
                            
                            <button 
                                onClick={() => handleChoosePackage(pkg)}
                                className="w-full bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-6 rounded-full transition-colors cursor-pointer">
                                Choose Package
                            </button>
                        </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Desktop/Tablet Layout - Carousel
                <div className="relative max-w-[1400px] mx-auto mb-10 px-4">
                    {/* Left Arrow */}
                    {showArrows && (
                        <button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all ${
                                currentIndex === 0 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-gray-50 hover:shadow-xl'
                            }`}
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {/* Right Arrow */}
                    {showArrows && (
                        <button
                            onClick={handleNext}
                            disabled={currentIndex >= totalSlides - 1}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all ${
                                currentIndex >= totalSlides - 1 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-gray-50 hover:shadow-xl'
                            }`}
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    {/* Cards Container */}
                    <div 
                        ref={scrollContainerRef}
                        className={`overflow-hidden ${showArrows ? 'mx-16' : 'mx-4'}`}
                    >
                        <div className="flex gap-4 transition-transform duration-300 ease-in-out">
                            {sortedPackages.map((pkg) => (
                                <div key={pkg.id} className="bg-white rounded-3xl p-6 border-2 border-gray-100 relative flex-shrink-0 w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] flex flex-col">
                                    <div className="text-left mb-6">
                                        <div className="w-16 h-16 mb-4 bg-[#F6F7FC] rounded-xl flex items-center justify-center">
                                            {renderIcon(pkg.icon)}
                                        </div>
                                        <h3 className="text-4xl font-bold text-[#411032] mb-2">{pkg.name}</h3>
                                        <p className="text-xl font-bold text-[#2A2E3F]">
                                            {pkg.currency} {pkg.price.toFixed(2)} 
                                            <span className="text-base font-regular text-[#9AA1B9]">
                                                /{pkg.billing_interval}
                                            </span>
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-4 mb-8 flex-grow">
                                        {pkg.details.map((detail, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Image src="/assets/checkbox-circle.png" alt="Feature" width={30} height={30} />
                                                <span className="text-gray-700">{detail}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-auto">
                                        <div className="border-t-[1px] border-[#E4E6ED] mb-5"></div>
                                        
                                        <button 
                                            onClick={() => handleChoosePackage(pkg)}
                                            className="w-full bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-6 rounded-full transition-colors cursor-pointer">
                                            Choose Package
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}