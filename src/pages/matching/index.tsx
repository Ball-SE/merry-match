import MatchingLeft from "@/components/match/MatchingLeft";
import MatchingCenter from "@/components/match/MatchingCenter";
import MatchingRight from "@/components/match/MatchingRight";
import NavBarUsers from "@/components/NavBarUsers";


function Matching() {
    return (
        <div className="">
            <NavBarUsers />
            <div className="flex flex-row mt-30 w-full">
                <div className="w-1/3">
                    <MatchingLeft />
                </div>
                <div className="w-2/3">
                    <MatchingCenter />
                </div>
                <div className="w-1/3">
                    <MatchingRight />
                </div>
            </div>
        </div>
    )
}

export default Matching;