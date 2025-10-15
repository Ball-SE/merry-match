import Image from "next/image";
import { Heart, MessageCircleMore, Eye, MapPin, X } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

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

interface MatchingListProps {
  matchList: Match[];
  unmatchedIds: (string | number)[];
  formatLocation?: (loc: unknown) => string;
  onChatSelect?: (matchId: string, matchName: string) => void;
  handleProfile?: (userId: string | number) => void;
  toggleMatch?: (matchId: string | number, isCurrentlyMatched: boolean, otherUserId?: string) => void;
}

export default function MatchList({
  matchList,
  unmatchedIds,
  formatLocation,
  onChatSelect,
  handleProfile,
  toggleMatch
}: MatchingListProps) {
  const router = useRouter();
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(matchList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSwipes = matchList.slice(startIndex, startIndex + itemsPerPage);

  function formatDateUTC(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  return (
    <>
      {currentSwipes.length > 0 ? (
        currentSwipes.map((match) => {
          const src = (Array.isArray(match.photo_url) 
            ? match.photo_url[0] 
            : match.photo_url) ?? "/assets/user.jpg";
          const effectiveMatchId = match.match_id ?? match.id;
          const isUnmatched = unmatchedIds.includes(effectiveMatchId);

          const formattedMatchDate = match.matched_at ? formatDateUTC(match.matched_at) : null;
          const today = new Date();
          const matchDate = formattedMatchDate ? new Date(match.matched_at) : null;
          const isTodayMatch = matchDate 
            && matchDate.getUTCDate() === today.getUTCDate()
            && matchDate.getUTCMonth() === today.getUTCMonth()
            && matchDate.getUTCFullYear() === today.getUTCFullYear();

          return (
            <div 
              key={match.id} 
              className="transition-all duration-300 ease-in-out hover:scale-102 border-b-2 border-gray-300"
            >
              <div className="p-4 mt-5 lg:w-300 lg:flex lg:p-0 lg:mt-8">
                <div className="flex justify-between lg:w-290 lg:absolute">
                  <div className="relative">
                    <Image
                      src={src}
                      alt={match.gender || "profile"}
                      width={200}
                      height={200}
                      className="rounded-2xl w-40 h-40 object-cover lg:w-50 lg:h-50 lg:ml-5"
                    />
                    {isTodayMatch && (
                      <div className="flex absolute bg-[#F4EBF2] text-[#7D2262] rounded-tr-lg rounded-bl-lg h-5 w-20 top-35.5 text-xs justify-center text-center items-center lg:top-45.5 lg:left-5">
                        Merry today
                      </div>
                    )}
                  </div>

                  <div className="mt-7 mr-2 lg:mt-0 lg:mr-0 lg:order-3 justify-items-end">
                    {isUnmatched ? (
                      <span className="flex items-end w-35 px-2.5 p-1 border-1 border-gray-300 rounded-2xl select-none">
                        <p className="ml-2 text-gray-600">Not Match yet</p>
                      </span>
                    ) : (
                      <p className="flex items-center px-4 pr-4.5 p-1 border-2 border-red-700 rounded-2xl bg-[#FCFCFE] select-none">
                        <Heart color="#ff1659" fill="#ff1659" size={10} className="absolute" />
                        <Heart color="#ff1659" fill="#ff1659" stroke="white" strokeWidth={1} size={12} className="relative left-1.5" />
                        <span className="ml-2 text-[#C70039] font-extrabold">Merry Match!</span>
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-6 w-40">
                      <button
                        className="flex justify-between items-center cursor-pointer w-7 h-7 transition-all duration-300 ease-in-out hover:scale-120"
                        onClick={() => {
                          if (onChatSelect && match.match_id && match.name) {
                            onChatSelect(match.match_id, match.name);
                          } else if (match.match_id) {
                            router.push({
                              pathname: '/chat',
                              query: { 
                                matchId: match.match_id, 
                                matchName: match.name || 'Chat' 
                              }
                            });
                          } else {
                            router.push('/chat');
                          }
                        }}
                      >
                        <MessageCircleMore color="white" fill="#646D89" size={22} />
                      </button>

                      <button
                        onClick={() => handleProfile?.(match.id)}
                        className="flex justify-between items-center cursor-pointer w-7 h-7 transition-all duration-300 ease-in-out hover:scale-120"
                      >
                        <Eye color="white" fill="#646D89" size={28} />
                      </button>

                      <button
                        onClick={() => toggleMatch?.(effectiveMatchId, !isUnmatched, match.other_user_id)}
                        className="group relative flex items-center justify-center rounded-lg cursor-pointer w-10 h-10 bg-[#C70039] transition-all duration-300 ease-in-out hover:scale-110"
                      >
                        {!isUnmatched ? (
                          <>
                            <span className="absolute opacity-100 transition-opacity duration-200 group-hover:opacity-0">
                              <Heart color="white" fill="white" size={20} />
                            </span>
                            <span className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <X color="white" size={22} strokeWidth={3} />
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="absolute opacity-100 transition-opacity duration-200 group-hover:opacity-0">
                              <X color="white" size={22} strokeWidth={3} />
                            </span>
                            <span className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <Heart color="white" fill="white" size={20} />
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative lg:left-65">
                  <div className="flex gap-1 items-center mt-5 lg:relative lg:bottom-10 lg:mt-8">
                    <p className="font-bold text-[#2A2E3F] text-lg">{match.name}</p>
                    <p className="ml-2 font-bold text-[#646D89] text-lg">{match.age}</p>
                    <MapPin color="white" fill="#FFB1C8" size={15} className="ml-1" />
                    <p className="text-[#646D89]">
                      {formatLocation ? formatLocation(match.location) : ""}
                    </p>
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
              <div className="mt-3 lg:mt-0 lg:mb-8"></div>
            </div>
          );
        })
      ) : (
        <p className="text-center text-gray-500 mt-4">No matches found.</p>
      )}

      {totalPages > 1 && (
        <Stack spacing={2} alignItems="center" mt={4} >
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(event, value) => setCurrentPage(value)}
          size="large"
          shape="rounded"
          sx={{
            '& .MuiPaginationItem-root': {
              color: '#ff1659 !important',
              borderRadius: '8px',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: '#FFD6E0 !important',
                color: '#C70039 !important',
                transform: 'scale(1.08)',
                boxShadow: '0 0 8px rgba(255, 22, 89, 0.3)',
              },
            },
            '& .MuiPaginationItem-root.Mui-selected': {
              backgroundColor: '#ff1659 !important',
              color: '#fff !important',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: '#ff1659 !important',
                transform: 'scale(1.08)',
                boxShadow: '0 0 8px rgba(255, 22, 89, 0.4) !important',
              },
            },
          }}
          showFirstButton
          showLastButton
        />
      </Stack>
      )}
    </>
  );
}