import { Task } from "./types";

export const TASKS: Task[] = [
  {
    id: "seo-titles",
    title: "Títulos SEO",
    description: "Generá títulos optimizados para buscadores.",
    icon: "Search",
    role: "Sos un editor SEO experto en medios digitales latinoamericanos.",
    instruction: "Dado el siguiente texto periodístico, generá EXACTAMENTE 5 títulos optimizados para buscadores.",
    rules: [
      "Cada título debe tener entre 55 y 70 caracteres (indicá el conteo al final de cada uno).",
      "Incluí las palabras clave más relevantes del texto.",
      "No uses clickbait vacío; priorizá claridad y relevancia.",
      "No agregues explicaciones, solo los 5 títulos.",
      "Formato: una por línea, numeradas del 1 al 5."
    ],
    fields: [
      { label: "Texto Periodístico", name: "text", placeholder: "Pegar texto aquí...", type: "textarea" },
      { label: "Tono", name: "tone", placeholder: "Ej: Informativo, Urgente...", type: "text" },
      { label: "Audiencia", name: "audience", placeholder: "Ej: Público general, Jóvenes...", type: "text" }
    ]
  },
  {
    id: "style-corrector",
    title: "Corrector de Estilo",
    description: "Ortografía y gramática con enfoque rioplatense.",
    icon: "CheckCircle",
    role: "Sos un corrector de estilo para un medio de comunicación argentino.",
    instruction: "Corregí el siguiente texto aplicando estas reglas:",
    rules: [
      "Ortografía y tildes según RAE + uso rioplatense.",
      "Eliminar espacios dobles y mayúsculas correctas después de punto.",
      "Puntuación adecuada y coherencia gramatical.",
      "Mantené el estilo y voz original del autor.",
      "Formato: Devolvé SOLO el texto corregido. Al final, agregá una línea en blanco y luego una lista breve con '✏️ Correcciones:' (máximo 5 ítems)."
    ],
    fields: [
      { label: "Texto a corregir", name: "text", placeholder: "Pegar texto aquí...", type: "textarea" }
    ]
  },
  {
    id: "tweet-generator",
    title: "Generador de Tweets",
    description: "3 tweets listos para publicar con hashtags y CTA.",
    icon: "Twitter",
    role: "Sos community manager de un medio digital argentino.",
    instruction: "A partir del siguiente texto periodístico, escribí EXACTAMENTE 3 tweets listos para publicar.",
    rules: [
      "Máximo 280 caracteres cada uno (indicá el conteo entre paréntesis).",
      "Incluí 1 o 2 hashtags relevantes en español.",
      "Terminá con un CTA suave (ej: 'Leé la nota →').",
      "Variá el enfoque: uno factual, uno de impacto, uno con pregunta o dato.",
      "Formato: 'Tweet 1 (X car.):' seguido del texto."
    ],
    fields: [
      { label: "Texto Periodístico", name: "text", placeholder: "Pegar texto aquí...", type: "textarea" },
      { label: "Tono", name: "tone", placeholder: "Ej: Provocador, Serio...", type: "text" }
    ]
  },
  {
    id: "editorial-dek",
    title: "Bajadas Editoriales",
    description: "Escribí bajadas (dek) que complementen el título.",
    icon: "FileText",
    role: "Sos editor de una redacción digital latinoamericana.",
    instruction: "Escribí EXACTAMENTE 2 bajadas (dek) para el siguiente texto periodístico.",
    rules: [
      "Cada bajada entre 120 y 160 caracteres.",
      "Complementan el título sin repetirlo.",
      "Aportan contexto o el dato más relevante.",
      "Tono informativo, directo, sin adjetivos innecesarios.",
      "Formato: 'Bajada A:' y 'Bajada B:' en líneas separadas."
    ],
    fields: [
      { label: "Texto Periodístico", name: "text", placeholder: "Pegar texto aquí...", type: "textarea" }
    ]
  },
  {
    id: "summary",
    title: "Resumen de Artículos",
    description: "Puntos clave y resumen ejecutivo.",
    icon: "AlignLeft",
    role: "Sos un editor senior de un medio digital.",
    instruction: "Resumí el siguiente texto periodístico en dos formatos: PUNTOS CLAVE (4-6 bullets) y RESUMEN (párrafo de 3-4 oraciones).",
    rules: [
      "PUNTOS CLAVE: entre 4 y 6 bullets (•) con los datos y hechos más importantes.",
      "RESUMEN: un párrafo de 3-4 oraciones que capture la esencia de la nota.",
      "Sin preámbulos ni explicaciones adicionales."
    ],
    fields: [
      { label: "Texto Periodístico", name: "text", placeholder: "Pegar texto aquí...", type: "textarea" }
    ]
  },
  {
    id: "derived-ideas",
    title: "Ideas de Notas",
    description: "6 ideas de notas derivadas o relacionadas.",
    icon: "Lightbulb",
    role: "Sos un jefe de redacción con experiencia en periodismo digital latinoamericano.",
    instruction: "A partir del siguiente texto, generá EXACTAMENTE 6 ideas de notas derivadas o relacionadas.",
    rules: [
      "Cada idea debe tener un ángulo periodístico claro y original.",
      "Priorizá perspectiva local/regional cuando sea posible.",
      "Incluí: título tentativo + una línea explicando el enfoque.",
      "Variá formatos: investigación, perfil, datos, testimonio, comparativa, explicador.",
      "Numeradas del 1 al 6."
    ],
    fields: [
      { label: "Texto Periodístico", name: "text", placeholder: "Pegar texto aquí...", type: "textarea" },
      { label: "Audiencia objetivo", name: "audience", placeholder: "Ej: Lectores locales, Expertos...", type: "text" }
    ]
  },
  {
    id: "pull-quotes",
    title: "Citas Destacadas",
    description: "Extraé 5 frases potentes para diseño.",
    icon: "Quote",
    role: "Sos un editor de diseño periodístico especializado en destacados y pull quotes.",
    instruction: "Del siguiente texto, extraé EXACTAMENTE 5 citas o frases para destacar visualmente.",
    rules: [
      "Priorizá frases textuales entre comillas si existen.",
      "Cada frase debe funcionar sola, fuera de contexto.",
      "Entre 20 y 120 caracteres cada una.",
      "Numeradas del 1 al 5, entre comillas.",
      "Sin explicaciones adicionales."
    ],
    fields: [
      { label: "Texto Periodístico", name: "text", placeholder: "Pegar texto aquí...", type: "textarea" }
    ]
  },
  {
    id: "image-prompts",
    title: "Prompts de Imágenes",
    description: "3 prompts en inglés para generadores de imagen IA.",
    icon: "Image",
    role: "Sos un director de arte de un medio digital periodístico.",
    instruction: "A partir del siguiente texto, generá EXACTAMENTE 3 prompts en inglés para generadores de imagen IA.",
    rules: [
      "Estilo editorial y periodístico (no ilustrativo ni fantástico).",
      "Sin rostros identificables ni personas reconocibles.",
      "Incluí: composición, iluminación, paleta de color, estilo fotográfico.",
      "Si el tema es sensible, usá metáforas visuales o planos abstractos.",
      "Formato: 'Prompt 1:', 'Prompt 2:', 'Prompt 3:'."
    ],
    fields: [
      { label: "Texto Periodístico", name: "text", placeholder: "Pegar texto aquí...", type: "textarea" }
    ]
  }
];
