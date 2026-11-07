// Variáveis de ambiente do SERVIDOR. "server-only" faz o build falhar se um componente do
// navegador importar este arquivo, então a chave secreta nunca vai parar no JavaScript do cliente.
import "server-only";

// Sem as variáveis do Supabase, o site funciona em modo demonstração (dados de exemplo).

export const env = {
  // Públicas (podem ir para o navegador): URL do projeto e chave publicável (sb_publishable_...)
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  // SECRETA (sb_secret_...): ignora o RLS. Só no servidor, sem NEXT_PUBLIC_.
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? "",
  mpAccessToken: process.env.MP_ACCESS_TOKEN ?? "",
  mpWebhookSecret: process.env.MP_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  /** Remetente dos e-mails. Sem domínio verificado no Resend, use "onboarding@resend.dev". */
  emailRemetente: process.env.EMAIL_REMETENTE ?? "",
  lojaEmail: process.env.LOJA_EMAIL ?? "",
  lojaWhatsapp: process.env.LOJA_WHATSAPP ?? "",
};

export const supabaseConfigurado = () => !!(env.supabaseUrl && env.supabasePublishableKey);
export const supabaseServidorConfigurado = () => supabaseConfigurado() && !!env.supabaseSecretKey;
export const mercadoPagoConfigurado = () => !!env.mpAccessToken;
export const emailConfigurado = () => !!env.resendApiKey;
