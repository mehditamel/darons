import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Adresse email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Le prénom est requis")
      .max(50, "50 caractères maximum"),
    lastName: z
      .string()
      .min(1, "Le nom est requis")
      .max(50, "50 caractères maximum"),
    email: z
      .string()
      .min(1, "L'email est requis")
      .email("Adresse email invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
      ),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
    acceptTerms: z.literal(true, {
      errorMap: () => ({
        message: "Vous devez accepter les conditions d'utilisation",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Adresse email invalide"),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
