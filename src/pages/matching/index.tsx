import MatchingLeft from "@/components/match/MatchingLeft";
import MatchingCenter from "@/components/match/MatchingCenter";
import MatchingRight from "@/components/match/MatchingRight";
import NavBar from "@/components/NavBar";


function Matching() {
    return (
        <div className="h-screen flex flex-col">
            <NavBar />
            <div className="flex flex-1 w-full pt-5">
                <div className="basis-1/4 p-4 overflow-auto">
                    <MatchingLeft />
                </div>
                <div className="basis-1/2 p-4 flex min-h-0">
                    <MatchingCenter />
                </div>
                <div className="basis-1/4 p-4 overflow-auto">
                    <MatchingRight />
                </div>
            </div>
        </div>
    )
}

export default Matching;