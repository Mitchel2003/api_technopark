import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "El correo electrónico es requerido" })
    .email({ message: "Correo electrónico inválido" }),
  password: z
    .string({ required_error: "La contraseña es requerida" })
    .min(6, { message: "La contraseña es demasiado corta" })
})

export const registerSchema = z.object({
  photo: z
    .instanceof(File)
    .optional(),
  email: z
    .string()
    .email("Correo electronico invalido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  phone: z
    .string()
    .min(10, "El telefono debe tener al menos 10 caracteres"),
  description: z
    .string()
    .min(10, "La descripcion debe tener al menos 10 caracteres"),
  socialNetworks: z
    .array(z.object({
      type: z.string(),
      url: z.string().url("URL invalida")
    }))
    .optional()
})