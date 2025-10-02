import Image from "next/image";
import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useMatchingContext } from "@/context/MatchingContext";
import { useRouter } from "next/router";

type Match = {
    id: string | number;
    name?: string;
    photo_url: string | string[] | null;
    match_id?: string;
};

interface MatchingLeftProps {
    onChatSelect?: (matchId: string, matchName: string) => void;
}

function MatchingLeft({ onChatSelect }: MatchingLeftProps) {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    // ใช้ context เพื่อดึง matchRefreshTrigger
    const { matchRefreshTrigger, applyFilters } = useMatchingContext();

    // ฟังก์ชันสำหรับดึงข้อมูล matches
    const fetchMatches = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            if (!token) {
                console.warn("No session token found; cannot fetch match list.");
                setMatches([]);
                return;
            }

            const response = await axios.get(
                `/api/matchList`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const matchData = (response.data.data ?? []).filter(Boolean);
            setMatches(matchData);
        } catch (error) {
            console.error("Error fetching matches:", error);
            setMatches([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    useEffect(() => {
        if (matchRefreshTrigger > 0) {
            fetchMatches();
        }
    }, [matchRefreshTrigger]);

    // ฟังก์ชันสำหรับ get photo URL
    const getPhotoUrl = (photoUrl: string | string[] | null): string => {
        if (Array.isArray(photoUrl)) {
            return photoUrl[0] || "/assets/user.jpg";
        }
        return photoUrl || "/assets/user.jpg";
    };

    // ฟังก์ชันสำหรับจัดการ scroll ใน Merry Match section
    const handlePhotosScroll = (e: React.WheelEvent) => {
        e.preventDefault();
        const container = e.currentTarget;
        const scrollAmount = 120; // จำนวนที่จะเลื่อนในแต่ละครั้ง
        container.scrollLeft += e.deltaY > 0 ? scrollAmount : -scrollAmount;
    };

    // ฟังก์ชันสำหรับจัดการ scroll ใน Chat section  
    const handleChatScroll = (e: React.WheelEvent) => {
        e.preventDefault();
        const container = e.currentTarget;
        const scrollAmount = 100;
        container.scrollTop += e.deltaY > 0 ? scrollAmount : -scrollAmount;
    };

    // ฟังก์ชันสำหรับเริ่ม matching process
    const handleDiscoverMatch = () => {
        applyFilters(); // เรียกใช้ applyFilters เพื่อเริ่มค้นหาโปรไฟล์ใหม่
    };

    return (
        <div className="w-full h-full flex flex-col pt-5">
            <div className="mx-auto">
            <button 
            className="sm:w-[282px] w-[330px] h-[187px] flex flex-col items-center cursor-pointer justify-center mb-7 border-1 bg-[#E4E6ED] border-[#A62D82] rounded-lg p-4"
            onClick={handleDiscoverMatch}
            >
                <Image src="/assets/hearchsearch.png" alt="discover" width={50} height={50} />
                <h4 className="text-2xl font-bold text-[#95002B]">Discover New Match</h4>
                <p className="text-sm text-[#646D89]">Start find and Merry to get know and connect with new friend!</p>
            </button>
            </div>
            <div className="border-t-[1px] border-[#E4E6ED] mb-5"></div>
            
            {/* Merry Match Section with Horizontal Scroll */}
            <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xl sm:text-2xl font-bold text-[#2A2E3F]">Merry Match!</h4>
                    
                </div>
                
                <div className="relative">
                    {loading ? (
                        <div className="flex flex-row gap-2 sm:gap-3 mt-2">
                            <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] bg-gray-200 rounded-xl animate-pulse flex-shrink-0"></div>
                            <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] bg-gray-200 rounded-xl animate-pulse flex-shrink-0"></div>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="text-[#646D89] text-center py-8 w-full text-sm sm:text-base">
                            No matches yet. Start swiping to find your match!
                        </div>
                    ) : (
                        // Horizontal scroll container
                        <div 
                            className="flex gap-2 sm:gap-3 mt-2 overflow-x-auto scrollbar-hide pb-2 cursor-grab active:cursor-grabbing"
                            onWheel={handlePhotosScroll}
                            style={{ 
                                scrollBehavior: 'smooth',
                                scrollbarWidth: 'none', 
                                msOverflowStyle: 'none' 
                            }}
                        >
                            {matches.map((match) => (
                                <div key={match.id} className="flex-shrink-0 relative">
                                    <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] relative overflow-hidden rounded-xl">
                                        <Image 
                                            src={getPhotoUrl(match.photo_url)} 
                                            alt={match.name || "match"} 
                                            fill
                                            className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                            sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, 120px"
                                        />
                                        {/* Heart overlay positioned at bottom right */}
                                        <div className="absolute bottom-1 right-1">
                                            <Image 
                                                src="/assets/twoheart.png" 
                                                alt="Merry Match" 
                                                width={20} 
                                                height={20}
                                                className="w-6 h-4 sm:w-8 sm:h-5"
                                            />
                                        </div>
                                    </div>
                                    
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Section with Vertical Scroll */}
            <div className="flex-1">
                <div className="flex items-center justify-between mt-8 sm:mt-10 mb-2">
                    <h4 className="text-xl sm:text-2xl font-bold text-[#2A2E3F]">Chat with Merry Match</h4>
                    
                </div>

                {loading ? (
                    // Loading placeholder สำหรับ chat section
                    <div className="space-y-3">
                        <div className="flex flex-row gap-2 sm:gap-3 m-3 items-center">
                            <div className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                            <div className="flex flex-col justify-center gap-2 flex-1">
                                <div className="w-16 sm:w-20 h-3 sm:h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-24 sm:w-32 h-2.5 sm:h-3 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex flex-row gap-2 sm:gap-3 m-3 items-center">
                            <div className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                            <div className="flex flex-col justify-center gap-2 flex-1">
                                <div className="w-14 sm:w-16 h-3 sm:h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-20 sm:w-24 h-2.5 sm:h-3 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="text-[#646D89] text-center py-4 text-sm sm:text-base">
                        No matches to chat with yet.
                    </div>
                ) : (
                    // Vertical scroll container สำหรับ chat
                    <div 
                        className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#E4E6ED] scrollbar-track-transparent hover:scrollbar-thumb-[#d1d5db] pr-2"
                        onWheel={handleChatScroll}
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        <div className="space-y-2">
                            {matches.map((match) => (
                                <div key={match.id} 
                                     className="flex flex-row gap-2 sm:gap-3 items-center cursor-pointer hover:bg-[#f9f9f9] p-2 sm:p-3 rounded-lg transition-colors mx-1 hover:border-1 hover:border-[#A62D82]"
                                     onClick={() => {
                                         if (onChatSelect && match.match_id && match.name) {
                                             onChatSelect(match.match_id, match.name);
                                         } else {
                                             router.push(`/chat`);
                                         }
                                     }}
                                     >
                                    <div className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] relative overflow-hidden rounded-full flex-shrink-0">
                                        <Image 
                                            src={getPhotoUrl(match.photo_url)} 
                                            alt={match.name || "match"} 
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 40px, 50px"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center min-w-0 flex-1">
                                        <h4 className="text-xs sm:text-sm font-bold text-[#2A2E3F] truncate">
                                            {match.name || "Unknown"}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-[#646D89] truncate">
                                            Start a conversation...
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MatchingLeft;