import NavBarUsers from "@/components/NavBarUsers";
import Footer from "@/components/Footer";

export default function PackagePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <NavBarUsers />
            
            {/* Main Content */}
            <div className="container mx-auto px-4 py-40">
                {/* Header Section */}
                <div className="mb-12 ml-46">
                    <p className="text-sm text-[#7B4429] uppercase tracking-wider mb-2">MERRY MEMBERSHIP</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#A62D82] mb-4">
                        Be part of Merry Membership
                    </h1>
                    <h2 className="text-4xl md:text-5xl font-bold text-[#A62D82]">
                        to make more Merry!
                    </h2>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Basic Package */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 relative">
                        <div className="text-left mb-6">
                            <div className="w-12 h-12 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Basic</h3>
                            <p className="text-3xl font-bold text-gray-800">
                                THB 59.00 <span className="text-sm font-normal text-gray-500">/Month</span>
                            </p>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-pink-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">"Merry" more than a daily limited</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-pink-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Up to 25 Merry per day</span>
                            </div>
                        </div>
                        
                        <button className="w-full bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-6 rounded-full transition-colors">
                            Choose Package
                        </button>
                    </div>

                    {/* Platinum Package */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 relative">
                        <div className="text-left mb-6">
                            <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Platinum</h3>
                            <p className="text-3xl font-bold text-gray-800">
                                THB 89.00 <span className="text-sm font-normal text-gray-500">/Month</span>
                            </p>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-pink-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">"Merry" more than a daily limited</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-pink-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Up to 45 Merry per day</span>
                            </div>
                        </div>
                        
                        <button className="w-full bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-6 rounded-full transition-colors">
                            Choose Package
                        </button>
                    </div>

                    {/* Premium Package */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 relative">
                        <div className="text-left mb-6">
                            <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Premium</h3>
                            <p className="text-3xl font-bold text-gray-800">
                                THB 149.00 <span className="text-sm font-normal text-gray-500">/Month</span>
                            </p>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-pink-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">"Merry" more than a daily limited</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-pink-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Up to 70 Merry per day</span>
                            </div>
                        </div>
                        
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