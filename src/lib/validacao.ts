import { z } from "zod";
import { cpfValido } from "./format";

const soDigitos = (v: string) => v.replace(/\D/g, "");

export const checkoutSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(5, "Informe nome e sobrenome.")
      .max(120)
      .refine((v) => v.split(/\s+/).length >= 2, "Informe nome e sobrenome."),
    email: z.string().trim().toLowerCase().pipe(z.email("E-mail inválido.")).pipe(z.string().max(160)),
    whatsapp: z
      .string()
      .transform(soDigitos)
      .refine((v) => /^[1-9]{2}9?\d{8}$/.test(v), "WhatsApp inválido. Use DDD + número."),
    cpf: z
      .string()
      .optional()
      .transform((v) => (v ? soDigitos(v) : ""))
      .refine((v) => v === "" || cpfValido(v), "CPF inválido."),
    tipoEntrega: z.enum(["retirada", "entrega"]),
    endereco: z
      .object({
        cep: z
          .string()
          .transform(soDigitos)
          .refine((v) => v.length === 8, "CEP inválido."),
        rua: z.string().trim().min(2, "Informe a rua.").max(160),
        numero: z.string().trim().min(1, "Informe o número.").max(20),
        complemento: z.string().trim().max(120).optional().default(""),
        bairro: z.string().trim().min(2, "Informe o bairro.").max(80),
        cidade: z.string().trim().min(2, "Informe a cidade.").max(80),
        uf: z.string().trim().max(2).optional().default(""),
      })
      .optional(),
    formaPagamento: z.enum(["pix", "cartao_boleto"]),
    itens: z
      .array(
        z.object({
          variantId: z.string().min(1).max(64),
          quantidade: z.number().int().min(1, "Quantidade inválida.").max(10, "Máximo de 10 unidades por item."),
        }),
      )
      .min(1, "O carrinho está vazio.")
      .max(30, "Carrinho grande demais."),
    // Qualquer preço enviado pelo navegador é ignorado: o servidor usa o banco.
  })
  .refine((d) => d.tipoEntrega === "retirada" || !!d.endereco, {
    message: "Informe o endereço de entrega.",
    path: ["endereco"],
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
