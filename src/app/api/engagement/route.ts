import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('[Engagement] Supabase credentials missing');
  return createClient(url, key);
}

type EngagementLevel = '3_days' | '15_days' | 'active';

async function generateAIMessage(
  userName: string,
  petName: string,
  level: EngagementLevel,
  lastActivity: string
): Promise<{ subject: string; headline: string; body: string; suggestedTasks: string[] }> {
  
  const prompts: Record<EngagementLevel, string> = {
    active: '',
    '3_days': `
      Eres un entrenador canino experto, empático y motivador del método MANADA. 
      El alumno se llama ${userName} y su perro se llama ${petName}.
      Llevan 3 días sin registrar tareas. Debes escribir un mensaje MUY breve, cálido y motivador.
      El objetivo es recordarles que deben registrar sus tareas diarias y que cada pequeño paso cuenta para la acreditación mensual de nivel mediante video.
      
      Responde ÚNICAMENTE con un JSON con esta estructura exacta:
      {
        "subject": "Asunto del correo (max 60 chars)",
        "headline": "Título corto y motivador (max 40 chars)",
        "body": "Mensaje de 2-3 oraciones, cálido y personalizado con su nombre y el del perro",
        "suggestedTasks": ["Tarea 1 sugerida", "Tarea 2 sugerida", "Tarea 3 sugerida"]
      }
    `,
    '15_days': `
      Eres un entrenador canino experto, empático y genuinamente preocupado del método MANADA.
      El alumno se llama ${userName} y su perro se llama ${petName}.
      Llevan 15 días sin actividad. Debes escribir un mensaje de re-conexión genuino.
      Muestra que te importa SU situación, no solo el entrenamiento. Pregunta si están bien y ofrece apoyo personalizado.
      Sugiere tareas muy simples que pueden hacer en 5 minutos para retomar sin presión.
      La última actividad registrada fue: ${lastActivity}
      
      Responde ÚNICAMENTE con un JSON con esta estructura exacta:
      {
        "subject": "Asunto del correo (max 60 chars)",
        "headline": "Título empático y cercano (max 40 chars)",
        "body": "Mensaje de 3-4 oraciones, muy personal, que demuestra interés genuino por su bienestar",
        "suggestedTasks": ["Tarea sencilla 1 (5 min)", "Tarea sencilla 2 (5 min)", "Tarea sencilla 3 (5 min)"]
      }
    `
  };

  try {
    if (!process.env.GROQ_API_KEY) {
       throw new Error('GROQ_API_KEY is missing');
    }
    
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompts[level] }],
      temperature: 0.8,
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('[Engagement] AI generation failed or key missing, using fallback:', error);
    // Fallback messages if AI fails or key is missing
    if (level === '3_days') {
      return {
        subject: `${petName} y tú llevan 3 días sin entrenar 🐾`,
        headline: '¡La Manada te espera!',
        body: `Hola ${userName}, notamos que ${petName} y tú llevan 3 días sin registrar actividad. ¡Cada pequeña sesión de 5 minutos suma! Recuerda que este mes debes enviar tu video de acreditación.`,
        suggestedTasks: ['Practicar "Sentado" por 5 minutos', 'Sesión de contacto visual consciente', 'Paseo de 10 minutos con foco total']
      };
    }
    return {
      subject: `¿Cómo están ${userName} y ${petName}? Te extrañamos 💛`,
      headline: 'Queremos saber de ti',
      body: `Hola ${userName}, han pasado 15 días y nos preguntamos cómo estás. ¿Podemos ayudarte en algo? El vínculo con ${petName} no tiene que pausarse. Estamos aquí para lo que necesites.`,
      suggestedTasks: ['Solo 5 minutos de caricias conscientes', 'Mirar a los ojos 30 segundos', 'Un paseo corto sin distracciones']
    };
  }
}

async function sendEngagementEmail(
  to: string,
  userName: string,
  petName: string,
  message: { subject: string; headline: string; body: string; suggestedTasks: string[] },
  level: EngagementLevel
) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const accentColor = level === '15_days' ? '#e8a87c' : '#d4af37';
  const icon = level === '15_days' ? '💛' : '🐾';

  const tasksHtml = message.suggestedTasks.map((task, i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:#f9f9f9;border-radius:8px;margin-bottom:8px;border-left:3px solid ${accentColor};">
      <span style="color:${accentColor};font-weight:bold;font-size:16px;">${i + 1}</span>
      <span style="font-size:14px;color:#333;">${task}</span>
    </div>
  `).join('');

  await transporter.sendMail({
    from: `"MC26 IA Studio" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${icon} ${message.subject}`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#0a0a0a;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1a1a1a,#0d0d0d);padding:40px 30px;text-align:center;border-bottom:2px solid ${accentColor}33;">
          <div style="font-size:32px;margin-bottom:12px;">${icon}</div>
          <h1 style="color:${accentColor};font-size:22px;font-weight:900;margin:0;text-transform:uppercase;letter-spacing:2px;">${message.headline}</h1>
          <p style="color:#888;font-size:12px;margin:8px 0 0;text-transform:uppercase;letter-spacing:3px;">MC26 IA STUDIO • MÉTODO MANADA</p>
        </div>
        <!-- Body -->
        <div style="padding:32px 30px;background:#111;">
          <p style="color:#e0e0e0;font-size:16px;line-height:1.7;margin:0 0 24px;">${message.body}</p>
          <!-- Suggested Tasks -->
          <div style="background:#0d0d0d;border:1px solid #222;border-radius:12px;padding:20px;margin:24px 0;">
            <h3 style="color:${accentColor};font-size:13px;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">🎯 Tareas Sugeridas para Retomar</h3>
            ${tasksHtml}
          </div>
          <!-- CTA -->
          <div style="text-align:center;margin:32px 0 16px;">
            <a href="https://mc26-ia-studio.vercel.app/dashboard" 
               style="display:inline-block;padding:14px 32px;background:${accentColor};color:#000;text-decoration:none;border-radius:10px;font-weight:900;font-size:15px;text-transform:uppercase;letter-spacing:1px;">
              Retomar Entrenamiento →
            </a>
          </div>
        </div>
        <!-- Footer -->
        <div style="padding:20px 30px;background:#0a0a0a;text-align:center;border-top:1px solid #222;">
          <p style="font-size:11px;color:#555;margin:0;">Mensaje automático inteligente de MC26 IA Studio • Método MANADA</p>
        </div>
      </div>
    `,
  });
}

async function processEngagement(secret: string | null) {
  if (secret !== process.env.CRON_SECRET) {
    throw new Error('Unauthorized');
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, displayName, dogName');
  if (usersError) throw usersError;

  const results = [];

  for (const user of (users || [])) {
    if (!user.email) continue;

    const { data: recentTasks } = await supabase
      .from('tasks')
      .select('createdAt')
      .eq('user_id', user.id)
      .order('createdAt', { ascending: false })
      .limit(1);

    const { data: recentUploads } = await supabase
      .from('uploads')
      .select('createdAt')
      .eq('user_id', user.id)
      .order('createdAt', { ascending: false })
      .limit(1);

    const lastTaskDate = recentTasks?.[0]?.createdAt;
    const lastUploadDate = recentUploads?.[0]?.createdAt;
    const lastActivity = lastTaskDate || lastUploadDate;

    const { data: recentNotif } = await supabase
      .from('notifications')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('type', 'engagement')
      .order('created_at', { ascending: false })
      .limit(1);

    const lastNotifDate = recentNotif?.[0]?.created_at;
    if (lastNotifDate && new Date(lastNotifDate) > new Date(threeDaysAgo)) {
      results.push({ user: user.email, status: 'skipped_recent_notif' });
      continue;
    }

    let engagementLevel: EngagementLevel = 'active';

    if (!lastActivity || new Date(lastActivity) < new Date(fifteenDaysAgo)) {
      engagementLevel = '15_days';
    } else if (new Date(lastActivity) < new Date(threeDaysAgo)) {
      engagementLevel = '3_days';
    }

    if (engagementLevel === 'active') {
      results.push({ user: user.email, status: 'active' });
      continue;
    }

    const userName = user.displayName || user.email.split('@')[0];
    const petName = user.dogName || 'tu binomio';

    const aiMessage = await generateAIMessage(userName, petName, engagementLevel, lastActivity || 'ninguna');

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: aiMessage.headline,
      message: aiMessage.body,
      type: 'engagement',
      read: false,
      metadata: { suggestedTasks: aiMessage.suggestedTasks, level: engagementLevel }
    });

    await sendEngagementEmail(user.email, userName, petName, aiMessage, engagementLevel);

    results.push({ user: user.email, status: `notified_${engagementLevel}` });
  }

  return results;
}

export async function POST(req: Request) {
  try {
    const { secret } = await req.json();
    const results = await processEngagement(secret);
    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.error('[Engagement] POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get('secret');
    const results = await processEngagement(secret);
    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.error('[Engagement] GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
