import NavBarUsers from "@/components/NavBarUsers";  
import Footer from "@/components/Footer";
import MerryProfileView from "@/components/profile/MerryProfileView";
import { Heart } from 'lucide-react';
import { MessageCircleMore } from 'lucide-react';
import { Eye } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { supabase } from "@/lib/supabase/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

type ProfileLocation = {
    city?: string;
    location?: string;
};

type Match = {
    id: string | number;
    match_id?: string; // from API matchList
    other_user_id?: string; // from API matchList
    gender?: string;
    name?: string;
    age?: number;
    location?: ProfileLocation | null;
    photo_url: string | string[] | null;
    sexual_preferences: string | null;
    racial_preferences: string | null;
    meeting_interests: string | null;
};

type Swipe = {
    id: string | number;
    gender?: string;
    name?: string;
    age?: number;
    location?: ProfileLocation | null;
    photo_url: string | string[] | null;
    sexual_preferences: string | null;
    racial_preferences: string | null;
    meeting_interests: string | null;
}

type User = {
    id: string | number;
    name: string;
}

type Package = {
    name: string;
    daily_swipe_limit: string | number;
}

type Subscription = {
    id: string | number;
    user: User;
    package: Package;
    merry_limit: string | number;
}

type MatchListResponse = { data: Match[] };
type SwipeListResponse = { data: Swipe[] };
type SubscriptionResponse = { success: boolean; subscription: Subscription | null };

// เพิ่มฟังก์ชันเช็ค Premium
function isPremium(subscriptionData: Subscription[]): boolean {
    if (!subscriptionData || subscriptionData.length === 0) {
        return false;
    }
    
    const packageName = subscriptionData[0]?.package?.name;
    return packageName === "Premium";
}

function MerryList () {
    const [matchList, setMatchList] = useState<Match[]>([]);
    const [swipeList, setSwipeList] = useState<Swipe[]>([]);
    const [AllSwipe, setAllSwipe] = useState<Swipe[]>([]);
    const [subscriptionData, setSubscriptionData] = useState<Subscription[]>([]);

    const [timeLeft, setTimeLeft] = useState("");
    const [openProfile, setOpenProfile] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null);

    const [unmatchedIds, setUnmatchedIds] = useState<(string | number)[]>([]);

    const router = useRouter();

    function formatLocation(loc: unknown): string {
        if (!loc || typeof loc !== "object") return "";
        const maybe = loc as { city?: unknown; location?: unknown };
        const city = typeof maybe.city === "string" ? maybe.city : "";
        const area = typeof maybe.location === "string" ? maybe.location : "";
        return [city, area].filter(Boolean).join(", ");
    }

    async function toggleMatch(matchId: string | number, isCurrentlyMatched: boolean, otherUserId?: string) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

        if (!token) {
            console.warn("No token found, cannot toggle match.");
            return;
        }

        const origin = typeof window !== "undefined" ? window.location.origin : "";

        if (isCurrentlyMatched) {
        // ยิง API unmatch
            await axios.post(
            `${origin}/api/unmatch`,
            { matchId, otherUserId },
            { headers: { Authorization: `Bearer ${token}` } }
            );
        // อัปเดต state local
        setUnmatchedIds((prev) => [...prev, matchId]);
      } else {
        // ยิง API match กลับมาใหม่
        await axios.post(
          `${origin}/api/rematch`,
          { matchId, otherUserId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // ลบออกจาก unmatchedIds
        setUnmatchedIds((prev) => prev.filter((id) => id !== matchId));
        }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(
                  "Toggle match error:",
                  {
                    message: error.message,
                    url: error.config?.url,
                    method: error.config?.method,
                    status: error.response?.status,
                    data: error.response?.data,
                  }
                );
            } else {
                console.error("Toggle match error:", error);
            }
        }
    }

    const handleProfile = (userId: string | number) => {
        setSelectedUserId(userId);
        setOpenProfile(true);
    };
    const closeProfile = () => setOpenProfile(false);

    useEffect(() => {
        const handleRouteChange = () => {
            setOpenProfile(false);
        };
        
        if (router.events) {
            router.events.on('routeChangeStart', handleRouteChange);
            
            return () => {
                router.events.off('routeChangeStart', handleRouteChange);
            };
        }
    }, [router]);

    useEffect(() => {

        const fetchMatch = async() => {
            try {
                // เช็คว่ามี session token หรือไม่
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) {
                    console.warn("No session token found; cannot fetch match list.");
                    setMatchList([]);
                    return;
                }

                // ดึง match list API และ swipe list API
                const resultMatch = await axios.get<MatchListResponse>(
                    `/api/matchList`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const resultSwipe = await axios.get<SwipeListResponse>(
                    `/api/swipeList`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const resultSubscription = await axios.get<SubscriptionResponse>(
                    `/api/subscriptions/get`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )

                const matches = (resultMatch.data.data ?? []).filter(Boolean);
                const swipes = (resultSwipe.data.data ?? []).filter(Boolean);
                const subscription = resultSubscription.data.subscription;

                setMatchList(matches)
                setAllSwipe(swipes)
                setSubscriptionData(subscription ? [subscription] : []);
                console.log("subscription from API:", subscription);
                console.log("🔍 Match data from API:", matches.map(m => ({
                    id: m.id,
                    other_user_id: (m as Match & { other_user_id?: string }).other_user_id,
                    match_id: (m as Match & { match_id?: string }).match_id,
                    name: m.name
                })));

                // เช็คว่าเป็น Premium หรือไม่ ถ้าไม่ใช่จะไม่แสดง swipeList
                if (!isPremium(subscription ? [subscription] : [])) {
                    setSwipeList([])
                } else {
                    setSwipeList(swipes)
                }
                  
            } catch (error) {
                console.error(error)
            };
        };
        fetchMatch()
    },[])

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            setTimeLeft(`${hours}h`);
        };
    
        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
    
        return () => clearInterval(timer);
    }, []);

    return(
        <>
        <NavBarUsers />
        <div className="mb-15 lg:flex lg:flex-col lg:items-center lg:mt-15">
        <div className="p-3 lg:w-300">
            <p className="text-start text-xs leading-10 text-[#7B4429] font-semibold">MERRY LIST</p>
            <p className="text-3xl font-bold text-[#A62D82]">Let&apos;s know each other with Merry!</p>
            <div className="mt-15">
                <div className="flex justify-between mx-8 items-center lg:justify-start lg:gap-20">
                    <div>
                        <div className="flex ">
                        <p className="text-[#C70039] font-extrabold text-xl">{AllSwipe.length}</p>
                        <Heart color = "#ff1659" fill="#ff1659" className="ml-2"/>
                        </div>
                        <p className="text-[#646D89]">Merry to you</p>
                    </div>
                    <div>
                        <div className="flex">
                            <p className="text-[#C70039] font-extrabold text-xl">{matchList.length}</p>
                            <div className="ml-2">
                                <Heart color = "#ff1659" fill="#ff1659" 
                                className="absolute" />
                                <Heart color = "#ff1659" fill="#ff1659" stroke="white" strokeWidth={1} size={28}
                                className="relative left-3.5 bottom-0.5" />
                            </div>
                        </div>
                    <p className="text-[#646D89]">Merry match</p>
                    </div>
                </div>
            </div>
            <div className="lg:relative lg:bottom-20">
                <div className="flex flex-row-reverse gap-3 mt-8">
                    <p className="text-[#FF1659]">{subscriptionData[0]?.merry_limit ?? 0}/{subscriptionData[0]?.package?.daily_swipe_limit ?? 0}</p>
                    <p className="text-[#646D89]">Merry limit today</p>
                </div>
                    <p className="text-end text-[#9AA1B9] text-xs">Reset in {timeLeft}...</p>
                </div>
            </div>
            {matchList.map((match) => {
                const src =
                (Array.isArray(match.photo_url) ? match.photo_url[0] : match.photo_url) ??
                "/assets/user.jpg";

                const effectiveMatchId = (match as Match & { match_id?: string }).match_id ?? match.id;
                const isUnmatched = unmatchedIds.includes(effectiveMatchId);

                return(
                    <div key={match.id}>
                        <div className="p-4 mt-5 lg:w-300 lg:flex lg:p-0 lg:mb-8">
                            <div className="flex justify-between lg:w-290 lg:absolute">
                                <Image 
                                src={src} 
                                alt={match.gender || "profile"}
                                width={200} 
                                height={200}
                                className="rounded-2xl w-25 h-25 object-cover lg:w-50 lg:h-50"
                                />
                                <div className="lg:order-3 justify-items-end">
                                    {isUnmatched ? 
                                    <span className="flex items-end w-35 px-2.5 p-1 border-1 border-gray-300 rounded-2xl cursor-not-allowed">
                                    <p className="ml-2 text-gray-600">
                                    Not Match yet
                                    </p>
                                    </span> 
                                    : 
                                    <p className="flex items-center px-4 pr-4.5 p-1 border-1 border-red-700 rounded-2xl">
                                        <Heart color = "#ff1659" fill="#ff1659" size={10}
                                        className="absolute" />
                                        <Heart color = "#ff1659" fill="#ff1659" stroke="white" strokeWidth={1} size={12}
                                        className="relative left-1.5" />
                                        <span className="ml-2 text-[#C70039] font-extrabold">
                                        Merry Match!
                                        </span>
                                    </p>
                                    }
                                    <div className="flex justify-between items-center mt-6 w-40">
                                        <button className="flex justify-between items-center cursor-pointer w-7 h-7">
                                            <MessageCircleMore color="white" fill ="#646D89" size={22}/>
                                        </button>
                                        <button
                                        onClick={() => handleProfile(match.id)}
                                        className="flex justify-between items-center cursor-pointer w-7 h-7">
                                            <Eye color="white" fill ="#646D89" size={28}/>
                                        </button>
                                        <button 
                                        onClick={() => toggleMatch(effectiveMatchId, !isUnmatched, (match as Match & { other_user_id?: string }).other_user_id)} 
                                        className="flex items-center justify-center rounded-lg cursor-pointer w-10 h-10 bg-[#C70039]"
                                        >
                                            <Heart 
                                            color = "white" 
                                            fill="white" 
                                            size={20}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:relative left-65">
                                <div className="flex gap-1 items-center mt-3 lg:relative lg:bottom-10 lg:mt-8">
                                    <p className="font-bold text-[#2A2E3F] text-lg">{match.name}</p>
                                    <p className="ml-2 font-bold text-[#646D89] text-lg">{match.age}</p>
                                    <MapPin color="white" fill="#FFB1C8" size={15}
                                    className="ml-1" />
                                    <p className="text-[#646D89]">{formatLocation(match.location)}</p>
                                </div>
                                <div className="flex flex-cols gap-8 mt-1 lg:relative lg:bottom-3">
                                    <div>
                                        <p className="text-sm leading-7 lg:leading-8.5">Sexual identities</p>
                                        <p className="text-sm leading-7 lg:leading-8.5">Sexual preferences</p>
                                        <p className="text-sm leading-7 lg:leading-8.5">Racial preferences</p>
                                        <p className="text-sm leading-7 lg:leading-8.5">Meeting interests</p>
                                    </div>
                                    <div>
                                        <p className="text-[#646D89] text-sm leading-7 lg:leading-8.5">{match.gender}</p>
                                        <p className="text-[#646D89] text-sm leading-7 lg:leading-8.5">{match.sexual_preferences}</p>
                                        <p className="text-[#646D89] text-sm leading-7 lg:leading-8.5">{match.racial_preferences}</p>
                                        <p className="text-[#646D89] text-sm leading-7 lg:leading-8.5">{match.meeting_interests}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="mt-8 lg:mt-0 lg:mb-8"/>
                    </div>
                    
                )
            })}
            
            {/* แสดง swipeList เฉพาะเมื่อเป็น Premium */}
            {isPremium(subscriptionData) ? (
                swipeList.map((swipe) => {
                    const firstPhoto = Array.isArray(swipe.photo_url)
                    ? (swipe.photo_url[0] || null)
                    : (swipe.photo_url || null);
                    const src = firstPhoto || "/assets/user.jpg";
                    return(
                        <div key={swipe.id}>
                            <div className="p-4 mt-2 lg:w-300 lg:flex lg:p-0 lg:mb-8">
                                <div className="flex justify-between lg:w-290 lg:absolute">
                                    <Image 
                                    src={src}
                                    alt={swipe.gender || "profile"}
                                    width={200} 
                                    height={200}
                                    className="rounded-2xl w-25 h-25 object-cover lg:w-50 lg:h-50"/>
                                    <div className="lg:order-3 justify-items-end">
                                        <button className="flex items-center px-3 pr-4.5 p-1 border-1 border-gray-300 rounded-2xl cursor-not-allowed">
                                            <p className="ml-2 text-gray-600 ">Not Match yet</p>
                                        </button>
                                        <div className="flex justify-end items-center w-25 mt-6">
                                            <button 
                                            onClick={() => handleProfile(swipe.id)}
                                            className="flex justify-between items-center cursor-pointer w-7 h-7">
                                                <Eye color="white" fill ="#646D89" size={28}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:relative left-65">
                                    <div className="flex gap-1 items-center mt-3 lg:relative lg:bottom-10 lg:mt-8">
                                        <p className="font-bold text-[#2A2E3F] text-lg">{swipe.name}</p>
                                        <p className="ml-2 font-bold text-[#646D89] text-lg">{swipe.age}</p>
                                        <MapPin color="white" fill="#FFB1C8" size={15}
                                        className="ml-1" />
                                        <p className="text-[#646D89]">{formatLocation(swipe.location)}</p>
                                    </div>
                                    <div className="flex flex-cols gap-8 mt-1 lg:relative lg:bottom-3">
                                        <div>
                                            <p className="text-sm leading-7 lg:leading-8.5">Sexual identities</p>
                                            <p className="text-sm leading-7 lg:leading-8.5">Sexual preferences</p>
                                            <p className="text-sm leading-7 lg:leading-8.5">Racial preferences</p>
                                            <p className="text-sm leading-7 lg:leading-8.5">Meeting interests</p>
                                        </div>
                                        <div>
                                            <p className="text-[#646D89] text-sm leading-7 lg:leading-8.5">{swipe.gender}</p>
                                            <p className="text-[#646D89] text-sm leading-7 lg:leading-8.5">{swipe.sexual_preferences}</p>
                                            <p className="text-[#646D89] text-sm leading-7 lg:leading-8.5">{swipe.racial_preferences}</p>
                                            <p className="text-[#646D89] text-sm leading-7 lg:leading-8.5">{swipe.meeting_interests}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr className="mt-8 lg:mt-0 lg:mb-8"/>
                        </div>
                    )
                })
            ) : (
                <Link href="/package">
                <div
                className="mt-8 mx-auto w-90 lg:w-auto p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200 cursor-pointer">
                    <div className="text-center">
                        <Heart color="#ff1659" size={48} className="mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-[#A62D82] mb-2">
                            Upgrade to Premium
                        </h3>
                        <p className="text-[#646D89] mb-4">
                            See who likes you with Premium package!
                        </p>
                        <p className="text-sm text-[#9AA1B9]">
                            Get access to your &quot;Merry to you&quot; list and see all the people who liked your profile.
                        </p>
                    </div>
                </div>
                </Link>
            )}
            
        </div>
        <Footer />
        {openProfile && selectedUserId && (
    <MerryProfileView 
      userId={selectedUserId}
      onClose={closeProfile}
    />
)}
        </>
    )
}

export default MerryList;