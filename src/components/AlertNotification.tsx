import { HiMiniBellAlert } from "react-icons/hi2";
import { useState } from "react";

export const AlertNotiNavbar = () => {
    const notifications = [
        {
            id: 1,
            name: "Khal Drogo",
            image: "/assets/knal.png",
            message: "Just Merry you!",
            subMessage: "Click here to see profile",
            hasHeart: true
        },
        {
            id: 2,
            name: "Daeny",
            image: "/assets/daeny.png",
            message: "Merry you back!",
            subMessage: "Let's start conversation now",
            hasHeart: true,
            multipleHearts: true
        },
        {
            id: 3,
            name: "Ygritte",
            image: "/assets/ygritte.png",
            message: "Merry you back!",
            subMessage: "Let's start conversation now",
            hasHeart: true
        }
    ];

    return (
        <div className="flex flex-col w-full h-full sm:w-[320px] sm:h-auto sm:max-w-[320px] bg-white border-0 sm:border-[1px] sm:border-[#E4E6ED] rounded-none sm:rounded-2xl shadow-none sm:shadow-lg p-4 overflow-y-auto">
            <div className="flex flex-col gap-3">
                {notifications.map((notification) => (
                    <div 
                        key={notification.id}
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                        <div className="relative">
                            <img 
                                src={notification.image} 
                                alt={notification.name} 
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            {notification.hasHeart && (
                                <div className="absolute -bottom-1 -right-1">
                                    {notification.multipleHearts ? (
                                        // Multiple hearts for Daeny
                                        <div className="relative">
                                            <div className="absolute -top-0 -left-1.5 w-6 h-6 flex items-center justify-center">
                                                <img 
                                                    src="/assets/merry.png" 
                                                    alt="heart" 
                                                    className="w-3 h-3"
                                                />
                                            </div>
                                            <div className="relative w-6 h-6 flex items-center justify-center">
                                                <img 
                                                    src="/assets/merry.png" 
                                                    alt="heart" 
                                                    className="w-3 h-3"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        // Single heart for others
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            <img 
                                                src="/assets/merry.png" 
                                                alt="heart" 
                                                className="w-3 h-3"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="text-sm text-gray-800 font-medium">
                                <span className="text-gray-600">'{notification.name}'</span>{" "}
                                <span className="text-gray-800">{notification.message}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {notification.subMessage}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const AlertNotification = () => {
    const [isOpenAlertNotification, setIsOpenAlertNotification] = useState(false);

    const handleOpenAlertNotification = () => {
        setIsOpenAlertNotification(!isOpenAlertNotification);
    }

    return (
        <div className="relative">
            <div className="w-[28px] h-[28px] sm:w-[48px] sm:h-[48px] rounded-full bg-[#F6F7FC] flex justify-center items-center">
                <button onClick={handleOpenAlertNotification}>
                    <HiMiniBellAlert className="w-[20px] h-[21px]" color="#FFB1C8"/>
                </button>
            </div>
            {isOpenAlertNotification && (
                <div className="fixed inset-0 top-[55px] sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:inset-auto z-50">
                    <AlertNotiNavbar />
                </div>
            )}
        </div>
    )
}