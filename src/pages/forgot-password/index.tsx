import NavBarNonUser from "@/components/NavBarNonUser";
import ForgotPassword from "@/components/login/ForgotPassword";
import { useRouter } from 'next/router';

function ForgotPasswordPage() {
    const router = useRouter();

    const handleBackToLogin = () => {
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-white shadow-lg">
            <NavBarNonUser />
            <ForgotPassword onBackToLogin={handleBackToLogin} />
        </div>
    );
}

export default ForgotPasswordPage;

