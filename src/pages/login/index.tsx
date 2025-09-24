import NavBarNonUser from "@/components/NavBarNonUser";
import Login from "@/components/login/Login";

function LoginPage() {
    return (
        <div className="min-h-screen bg-white shadow-lg">
            <NavBarNonUser />
            <Login />
        </div>
    );
}

export default LoginPage;