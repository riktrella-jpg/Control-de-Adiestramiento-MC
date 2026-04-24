export type Week = {
    id: string;
    week: number;
    objective: string;
    exercises: string;
    time: string;
    alternatives: string;
    completed: boolean;
};

export type Module = {
    id: string;
    moduleNumber: number;
    title: string;
    icon: string; // Can be emoji or lucide icon name
    description: string;
    weeks: Week[];
};

export const coursesData: Module[] = [
    {
        id: "module1",
        moduleNumber: 1,
        title: "Fundamentos",
        icon: "🐶",
        description: "Comprender la comunicación canina, el estado emocional del perro y las bases del aprendizaje positivo.",
        weeks: [
            { id: "m1w1", week: 1, objective: "Observación del lenguaje corporal", exercises: "Registro diario de señales (orejas, cola, respiración, postura).", time: "20 min diarios", alternatives: "Usar videos de YouTube de perros para análisis si no hay interacción real.", completed: false },
            { id: "m1w2", week: 2, objective: "Introducción al refuerzo positivo", exercises: "Uso del clicker o palabra marcador. Asociación con premio.", time: "15 min x 2 sesiones", alternatives: "Si no hay clicker, usar palabra corta (“sí”) con tono alegre.", completed: false },
            { id: "m1w3", week: 3, objective: "Rutina de bienestar", exercises: "Sesiones de mindfulness con el tutor (respirar juntos, contacto físico consciente).", time: "10 min diarios", alternatives: "Hacerlo durante paseos o antes de dormir.", completed: false },
            { id: "m1w4", week: 4, objective: "Evaluación del vínculo", exercises: "Autoevaluación emocional del tutor y registro de respuestas del perro.", time: "30 min semanal", alternatives: "Puede hacerse con video de apoyo para ver progreso.", completed: false },
        ]
    },
    {
        id: "module2",
        moduleNumber: 2,
        title: "Herramientas",
        icon: "🦴",
        description: "Manejar correctamente el equipo y desarrollar timing preciso.",
        weeks: [
            { id: "m2w1", week: 1, objective: "Familiarización con herramientas", exercises: "Clicker: marcar y premiar conductas espontáneas.", time: "15 min diarios", alternatives: "Usar sonido de bolígrafo o palabra “¡bien!”.", completed: false },
            { id: "m2w2", week: 2, objective: "Tipos de refuerzos", exercises: "Identificar motivadores del perro (comida, juego, contacto).", time: "30 min total", alternatives: "Si no hay juguetes, usar trozos de toalla o pelota de trapo.", completed: false },
            { id: "m2w3", week: 3, objective: "Equipo y seguridad", exercises: "Ajuste del arnés, revisión de correa y señales de incomodidad.", time: "20 min diarios", alternatives: "Usar correa artesanal de cuerda gruesa.", completed: false },
            { id: "m2w4", week: 4, objective: "Secuencia marcador–acción–recompensa", exercises: "Microentrenamientos en casa (2 min x 5 repeticiones).", time: "Diario", alternatives: "Grabar para autoevaluación.", completed: false },
        ]
    },
    {
        id: "module3",
        moduleNumber: 3,
        title: "MANADA en práctica",
        icon: "🐾",
        description: "Aplicación paso a paso de las 6 fases del método MANADA.",
        weeks: [
            { id: "m3w1", week: 1, objective: "Mindfulness canino", exercises: "Ejercicios de respiración guiada con el tutor, rutinas de calma.", time: "10–15 min diarios", alternatives: "Hacerlo en espacios reducidos o durante caricias.", completed: false },
            { id: "m3w2", week: 2, objective: "Apego seguro", exercises: "Contacto visual, paseo en sincronía, llamada afectiva.", time: "20 min diarios", alternatives: "En interiores, practicar llamada entre habitaciones.", completed: false },
            { id: "m3w3", week: 3, objective: "Normas básicas", exercises: "“Sentado”, “quieto”, “junto”, “ven”.", time: "10 min x 3 sesiones", alternatives: "Usar marcadores en lugar de clicker si hay distracciones.", completed: false },
            { id: "m3w4", week: 4, objective: "Autocontrol", exercises: "Esperar la orden antes de tomar comida o cruzar puerta.", time: "15 min diarios", alternatives: "Reforzar con voz si no hay premios.", completed: false },
        ]
    },
    {
        id: "module4",
        moduleNumber: 4,
        title: "Casos reales",
        icon: "🧘‍♀️",
        description: "Aplicar técnicas de desensibilización y contracondicionamiento.",
        weeks: [
            { id: "m4w1", week: 1, objective: "Ansiedad de separación", exercises: "Ausencias progresivas (de 1 a 15 min).", time: "Diario", alternatives: "Grabar video para monitoreo si se vive solo.", completed: false },
            { id: "m4w2", week: 2, objective: "Hipervigilancia", exercises: "Caminata con enfoque (trabajo de olfato).", time: "30 min", alternatives: "En casa: juegos de búsqueda de premios.", completed: false },
            { id: "m4w3", week: 3, objective: "Miedo a ruidos", exercises: "Exposición controlada a sonidos (baja intensidad).", time: "10 min diarios", alternatives: "Reproducir sonidos desde celular a bajo volumen.", completed: false },
            { id: "m4w4", week: 4, objective: "Evaluación", exercises: "Revisión de respuestas emocionales y ajustes.", time: "1 sesión guiada", alternatives: "Repetir ejercicios exitosos.", completed: false },
        ]
    },
    {
        id: "module5",
        moduleNumber: 5,
        title: "Protocolos urbanos",
        icon: "🌆",
        description: "Transporte, cafés, clínicas; derechos y obligaciones.",
        weeks: [
            { id: "m5w1", week: 1, objective: "Exposición gradual", exercises: "Paseo en zonas con tránsito suave.", time: "30 min", alternatives: "Simular en estacionamiento o pasillo.", completed: false },
            { id: "m5w2", week: 2, objective: "Cafés y lugares públicos", exercises: "Permanecer tranquilo bajo la mesa.", time: "15–20 min", alternatives: "Practicar en casa con música y olores de comida.", completed: false },
            { id: "m5w3", week: 3, objective: "Transporte público", exercises: "Subir, esperar y bajar con calma.", time: "3 salidas semanales", alternatives: "Practicar en coche o simulando entrada/salida.", completed: false },
            { id: "m5w4", week: 4, objective: "Ética y convivencia", exercises: "Revisión de derechos del binomio y responsabilidad cívica.", time: "1 sesión teórica + práctica.", alternatives: "Revisión de normativa local.", completed: false },
        ]
    },
    {
        id: "module6",
        moduleNumber: 6,
        title: "Plan y certificación",
        icon: "🎓",
        description: "Bitácora, evaluación, ética y continuidad.",
        weeks: [
            { id: "m6w1", week: 1, objective: "Bitácora y registro", exercises: "Documentar progreso (conducta, emociones, logros).", time: "Diario", alternatives: "Formato digital gratuito.", completed: false },
            { id: "m6w2", week: 2, objective: "Evaluación del binomio", exercises: "Pruebas de autocontrol, respuesta y calma.", time: "2 sesiones", alternatives: "Puede hacerse en parque o casa.", completed: false },
            { id: "m6w3", week: 3, objective: "Ética y compromiso", exercises: "Taller sobre respeto animal y responsabilidad.", time: "1 sesión", alternatives: "Online o en grupo reducido.", completed: false },
            { id: "m6w4", week: 4, objective: "Cierre y certificación", exercises: "Presentación final + ceremonia simbólica.", time: "1 día", alternatives: "Entrega de diploma digital.", completed: false },
        ]
    },
    {
        id: "module7",
        moduleNumber: 7,
        title: "Perfeccionamiento Práctico",
        icon: "🎯",
        description: "Ejercicios avanzados para dominar el autocontrol, el apego seguro, el timing y el foco bajo distracciones.",
        weeks: [
            { id: "m7w1", week: 1, objective: "Autocontrol Avanzado", exercises: "Juegos de 'Deja eso' con premios de alto valor. Esperar en la puerta abierta sin salir hasta recibir la orden de liberación.", time: "15 min x 2 sesiones diarias", alternatives: "Usar juguetes favoritos en lugar de comida si el perro no está motivado por alimento.", completed: false },
            { id: "m7w2", week: 2, objective: "Apego Seguro en Exteriores", exercises: "Práctica de llamada ('Ven') usando correa larga (5-10 metros) en un parque con distracciones moderadas. Premiar siempre la llegada.", time: "20 min durante el paseo", alternatives: "Practicar en un patio cerrado o pasillo largo si no hay un parque seguro disponible.", completed: false },
            { id: "m7w3", week: 3, objective: "Perfeccionamiento del Timing", exercises: "Juego de atrapar al vuelo: lanzar un premio y usar la palabra marcador EXACTAMENTE cuando el perro lo atrapa. Ejercicios de target con la mano.", time: "10 min diarios", alternatives: "Grabar la sesión en video y revisar en cámara lenta para evaluar la precisión del marcador.", completed: false },
            { id: "m7w4", week: 4, objective: "Foco bajo Distracciones", exercises: "Comando 'Mírame' mientras otra persona rebota una pelota o camina cerca. Mantener contacto visual sostenido por 5-10 segundos.", time: "15 min diarios", alternatives: "Comenzar con distracciones estáticas (objetos en el suelo) antes de pasar a distracciones en movimiento.", completed: false },
        ]
    }
];
