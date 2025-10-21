import { createServiceRoleSupabaseClient } from '@/lib/supabase/serviceRoleSupabaseClient';

export async function createMatchNotification(
  userId: string, 
  matchedUserId: string, 
  matchedUserData: { name?: string; photo_url?: string }
) {
  try {
    const supabase = createServiceRoleSupabaseClient();

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'match',
        title: 'New Match! 🎉',
        message: `You and ${matchedUserData?.name || 'Someone'} liked each other!`,
        data: {
          match_type: 'mutual_like',
          matched_user_id: matchedUserId,
          matched_user_name: matchedUserData?.name,
          matched_user_photo: matchedUserData?.photo_url
        },
        is_read: false
      });

    if (error) {
      console.error('Error creating match notification:', error);
      return false;
    }
    
    console.log(`Match notification created for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Failed to create match notification:', error);
    return false;
  }
}

export async function createMessageNotification(
  receiverId: string,
  senderId: string,
  senderData: { name?: string; photo_url?: string },
  matchId: string,
  messageText: string,
  receiverIsOnline: boolean = false
) {
  try {
    console.log("🔔 createMessageNotification called with:");
    console.log("- receiverId:", receiverId);
    console.log("- senderId:", senderId);
    console.log("- senderData:", senderData);
    console.log("- matchId:", matchId);
    console.log("- messageText:", messageText);
    console.log("- receiverIsOnline:", receiverIsOnline);

    const supabase = createServiceRoleSupabaseClient();
    
    console.log("✅ Supabase client created");

    // ✅ EDIT: ถ้า receiver online ให้ skip ทันที
    if (receiverIsOnline) {
      console.log("⏸️ Receiver is online in chat room, skipping notification");
      return true;
    }

    // // ✅ EDIT: เพิ่มการตรวจสอบ presence ก่อน
    // // ตรวจสอบว่า receiver อยู่ online ในห้อง chat นี้หรือไม่
    // const channelName = `match-${matchId}`;
    
    // // อ่าน presence state จาก Supabase Realtime
    // const presenceChannel = supabase.channel(channelName);
    // await presenceChannel.subscribe();
    
    // const presenceState = presenceChannel.presenceState();
    // const isReceiverOnline = Object.values(presenceState)
    //   .flat()
    //   .some((p: any) => p.user_id === receiverId && p.match_id === matchId);
    
    // await supabase.removeChannel(presenceChannel);
    
    // if (isReceiverOnline) {
    //   console.log("⏸️ Receiver is online in chat room, skipping notification");
    //   return true;
    // }

    // ตรวจสอบว่า receiver ยังไม่ได้อ่านข้อความล่าสุดใน chat นี้
    const { data: recentMessages, error: recentError } = await supabase
      .from('messages')
      .select('is_read')
      .eq('match_id', matchId)
      .eq('receiver_id', receiverId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentError) {
      console.error("❌ Error checking recent messages:", recentError);
    } else {
      console.log("📱 Recent messages check:", recentMessages);
    }

    // ถ้า receiver กำลังอยู่ใน chat หรือเพิ่งอ่านข้อความล่าสุด ให้ไม่ส่ง notification
    if (recentMessages && recentMessages.length > 0 && recentMessages[0].is_read) {
      console.log("⏸️ Receiver is active in chat, skipping notification");
      return true;
    }

    console.log("🔔 Creating notification in database...");

    const notificationData = {
      user_id: receiverId,
      type: 'message',
      title: 'New Message 💬',
      message: `${senderData?.name || 'Someone'} sent you a message`,
      data: {
        sender_id: senderId,
        sender_name: senderData?.name,
        sender_photo: senderData?.photo_url,
        match_id: matchId,
        message_preview: messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText
      },
      is_read: false
    };

    console.log("📝 Notification data:", notificationData);

    const { data: insertedNotification, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating message notification:', error);
      return false;
    }
    
    console.log('✅ Message notification created successfully:', insertedNotification);
    return true;
  } catch (error) {
    console.error('❌ Failed to create message notification:', error);
    return false;
  }
}

// ✅ ใหม่: แจ้งเตือนเมื่อถูก Merry ฝั่งเดียว
export async function createLikeNotification(
  targetUserId: string,                 // คนที่ถูกกด like
  likerUserId: string,                  // คนที่มากด like
  likerData: { name?: string; photo_url?: string }
) {
  try {
    const supabase = createServiceRoleSupabaseClient();             
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type: 'like',                                               
        title: 'Someone Merry you 💖',                              
        message: `${likerData?.name || 'Someone'} Merry you!`,      
        data: {                                                     
          liker_user_id: likerUserId,                               
          liker_user_name: likerData?.name,                         
          liker_user_photo: likerData?.photo_url                    
        },
        is_read: false
      });
    if (error) { console.error('Error creating like notification:', error); return false; }
    return true;                                                    
  } catch (e) {
    console.error('Failed to create like notification:', e);        
    return false;                                                   
  }
}