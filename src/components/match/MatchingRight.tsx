import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

function MatchingRight() {
    // สร้าง state สำหรับเก็บช่วงอายุ [อายุต่ำสุด, อายุสูงสุด]
    // เริ่มต้นที่ 18-50 ปี
    const [ageRange, setAgeRange] = useState([18, 50])

    return (
        <div className="w-full h-full flex flex-col">
            <h1 className="text-black text-base font-bold">Gender you interest</h1>
            <div className="flex flex-col gap-2 mt-5">
                <div className="flex items-center gap-2">
                    <Checkbox />
                    <label htmlFor="Fefault">Default</label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox />
                    <label htmlFor="Female">Female</label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox />
                    <label htmlFor="Non-bunary people">Non-bunary people</label>
                </div>
            </div>

            <div className="mt-5 ">
                <h1 className="text-black text-base font-bold">Age range</h1>
                {/* Range Slider สำหรับเลือกช่วงอายุ */}
                <Slider 
                    className="mt-5"
                    min={18}                    // อายุต่ำสุด 18 ปี
                    max={80}                    // อายุสูงสุด 80 ปี
                    value={ageRange}            // ค่าปัจจุบันจาก state
                    onValueChange={setAgeRange} // ฟังก์ชันอัพเดท state เมื่อลาก slider
                    step={1}                    // เพิ่มทีละ 1 ปี
                />
            </div>

            {/* Input fields ที่เชื่อมต่อกับ slider */}
            <div className="mt-5 flex flex-row gap-5 items-center">
                {/* Input สำหรับอายุต่ำสุด */}
                <input 
                    className="w-1/2 border border-gray-300 rounded-md p-2" 
                    value={ageRange[0]}  // แสดงค่าอายุต่ำสุดจาก state
                    onChange={(e) => setAgeRange([parseInt(e.target.value) || 18, ageRange[1]])} // อัพเดทอายุต่ำสุด
                    type="number"
                    min="18"
                    max="80"
                />
                -
                {/* Input สำหรับอายุสูงสุด */}
                <input 
                    className="w-1/2 border border-gray-300 rounded-md p-2" 
                    value={ageRange[1]}  // แสดงค่าอายุสูงสุดจาก state
                    onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value) || 50])} // อัพเดทอายุสูงสุด
                    type="number"
                    min="18"
                    max="80"
                />
            </div>
            
            <div className="mt-auto">
                <div className="border-t-[1px] border-gray-300 mt-10"></div>
                <div className="flex flex-row gap-5 items-center mt-10">
                    <button 
                    className="w-1/2 button-ghost text-[#C70039] rounded-md p-2"
                    onClick={() => setAgeRange([18, 50])}
                    >
                        Clear
                    </button>
                    <button 
                    className="w-1/2 button-primary bg-[#C70039] text-white rounded-md p-2"
                    >
                        Search
                        </button>
                </div>
            </div>
        </div>
    )
}
export default MatchingRight;