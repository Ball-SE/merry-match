import { HiMiniBellAlert } from "react-icons/hi2";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: {
    match_type?: string;
    matched_user_id?: string;
    matched_user_name?: string;
    matched_user_photo?: string;
    match_id?: string;
    message_preview?: string;
    sender_id?: string;
    sender_name?: string;
    sender_photo?: string;
    liker_user_id?: string;
    liker_user_name?: string;
    liker_user_photo?: string;
  };
  is_read: boolean;
  created_at: string;
};

type NotificationsProps = {
  notifications?: Notification[];
  unreadCount?: number | null;
  loading?: boolean;
  error?: string | null;
  markAsRead?: (notificationIds: string[]) => Promise<void>;
};

export const AlertNotiNavbar = ({
  notifications,
  markAsRead,
}: NotificationsProps) => {
  const router = useRouter();
  // แสดงเฉพาะที่ยังไม่อ่าน และจำกัด 5 รายการล่าสุด
  const visible = (notifications ?? []).slice(0, 15);
    //  .filter(n => !n.is_read)      // ยังไม่อ่านเท่านั้น

  const handleNotificationClick = async (notification: Notification) => {
    // ไม่ mark read ทันทีเมื่อคลิก เพื่อให้ยังคงเป็น unread ระหว่างเปิดดู // EDIT
    // if (!notification.is_read) {
    //   await markAsRead([notification.id]);
    // }

    if (notification.type === "match") {
      if (notification.data?.matched_user_id) {
        router.push(`/user-profile/${notification.data.matched_user_id}`);
      }
    } else if (notification.type === "message") {
      router.push(`/chat?matchId=${notification.data.match_id}`);
    } else if (notification.type === "like") {
      if (notification.data?.liker_user_id) {
        router.push(`/user-profile/${notification.data.liker_user_id}`);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full sm:w-[300px] sm:h-[400px] sm:max-h-[400px] bg-white border-0 sm:border-[1px] sm:border-[#E4E6ED] rounded-none sm:rounded-2xl shadow-none sm:shadow-lg p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-gray-100">
      <div className="flex flex-col gap-3">
        {visible.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No notifications yet</p>
          </div>
        ) : (
          visible.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${!notification.is_read
                ? "bg-[#FFE1EA]"
                : ""
                }`}
            >
              <div className="relative">
                <Image
                  src={
                    notification.type === "like"
                      ? notification.data?.liker_user_photo || "/assets/user.jpg"
                      : notification.data?.matched_user_photo ||
                      notification.data?.sender_photo ||
                      "/assets/user.jpg"
                  }
                  alt={notification.data?.matched_user_name || notification.data?.sender_name || "User"}
                  className="w-12 h-12 rounded-full object-cover"
                  width={56}
                  height={56}
                  onError={(e) => {
                    e.currentTarget.src = "/assets/user.jpg";  // ✅ fallback เมื่อโหลดไม่ได้
                  }}
                />
                {notification.type === "match" && (
                  <div className="absolute -bottom-1 -right-1">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Image
                        src="/assets/twoheart.png"
                        alt="heart"
                        className="w-6 h-3.5"
                        width={20}
                        height={20}
                      />
                    </div>
                  </div>
                )}
                {notification.type === "like" && (
                  <div className="absolute -bottom-1 -right-1">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Image
                        src="/assets/merry.png"
                        alt="twoheart"
                        className="w-3.5 h-3.5"
                        width={20}
                        height={20}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-800 font-medium">
                  <span className="text-gray-600">{notification.title}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {notification.message}
                </div>
              </div>
              {!notification.is_read && (
                <div className="w-2 h-2 bg-[#FFE1EA] rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const AlertNotification = ({
  notifications,
  unreadCount,
  loading,
  error,
  markAsRead,
}: NotificationsProps) => {
  const [isOpenAlertNotification, setIsOpenAlertNotification] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // ใช้สำหรับดัก route change

  // เคยเปิดดรอปดาวน์ไหม และกันยิงซ้ำ 
  const hasOpenedRef = useRef(false);   // เปิดครั้งแรกแล้วหรือยัง 
  const markingRef = useRef(false);     // กัน PUT ซ้ำซ้อน 

  const handleOpenAlertNotification = async () => {                   
    const next = !isOpenAlertNotification;                            
    // ถ้ากำลังปิด → mark read (ครั้งเดียว)                          
    if (!next && hasOpenedRef.current) {                              
      const toRead = (notifications ?? []).filter(n => !n.is_read).map(n => n.id); 
      if (toRead.length > 0 && !markingRef.current) {                 
        markingRef.current = true;                                    
        await markAsRead?.(toRead);                                     
        markingRef.current = false;                                   
      }
    }
    if (next) hasOpenedRef.current = true;                            
    setIsOpenAlertNotification(next);                                 
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setIsOpenAlertNotification(false);
      }
    };

    if (isOpenAlertNotification) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenAlertNotification]);

  // เมื่อเริ่มเปลี่ยนหน้า → mark read ให้เหมือนกัน // EDIT
  useEffect(() => {
    const handleRouteStart = async () => {
      if (!hasOpenedRef.current) return;                                         // EDIT
      const toRead = (notifications ?? []).filter(n => !n.is_read).map(n => n.id);  // EDIT
      if (toRead.length > 0 && !markingRef.current) {                 // EDIT
        markingRef.current = true;                                    // EDIT
        await markAsRead?.(toRead);                                     // EDIT
        markingRef.current = false;                                   // EDIT
      }
    };
    router.events.on("routeChangeStart", handleRouteStart);
    return () => router.events.off("routeChangeStart", handleRouteStart);
  }, [notifications, markAsRead, router.events]);          // EDIT

  if (error) {
    return (
      <div className="w-[28px] h-[28px] sm:w-[48px] sm:h-[48px] rounded-full bg-red-100 flex justify-center items-center">
        <HiMiniBellAlert className="w-[20px] h-[21px]" color="#ef4444" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-[28px] h-[28px] sm:w-[48px] sm:h-[48px] rounded-full bg-[#F6F7FC] flex justify-center items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  

  return (
    <div className="relative" ref={notiRef}>
      <div className="w-[28px] h-[28px] sm:w-[48px] sm:h-[48px] rounded-full bg-[#F6F7FC] flex justify-center items-center">
        <button onClick={handleOpenAlertNotification} className="relative">
          <HiMiniBellAlert className="w-[20px] h-[21px] cursor-pointer transition-all ease-in-out duration-280 hover:scale-120" color="#FFB1C8" />
          {typeof unreadCount === "number" && unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[0.5rem] rounded-full w-3.5 h-3.5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </button>
      </div>
      {isOpenAlertNotification && (
        <div className="fixed inset-0 top-[55px] sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:inset-auto z-50 transition-all duration-300 ease-out transform opacity-100 scale-100 animate-fadeIn">
          <AlertNotiNavbar
            notifications={notifications}
            unreadCount={unreadCount}
            loading={loading}
            error={error}
            markAsRead={markAsRead}
          />
        </div>
      )}
    </div>
  );
};