import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: ['shrutika.shaw2015@gmail.com'],
      replyTo: email,
      subject: `New portfolio message from ${name || 'Someone'}`,
      html: `
        <h2>New portfolio message</h2>

        <p><strong>Name:</strong> ${name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email}</p>

        <hr />

        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    if (error) {
      console.error('RESEND ERROR:', error);

      return res.status(500).json({
        error: error.message || 'Failed to send email',
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('CONTACT API ERROR:', error);

    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}