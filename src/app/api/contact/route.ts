import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const CONTACT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const CONTACT_MAX_REQUESTS = 5;

const HONEYPOT_FIELD = 'website_url'; // bot trap: should stay empty

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASS must be set');
  }
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 'contact', CONTACT_WINDOW_MS, CONTACT_MAX_REQUESTS)) {
      return NextResponse.json(
        { error: 'Too many messages. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message, [HONEYPOT_FIELD]: honeypot } = body as Record<string, string>;

    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter your name' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Please enter a message (at least 10 characters)' }, { status: 400 });
    }

    const to = process.env.CONTACT_EMAIL || 'support@stocktrackpro.co.uk';
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      replyTo: email.trim(),
      subject: subject?.trim() ? `[Stock Track PRO] ${subject.trim()}` : `[Stock Track PRO] Contact from ${name.trim()}`,
      text: message.trim(),
      html: `<p>From: ${name.trim()} &lt;${email.trim()}&gt;</p><p>${message.trim().replace(/\n/g, '<br>')}</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again or email us directly.' },
      { status: 500 }
    );
  }
}
