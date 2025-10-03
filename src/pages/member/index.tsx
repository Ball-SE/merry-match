import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Member from "@/components/payment/Member";
import { useAuth } from '@/hooks/useAuth';

function MemberPage() {
    const { isLoggedIn } = useAuth('/login');

    if (isLoggedIn === null) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        return <div>Redirecting to login...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <NavBar />
            <div className="flex-grow">
                <Member />
            </div>
            <Footer />
        </div>
    );
}

export default MemberPage;