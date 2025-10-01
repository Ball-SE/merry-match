import React, { useState, useEffect } from 'react';
import MatchingLeft from "@/components/match/MatchingLeft";
import NavBar from "@/components/NavBar";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/chatWindow";
import { useAuth } from '@/hooks/useAuth';
import { MatchingProvider } from "@/context/MatchingContext";
import { MatchWithProfile } from '@/services/chatService';

function Chat() {
    const { isLoggedIn } = useAuth('/login');
    const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);

    if (isLoggedIn === null) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        return <div>Redirecting to login...</div>;
    }

    return (
        <MatchingProvider>
            <div className="h-screen flex flex-col">
                <NavBar />
                <div className="flex flex-1 w-full h-full">
                    <div className="basis-1/5 p-4 overflow-auto bg-[#F6F7FC]">
                        <MatchingLeft />
                    </div>
                    <div className="basis-4/5 flex min-h-0 bg-white">
                        {selectedMatch ? (
                            <ChatWindow 
                                match={selectedMatch} 
                                onClose={() => setSelectedMatch(null)} 
                            />
                        ) : (
                            <ChatList onSelectMatch={setSelectedMatch} />
                        )}
                    </div>
                </div>
            </div>
        </MatchingProvider>
    )
}

export default Chat;