

import { NextResponse } from "next/server";
import sendEmail from "@/lib/sendEmail"; // adjust this import to wherever sendEmail actually lives in your project

/* =========================================================================
   POST /api/contact
   Receives the Iccha Store contact form and emails it using your existing
   sendEmail(to, subject, html) helper (nodemailer + Gmail).

   Env vars used:
   - EMAIL_USER          the Gmail address sendEmail sends FROM (already
                          required by sendEmail itself)
   - CONTACT_TO_EMAIL    optional — where enquiries should land. Falls back
                          to EMAIL_USER, so if you skip this, enquiries just
                          arrive in the same inbox you send from.
   ========================================================================= */

type ContactPayload = {
  name: string;
  shopName: string;
  phone: string;
  email: string;
  city: string;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  let body: Partial<ContactPayload>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, shopName, phone, email, city, message } = body;

  if (!name || !phone || !city || !message) {
    return NextResponse.json(
      { error: "Name, phone, city, and message are required." },
      { status: 400 }
    );
  }

  const subject = `New enquiry — ${shopName || name} (${city})`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #2E2620;">
      <h2 style="margin: 0 0 4px; color: #2E2620;">New website enquiry</h2>
      <p style="margin: 0 0 20px; color: #8a8378; font-size: 13px;">Iccha Store contact form</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; width: 130px; color: #8a8378; vertical-align: top;">Name</td>
          <td style="padding: 6px 0;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #8a8378; vertical-align: top;">Shop name</td>
          <td style="padding: 6px 0;">${shopName ? escapeHtml(shopName) : "—"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #8a8378; vertical-align: top;">Phone</td>
          <td style="padding: 6px 0;">${escapeHtml(phone)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #8a8378; vertical-align: top;">Email</td>
          <td style="padding: 6px 0;">${email ? escapeHtml(email) : "—"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #8a8378; vertical-align: top;">City</td>
          <td style="padding: 6px 0;">${escapeHtml(city)}</td>
        </tr>
      </table>
      <div style="margin-top: 18px;">
        <p style="margin: 0 0 4px; color: #8a8378; font-size: 13px;">Message</p>
        <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</p>
      </div>
    </div>
  `;

  const to = process.env.CONTACT_TO_EMAIL || process.env.EMAIL_USER!;

  const sent = await sendEmail(to, subject, html);

  if (!sent) {
    return NextResponse.json({ error: "Could not send the email." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}