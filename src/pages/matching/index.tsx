import MatchingLeft from "@/components/match/MatchingLeft";
import MatchingCenter from "@/components/match/MatchingCenter";
import MatchingRight from "@/components/match/MatchingRight";
import NavBar from "@/components/NavBar";
import { useAuth } from '@/hooks/useAuth';
import { MatchingProvider } from "@/context/MatchingContext";

function Matching() {
    const { isLoggedIn } = useAuth('/login');

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
                <div className="flex flex-1 w-full h-full overflow-hidden">
                    <div className="hidden sm:block basis-1/4 p-4 overflow-auto bg-[#F6F7FC]">
                        <MatchingLeft />
                    </div>
                    <div className="flex-1 sm:basis-4/4 flex sm:min-h-0 bg-black">
                        <MatchingCenter />
                    </div>
                    <div className="hidden sm:block basis-1/4 p-4 overflow-auto bg-[#F6F7FC]">
                        <MatchingRight />
                    </div>
                </div>
            </div>
        </MatchingProvider>
    )
}

export default Matching;