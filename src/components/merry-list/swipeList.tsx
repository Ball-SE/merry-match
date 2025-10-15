import { useState } from "react";
import { X, Heart, Eye, MapPin } from "lucide-react";
import Image from "next/image";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

type ProfileLocation = {
  city?: string;
  location?: string;
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
};

interface SwipeListProps {
  swipeList: Swipe[];
  handleProfile?: (userId: string | number) => void;
  unswipe?: (id: string | number) => void;
  formatLocation?: (loc: unknown) => string;
}

export default function SwipeList({ 
  swipeList, 
  handleProfile, 
  unswipe, 
  formatLocation 
}: SwipeListProps) {
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(swipeList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSwipes = swipeList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      {currentSwipes.length > 0 ? (
        currentSwipes.map((swipe) => {
          const firstPhoto = Array.isArray(swipe.photo_url)
            ? swipe.photo_url[0] || null
            : swipe.photo_url || null;
          const src = firstPhoto || "/assets/user.jpg";

          return (
            <div
              key={swipe.id}
              className="transition-all duration-300 ease-in-out hover:scale-[1.02] border-b-2 rounded-tr-xl rounded-tl-xl"
            >
              <div className="p-4 mt-2 lg:w-300 lg:flex lg:p-0 lg:mt-8">
                <div className="flex justify-between lg:w-290 lg:absolute">
                  <Image
                    src={src}
                    alt={swipe.gender || "profile"}
                    width={200}
                    height={200}
                    className="rounded-2xl w-40 h-40 object-cover lg:w-50 lg:h-50 lg:ml-5"
                  />
                  <div className="mt-7 mr-2 lg:mt-0 lg:mr-0 lg:order-3 justify-items-end">
                    <div className="flex items-center px-3 pr-4.5 p-1 border-2 border-gray-300 rounded-2xl bg-[#FCFCFE] select-none">
                      <p className="ml-2 text-gray-600">Not Match yet</p>
                    </div>
                    <div className="flex justify-between items-center w-24 mt-6">
                      <button
                        onClick={() => handleProfile?.(swipe.id)}
                        className="flex justify-between items-center cursor-pointer w-7 h-7 transition-all duration-300 ease-in-out hover:scale-120"
                      >
                        <Eye color="white" fill="#646D89" size={28} />
                      </button>
                      <button
                        onClick={() => unswipe?.(swipe.id)}
                        className="group relative flex items-center justify-center rounded-lg cursor-pointer w-10 h-10 bg-[#C70039] transition-all duration-300 ease-in-out hover:scale-110"
                      >
                        {/* ปกติแสดง ❤️ */}
                        <span className="absolute opacity-100 transition-opacity duration-200 group-hover:opacity-0">
                          <Heart color="white" fill="white" size={20} />
                        </span>
                        {/* Hover แล้วแสดง ❌ */}
                        <span className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <X color="white" size={22} strokeWidth={3} />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ข้อมูลโปรไฟล์ */}
                <div className="lg:relative left-65">
                  <div className="flex gap-1 items-center mt-5 lg:relative lg:bottom-10 lg:mt-8">
                    <p className="font-bold text-[#2A2E3F] text-lg">{swipe.name}</p>
                    <p className="ml-2 font-bold text-[#646D89] text-lg">{swipe.age}</p>
                    <MapPin color="white" fill="#FFB1C8" size={15} className="ml-1" />
                    <p className="text-[#646D89]">
                      {formatLocation ? formatLocation(swipe.location) : ""}
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
                      <p className="text-[#646D89] text-sm leading-7 lg:leading-8.5">{swipe.gender}</p>
                      <p className="text-[#646D89] text-sm leading-7 lg:leading-8.5">{swipe.sexual_preferences}</p>
                      <p className="text-[#646D89] text-sm leading-7 lg:leading-8.5">{swipe.racial_preferences}</p>
                      <p className="text-[#646D89] text-sm leading-7 lg:leading-8.5">{swipe.meeting_interests}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 lg:mt-0 lg:mb-8"></div>
            </div>
          );
        })
      ) : (
        <p className="text-center text-gray-500 mt-4">No swipes found.</p>
      )}

      {/* ✅ Pagination control */}
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