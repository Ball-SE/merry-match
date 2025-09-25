import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"
import { useMatchingContext } from "@/context/MatchingContext"

function MatchingRight() {
    const { filters, updateFilters, applyFilters } = useMatchingContext();
    
    // ใช้ local state เพื่อให้ user ปรับแต่งได้ก่อนกด Search
    const [localGenders, setLocalGenders] = useState<string[]>(filters.selectedGenders);
    const [localAgeRange, setLocalAgeRange] = useState<number[]>(filters.ageRange);

    // อัพเดท local state เมื่อ context เปลี่ยน
    useEffect(() => {
        setLocalGenders(filters.selectedGenders);
        setLocalAgeRange(filters.ageRange);
    }, [filters]);

    // ฟังก์ชันสำหรับจัดการ checkbox
    const handleGenderChange = (gender: string, checked: boolean) => {
        if (checked) {
            setLocalGenders(prev => [...prev, gender]);
        } else {
            setLocalGenders(prev => prev.filter(g => g !== gender));
        }
    }

    // ฟังก์ชันสำหรับ search - อัพเดท context
    const handleSearch = () => {
        console.log("Selected genders:", localGenders);
        console.log("Age range:", localAgeRange);
        
        // ตรวจสอบว่ามีการเลือก gender หรือไม่
        if (localGenders.length === 0) {
            alert("กรุณาเลือก gender อย่างน้อย 1 ตัวเลือก");
            return;
        }

        // อัพเดท context ด้วยค่าใหม่
        updateFilters({
            selectedGenders: localGenders,
            ageRange: localAgeRange
        });

        // เรียก applyFilters เพื่อให้ components อื่นๆ รู้ว่าต้องอัพเดท
        applyFilters();
    }

    // ฟังก์ชันสำหรับ clear ทั้งหมด
    const handleClear = () => {
        setLocalAgeRange([18, 50]);
        setLocalGenders(['default']);
        
        // อัพเดท context ด้วย
        updateFilters({
            selectedGenders: ['default'],
            ageRange: [18, 50]
        });
        applyFilters();
    }

    return (
        <div className="w-full h-full flex flex-col pt-5">
            <h1 className="text-black text-base font-bold">Gender you interest</h1>
            <div className="flex flex-col gap-2 mt-5">
                <div className="flex items-center gap-2">
                    <Checkbox 
                        id="default"
                        checked={localGenders.includes("default")}
                        onCheckedChange={(checked) => handleGenderChange("default", !!checked)}
                    />
                    <label htmlFor="default">Default</label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox 
                        id="male"
                        checked={localGenders.includes("male")}
                        onCheckedChange={(checked) => handleGenderChange("male", !!checked)}
                    />
                    <label htmlFor="male">Male</label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox 
                        id="female"
                        checked={localGenders.includes("female")}
                        onCheckedChange={(checked) => handleGenderChange("female", !!checked)}
                    />
                    <label htmlFor="female">Female</label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox 
                        id="non-binary"
                        checked={localGenders.includes("non-binary")}
                        onCheckedChange={(checked) => handleGenderChange("non-binary", !!checked)}
                    />
                    <label htmlFor="non-binary">Non-binary people</label>
                </div>
            </div>

            <div className="mt-5 ">
                <h1 className="text-black text-base font-bold">Age range</h1>
                <Slider 
                    className="mt-5"
                    min={18}
                    max={80}
                    value={localAgeRange}
                    onValueChange={setLocalAgeRange}
                    step={1}
                />
            </div>

            <div className="mt-5 flex flex-row gap-5 items-center">
                <input 
                    className="w-1/2 border border-gray-300 rounded-md p-2" 
                    value={localAgeRange[0]}
                    onChange={(e) => setLocalAgeRange([parseInt(e.target.value) || 18, localAgeRange[1]])}
                    type="number"
                    min="18"
                    max="80"
                />
                -
                <input 
                    className="w-1/2 border border-gray-300 rounded-md p-2" 
                    value={localAgeRange[1]}
                    onChange={(e) => setLocalAgeRange([localAgeRange[0], parseInt(e.target.value) || 50])}
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
                        onClick={handleClear}
                    >
                        Clear
                    </button>
                    <button 
                        className="w-1/2 button-primary bg-[#C70039] text-white rounded-md p-2"
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                </div>
            </div>
        </div>
    )
}
export default MatchingRight;