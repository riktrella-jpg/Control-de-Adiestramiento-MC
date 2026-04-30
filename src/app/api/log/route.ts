import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Aquí se puede integrar Sentry, Datadog o guardar en Supabase (tabla logs).
        // Por ahora, registrarlo estructurado en la consola del servidor (Vercel).
        console.error("🔥 [CRITICAL SYSTEM ALERT]", JSON.stringify(body, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
    }
}
