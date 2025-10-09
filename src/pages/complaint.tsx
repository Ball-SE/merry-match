import React from "react";
import Image from "next/image";
import Footer from "../components/Footer";
import NavBarUsers from "../components/NavBarUsers";
import ComplaintForm from "../components/complaint/ComplaintForm";

const ComplaintPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <NavBarUsers />

      {/* Main Section */}
      <main className="flex flex-col md:flex-row items-start md:items-center justify-center flex-1 px-6 py-12 gap-8 md:gap-24 lg:gap-32 bg-white mb-16">
        
        {/* Right Image - First on mobile (top), Second on desktop (right) */}
        <div className="w-[240px] md:w-[340px] lg:w-[380px] order-1 md:order-2 mx-auto md:mx-0">
          <Image
            src="/assets/image3.png"
            alt="Person using laptop"
            width={400}
            height={400}
            className="rounded-full object-cover"
          />
        </div>

        {/* Left Content - Second on mobile (bottom), First on desktop (left) */}
        <div className="max-w-md w-full text-left order-2 md:order-1">
          <h2 className="text-sm uppercase tracking-wide font-semibold text-[#7B4429] mb-3">
            Complaint
          </h2>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#A62D82] leading-snug mb-8 md:mb-16">
            If you have any trouble <br />
            Don&apos;t be afraid to tell us!
          </h1>

          <ComplaintForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ComplaintPage;