import { Resend } from 'resend'
import { buildConfirmationUrl, buildUnsubscribeUrl, buildAppUrl, getEnvironmentInfo } from './url-builder'

const config = useRuntimeConfig()

// Validate configuration
if (!config.resend?.apiKey) {
  console.error('❌ RESEND_API_KEY is not configured')
  throw new Error('Resend API key is required')
}

if (!config.public?.baseUrl) {
  console.error('❌ BASE_URL is not configured')
  throw new Error('Base URL is required')
}

console.log('✅ Resend configuration validated')
const resend = new Resend(config.resend.apiKey)

export async function sendConfirmationEmail(email: string, confirmationToken: string) {
  const confirmationUrl = buildConfirmationUrl(confirmationToken)
  const envInfo = getEnvironmentInfo()
  
  console.log(`📧 Sending confirmation email to: ${email}`)
  console.log(`🌐 Environment: ${envInfo.environment} (${envInfo.protocol})`)
  console.log(`🔗 Confirmation URL: ${confirmationUrl}`)
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'MOABA Cinema TV <onboarding@resend.dev>',
      to: [email],
      subject: 'Confirma tu suscripción a MOABA Cinema TV',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MOABA Cinema TV</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Cine Africano Premium</p>
          </div>
          
          <div style="padding: 40px; background: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">¡Confirma tu suscripción!</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
              Gracias por tu interés en MOABA Cinema TV. Para completar tu suscripción a nuestro newsletter y recibir las últimas novedades del cine africano, por favor confirma tu dirección de correo electrónico.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background: #f59e0b; color: #000000; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Confirmar Suscripción
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
              <span style="word-break: break-all; color: #3b82f6;">${confirmationUrl}</span>
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Si no solicitaste esta suscripción, puedes ignorar este correo.
            </p>
          </div>
          
          <div style="padding: 20px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>© 2025 MOABA Cinema TV - Todos los derechos reservados</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('❌ Resend API error:', error)
      throw new Error(`Failed to send confirmation email: ${error.message}`)
    }

    console.log('✅ Confirmation email sent successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error)
    if (error instanceof Error) {
      throw new Error(`Email sending failed: ${error.message}`)
    }
    throw new Error('Unknown email sending error')
  }
}

export async function sendWelcomeEmail(email: string) {
  console.log(`🎉 Sending welcome email to: ${email}`)
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'MOABA Cinema TV <onboarding@resend.dev>',
      to: [email],
      subject: '¡Bienvenido a MOABA Cinema TV! 🎬',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a MOABA!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Tu puerta al cine africano</p>
          </div>
          
          <div style="padding: 40px; background: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">¡Tu suscripción está confirmada! 🎉</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Ahora eres parte de nuestra comunidad y recibirás las últimas novedades sobre:
            </p>
            
            <ul style="color: #4b5563; line-height: 1.6; margin-bottom: 30px; padding-left: 20px;">
              <li>Estrenos exclusivos de cine africano</li>
              <li>Documentales y series culturales</li>
              <li>Entrevistas con directores y actores</li>
              <li>Eventos especiales y promociones</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${buildAppUrl()}" 
                 style="background: #f59e0b; color: #000000; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Explorar MOABA
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Si deseas cancelar tu suscripción en cualquier momento, puedes hacerlo 
              <a href="${buildUnsubscribeUrl(email)}" style="color: #3b82f6;">aquí</a>.
            </p>
          </div>
          
          <div style="padding: 20px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>© 2025 MOABA Cinema TV - Todos los derechos reservados</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('❌ Resend API error (welcome email):', error)
      throw new Error(`Failed to send welcome email: ${error.message}`)
    }

    console.log('✅ Welcome email sent successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error)
    if (error instanceof Error) {
      throw new Error(`Welcome email sending failed: ${error.message}`)
    }
    throw new Error('Unknown welcome email sending error')
  }
}