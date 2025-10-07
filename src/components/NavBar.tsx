import { useAuthContext } from '@/context/AuthContext';
import NavBarUsers from "./NavBarUsers";
import NavBarNonUser from "./NavBarNonUser";

function NavBar() {
  const { isLoggedIn, loading } = useAuthContext();

  if (loading) return <NavBarNonUser />;
  return isLoggedIn ? <NavBarUsers /> : <NavBarNonUser />;
}

export default NavBar;