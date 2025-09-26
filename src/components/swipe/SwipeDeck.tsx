import { useMemo, useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";

export type Card = { id: string; title: string; age: string; img: string[] };

interface SwipeDeckProps {
  items: Card[];
  onLike?: (card: Card) => void;
  onPass?: (card: Card) => void;
  currentImageIndex?: number; // เพิ่ม prop นี้
  onCurrentCardChange?: (card: Card | null) => void; // เพิ่ม callback สำหรับส่งข้อมูลการ์ดปัจจุบัน
  disabled?: boolean;
}

export default function SwipeDeck({ 
  items, 
  onLike, 
  onPass, 
  currentImageIndex = 0, 
  onCurrentCardChange,
  disabled = false
}: SwipeDeckProps) {
  const [stack, setStack] = useState(items);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);

  const top = stack[0];
  const rest = useMemo(() => stack.slice(1), [stack]);

  // ✅ อัพเดท stack เมื่อ items prop เปลี่ยน
  useEffect(() => {
    setStack(items);
  }, [items]);

  // ส่งข้อมูลการ์ดปัจจุบันกลับไปยัง parent component
  useEffect(() => {
    if (onCurrentCardChange) {
      onCurrentCardChange(top || null);
    }
  }, [top, onCurrentCardChange]);

  const handlers = useSwipeable({
    onSwipeStart: () => !disabled && setDragging(true),
    onSwiping: (e) => { 
      if (!disabled) { // เพิ่มเงื่อนไข disabled
        setDx(e.deltaX); 
        setDy(e.deltaY); 
      }
    },
    onSwiped: (e) => {
      if (disabled) return; // หยุดการทำงานเมื่อ disabled
      
      setDragging(false);
      const shouldDismiss =
        Math.abs(e.deltaX) > 120 || Math.abs(e.velocity) > 0.6;
      if (shouldDismiss) {
        if (!top) return;
        
        // เรียก callback ตามทิศทางการ swipe
        if (e.deltaX > 0 && onLike) {
          onLike(top);
        } else if (e.deltaX < 0 && onPass) {
          onPass(top);
        }
        
        setStack((s) => s.slice(1));
        setDx(0); setDy(0);
      } else {
        setDx(0); setDy(0);
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  if (!top) return 
    <div 
    style={{textAlign:'center', padding:'4rem'}}
    >
    หมดการ์ดแล้ว ✨
    </div>;

  const rotation = dx / 12;
  const throwX = Math.sign(dx || 1) * 1200;

  return (
    <div style={{
      position:'relative', 
      width:'100%', 
      maxWidth: '100%',
      margin:'0 auto', 
      height: 'clamp(400px, 70vh, 700px)', // Responsive height with min/max constraints
      aspectRatio: '3/4' // Maintain consistent aspect ratio
    }}>
      {rest.slice(0, 3).map((c, i) => (
        <div
          key={c.id}
          style={{
            position:'absolute', 
            inset:0, 
            borderRadius: 'clamp(12px, 2vw, 20px)', // Responsive border radius
            boxShadow:'0 12px 30px rgba(0,0,0,.25)',
            background:'#111',
            transform:`scale(${1 - (i+1)*0.03}) translateY(${(i+1)*10}px)`
          }}
        />
      ))}

      <div
        {...handlers}
        style={{
          position:'absolute', 
          inset:0, 
          borderRadius: 'clamp(12px, 2vw, 20px)', // Responsive border radius
          overflow:'hidden',
          boxShadow:'0 20px 40px rgba(0,0,0,.35)',
          cursor: dragging ? 'grabbing' : 'grab',
          transform: dragging
            ? `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`
            : dx === 0 && dy === 0
              ? undefined
              : `translate(${throwX}px, ${dy}px) rotate(${rotation*2}deg)`,
          transition: dragging ? 'none' : 'transform 320ms cubic-bezier(.2,.8,.2,1)',
          willChange:'transform',
          background:'#000'
        }}
      >
        {/* แสดงรูปภาพตาม currentImageIndex */}
        <img 
          src={top.img[currentImageIndex] || top.img[0]} 
          alt={top.title + ' ' + top.age} 
          style={{
            width:'100%', 
            height:'100%', 
            objectFit:'cover',
            objectPosition: 'center',
            display: 'block', // Prevent inline spacing issues
            userSelect: 'none', // Prevent text selection
            WebkitUserSelect: 'none', // Safari
            MozUserSelect: 'none', // Firefox
            msUserSelect: 'none' // IE
          }} 
        />
        
        {/* แสดงจุดบอกจำนวนรูปภาพ */}
        {top.img.length > 1 && (
          <div style={{
            position: 'absolute',
            top: 'clamp(12px, 3vw, 20px)', // Responsive positioning
            right: 'clamp(12px, 3vw, 20px)',
            display: 'flex',
            gap: 'clamp(3px, 1vw, 6px)' // Responsive gap
          }}>
            {top.img.map((_, index) => (
              <div
                key={index}
                style={{
                  width: 'clamp(6px, 1.5vw, 10px)', // Responsive dot size
                  height: 'clamp(6px, 1.5vw, 10px)',
                  borderRadius: '50%',
                  backgroundColor: index === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'background-color 0.2s'
                }}
              />
            ))}
          </div>
        )}

        <div style={{
          position:'absolute', 
          left:0, 
          right:0, 
          bottom:0, 
          padding:'clamp(8px, 2vw, 16px) clamp(12px, 3vw, 20px)', // Responsive padding
          color:'#fff', 
          background:'linear-gradient( to top, rgba(0,0,0,.55), transparent )'
        }}>
        </div>
      </div>

    </div>
  );
}