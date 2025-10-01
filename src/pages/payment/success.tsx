import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import PaymentSuccess from "@/components/payment/PaymentSuccess";
import { useAuth } from '@/hooks/useAuth';

function PaymentSuccessPage() {
    const { isLoggedIn } = useAuth('/login');

    if (isLoggedIn === null) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        return <div>Redirecting to login...</div>;
    }

    return (
        <div className="min-h-screen">
            <NavBar />
            <PaymentSuccess />
            <Footer />
        </div>
    );
}

export default PaymentSuccessPage;
