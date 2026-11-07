// Variáveis de ambiente do SERVIDOR. Nunca importe este arquivo em componentes "use client".
// Sem as variáveis do Supabase, o site funciona em modo demonstração (dados de exemplo).

export const env = {
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  mpAccessToken: process.env.MP_ACCESS_TOKEN ?? "",
  mpWebhookSecret: process.env.MP_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  /** Remetente dos e-mails. Sem domínio verificado no Resend, use "onboarding@resend.dev". */
  emailRemetente: process.env.EMAIL_REMETENTE ?? "",
  lojaEmail: process.env.LOJA_EMAIL ?? "",
  lojaWhatsapp: process.env.LOJA_WHATSAPP ?? "",
};

export const supabaseConfigurado = () => !!(env.supabaseUrl && env.supabaseAnonKey);
export const supabaseServidorConfigurado = () => supabaseConfigurado() && !!env.supabaseServiceKey;
export const mercadoPagoConfigurado = () => !!env.mpAccessToken;
export const emailConfigurado = () => !!env.resendApiKey;
