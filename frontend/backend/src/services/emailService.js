// src/services/emailService.js
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function enviarCodigoVerificacion(email, codigo, razonSocial) {
  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@iasystemgrup.com",
      subject: "🔐 Código de Verificación - IA System Grup",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bienvenido a IA System Grup</h2>
          <p>Hola <strong>${razonSocial}</strong>,</p>
          <p>Tu código de verificación es:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #2563eb; margin: 0; letter-spacing: 5px;">${codigo}</h1>
          </div>
          <p>Este código expira en 10 minutos.</p>
          <p>Si no solicitaste este código, ignora este correo.</p>
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc;">
          <p style="color: #666; font-size: 12px;">© 2024 IA System Grup. Todos los derechos reservados.</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log(`✅ Correo de verificación enviado a ${email}`);
  } catch (error) {
    console.error("❌ Error enviando correo:", error.message);
    throw error;
  }
}
