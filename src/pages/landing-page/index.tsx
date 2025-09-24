import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Element } from "react-scroll";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase/supabaseClient";

function HomePage(){
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        let init = async () => {
            const { data } = await supabase.auth.getSession();
            if (mounted) setIsLoggedIn(!!data?.session);
        };
        init();

        const {data: authListener} = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (mounted) setIsLoggedIn(!!session);
            });

        return () => {
            mounted = false;
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const handleStartMatching = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (isLoggedIn) {
            router.push("/matching");
        } else {
            router.push("/login");
        }

    };

    return (
        <div className="flex justify-center items-center bg-[#160404]">
            <div className="m-auto w-full ">
            <NavBar />
                {/* Hero Section */}
                <section className="sm:h-[818px] overflow-hidden pt-70 md:pt-50 sm:pb-20 bg-[#160404]">
                    <div className="m-auto max-w-[1200px]  relative">

                        <div className="absolute w-[67px] h-[67px] top-[-60px] left-[-180px] bg-[#532341] rounded-full"></div>
                        <div className="absolute w-2 h-2 top-[360px] right-[70px] bg-[#7B4429] rounded-full"></div>
                        <div className="absolute w-[7px] h-[7px] top-[-70px] left-[30px] bg-[#FFB1C8] rounded-full"></div>

                        <div className="flex flex-col  items-center justify-center text-center ">
                            <div className="max-w-xl w-[358px] relative z-10">
                                <h1 className="text-6xl font-black text-white leading-tight mb-6">
                                Make the <br />
                                first 'Merry'
                                </h1>
                                <p className="text-xl text-white mb-12">
                                If you feel lonely, let's start meeting new people in your
                                area! <br />
                                Don't forget to get Merry with us
                                </p>
                                {/* authen ตรงนี้ */}
                                <Link
                                    href="/matching"
                                    onClick={handleStartMatching}
                                    className="bg-[#C70039] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#950028] transition-colors">
                                Start matching!
                                </Link>
                            </div>

                            {/* Profile Images */}
                            <div className="relative w-1/2 h-[600px]">
                                <div>
                                <div className="absolute left-[-115px] bottom-[995px] w-[210px] h-[305px] sm:left-[-210px] sm:bottom-[920px] md:left-[550px] md:bottom-[760px] sm:w-[286px] sm:h-[500px] rounded-[999px] bg-gray-200 overflow-hidden">
                                    <img
                                    src="/assets/image1.png"
                                    alt="Profile1"
                                    className="w-full h-full object-cover rounded-[999px]"
                                    />
                                </div>
                                <div className="absolute bottom-[1050px] right-[10px] sm:bottom-[980px] sm:right-[190px] w-[160px] md:bottom-[820px] md:right-[-275px] bg-[#64001D] text-white p-3 rounded-[24px_24px_24px_0px] text-sm font-semibold">
                                    Hi! Nice to meet you
                                </div>
                                </div>

                                <div>
                                <div className="absolute sm:right-[-210px] sm:bottom-[10px] right-[-140px] bottom-[150px] w-[217px] h-[376px] md:right-[510px] md:bottom-[360px] sm:w-[286px] sm:h-[500px] rounded-[999px] bg-gray-200 overflow-hidden">
                                    <img
                                    src="/assets/image2.png"
                                    alt="Profile2"
                                    className="w-full h-full object-cover rounded-[999px] grayscale "
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute flex flex-row w-[180px] sm:w-[180px] sm:bottom-[-180px] sm:left-[170px] bottom-[-180px] left-[10px] md:bottom-[150px] md:left-[-230px] bg-[#64001D] text-white p-3 rounded-[24px_24px_0px_24px] text-sm font-semibold">
                                    <svg
                                        className="hidden sm:flex mr-2"
                                        width="10"
                                        height="10"
                                        viewBox="0 0 10 10"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                        d="M7.73534 9.22569L7.73187 9.22615L7.72041 9.22661C7.65323 9.22905 7.58604 9.23054 7.51888 9.23108C6.70945 9.2342 5.90473 9.15349 5.11807 8.9903C3.72123 8.6949 2.03873 8.03119 1.16671 6.5208C0.516029 5.39379 0.984887 3.93141 2.17361 3.2451C2.50316 3.05276 2.87026 2.93442 3.24761 2.89888C3.62495 2.86335 4.00283 2.91154 4.35314 3.03986C4.41717 2.67225 4.56443 2.32083 4.78395 2.01177C5.00346 1.7027 5.2896 1.44393 5.62105 1.25472C6.80937 0.568643 8.31026 0.893788 8.96094 2.0208C9.83319 3.53158 9.56673 5.32052 9.12368 6.67715C8.8717 7.44001 8.53924 8.17727 8.1318 8.8767C8.09783 8.93472 8.06302 8.99229 8.02738 9.04938L8.02126 9.05907L8.01935 9.06223L8.01837 9.0633C7.98779 9.11044 7.94616 9.14988 7.89711 9.1782C7.84807 9.20652 7.79309 9.22285 7.73698 9.22577L7.73556 9.22607L7.73534 9.22569Z"
                                        fill="#F4EBF2"
                                        />
                                    </svg>
                                    Nice to meet you too!
                                    </div>
                                </div>
                                </div>

                                <div className="absolute w-[60px] h-[60px] top-[-100px] right-[-355px] bg-[#320000] rounded-full">
                                <div className="relative">
                                    <div className="absolute top-[30px] left-[-15px] ">
                                    <img
                                        src="/assets/smile-emoji.png"
                                        alt="smile-emoji"
                                        className="w-7 h-7 object-cover rounded-full "
                                    />
                                    </div>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                </section>

                {/* why merry match */}
                <Element name="why-merry-match">
                <section className="m-auto sm:py-20 bg-[#160404]">
                    <div className="flex md:flex-row m-auto mx-auto px-6">
                        <div className="flex flex-col xl:flex-row  lg:flex-col items-center justify-center w-full">
                            <div className="max-w-xl">
                                <h2 className="text-5xl font-extrabold text-[#DF89C6]">Why Merry Match?</h2>
                                <p className="text-xl text-white mb-6">
                                Merry Match is a new generation of online dating website for
                                everyone
                                </p>
                                <p className="text-[#F6F7FC] text-base leading-relaxed">
                                Whether you're committed to dating, meeting new people,
                                expanding your social network, meeting locals while traveling,
                                or even just making a small chat with strangers.
                                <br />
                                <br />
                                This site allows you to make your own dating profile, discover
                                new people, save favorite profiles, and let them know that
                                you're interested
                                </p>
                            </div>

                            <img src="/assets/vector.png" alt="why-merry-match" className="" />
                        </div>
                    </div>
                </section>
                </Element>

                {/* how to marry */}
                <Element name="how-to-merry">
                <section className=" m-auto py-20 bg-[#160404]">
                    <div className="m-auto max-w-[1200px] px-6">
                        <h2 className="text-5xl font-extrabold text-[#DF89C6] text-center mb-12">
                        How to Merry
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="bg-[#2A0B21] rounded-[40px] p-8 text-center">
                            <div className="w-[120px] h-[120px] bg-[#411032] rounded-full mx-auto mb-10 flex justify-center items-center">
                            <img
                                src="/assets/emote-1.png"
                                alt="Upload-emoji"
                                className="w-[50px] h-[50px] object-cover rounded-full "
                            />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">
                            Upload your cool picture
                            </h3>
                            <p className="text-[#C8CCDB]">Lorem ipsum is a placeholder text</p>
                        </div>
                        <div className="bg-[#2A0B21] rounded-[40px] p-8 text-center">
                            <div className="w-[120px] h-[120px] bg-[#411032] rounded-full mx-auto mb-10 flex justify-center items-center ">
                            <img
                                src="/assets/emote-2.png"
                                alt="Explore-emoji"
                                className="w-[50px] h-[50px] "
                            />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">
                            Explore and find the one you like
                            </h3>
                            <p className="text-[#C8CCDB]">Lorem ipsum is a placeholder text</p>
                        </div>
                        <div className="bg-[#2A0B21] rounded-[40px] p-8 text-center">
                            <div className="w-[120px] h-[120px] bg-[#411032] rounded-full mx-auto mb-10 flex justify-center items-center ">
                            <img
                                src="/assets/emote-3.png"
                                alt="Explore-emoji"
                                className="w-[50px] h-[50px] "
                            />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">
                            Click 'Merry' for get to know!
                            </h3>
                            <p className="text-[#C8CCDB]">Lorem ipsum is a placeholder text</p>
                        </div>
                        <div className="bg-[#2A0B21] rounded-[40px] p-8 text-center">
                            <div className="w-[120px] h-[120px] bg-[#411032] rounded-full mx-auto mb-10 flex justify-center items-center ">
                            <img
                                src="/assets/emote-4.png"
                                alt="Explore-emoji"
                                className="w-[50px] h-[50px] "
                            />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">
                            Start chating and relationship
                            </h3>
                            <p className="text-[#C8CCDB]">Lorem ipsum is a placeholder text</p>
                        </div>
                        </div>
                    </div>
                </section>
                </Element>

                {/* let's start finding */}
                <Element name="start-matching">
                <section className=" py-0 sm:py-20 bg-[#160404] ">
                    <div className="m-auto sm:max-w-[1200px] sm:px-6 ">
                        <div className="md:rounded-[32px] overflow-hidden bg-gradient-to-r from-[#820025] to-[#A95BCD] h-[564px] md:h-[369px]  ">
                            <div className="py-20 px-12 text-center relative">
                            <div className="absolute top-[50px] left-[-20px] inset-0 bg-[url('/assets/heart.png')] bg-cover opacity-20"></div>
                                <h2 className="text-5xl font-extrabold text-white mb-12 relative z-10">
                                Let's start finding <br />
                                and matching someone new
                                </h2>
                                {/* authen ตรงนี้ */}
                                <Link href="/matching" 
                                onClick={handleStartMatching}
                                className="bg-[#FFE1EA] text-[#950028] px-6 py-3 rounded-full font-bold hover:bg-[#FFB1C8] transition-colors relative z-10">
                                Start Matching!
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                </Element>
            <Footer />
            </div>
        </div>
    )
}

export default HomePage;