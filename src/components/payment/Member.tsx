import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useBillingHistory } from "@/hooks/useBillingHistory";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { IoCloseCircleOutline } from "react-icons/io5";

function Member() {
    const { subscription, loading: subLoading, hasActiveSubscription, refetch: refetchSubscription } = useUserSubscription();
    const { billingHistory, loading: historyLoading } = useBillingHistory();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const nextBillingDate = subscription?.current_period_end 
        ? formatDate(subscription.current_period_end)
        : "-";

        const handleRequestPDF = async (subscriptionId: number) => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.access_token) {
                    throw new Error('Not authenticated');
                }
        
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent);
                const url = `/api/receipt-pdf?token=${encodeURIComponent(session.access_token)}&subscriptionId=${subscriptionId}&mobile=${isMobile}`;
                
                if (isMobile) {
                    // สำหรับ mobile: ใช้ fetch แล้วเปิด blob URL
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error(`Failed to generate PDF: ${response.statusText}`);
                    }
                    
                    const blob = await response.blob();
                    const pdfUrl = URL.createObjectURL(blob);
                    
                    // เปิดใน new tab โดยไม่ใช้ window.open()
                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // ล้าง URL หลังจากใช้
                    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
                    
                } else {
                    // สำหรับ desktop: ดาวน์โหลดไฟล์
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error(`Failed to generate PDF: ${response.statusText}`);
                    }
                    
                    const blob = await response.blob();
                    const pdfUrl = URL.createObjectURL(blob);
                    
                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.download = `receipt-${subscriptionId}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    URL.revokeObjectURL(pdfUrl);
                }
                
            } catch (error) {
                console.error('Error requesting PDF:', error);
                setAlert({ 
                    type: 'error', 
                    message: error instanceof Error ? error.message : 'Failed to generate receipt' 
                });
            }
        };

    // กรอง billingHistory เอาเฉพาะที่ไม่ใช่ package "free"
    const filteredBillingHistory = billingHistory.filter(
        item => item.package.toLowerCase() !== 'free'
    );
        

    // ฟังก์ชัน Cancel Subscription
    const handleCancelSubscription = async () => {
        try {
            setCancelling(true);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch('/api/billing/cancle', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to cancel subscription');
            }

            setAlert({ type: 'success', message: 'Subscription cancelled successfully!' });
            setShowCancelModal(false);
            
            // รอ 1.5 วินาทีแล้ว refresh ข้อมูล
            setTimeout(() => {
                refetchSubscription();
                setAlert(null);
            }, 1500);

        } catch (error) {
            console.error('Error cancelling subscription:', error);
            setAlert({ 
                type: 'error', 
                message: error instanceof Error ? error.message : 'Failed to cancel subscription' 
            });
        } finally {
            setCancelling(false);
        }
    };

    // แสดง loading ถ้ายังโหลดข้อมูลไม่เสร็จ
    if (subLoading || historyLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-[#FCFCFE] min-h-screen py-12 px-4 sm:px-8 lg:px-24">
            {/* Alert Notification */}
            {alert && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className={`rounded-lg p-4 shadow-lg ${
                        alert.type === 'success' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                    }`}>
                        <div className="flex items-center gap-2">
                            {alert.type === 'success' ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            <span className="font-medium">{alert.message}</span>
                        </div>
                    </div>
                </div>
            )}

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

                                <div className="space-y-2">
                                        {subscription.package?.details?.slice(0, 2).map((detail, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Image 
                                                    src="/assets/checkbox-circle.png" 
                                                    alt="Check" 
                                                    width={30} 
                                                    height={30}
                                                />
                                                <span className="text-white text-sm">{detail}</span>
                                            </div>
                                        ))}
                                    </div>

                                {/* Features and Status */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                                    <div className="flex flex-row sm:flex-col gap-3 sm:gap-2 items-center">
                                        <span className={`hidden sm:block px-4 py-1.5 rounded-full text-sm font-semibold ${
                                            subscription.cancel_at_period_end || subscription.status === 'cancelled' || subscription.status === 'active' 
                                                ? 'bg-[#F3E4DD] text-[#B8653E]' 
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {subscription.cancel_at_period_end || subscription.status === 'cancelled'
                                                ? 'Inactive'
                                                : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t-[1px] border-[#E4E6ED] mb-5 mt-5"></div>

                            <div className="hidden sm:flex flex-row sm:flex-col gap-3 sm:gap-2 justify-end items-end">
                                {subscription.cancel_at_period_end ? (
                                    <p className="text-white text-sm">
                                        Your subscription will end on {formatDate(subscription.cancel_at || subscription.current_period_end)}
                                    </p>
                                ) : (
                                    <button 
                                        onClick={() => setShowCancelModal(true)}
                                        className="text-white text-sm hover:text-gray-200 transition-colors underline"
                                    >
                                        Cancel Package
                                    </button>
                                )}
                            </div>

                            {/* Mobile package info */}
                            <div className="sm:hidden flex flex-col gap-2">
                                <p className="text-white text-sm flex flex-row justify-between items-center">
                                        Start Member Ship <span>{formatDate(subscription.current_period_start)}</span>
                                </p>
                                <p className="text-white text-sm flex flex-row justify-between items-center">
                                    Next Billing <span>{nextBillingDate}</span>
                                </p>
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
                        {filteredBillingHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <tbody className="">
                                        {filteredBillingHistory.map((item) => (
                                            <tr key={item.id} className="even:bg-[#F6F7FC] rounded-lg">
                                                <td className="py-4 px-2 text-[#646D89]">
                                                    {formatDate(item.date)}
                                                </td>
                                                <td className="py-4 px-2 text-[#646D89]">{item.package}</td>
                                                <td className="py-4 px-2 text-right font-semibold text-[#191C77]">
                                                    THB {item.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-600 text-center py-4">
                                No billing history available.
                            </p>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={() => {
                                    // ถ้ามี billing history อย่างน้อย 1 รายการ ให้ใช้รายการแรก (ล่าสุด)
                                    if (filteredBillingHistory.length > 0) {
                                        handleRequestPDF(filteredBillingHistory[0].id);
                                    } else {
                                        setAlert({ type: 'error', message: 'No billing history to export' });
                                    }
                                }}
                                className="text-[#C70039] font-semibold hover:text-[#A00030] transition-colors"
                            >
                                Request PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl border-1 max-w-2xl w-full relative">

                        {/* Close button */}
                        <button
                            onClick={() => setShowCancelModal(false)}
                            disabled={cancelling}
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors "
                            aria-label="Close modal"
                        >
                            <IoCloseCircleOutline className="w-6 h-6" />
                        </button>

                        <h3 className="text-2xl font-bold p-5 text-gray-800 mb-4 border-b">
                            Cancel confirmation?
                        </h3>
                        
                        <p className="text-gray-600 mb-6 px-5">
                            Do you sure to cancel Membership to get more Merry?
                        </p>
                        <div className="flex gap-4 p-5">
                            <button 
                                onClick={handleCancelSubscription}
                                disabled={cancelling}
                                className="button-secondary bg-[#FFE1EA] w-full"
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, I want to cancel'}
                            </button>
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                                className="button-primary bg-[#C70039]  w-full"
                            >
                                No, I still want to be member
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Member;