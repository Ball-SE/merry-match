import MatchingLeft from "@/components/match/MatchingLeft";
import MatchingCenter from "@/components/match/MatchingCenter";
import MatchingRight from "@/components/match/MatchingRight";
import NavBar from "@/components/NavBar";
import { useAuth } from '@/hooks/useAuth';

function Matching() {
    const { isLoggedIn, loading } = useAuth('/login');

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