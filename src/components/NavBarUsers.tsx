import Link from "next/link";

function NavBarUsers() {
    return (
        <nav className="w-full bg-white shadow-md">
            <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-row justify-between items-center">
            <Link href="/" className="w-auto flex flex-row">
                <h1 className="text-4xl">Merry</h1>
                <h1 className="text-4xl text-[#C70039] font-bold">Match</h1>
            </Link>
            <div className="">
            <a href="/" className="button-ghost">Why Merry Match?</a>
            <a href="/" className="button-ghost">How to Merry</a>
                <Link href="/" className="button-primary bg-[#C70039] text-white">Login</Link>
            </div>
            </div>
        </nav>
    )
}

export default NavBarUsers;