import NavBarUsers from "@/components/NavBarUsers";  
import Footer from "@/components/Footer";
import { Heart } from 'lucide-react';
import { MessageCircleMore } from 'lucide-react';
import { Eye } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { supabase } from "@/lib/supabase/supabaseClient";

type ProfileLocation = {
    city?: string;
    location?: string;
};

type Match = {
    id: string | number;
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

type MatchListItem = { user2: Match };
type MatchListResponse = { data: Match[] };
type SwipeListResponse = { data: Swipe[] };

function MerryList () {

    const [matchList, setMatchList] = useState<Match[]>([]);
    const [swipeList, setSwipeList] = useState<Swipe[]>([]);

    useEffect(() => {
        const fetchMatch = async() => {
            try {

                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) {
                    console.warn("No session token found; cannot fetch match list.");
                    setMatchList([]);
                    return;
                }

                const resultMatch = await axios.get<MatchListResponse>(
                    `/api/matchList`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const resultSwipe = await axios.get<SwipeListResponse>(
                    `/api/swipeList`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const matches = (resultMatch.data.data ?? []).filter(Boolean);
                const swipes = (resultSwipe.data.data ?? []).filter(Boolean);

                

                setMatchList(matches)
                setSwipeList(swipes)
            } catch (error) {
                console.error(error)
            }
        }
        fetchMatch()
    },[])

    return(
        <>
        <NavBarUsers />
        <div className="mb-15 lg:flex lg:flex-col lg:items-center lg:mt-15">
        <div className="p-3 lg:w-300">
            <p className="text-start text-xs leading-10 text-[#7B4429] font-semibold">MERRY LIST</p>
            <p className="text-3xl font-bold text-[#A62D82]">Let's know each other with Merry!</p>
            <div className="mt-15">
                <div className="flex justify-between mx-8 items-center lg:justify-start lg:gap-20">
                    <div>
                        <div className="flex ">
                        <p className="text-[#C70039] font-extrabold text-xl">16</p>
                        <Heart color = "#ff1659" fill="#ff1659" className="ml-2"/>
                        </div>
                        <p className="text-[#646D89]">Merry to you</p>
                    </div>
                    <div>
                        <div className="flex">
                            <p className="text-[#C70039] font-extrabold text-xl">3</p>
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
                    <p className="text-[#FF1659]">2/20</p>
                    <p className="text-[#646D89]">Merry limit today</p>
                </div>
                    <p className="text-end text-[#9AA1B9] text-xs">Reset in 12h...</p>
                </div>
            </div>
            {matchList.map((match) => {
                const src =
                (Array.isArray(match.photo_url) ? match.photo_url[0] : match.photo_url) ??
                "/assets/user.jpg";
                return(
                    <div key={match.id}>
                        <div className="p-4 mt-5 lg:w-300 lg:flex lg:p-0 lg:mb-8">
                            <div className="flex justify-between lg:w-290 lg:absolute">
                                <img src={src} alt={match.gender || "profile"}
                                className="rounded-2xl w-25 h-25 object-cover lg:w-50 lg:h-50"/>
                                <div className="lg:order-3">
                                    <button className="flex items-center px-4 pr-6 p-1 border-1 border-red-700 rounded-2xl cursor-pointer">
                                        <Heart color = "#ff1659" fill="#ff1659" size={10}
                                        className="absolute" />
                                        <Heart color = "#ff1659" fill="#ff1659" stroke="white" strokeWidth={1} size={12}
                                        className="relative left-1.5" />
                                        <p className="ml-2 text-[#C70039] font-extrabold">Merry Match!</p>
                                    </button>
                                    <div className="flex justify-between items-center mt-6">
                                        <button className="flex justify-between items-center cursor-pointer w-7 h-7">
                                            <MessageCircleMore color="white" fill ="#646D89" size={22}/>
                                        </button>
                                        <button className="flex justify-between items-center cursor-pointer w-7 h-7">
                                            <Eye color="white" fill ="#646D89" size={28}/>
                                        </button>
                                        <button className="flex items-center justify-center rounded-lg cursor-pointer w-10 h-10 bg-[#C70039]">
                                            <Heart color = "white" fill="white" size={20}/>
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
                                    <p className="text-[#646D89]">{match.location?.city}, {match.location?.location}</p>
                                </div>
                                <div className="flex flex-cols gap-8 mt-1 lg:relative lg:bottom-3">
                                    <div>
                                        <p className="text-sm leading-5.5 lg:leading-8.5">Sexual identities</p>
                                        <p className="text-sm leading-5.5 lg:leading-8.5">Sexual preferences</p>
                                        <p className="text-sm leading-5.5 lg:leading-8.5">Racial preferences</p>
                                        <p className="text-sm leading-5.5 lg:leading-8.5">Meeting interests</p>
                                    </div>
                                    <div>
                                        <p className="text-[#646D89] text-sm leading-5.5 lg:leading-8.5">{match.gender}</p>
                                        <p className="text-[#646D89] text-sm leading-5.5 lg:leading-8.5">{match.sexual_preferences}</p>
                                        <p className="text-[#646D89] text-sm leading-5.5 lg:leading-8.5">{match.racial_preferences}</p>
                                        <p className="text-[#646D89] text-sm leading-5.5 lg:leading-8.5">{match.meeting_interests}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="mt-8 lg:mt-0 lg:mb-8"/>
                    </div>
                )
            })}
            {swipeList.map((swipe) => {
                const firstPhoto = Array.isArray(swipe.photo_url)
                ? (swipe.photo_url[0] || null)
                : (swipe.photo_url || null);
                const src = firstPhoto || "/assets/user.jpg";
                return(
                    <div key={swipe.id}>
                        <div className="p-4 mt-2 lg:w-300 lg:flex lg:p-0 lg:mb-8">
                            <div className="flex justify-between lg:w-290 lg:absolute">
                                <img src={src} alt={swipe.gender || "profile"}
                                className="rounded-2xl w-25 h-25 object-cover lg:w-50 lg:h-50"/>
                                <div className="lg:order-3 justify-items-end">
                                    <button className="flex items-center px-3 pr-4.5 p-1 border-1 border-gray-300 rounded-2xl cursor-not-allowed">
                                        <p className="ml-2 text-gray-600 ">Not Match yet</p>
                                    </button>
                                    <div className="flex justify-between items-center w-25 mt-6">
                                        <button className="flex justify-between items-center cursor-pointer w-7 h-7">
                                            <Eye color="white" fill ="#646D89" size={28}/>
                                        </button>
                                        <button className="flex items-center justify-center rounded-lg cursor-pointer w-10 h-10 bg-[#C70039]">
                                            <Heart color = "white" fill="white" size={20}/>
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
                                    <p className="text-[#646D89]">{swipe.location?.city}, {swipe.location?.location}</p>
                                </div>
                                <div className="flex flex-cols gap-8 mt-1 lg:relative lg:bottom-3">
                                    <div>
                                        <p className="text-sm leading-5.5 lg:leading-8.5">Sexual identities</p>
                                        <p className="text-sm leading-5.5 lg:leading-8.5">Sexual preferences</p>
                                        <p className="text-sm leading-5.5 lg:leading-8.5">Racial preferences</p>
                                        <p className="text-sm leading-5.5 lg:leading-8.5">Meeting interests</p>
                                    </div>
                                    <div>
                                        <p className="text-[#646D89] text-sm leading-5.5 lg:leading-8.5">{swipe.gender}</p>
                                        <p className="text-[#646D89] text-sm leading-5.5 lg:leading-8.5">{swipe.sexual_preferences}</p>
                                        <p className="text-[#646D89] text-sm leading-5.5 lg:leading-8.5">{swipe.racial_preferences}</p>
                                        <p className="text-[#646D89] text-sm leading-5.5 lg:leading-8.5">{swipe.meeting_interests}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="mt-8 lg:mt-0 lg:mb-8"/>
                    </div>
                )
            })}
        </div>
        <Footer />
        </>
    )
}

export default MerryList;