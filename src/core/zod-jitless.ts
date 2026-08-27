import { z } from "zod";

/**
 * Desliga o JIT do Zod (`new Function`) antes de qualquer schema.
 * Em produção a CSP não tem `'unsafe-eval'`; o probe `Function("")` é
 * apanhado pelo try/catch mas o Chrome ainda regista um Issue de CSP.
 *
 * Importar este módulo como **primeira linha** de cada ficheiro que define
 * schemas — `core/` não importa `lib/`.
 */
z.config({ jitless: true });
