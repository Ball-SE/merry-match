import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Package from "@/components/package/Package";
import { useAuth } from '@/hooks/useAuth';

export default function PackagePage() {
    const { isLoggedIn } = useAuth('/login');

    if (isLoggedIn === null) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        return <div>Redirecting to login...</div>;
    }
    
    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <Package />
            <Footer />
        </div>
    )
}