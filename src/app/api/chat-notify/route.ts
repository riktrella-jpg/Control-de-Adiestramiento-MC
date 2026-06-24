import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase Admin credentials missing');
  }
  
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { senderName, receiverId, messageContent } = body;

    console.log(`[ChatNotifyAPI] Iniciando notificación para receiverId: ${receiverId}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("[ChatNotifyAPI] WARN: EMAIL_USER o EMAIL_PASS no configurados en .env");
        return NextResponse.json({ success: true, warning: 'Emails not configured' });
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Fetch receiver email and name
    const { data: receiverData, error: userError } = await supabaseAdmin
        .from('users')
        .select('email, display_name')
        .eq('id', receiverId)
        .single();

    if (userError || !receiverData?.email) {
        console.error("[ChatNotifyAPI] Error fetching receiver data:", userError);
        return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    const receiverEmail = receiverData.email;
    const receiverName = receiverData.display_name || 'Usuario';

    console.log(`[ChatNotifyAPI] Intentando enviar email a ${receiverEmail}...`);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
        from: `"MC26 IA Studio" <${process.env.EMAIL_USER}>`,
        to: receiverEmail,
        subject: `Nuevo mensaje de ${senderName} 📩`,
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; background-color: #111111; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
            <div style="background-color: #080808; padding: 20px; text-align: center; border-bottom: 2px solid #d4af37;">
              <h1 style="color: #d4af37; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">MC26 IA Studio</h1>
            </div>
            
            <div style="padding: 30px;">
                <h2 style="color: #ffffff; margin-top: 0;">¡Hola, ${receiverName}!</h2>
                <p style="color: #aaaaaa; font-size: 16px; line-height: 1.5;">Tienes un nuevo mensaje esperándote en la plataforma.</p>
                
                <div style="background: rgba(212,175,55,0.1); padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #d4af37;">
                    <p style="margin: 0; font-size: 14px; color: #d4af37; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">${senderName} dice:</p>
                    <p style="margin: 0; font-size: 16px; font-style: italic; color: #ffffff;">"${messageContent}"</p>
                </div>
                
                <p style="color: #aaaaaa; font-size: 14px; margin-bottom: 30px;">Inicia sesión en MC26 IA Studio para responder a este mensaje de inmediato.</p>
                
                <div style="text-align: center;">
                    <a href="https://mc26-ia-studio.vercel.app/dashboard" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #d4af37 0%, #aa8529 100%); color: #000; text-decoration: none; border-radius: 30px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Entrar a MC App</a>
                </div>
            </div>
            
            <div style="background-color: #080808; padding: 20px; text-align: center; border-top: 1px solid #333;">
                <p style="font-size: 11px; color: #666; margin: 0;">Este es un mensaje automático de MC26 IA Studio. Por favor no respondas a este correo.</p>
            </div>
          </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log("[ChatNotifyAPI] Email enviado con éxito a", receiverEmail);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ChatNotifyAPI] Error Crítico:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
