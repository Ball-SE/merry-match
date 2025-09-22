import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/supabaseClient";

type Body = {
    swiperId: string;
    swipedId: string;
    action: "like" | "dislike";
}

export async function POST(req: Request) {
    try {
        const body: Body = await req.json();
        const { swiperId, swipedId, action } = body;
        
    } catch (error) {
        
    }
}