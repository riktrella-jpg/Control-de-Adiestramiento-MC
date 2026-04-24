import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Helper to get Supabase Admin client only when needed
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
    const { clientEmail, clientName, status, feedbackText, userId } = body;

    console.log(`[NotificationAPI] Iniciando proceso para: ${clientName} (${clientEmail}) - Status: ${status}`);

    // 1. Check if Email Credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("[NotificationAPI] WARN: EMAIL_USER o EMAIL_PASS no configurados en .env");
    }

    // 2. Create Notification in Database
    if (userId) {
        console.log(`[NotificationAPI] Creando notificación en DB para userId: ${userId}`);
        const supabaseAdmin = getSupabaseAdmin();
        const { error: dbError } = await supabaseAdmin.from('notifications').insert({
            user_id: userId,
            title: status === 'approved' ? '¡Ejercicio Aprobado!' : 'Nueva retroalimentación',
            message: feedbackText || 'Tu entrenador ha dejado comentarios técnicos en tu video.',
            type: 'feedback',
            read: false
        });
        if (dbError) console.error("[NotificationAPI] Error DB:", dbError);
        else console.log("[NotificationAPI] Notificación en DB creada con éxito.");
    } else {
        console.warn("[NotificationAPI] WARN: No se proporcionó userId, saltando notificación de DB.");
    }

    // 3. Send Email using Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && clientEmail) {
        console.log(`[NotificationAPI] Intentando enviar email a ${clientEmail}...`);
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
            from: `"MC26 IA Studio" <${process.env.EMAIL_USER}>`,
            to: clientEmail,
            subject: `Actualización de tu Entrenamiento: ${status === 'approved' ? 'Aprobado ✅' : 'Retroalimentación 🐕'}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; background-color: #ffffff; color: #111111;">
                <h2 style="color: #d4af37;">Hola, ${clientName}!</h2>
                <p>Tu entrenador ha revisado tu última evidencia enviada.</p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #d4af37;">
                    <p><strong>Estado:</strong> <span style="text-transform: uppercase; font-weight: bold;">${status === 'approved' ? 'Aprobado' : status === 'improve' ? 'Por Mejorar' : status}</span></p>
                    <p><strong>Comentarios:</strong> ${feedbackText}</p>
                </div>
                <p>Entra a la aplicación para ver los detalles técnicos y continuar con tu progreso.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://mc26-ia-studio.vercel.app/dashboard" style="display: inline-block; padding: 12px 24px; background: #d4af37; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Ver mi Dashboard</a>
                </div>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
                <p style="font-size: 11px; color: #888; text-align: center;">Este es un mensaje automático de MC26 IA Studio.</p>
              </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("[NotificationAPI] Email enviado con éxito.");
    } else {
        console.warn("[NotificationAPI] WARN: Faltan credenciales de email o email del cliente, saltando paso de email.");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[NotificationAPI] Error Crítico:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
