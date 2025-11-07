import { z } from "zod";

// Esquema simples para criar/editar projeto
export const projectSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(1, "Informe o nome do projeto"),
  // templateId não é mais obrigatório neste fluxo
  templateId: z.number().int().gt(0).optional(),
  descricao: z.string().optional(),
  imagemBg: z.string().url().optional().or(z.literal("")).transform(v => v || undefined),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
