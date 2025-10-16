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
  messageText: string
) {
  try {
    console.log("🔔 createMessageNotification called with:");
    console.log("- receiverId:", receiverId);
    console.log("- senderId:", senderId);
    console.log("- senderData:", senderData);
    console.log("- matchId:", matchId);
    console.log("- messageText:", messageText);

    const supabase = createServiceRoleSupabaseClient();

    console.log("✅ Supabase client created");

    // เช็คว่า receiver กำลัง active ในห้อง chat นี้หรือไม่
    const { data: activeChat, error: activeChatError } = await supabase
      .from('user_active_chats')
      .select('last_active_at')
      .eq('user_id', receiverId)
      .eq('match_id', matchId)
      .single();

    if (activeChatError && activeChatError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (ไม่มี active chat)
      console.error("❌ Error checking active chat:", activeChatError);
    } else {
      console.log("📱 Active chat check:", activeChat);
    }

    if (activeChat) {
      const lastActiveAt = new Date(activeChat.last_active_at);
      const now = new Date();
      const secondsSinceActive = (now.getTime() - lastActiveAt.getTime()) / 1000;

      // ถ้า active ภายใน 25 วินาที ถือว่ากำลังอยู่ใน chat
      if (secondsSinceActive < 25) {
        console.log(`⏸️ Receiver is active in chat (${secondsSinceActive.toFixed(1)}s ago), skipping notification`);
        return true;
      } else {
        console.log(`📊 Receiver was active ${secondsSinceActive.toFixed(1)}s ago, will send notification`);
      }
    } else {
      console.log("📊 Receiver is not in chat, will send notification");
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