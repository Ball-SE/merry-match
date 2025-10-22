import NavBarUsers from "@/components/NavBarUsers";
import Footer from "@/components/Footer";
import MerryProfileView from "@/components/profile/MerryProfileView";
import FullScreenLoader from "@/components/loader/FullScreenLoader";
import SwipeList from "@/components/merry-list/swipeList";
import MatchList from "@/components/merry-list/matchList";
import OtherSwipeList from "@/components/merry-list/otherSwipeList";
import { Heart } from 'lucide-react';
import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "@/lib/supabase/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUserSubscription } from "@/hooks/useUserSubscription";

type ProfileLocation = {
  city?: string;
  location?: string;
};

type Match = {
  id: string | number;
  match_id?: string;
  other_user_id?: string;
  gender?: string;
  name?: string;
  age?: number;
  matched_at: string;
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

interface MatchingLeftProps {
  onChatSelect?: (matchId: string, matchName: string) => void;
}

type MatchListResponse = {
  data: Match[]
};

type SwipeListResponse = {
  data: Swipe[]
};

type SubscriptionResponse = {
  success: boolean;
  subscription: Subscription | null
};

// เพิ่มฟังก์ชันเช็ค Platinum
function isPlatinum(subscriptionData: Subscription[]): boolean {
  if (!subscriptionData || subscriptionData.length === 0) {
    return false;
  }
  const packageName = subscriptionData[0]?.package?.name;
  return packageName === "Platinum";
}

function MerryList ({ onChatSelect }: MatchingLeftProps) {
  const [matchList, setMatchList] = useState<Match[]>([]);
  const [swipeList, setSwipeList] = useState<Swipe[]>([]);
  const [otherSwipe, setOtherSwipe] = useState<Swipe[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<Subscription[]>([]);
  const [activeTab, setActiveTab] = useState<"matches" | "swipes" | "other">("matches");
  const [timeLeft, setTimeLeft] = useState("");
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [unmatchedIds, setUnmatchedIds] = useState<(string | number)[]>([]);

  const { subscription, refetch: refetchSubscription } = useUserSubscription();
  
  const router = useRouter();

  function formatLocation(loc: unknown): string {
    if (!loc || typeof loc !== "object") return "";
    const maybe = loc as { city?: unknown; location?: unknown };
    const city = typeof maybe.city === "string" ? maybe.city : "";
    const area = typeof maybe.location === "string" ? maybe.location : "";
    return [city, area].filter(Boolean).join(", ");
  }

  async function unswipe(id: string | number) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.warn("No token found, cannot unswipe.");
        return;
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "";

      // 🔹 ยิง API ลบ swipe
      await axios.post(
        `${origin}/api/unswipe`,
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🔹 อัปเดต UI ทันที — ลบ swipe ออกจาก state
      setSwipeList((prev) => prev.filter((swipe) => swipe.id !== id));
      console.log("Swipe deleted locally:", id);
    } catch (err) {
      console.error("Unswipe error:", err);
    }
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

        const resultOtherSwipe = await axios.get<SwipeListResponse>(
          `/api/otherSwipeList`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const resultSubscription = await axios.get<SubscriptionResponse>(
          `/api/subscriptions/get`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const matches = (resultMatch.data.data ?? []).filter(Boolean);
        const swipes = (resultSwipe.data.data ?? []).filter(Boolean);
        const other = (resultOtherSwipe.data.data ?? []).filter(Boolean);
        const subscription = resultSubscription.data.subscription;

        setMatchList(matches)
        setSwipeList(swipes)
        setOtherSwipe(other)
        setSubscriptionData(subscription ? [subscription] : []);

        console.log("subscription from API:", subscription);
        console.log("🔍 Match data from API:", matches.map(m => ({
          id: m.id,
          other_user_id: m.other_user_id,
          match_id: m.match_id,
          name: m.name
        })));

      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false);
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

  const callMerryAPI = async (swiped_id: string | number, action: "like" | "pass") => {
    try {
      // 🆕 Check limit ก่อน swipe
      if (subscription && subscription.merry_limit <= 0) {
        alert("You've reached your daily merry limit!");
        return { success: false, match: false, limitReached: true };
      }
  
      // ดึง token จาก Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        console.error('No valid session found');
        return { success: false, match: false };
      }
  
      const response = await axios.post('/api/merry', {
        swiped_id,
        action
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });
  
      const result = response.data;
  
      // 🆕 Refresh subscription เพื่อ update merry_limit
      await refetchSubscription();
  
      // ✅ ลบออกจาก otherSwipe ทันที
      setOtherSwipe((prev) => prev.filter((swipe) => swipe.id !== swiped_id));
  
      // ✅ ถ้า match สำเร็จ → เพิ่มเข้า matchList
      if (result.match && result.matchUser) {
        const newMatch: Match = {
          id: result.matchUser.id || swiped_id,
          match_id: result.matchUser.match_id,
          other_user_id: swiped_id as string,
          gender: result.matchUser.gender,
          name: result.matchUser.name,
          age: result.matchUser.age,
          matched_at: new Date().toISOString(),
          location: result.matchUser.location,
          photo_url: result.matchUser.photo_url,
          sexual_preferences: result.matchUser.sexual_preferences,
          racial_preferences: result.matchUser.racial_preferences,
          meeting_interests: result.matchUser.meeting_interests,
        };
        
        setMatchList((prev) => [newMatch, ...prev]);
        console.log("✅ Match added to matchList:", newMatch);
      } 
      // ✅ ถ้าแค่ like → เพิ่มเข้า swipeList
      else if (action === "like" && result.swipedUser) {
        const newSwipe: Swipe = {
          id: result.swipedUser.id || swiped_id,
          gender: result.swipedUser.gender,
          name: result.swipedUser.name,
          age: result.swipedUser.age,
          location: result.swipedUser.location,
          photo_url: result.swipedUser.photo_url,
          sexual_preferences: result.swipedUser.sexual_preferences,
          racial_preferences: result.swipedUser.racial_preferences,
          meeting_interests: result.swipedUser.meeting_interests,
        };
        
        setSwipeList((prev) => [newSwipe, ...prev]);
        console.log("✅ Like added to swipeList:", newSwipe);
      }
      
      return { success: true, match: result.match || false };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        await refetchSubscription();
        alert("You've reached your daily merry limit!");
        return { success: false, match: false, limitReached: true };
      }
      console.error("Merry API error:", error);
      return { success: false, match: false };
    }
  };

  return(
    <>
      <FullScreenLoader show={loading} />
      <NavBarUsers />
      <div className="mb-15 lg:flex lg:flex-col lg:items-center lg:mt-15">
        <div className="p-3 lg:w-300">
          <p className="text-start text-s leading-10 text-[#7B4429] font-semibold">MERRY LIST</p>
          <p className="text-4xl font-extrabold text-[#A62D82]">Let&apos;s know each other with Merry!</p>
          
          <div className="mt-15">
            <div className="flex justify-between items-center lg:justify-start lg:gap-15 lg:ml-[1vh]">
              <div className="lg:relative lg:left-3.5">
                <div className="flex">
                  <p className="text-[#C70039] font-extrabold text-xl">{matchList.length}</p>
                  <div className="ml-2">
                    <Heart color="#ff1659" fill="#ff1659" stroke="white" strokeWidth={1} size={28} className="absolute " />
                    <Heart color="#ff1659" fill="#ff1659" stroke="white" strokeWidth={1} size={28} className="relative left-3.5" />
                  </div>
                </div>
                <p className="text-[#646D89]">Merry Match</p>
              </div>
              <div>
                <div className="flex ">
                  <p className="text-[#C70039] font-extrabold text-xl">{swipeList.length}</p>
                  <Heart color="#ff1659" fill="#ff1659" className="ml-2"/>
                </div>
                <p className="text-[#646D89]">Your Merry</p>
              </div>
              <div className="lg:relative lg:right-2">
                <div className="flex">
                  <p className="text-[#C70039] font-extrabold text-xl">{otherSwipe.length}</p>
                  <Heart color="#ff1659" fill="#ff1659" className="ml-2"/>
                </div>
                <p className="text-[#646D89]">Merry to you</p>
              </div>
            </div>
          </div>

          <div className="lg:relative lg:bottom-20">
            <div className="flex flex-row-reverse gap-3 mt-8">
              <p className="text-[#FF1659]">{subscription?.merry_limit ?? 0}/{subscription?.package?.daily_swipe_limit ?? 0}</p>
              <p className="text-[#646D89]">Merry limit today</p>
            </div>
            <p className="text-end text-[#9AA1B9] text-xs">Reset in {timeLeft}...</p>
          </div>
        </div>

        <div className="flex justify-evenly mx-0.5 p-2 gap-0 rounded-xl lg:p-0 lg:gap-5 lg:relative lg:right-96.5 select-none">
          <button
            onClick={() => setActiveTab("matches")}
            className={`p-2 px-4 text-sm rounded-xl font-semibold transition-all cursor-pointer w-[20vh] h-[6vh] lg:w-[12vh] lg:h-[4.5vh] ${
              activeTab === "matches"
                ? "bg-[#C70039] text-white shadow-lg"
                : "bg-red-200/70 text-[#C70039] hover:bg-red-300/70 transition-all ease-in-out duration-150 hover:scale-101"
            }`}
          >
            Merry Match
          </button>
          <button
            onClick={() => setActiveTab("swipes")}
            className={`p-2 px-4 text-sm rounded-xl font-semibold transition-all cursor-pointer mx-1.5 lg:mx-0 w-[20vh] h-[6vh] lg:w-[12vh] lg:h-[4.5vh] ${
              activeTab === "swipes"
                ? "bg-[#C70039] text-white shadow-lg"
                : "bg-red-200/70 text-[#C70039] hover:bg-red-300/70 transition-all ease-in-out duration-150 hover:scale-101"
            }`}
          >
            Your Merry
          </button>
          <button
            onClick={() => setActiveTab("other")}
            className={`p-2 px-4 text-sm rounded-xl font-semibold transition-all cursor-pointer w-[20vh] h-[6vh] lg:w-[12vh] lg:h-[4.5vh] ${
              activeTab === "other"
                ? "bg-[#C70039] text-white shadow-lg"
                : "bg-red-200/70 text-[#C70039] hover:bg-red-300/70 transition-all ease-in-out duration-150 hover:scale-101"
            }`}
          >
            Merry to you
          </button>
        </div>

        {activeTab === "matches" && (
          <MatchList
            matchList={matchList}
            unmatchedIds={unmatchedIds}
            onChatSelect={onChatSelect}
            handleProfile={handleProfile}
            formatLocation={formatLocation}
            toggleMatch={toggleMatch}
          />
        )}

        {activeTab === "swipes" && (
          <SwipeList
            swipeList={swipeList}
            handleProfile={handleProfile}
            unswipe={unswipe}
            formatLocation={formatLocation}
          />
        )}

        {activeTab === "other" && (
          isPlatinum(subscriptionData) ? (
            <OtherSwipeList
              otherSwipeList={otherSwipe}
              handleProfile={handleProfile}
              unswipe={unswipe}
              formatLocation={formatLocation}
              callMerryAPI={callMerryAPI}
            />
          ) : (
            <Link href="/package">
              <div className="mt-8 mx-auto w-90 lg:w-auto bg-gray-100 p-6 rounded-xl border border-pink-200 cursor-pointer transition-all ease-in-out duration-300 hover:scale-102 hover:bg-gray-200 select-none">
                <div className="text-center">
                  <Heart color="#ff1659" size={48} className="mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#A62D82] mb-2">
                    Upgrade to Platinum
                  </h3>
                  <p className="text-[#646D89] mb-4">
                    See who likes you with Platinum package!
                  </p>
                  <p className="text-sm text-[#9AA1B9]">
                    Get access to your &quot;Merry to you&quot; list and see all the people who liked your profile.
                  </p>
                </div>
              </div>
            </Link>
          )
        )}
      </div>

      <Footer />

      {openProfile && selectedUserId && (
        <MerryProfileView userId={selectedUserId} onClose={closeProfile} />
      )}

      <FullScreenLoader show={loading} />
    </>
  )
}

export default MerryList;