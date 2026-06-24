import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase Admin credentials missing');
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, label, clientEmail, clientName } = body;

    if (!userId || !label) {
      return NextResponse.json({ error: 'userId y label son requeridos' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Insert task bypassing RLS with service_role key
    const { error: insertError } = await supabaseAdmin.from('tasks').insert({
      user_id: userId,
      label,
      done: false,
      createdAt: new Date().toISOString(),
    });

    if (insertError) {
      console.error('[AssignTask] Error insertando tarea:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log(`[AssignTask] Tarea asignada a usuario ${userId}: "${label}"`);

    // 2. Create in-app notification
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title: '📋 Nueva Tarea Asignada',
      message: `Tu entrenador te asignó: "${label}"`,
      type: 'task',
      read: false,
    });

    // 3. Send email notification if credentials and email are available
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && clientEmail) {
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
        subject: `📋 Tu entrenador te asignó una nueva tarea`,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background: #0a0a0a; color: #f5f5f5; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #111111 100%); padding: 40px 32px; text-align: center; border-bottom: 1px solid #d4af37;">
              <div style="font-size: 13px; letter-spacing: 0.3em; color: #d4af37; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">MANADA CLUB</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff;">Nueva Tarea Asignada</h1>
            </div>

            <!-- Content -->
            <div style="padding: 36px 32px;">
              <p style="margin: 0 0 16px; color: #cccccc; font-size: 16px;">
                Hola, <strong style="color: #f5f5f5;">${clientName || 'alumno'}</strong> 👋
              </p>
              <p style="margin: 0 0 28px; color: #999999; font-size: 14px; line-height: 1.6;">
                Tu entrenador te ha asignado una nueva tarea de entrenamiento. ¡Es momento de practicar con tu binomio!
              </p>

              <!-- Task Card -->
              <div style="background: #161616; border: 1px solid #2a2a2a; border-left: 4px solid #d4af37; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #d4af37; font-weight: 700; margin-bottom: 8px;">📋 Tu nueva tarea</div>
                <p style="margin: 0; font-size: 17px; font-weight: 700; color: #ffffff;">${label}</p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center;">
                <a href="https://mc26-ia-studio.vercel.app/dashboard/tasks"
                  style="display: inline-block; padding: 14px 32px; background: #d4af37; color: #000000; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase;">
                  Ver mis tareas
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #0d0d0d; padding: 20px 32px; text-align: center; border-top: 1px solid #1e1e1e;">
              <p style="margin: 0; font-size: 11px; color: #555;">Este mensaje fue generado automáticamente por MC26 IA Studio.</p>
            </div>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`[AssignTask] Email enviado a ${clientEmail}`);
      } catch (emailError) {
        console.error('[AssignTask] Error enviando email:', emailError);
        // Don't fail the whole request if email fails
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[AssignTask] Error general:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
