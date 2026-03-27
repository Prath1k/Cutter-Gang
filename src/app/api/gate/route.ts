import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 30;

export async function POST(request: Request) {
  const { password } = await request.json();
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

  // 1. Check for existing lockout
  const { data: attemptData } = await supabase
    .from('password_attempts')
    .select('*')
    .eq('ip', ip)
    .single();

  const now = new Date();
  if (attemptData) {
    const lastAttempt = new Date(attemptData.last_attempt);
    const diffMs = now.getTime() - lastAttempt.getTime();
    const diffMins = diffMs / (1000 * 60);

    if (attemptData.attempts >= MAX_ATTEMPTS && diffMins < LOCKOUT_MINUTES) {
      const remaining = Math.ceil(LOCKOUT_MINUTES - diffMins);
      return NextResponse.json(
        { error: `Locked out. Try again in ${remaining} minutes.` },
        { status: 403 }
      );
    }

    // Reset attempts if lockout period has passed
    if (diffMins >= LOCKOUT_MINUTES) {
      await supabase
        .from('password_attempts')
        .update({ attempts: 0, last_attempt: now.toISOString() })
        .eq('ip', ip);
      attemptData.attempts = 0;
    }
  } else {
    // Initialize record for new IP
    await supabase.from('password_attempts').insert([{ ip, attempts: 0 }]);
  }

  // 2. Validate Password
  const correctPassword = process.env.SITE_PASSWORD || 'cuttergang';

  if (password === correctPassword) {
    // Clear attempts on success
    await supabase.from('password_attempts').delete().eq('ip', ip);

    // Set cookie with a simple signature (using password as part of the "secret")
    const vettingToken = Buffer.from(`${correctPassword}-vetted`).toString('base64');
    
    const cookieStore = await cookies();
    cookieStore.set('cutter_vetted', vettingToken, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return NextResponse.json({ success: true });
  }

  // 3. Handle Failed Attempt
  const newAttempts = (attemptData?.attempts || 0) + 1;
  await supabase
    .from('password_attempts')
    .upsert({ ip, attempts: newAttempts, last_attempt: now.toISOString() });

  if (newAttempts >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: `Too many attempts. Locked out for ${LOCKOUT_MINUTES} minutes.` },
      { status: 403 }
    );
  }

  return NextResponse.json(
    { error: `Invalid password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.` },
    { status: 401 }
  );
}
