import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function PackagePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            
            {/* Main Content */}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-10">
                    {/* Basic Package */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 relative">
                        <div className="text-left mb-6">
                            <div className="w-16 h-16 mb-4 bg-[#F6F7FC] rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-4xl font-bold text-[#411032] mb-2">Basic</h3>
                            <p className="text-xl font-bold text-[#2A2E3F]">
                                THB 59.00 <span className="text-base font-regular text-[#9AA1B9]">/Month</span>
                            </p>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-2">
                                <Image src="/assets/checkbox-circle.png" alt="Basic" width={30} height={30} />
                                <span className="text-gray-700">&quot;Merry&quot; more than a daily limited</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Image src="/assets/checkbox-circle.png" alt="Basic" width={30} height={30} />
                                <span className="text-gray-700">Up to 25 Merry per day</span>
                            </div>
                        </div>

                        <div className="border-t-[1px] border-[#E4E6ED] mt-5 mb-5"></div>
                        
                        <button className="w-full bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-6 rounded-full transition-colors">
                            Choose Package
                        </button>
                    </div>

                    {/* Platinum Package */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 relative">
                        <div className="text-left mb-6">
                            <div className="w-16 h-16 mb-4 bg-[#F6F7FC] rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <h3 className="text-4xl font-bold text-[#411032] mb-2">Platinum</h3>
                            <p className="text-xl font-bold text-[#2A2E3F]">
                                THB 89.00 <span className="text-base font-regular text-[#9AA1B9]">/Month</span>
                            </p>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-2">
                                <Image src="/assets/checkbox-circle.png" alt="Basic" width={30} height={30} />
                                <span className="text-gray-700">&quot;Merry&quot; more than a daily limited</span>
                            </div>
                            <div className="flex items-center gap-2">
                            <Image src="/assets/checkbox-circle.png" alt="Basic" width={30} height={30} />
                                <span className="text-gray-700">Up to 45 Merry per day</span>
                            </div>
                        </div>
                        
                        <div className="border-t-[1px] border-[#E4E6ED] mt-5 mb-5"></div>

                        <button className="w-full bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-6 rounded-full transition-colors">
                            Choose Package
                        </button>
                    </div>

                    {/* Premium Package */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 relative">
                        <div className="text-left mb-6">
                            <div className="w-16 h-16 mb-4 bg-[#F6F7FC] rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <h3 className="text-4xl font-bold text-[#411032] mb-2">Premium</h3>
                            <p className="text-xl font-bold text-[#2A2E3F]">
                                THB 149.00 <span className="text-base font-regular text-[#9AA1B9]">/Month</span>
                            </p>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-2">
                            <Image src="/assets/checkbox-circle.png" alt="Basic" width={30} height={30} />
                                <span className="text-gray-700">&quot;Merry&quot; more than a daily limited</span>
                            </div>
                            <div className="flex items-center gap-2">
                            <Image src="/assets/checkbox-circle.png" alt="Basic" width={30} height={30} />
                                <span className="text-gray-700">Up to 70 Merry per day</span>
                            </div>
                        </div>

                        <div className="border-t-[1px] border-[#E4E6ED] mt-5 mb-5"></div>
                        
                        <button className="w-full bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-6 rounded-full transition-colors">
                            Choose Package
                        </button>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    )
}