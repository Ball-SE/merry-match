import MatchingLeft from "@/components/match/MatchingLeft";
import MatchingCenter from "@/components/match/MatchingCenter";
import MatchingRight from "@/components/match/MatchingRight";
import NavBar from "@/components/NavBar";
import { useAuth } from '@/hooks/useAuth';

function Matching() {
    const { isLoggedIn } = useAuth('/login');

    // แสดง loading หรือไม่แสดงอะไรเลยขณะตรวจสอบ authentication
    if (isLoggedIn === null) {
        return <div>Loading...</div>;
    }

    // ถ้าไม่ได้ login ให้แสดงหน้า loading (จริงๆ จะถูก redirect ไปหน้า login แล้ว)
    if (!isLoggedIn) {
        return <div>Redirecting to login...</div>;
    }

    return (
        <div className="h-screen flex flex-col">
            <NavBar />
            <div className="flex flex-1 w-full h-full">
                <div className="basis-1/4 p-4 overflow-auto bg-[#F6F7FC]">
                    <MatchingLeft />
                </div>
                <div className="basis-2/2 p-4 flex min-h-0 bg-black">
                    <MatchingCenter />
                </div>
                <div className="basis-1/4 p-4 overflow-auto bg-[#F6F7FC]">
                    <MatchingRight />
                </div>
            </div>
        </div>
    )
}

export default Matching;