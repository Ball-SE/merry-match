import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface FullScreenLoaderProps {
  show: boolean;
}

export default function FullScreenLoader({ show }: FullScreenLoaderProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true); // show loader
    } else {
      // รอให้ fade-out animation จบก่อนซ่อน
      const timeout = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [show]);

  if (!visible) return null;

  const words = ["Merry", "Match!"];

  return (
    <div
      className={`fixed inset-0 z-9999999 flex flex-col justify-center items-center bg-[#FFE1EA] bg-opacity-70 transition-opacity duration-500 ${
        show ? "opacity-100" : "opacity-0"
      } select-none`}
    >
        
      {/* Heart animation */}
        <div className="animate-pulse relative flex justify-center items-center ">
            <Heart color="#FF6390" fill="#FF6390" className='w-auto h-100'/>
            </div> 
        <div className="animate-pulse absolute flex justify-center items-center bottom-80"> 
            <Heart color="#FFE1EA" fill="#FFE1EA" className='w-auto h-70'/> 
        </div>
        <div className="animate-ping absolute flex justify-center items-center"> 
            <Heart color="#FF6390" fill="#FF6390" className='w-auto h-80'/> 
        </div> 
        <div className="animate-ping absolute flex justify-center items-center"> 
            <Heart color="#FFE1EA" fill="#FFE1EA" className='w-auto h-80'/>
        </div>

      {/* Text animation */}
      <div className="flex space-x-3">
        {words.map((word, wIndex) => (
          <div key={wIndex} className="flex space-x-0.4">
            {word.split("").map((char, i) => (
              <p
                key={i}
                className="text-pink-500 text-5xl font-extrabold animate-smooth-bounce"
                style={{ animationDelay: `${(i + wIndex * 0.5) * 0.1}s` }}
              >
                {char}
              </p>
            ))}
          </div>
        ))}
      </div>
      
    </div>
  );
}
