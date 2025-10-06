import React from "react";
import Image from "next/image";
import Footer from "../components/Footer";
import NavBarUsers from "../components/NavBarUsers"; // ✅ Use this instead
import ComplaintForm from "../components/complaint/ComplaintForm";

const ComplaintPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <NavBarUsers />

      {/* Main Section */}
      <main className="flex flex-col md:flex-row items-center justify-center flex-1 px-6 py-12 space-y-8 md:space-y-0 md:space-x-16 bg-white">
        {/* Left Content */}
        <div className="max-w-md w-full text-left">
          <h2 className="text-sm uppercase tracking-wide text-[#A62D82] mb-3">
            Complaint
          </h2>
          <h1 className="text-2xl md:text-3xl font-bold text-[#A62D82] leading-snug mb-6">
            If you have any trouble <br />
            Don&apos;t be afraid to tell us!
          </h1>

          <ComplaintForm />
        </div>

        {/* Right Image */}
        <div className="w-[280px] md:w-[380px] lg:w-[420px]">
          <Image
            src="/assets/image3.png"
            alt="Person using laptop"
            width={400}
            height={400}
            className="rounded-full object-cover"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ComplaintPage;
