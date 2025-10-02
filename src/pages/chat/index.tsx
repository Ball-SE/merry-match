import MatchingLeft from "@/components/match/MatchingLeft";
import NavBar from "@/components/NavBar";
import Chat from "@/components/chat/Chat";
import { useAuth } from '@/hooks/useAuth';
import { MatchingProvider } from "@/context/MatchingContext";
import { useState } from 'react';
import { LuArrowLeft } from 'react-icons/lu';

function ChatPage() {
    const { isLoggedIn } = useAuth('/login');
    const [showChat, setShowChat] = useState(false);
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
    const [selectedMatchName, setSelectedMatchName] = useState<string>('');

    if (isLoggedIn === null) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        return <div>Redirecting to login...</div>;
    }

    return (
        <MatchingProvider>
            <div className="h-screen flex flex-col">
                {/* NavBar - Always visible */}
                <NavBar />

                {/* Mobile Chat Header - Only show when in chat */}
                {showChat && (
                    <div className="md:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setShowChat(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <LuArrowLeft size={20} className="text-gray-600" />
                            </button>
                            <h1 className="text-lg font-semibold text-gray-900">{selectedMatchName || 'Chat'}</h1>
                        </div>
                    </div>
                )}

                <div className="flex flex-1 w-full h-full relative">
                    {/* Desktop Sidebar */}
                    <div className="hidden md:block md:basis-1/4 lg:basis-1/5 overflow-auto bg-[#F6F7FC] ">
                        <div className="w-full p-4 h-full">
                            <MatchingLeft onChatSelect={(matchId: string, matchName: string) => {
                                setSelectedMatchId(matchId);
                                setSelectedMatchName(matchName);
                            }} />
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden flex-1 flex flex-col">
                        {!showChat ? (
                            /* Mobile MatchingLeft - Full screen */
                            <div className="flex-1 overflow-auto bg-[#F6F7FC]">
                                <div className="p-4 w-full">
                                    <MatchingLeft onChatSelect={(matchId: string, matchName: string) => {
                                        setSelectedMatchId(matchId);
                                        setSelectedMatchName(matchName);
                                        setShowChat(true);
                                    }} />
                                </div>
                            </div>
                        ) : (
                            /* Mobile Chat - Full screen */
                            <div className="flex-1 flex min-h-0">
                                <div className="w-full">
                                    {selectedMatchId && <Chat matchId={selectedMatchId} />}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Chat Area */}
                    <div className="hidden md:flex flex-1 md:basis-3/4 lg:basis-4/5 min-h-0">
                        <div className="w-full">
                            {selectedMatchId ? (
                                <Chat matchId={selectedMatchId} />
                            ) : (
                                <div className="h-full flex items-center justify-center bg-[#160404]">
                                    <div className="text-white text-center">
                                        <p className="text-lg mb-2">Select a match to start chatting</p>
                                        <p className="text-sm opacity-70">Choose someone from your matches to begin the conversation</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MatchingProvider>
    )
}

export default ChatPage;