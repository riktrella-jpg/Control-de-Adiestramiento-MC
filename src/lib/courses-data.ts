export type Week = {
    id: string;
    week: number;
    objective: string;
    enfoque?: string;
    experienciaFormativa?: string;
    entrenamientoCentral?: string;
    microPracticas?: string[];
    aprendizajeHumano?: string;
    transformacionEsperada?: string;
    time: string;
    alternatives: string;
    completed: boolean;
    videoUrl?: string;
    exercises: string; // Brief summary
};

export type Module = {
    id: string;
    moduleNumber: number;
    title: string;
    icon: string; // Can be emoji or lucide icon name
    description: string;
    imageUrl?: string;
    weeks: Week[];
};

export const coursesData: Module[] = [
    {
        id: "module1",
        moduleNumber: 1,
        title: "Fundamentos",
        icon: "🐶",
        description: "Comprender la comunicación canina, el estado emocional del perro y las bases del aprendizaje positivo.",
        imageUrl: "/course_images/module1_fundamentos_1778029423207.png",
        weeks: [
            { 
                id: "m1w1", 
                week: 1, 
                objective: "Aprender a observar antes de intervenir", 
                enfoque: "El vínculo comienza cuando el humano aprende a leer el estado emocional del perro.",
                experienciaFormativa: "El tutor desarrolla sensibilidad para identificar: tensión, calma, alerta, curiosidad, inseguridad y necesidad de espacio.",
                entrenamientoCentral: "Observación consciente y atención voluntaria.",
                microPracticas: [
                    "Lectura de lenguaje corporal",
                    "Primer contacto visual espontáneo",
                    "Asociación positiva con la presencia humana",
                    "Registro emocional diario",
                    "Introducción suave al marcador emocional"
                ],
                aprendizajeHumano: "La conducta es consecuencia del estado emocional. La mayoría de los problemas de conducta comienzan porque el humano no detecta señales tempranas.",
                transformacionEsperada: "El tutor deja de reaccionar automáticamente y comienza a comprender.",
                time: "15–20 min diarios", 
                alternatives: "Usar videos de YouTube de perros para análisis si no hay interacción real.", 
                exercises: "Observación consciente del lenguaje corporal y registro de emociones.",
                completed: false 
            },
            { 
                id: "m1w2", 
                week: 2, 
                objective: "Construir confianza mediante motivación emocional", 
                enfoque: "Cada perro tiene necesidades emocionales y motivadores distintos.",
                experienciaFormativa: "El tutor aprende qué genera: seguridad, interés, conexión y cooperación voluntaria.",
                entrenamientoCentral: "Refuerzo positivo consciente y comunicación clara.",
                microPracticas: [
                    "Identificación de reforzadores emocionales",
                    "Juegos de enfoque",
                    "Recompensa de calma",
                    "Asociación marcador → emoción positiva",
                    "Micro sesiones de cooperación"
                ],
                aprendizajeHumano: "La confianza produce más aprendizaje que la presión. El timing lo es todo: se premia el comportamiento deseado exactamente cuando ocurre.",
                transformacionEsperada: "El perro comienza a colaborar por seguridad emocional, no por miedo.",
                time: "20 min diarios", 
                alternatives: "Si no hay clicker, usar palabra corta (“sí”) con tono alegre.", 
                exercises: "Uso del clicker/marcador para recompensar la atención voluntaria.",
                completed: false, 
                videoUrl: "https://player.vimeo.com/video/1189192604?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479" 
            },
            { 
                id: "m1w3", 
                week: 3, 
                objective: "Crear seguridad emocional durante el paseo y la convivencia", 
                enfoque: "El paseo no es solo ejercicio físico. Es regulación emocional en movimiento.",
                experienciaFormativa: "El tutor aprende a detectar: sobreestimulación, ansiedad, tensión ambiental y señales tempranas de incomodidad.",
                entrenamientoCentral: "Caminata consciente y manejo emocional del entorno.",
                microPracticas: [
                    "Regulación antes de salir",
                    "Uso correcto de arnés y correa",
                    "Exploración olfativa guiada",
                    "Pausas de calma",
                    "Lectura emocional durante estímulos externos"
                ],
                aprendizajeHumano: "Un perro acelerado muchas veces refleja un entorno acelerado. Los perros leen energía, respiración y tensión corporal.",
                transformacionEsperada: "Disminuyen: jalones, impulsividad, estrés y tensión en paseo.",
                time: "20–30 min diarios", 
                alternatives: "Practicar en interiores o pasillos si el entorno exterior es muy estresante.", 
                exercises: "Paseo consciente sin distracciones y ejercicios de respiración compartida.",
                completed: false, 
                videoUrl: "https://player.vimeo.com/video/1189226001?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479" 
            },
            { 
                id: "m1w4", 
                week: 4, 
                objective: "Desarrollar comunicación funcional y vínculo consciente", 
                enfoque: "La verdadera comunicación ocurre cuando existe claridad emocional y consistencia.",
                experienciaFormativa: "El perro aprende patrones simples de interacción segura y predecible.",
                entrenamientoCentral: "Comunicación emocional aplicada a la vida diaria.",
                microPracticas: [
                    "Seguimiento natural",
                    "Llamado consciente por nombre",
                    "Permanencia breve relajada",
                    "Contacto visual sostenido",
                    "Autorregulación básica",
                    "Cierre emocional positivo de sesión"
                ],
                aprendizajeHumano: "La conexión emocional sostenida genera estabilidad conductual. No existen perros “malos”, existen emociones mal gestionadas.",
                transformacionEsperada: "El vínculo evoluciona de convivencia básica a comunicación consciente.",
                time: "2–5 micro sesiones diarias", 
                alternatives: "Grabar las sesiones para evaluar la claridad de la comunicación propia.", 
                exercises: "Pruebas de conexión y mapeo emocional de situaciones cotidianas.",
                completed: false 
            },
        ]
    },
    {
        id: "module2",
        moduleNumber: 2,
        title: "Regulación emocional y comunicación funcional",
        icon: "🦴",
        description: "El perro no necesita más control. Necesita claridad, estabilidad y seguridad emocional para aprender.",
        imageUrl: "/course_images/module2_herramientas_1778029566477.png",
        weeks: [
            { 
                id: "m2w1", 
                week: 1, 
                objective: "Crear asociaciones positivas con herramientas y señales", 
                enfoque: "Las herramientas no deben generar tensión ni miedo. Deben convertirse en señales de seguridad y comunicación.",
                experienciaFormativa: "El perro aprende que: el clicker, el arnés, la correa y la voz humana predicen experiencias positivas y seguras.",
                entrenamientoCentral: "Asociación emocional positiva con elementos de entrenamiento.",
                microPracticas: [
                    "Introducción consciente al marcador emocional",
                    "Asociación click → emoción positiva",
                    "Exploración libre de herramientas",
                    "Recompensa por calma y curiosidad",
                    "Inicio de atención voluntaria"
                ],
                aprendizajeHumano: "La herramienta no entrena al perro. La relación emocional con la herramienta sí.",
                transformacionEsperada: "El perro comienza a percibir el entrenamiento como un espacio seguro.",
                time: "15 min diarios", 
                alternatives: "Usar sonido de bolígrafo o palabra “¡bien!” si no hay clicker.", 
                exercises: "Asociación emocional positiva con elementos de entrenamiento.",
                completed: false 
            },
            { 
                id: "m2w2", 
                week: 2, 
                objective: "Descubrir qué motiva emocionalmente a tu perro", 
                enfoque: "No todos los perros aprenden igual porque no todos valoran lo mismo.",
                experienciaFormativa: "El tutor identifica qué genera: entusiasmo, seguridad, cooperación y motivación auténtica.",
                entrenamientoCentral: "Creación de aprendizaje basado en reforzadores emocionales reales.",
                microPracticas: [
                    "Evaluación de preferencias",
                    "Motivación por juego",
                    "Motivación por comida",
                    "Motivación social",
                    "Recompensa de comportamientos tranquilos",
                    "Introducción al enfoque sostenido"
                ],
                aprendizajeHumano: "La cooperación nace cuando el perro encuentra valor emocional en interactuar contigo.",
                transformacionEsperada: "Aumenta: atención, disposición, enfoque y conexión emocional.",
                time: "20–30 min diarios", 
                alternatives: "Si no hay juguetes, usar trozos de toalla o pelota de trapo.", 
                exercises: "Identificar motivadores del perro y usarlos para crear aprendizaje basado en reforzadores emocionales.",
                completed: false 
            },
            { 
                id: "m2w3", 
                week: 3, 
                objective: "Construir seguridad emocional durante el paseo", 
                enfoque: "La seguridad física sin estabilidad emocional sigue generando estrés.",
                experienciaFormativa: "El tutor aprende a prevenir: tensión, frustración, incomodidad e hiperactivación antes de que aparezcan conductas problemáticas.",
                entrenamientoCentral: "Uso consciente del equipo y lectura emocional del perro.",
                microPracticas: [
                    "Ajuste correcto del arnés",
                    "Manejo suave de correa",
                    "Identificación de señales de incomodidad",
                    "Pausas de regulación",
                    "Caminata sin presión constante",
                    "Exploración olfativa consciente"
                ],
                aprendizajeHumano: "Muchos problemas de paseo comienzan por exceso de tensión humana.",
                transformacionEsperada: "Disminuyen: jalones, bloqueos, ansiedad y reactividad.",
                time: "20 min diarios", 
                alternatives: "Practicar en un pasillo largo o patio si la calle genera demasiada tensión inicial.", 
                exercises: "Uso consciente del equipo y lectura emocional durante el paseo.",
                completed: false 
            },
            { 
                id: "m2w4", 
                week: 4, 
                objective: "Crear comunicación clara mediante secuencias emocionales", 
                enfoque: "El aprendizaje emocional ocurre cuando existe claridad y consistencia.",
                experienciaFormativa: "El perro aprende secuencias simples y predecibles: señal → acción → recompensa → calma.",
                entrenamientoCentral: "Microentrenamientos funcionales basados en cooperación voluntaria.",
                microPracticas: [
                    "Marcador emocional preciso",
                    "Conductas cortas y exitosas",
                    "Pausas de regulación",
                    "Recompensa inmediata",
                    "Cierre positivo de sesión",
                    "Autorregulación básica"
                ],
                aprendizajeHumano: "Las sesiones cortas generan más estabilidad emocional que los entrenamientos largos y saturados.",
                transformacionEsperada: "El perro comprende mejor las señales, coopera con menor tensión y mantiene mayor estabilidad emocional.",
                time: "2–5 micro sesiones diarias", 
                alternatives: "Grabar las sesiones para verificar el timing del marcador emocional.", 
                exercises: "Secuencia marcador–acción–recompensa en microentrenamientos en casa.",
                completed: false 
            },
        ]
    },
    {
        id: "module3",
        moduleNumber: 3,
        title: "Vínculo consciente y regulación compartida",
        icon: "🐾",
        description: "El equilibrio conductual no nace del control. Nace de la seguridad emocional, la claridad y la conexión constante.",
        imageUrl: "/course_images/module3_manada_1778029643088.png",
        weeks: [
            { 
                id: "m3w1", 
                week: 1, 
                objective: "Regulación emocional y mindfulness humano–canino", 
                enfoque: "Los perros perciben tensión, respiración, velocidad corporal y estados emocionales humanos constantemente.",
                experienciaFormativa: "El tutor aprende a desacelerar su energía para ayudar al perro a entrar en estados de calma y estabilidad.",
                entrenamientoCentral: "Rutinas conscientes de regulación emocional compartida.",
                microPracticas: [
                    "Respiración guiada junto al perro",
                    "Contacto físico consciente",
                    "Rutinas breves de calma",
                    "Observación de tensión corporal",
                    "Inicio y cierre emocional de sesión",
                    "Pausas de conexión silenciosa"
                ],
                aprendizajeHumano: "El perro no solo escucha órdenes. También responde al estado emocional del entorno.",
                transformacionEsperada: "Disminuye la hiperactivación y ansiedad ambiental; aumenta la calma y seguridad emocional.",
                time: "10–15 min diarios", 
                alternatives: "Practicar en espacios silenciosos y familiares.", 
                exercises: "Rutinas conscientes de regulación emocional compartida.",
                completed: false 
            },
            { 
                id: "m3w2", 
                week: 2, 
                objective: "Construir apego seguro y presencia emocional", 
                enfoque: "El apego saludable genera confianza, estabilidad y mejor capacidad de aprendizaje.",
                experienciaFormativa: "El perro aprende que el humano representa: seguridad, guía, estabilidad y protección emocional.",
                entrenamientoCentral: "Sincronización emocional y cooperación cercana.",
                microPracticas: [
                    "Contacto visual relajado",
                    "Paseo en sincronía",
                    "Llamado afectivo consciente",
                    "Seguimiento natural",
                    "Recompensa por proximidad tranquila",
                    "Permanencia emocionalmente estable"
                ],
                aprendizajeHumano: "La cercanía emocional sostenida fortalece la regulación conductual.",
                transformacionEsperada: "El perro busca más conexión, mejora atención voluntaria y reduce inseguridad.",
                time: "20 min diarios", 
                alternatives: "En interiores, practicar llamada entre habitaciones con tono afectivo.", 
                exercises: "Sincronización emocional y ejercicios de cooperación cercana.",
                completed: false 
            },
            { 
                id: "m3w3", 
                week: 3, 
                objective: "Comunicación funcional y convivencia consciente", 
                enfoque: "Las normas claras generan tranquilidad cuando se enseñan desde calma y consistencia.",
                experienciaFormativa: "El perro aprende patrones simples de convivencia emocionalmente seguros.",
                entrenamientoCentral: "Comunicación funcional aplicada a rutinas reales.",
                microPracticas: [
                    "Señales simples y claras",
                    "Permanencia breve relajada",
                    "Seguimiento suave",
                    "Pausas antes de actuar",
                    "Recompensa de autocontrol espontáneo",
                    "Comunicación sin tensión ni presión"
                ],
                aprendizajeHumano: "La claridad constante reduce frustración y conflictos.",
                transformacionEsperada: "Mejora la convivencia diaria y la estabilidad emocional en rutinas comunes.",
                time: "10 min x 3 sesiones", 
                alternatives: "Usar recompensas de calma en lugar de excitación.", 
                exercises: "Aplicar comunicación funcional a rutinas reales de convivencia.",
                completed: false 
            },
            { 
                id: "m3w4", 
                week: 4, 
                objective: "Desarrollar autocontrol y estabilidad emocional", 
                enfoque: "El autocontrol no debe enseñarse mediante castigo, sino mediante regulación emocional progresiva.",
                experienciaFormativa: "El perro aprende a gestionar impulsos desde estados de calma y seguridad.",
                entrenamientoCentral: "Pausas conscientes y tolerancia gradual a la espera.",
                microPracticas: [
                    "Espera antes de comida",
                    "Pausas antes de cruzar puertas",
                    "Regulación antes del juego",
                    "Recompensa de calma voluntaria",
                    "Micro ejercicios de paciencia",
                    "Recuperación emocional después de estímulos"
                ],
                aprendizajeHumano: "La paciencia emocional se construye, no se impone.",
                transformacionEsperada: "Disminuye impulsividad y ansiedad anticipatoria; aumenta el enfoque y tolerancia emocional.",
                time: "15 min diarios", 
                alternatives: "Reforzar con voz tranquila si no hay premios físicos.", 
                exercises: "Ejercicios de paciencia y regulación emocional ante impulsos.",
                completed: false 
            },
        ]
    },
    {
        id: "module4",
        moduleNumber: 4,
        title: "Acompañamiento emocional y casos conductuales reales",
        icon: "🧘‍♀️",
        description: "Detrás de muchas conductas problemáticas existe un sistema emocional saturado, inseguro o mal interpretado.",
        imageUrl: "/course_images/module4_casos_1778029754704.png",
        weeks: [
            { 
                id: "m4w1", 
                week: 1, 
                objective: "Acompañar la ansiedad por separación con seguridad emocional", 
                enfoque: "La ansiedad por separación no es “dependencia” ni “capricho”. Es una respuesta emocional asociada a inseguridad, anticipación y estrés.",
                experienciaFormativa: "El tutor aprende a construir ausencias emocionalmente tolerables y progresivas.",
                entrenamientoCentral: "Creación de seguridad durante separaciones cortas.",
                microPracticas: [
                    "Ritual de salida tranquilo",
                    "Ausencias graduales controladas",
                    "Recompensa de calma antes de salir",
                    "Neutralidad emocional al regresar",
                    "Asociación positiva con momentos de soledad",
                    "Creación de zonas seguras"
                ],
                aprendizajeHumano: "La despedida emocional intensa muchas veces aumenta la ansiedad anticipatoria.",
                transformacionEsperada: "Disminuye la vocalización excesiva, la destrucción y el estrés anticipatorio.",
                time: "Práctica diaria progresiva", 
                alternatives: "Grabar video para monitoreo si se vive solo.", 
                exercises: "Creación de seguridad durante separaciones cortas y progresivas.",
                completed: false 
            },
            { 
                id: "m4w2", 
                week: 2, 
                objective: "Reducir hipervigilancia y sobreestimulación ambiental", 
                enfoque: "Algunos perros viven en estado constante de alerta física y emocional.",
                experienciaFormativa: "El tutor aprende a disminuir sobrecarga ambiental y mejorar la regulación del sistema nervioso del perro.",
                entrenamientoCentral: "Actividades de enfoque, exploración y regulación sensorial.",
                microPracticas: [
                    "Caminata olfativa consciente",
                    "Exploración guiada",
                    "Pausas de observación",
                    "Trabajo de enfoque suave",
                    "Reducción de estímulos intensos",
                    "Recompensa de estados de calma"
                ],
                aprendizajeHumano: "Un perro hipervigilante no necesita más presión. Necesita más seguridad.",
                transformacionEsperada: "Disminuye la reactividad, los sobresaltos y la tensión constante.",
                time: "30 min diarios", 
                alternatives: "En casa: juegos de búsqueda de premios para fomentar el olfato.", 
                exercises: "Actividades de enfoque, exploración y regulación sensorial.",
                completed: false 
            },
            { 
                id: "m4w3", 
                week: 3, 
                objective: "Miedo a ruidos y desensibilización", 
                enfoque: "Los ruidos fuertes pueden generar bloqueos emocionales profundos.",
                experienciaFormativa: "Aprender a asociar sonidos estresantes con estados de calma y seguridad.",
                entrenamientoCentral: "Exposición controlada y contracondicionamiento.",
                microPracticas: [
                    "Exposición a baja intensidad",
                    "Asociación con juego/premios",
                    "Refugio seguro",
                    "Lectura de señales de miedo"
                ],
                aprendizajeHumano: "Validar el miedo sin reforzar la hiperactivación es clave.",
                transformacionEsperada: "Aumento de la resiliencia ante estímulos sonoros externos.",
                time: "10 min diarios", 
                alternatives: "Reproducir sonidos desde celular a bajo volumen.", 
                exercises: "Exposición controlada a sonidos (baja intensidad).",
                completed: false 
            },
            { 
                id: "m4w4", 
                week: 4, 
                objective: "Evaluación emocional y ajustes finales", 
                enfoque: "Cada binomio es único y requiere ajustes constantes.",
                experienciaFormativa: "Revisar la evolución del sistema emocional del perro y del tutor.",
                entrenamientoCentral: "Consolidación de técnicas y planes a largo plazo.",
                microPracticas: [
                    "Revisión de bitácora",
                    "Pruebas de respuesta emocional",
                    "Ajuste de motivadores",
                    "Plan de mantenimiento"
                ],
                aprendizajeHumano: "No existen perros 'malos', existen emociones mal gestionadas.",
                transformacionEsperada: "Claridad total sobre el estado actual del vínculo y herramientas de futuro.",
                time: "1 sesión guiada", 
                alternatives: "Repetir ejercicios exitosos de semanas anteriores.", 
                exercises: "Revisión de respuestas emocionales y ajustes finales del plan.",
                completed: false 
            },
        ]
    },
    {
        id: "module5",
        moduleNumber: 5,
        title: "Integración urbana y convivencia consciente",
        icon: "🌆",
        description: "La verdadera estabilidad emocional no solo se demuestra en casa. Se refleja en la capacidad del perro y del humano para convivir de forma equilibrada dentro de entornos reales.",
        imageUrl: "/course_images/module1_fundamentos_1778029423207.png",
        weeks: [
            { 
                id: "m5w1", 
                week: 1, 
                objective: "Adaptación emocional a entornos urbanos", 
                enfoque: "Las ciudades pueden saturar emocionalmente a muchos perros: ruido, movimiento, personas, olores, estímulos impredecibles.",
                experienciaFormativa: "El tutor aprende a introducir nuevos entornos sin sobrecargar el sistema emocional del perro.",
                entrenamientoCentral: "Exposición progresiva y regulación durante paseos urbanos.",
                microPracticas: [
                    "Caminatas en zonas de baja estimulación",
                    "Pausas de observación",
                    "Exploración olfativa consciente",
                    "Regulación antes y después del paseo",
                    "Lectura emocional durante estímulos externos",
                    "Recompensa de estados de calma"
                ],
                aprendizajeHumano: "La adaptación urbana ocurre progresivamente, no mediante saturación.",
                transformacionEsperada: "El perro mejora su tolerancia ambiental, seguridad en exteriores y recuperación emocional.",
                time: "30 min diarios", 
                alternatives: "Simular en estacionamiento o pasillo si la calle es muy ruidosa.", 
                exercises: "Exposición progresiva y regulación durante paseos urbanos.",
                completed: false 
            },
            { 
                id: "m5w2", 
                week: 2, 
                objective: "Construir calma y seguridad en espacios públicos", 
                enfoque: "El objetivo no es que el perro “aguante”. Es que aprenda a sentirse seguro y estable en presencia de estímulos sociales.",
                experienciaFormativa: "El tutor desarrolla herramientas para acompañar emocionalmente al perro en cafeterías, terrazas, parques y zonas concurridas.",
                entrenamientoCentral: "Permanencia relajada y regulación social.",
                microPracticas: [
                    "Permanencia tranquila bajo mesa",
                    "Observación sin sobreexcitación",
                    "Recompensa de calma espontánea",
                    "Pausas de regulación",
                    "Manejo de distancia emocional",
                    "Contacto visual suave"
                ],
                aprendizajeHumano: "La estabilidad emocional vale más que la obediencia rígida en espacios públicos.",
                transformacionEsperada: "Disminuye la ansiedad social, hiperactivación y tensión ambiental.",
                time: "15–20 min por práctica", 
                alternatives: "Practicar en casa con música y olores de comida antes de salir.", 
                exercises: "Permanencia relajada y regulación social en espacios públicos.",
                completed: false 
            },
            { 
                id: "m5w3", 
                week: 3, 
                objective: "Seguridad emocional en movilidad y transporte", 
                enfoque: "Moverse por la ciudad requiere estabilidad emocional, tolerancia y capacidad de recuperación.",
                experienciaFormativa: "El perro aprende a esperar, subir, bajar y permanecer sin entrar en estados altos de estrés.",
                entrenamientoCentral: "Movilidad urbana consciente y regulación en tránsito.",
                microPracticas: [
                    "Espera antes de abordar",
                    "Ingreso tranquilo a transporte",
                    "Permanencia relajada",
                    "Salidas controladas",
                    "Observación emocional durante trayecto",
                    "Recuperación posterior al estímulo"
                ],
                aprendizajeHumano: "La calma en movimiento se construye con repetición gradual y seguridad emocional.",
                transformacionEsperada: "Aumenta la tolerancia urbana, estabilidad en movimiento y capacidad de adaptación.",
                time: "3 prácticas semanales", 
                alternatives: "Practicar en coche o simulando entrada/salida de transporte.", 
                exercises: "Movilidad urbana consciente y regulación en tránsito.",
                completed: false 
            },
            { 
                id: "m5w4", 
                week: 4, 
                objective: "Convivencia ética y bienestar compartido", 
                enfoque: "La convivencia urbana requiere empatía, responsabilidad y comprensión emocional tanto hacia el perro como hacia la comunidad.",
                experienciaFormativa: "El tutor aprende principios de convivencia respetuosa y bienestar humano–canino.",
                entrenamientoCentral: "Responsabilidad emocional y social del binomio.",
                microPracticas: [
                    "Gestión responsable del entorno",
                    "Respeto de espacios públicos",
                    "Prevención de saturación emocional",
                    "Identificación de límites del perro",
                    "Comunicación social consciente",
                    "Rutinas de bienestar compartido"
                ],
                aprendizajeHumano: "Un perro equilibrado necesita un humano consciente y responsable.",
                transformacionEsperada: "El binomio desarrolla estabilidad social, convivencia armónica y mayor conciencia emocional.",
                time: "1 sesión teórica + práctica guiada", 
                alternatives: "Revisión de normativa local y ética animal.", 
                exercises: "Revisión de derechos del binomio y responsabilidad cívica.",
                completed: false 
            },
        ]
    },
    {
        id: "module6",
        moduleNumber: 6,
        title: "Integración emocional y consolidación del vínculo",
        icon: "🎓",
        description: "El verdadero progreso no se mide por cuántos comandos ejecuta un perro. Se mide por la calidad del vínculo, la estabilidad emocional y la capacidad del binomio para convivir en equilibrio.",
        imageUrl: "/course_images/module4_casos_1778029754704.png",
        weeks: [
            { 
                id: "m6w1", 
                week: 1, 
                objective: "Construir una memoria emocional del proceso", 
                enfoque: "El progreso emocional necesita observarse para poder comprenderse.",
                experienciaFormativa: "El tutor aprende a identificar avances conductuales, cambios emocionales, detonantes, momentos de conexión y señales de regulación.",
                entrenamientoCentral: "Registro consciente del desarrollo humano–canino.",
                microPracticas: [
                    "Bitácora emocional diaria",
                    "Registro de conductas relevantes",
                    "Identificación de logros reales",
                    "Reflexión sobre momentos de calma",
                    "Evaluación de recuperación emocional",
                    "Observación del vínculo cotidiano"
                ],
                aprendizajeHumano: "Muchas mejoras emocionales son sutiles y progresivas.",
                transformacionEsperada: "Mayor sensibilidad conductual, observación emocional y comprensión del proceso.",
                time: "Práctica diaria breve", 
                alternatives: "Usar un formato digital o cuaderno dedicado para el registro.", 
                exercises: "Bitácora emocional y registro de progreso diario.",
                completed: false 
            },
            { 
                id: "m6w2", 
                week: 2, 
                objective: "Evaluar estabilidad emocional y cooperación funcional", 
                enfoque: "La evaluación no busca perfección. Busca medir equilibrio, regulación y capacidad de adaptación.",
                experienciaFormativa: "El binomio humano–canino pone en práctica habilidades desarrolladas durante el programa.",
                entrenamientoCentral: "Evaluación consciente del vínculo y la estabilidad emocional.",
                microPracticas: [
                    "Pruebas de calma",
                    "Ejercicios de espera consciente",
                    "Respuesta emocional ante estímulos",
                    "Seguimiento funcional",
                    "Recuperación después de distracciones",
                    "Cooperación voluntaria"
                ],
                aprendizajeHumano: "La estabilidad emocional es más importante que la obediencia mecánica.",
                transformacionEsperada: "Fortalezas identificadas y áreas de mejora sin recurrir a presión o castigo.",
                time: "2 sesiones guiadas", 
                alternatives: "Realizar en entornos familiares para una evaluación más realista del día a día.", 
                exercises: "Pruebas de autocontrol, respuesta y calma en situaciones variadas.",
                completed: false 
            },
            { 
                id: "m6w3", 
                week: 3, 
                objective: "Desarrollar compromiso ético y bienestar compartido", 
                enfoque: "La convivencia consciente requiere empatía, responsabilidad y respeto hacia las necesidades emocionales del perro.",
                experienciaFormativa: "El tutor reflexiona sobre su papel como guía emocional y responsable del bienestar del binomio.",
                entrenamientoCentral: "Conciencia ética aplicada a la relación humano–canina.",
                microPracticas: [
                    "Reflexión sobre bienestar animal",
                    "Reconocimiento de límites emocionales",
                    "Responsabilidad en espacios públicos",
                    "Prevención de saturación emocional",
                    "Rutinas de equilibrio compartido",
                    "Construcción de hábitos saludables"
                ],
                aprendizajeHumano: "Un perro equilibrado necesita un entorno emocionalmente estable.",
                transformacionEsperada: "Empatía, responsabilidad y compromiso con el bienestar fortalecidos.",
                time: "1 sesión formativa", 
                alternatives: "Compartir experiencias con otros tutores en el foro del curso.", 
                exercises: "Taller sobre respeto animal, responsabilidad y límites emocionales.",
                completed: false 
            },
            { 
                id: "m6w4", 
                week: 4, 
                objective: "Integrar el vínculo y celebrar la transformación compartida", 
                enfoque: "El cierre del programa representa el inicio de una nueva forma de convivencia y comunicación.",
                experienciaFormativa: "El binomio reconoce el camino recorrido y consolida una relación basada en confianza, calma, cooperación y conexión emocional.",
                entrenamientoCentral: "Cierre emocional y consolidación del proceso.",
                microPracticas: [
                    "Evaluación final del vínculo",
                    "Ritual simbólico de cierre",
                    "Actividad de conexión consciente",
                    "Registro de transformación emocional",
                    "Compromiso de continuidad",
                    "Celebración del progreso compartido"
                ],
                aprendizajeHumano: "La transformación emocional ocurre en la constancia diaria y la conexión genuina.",
                transformacionEsperada: "Estabilidad, comunicación clara y vínculo fortalecido para la vida diaria.",
                time: "1 sesión de cierre", 
                alternatives: "Documentar la sesión final con un video para el recuerdo.", 
                exercises: "Evaluación final del vínculo y celebración simbólica del progreso.",
                completed: false 
            },
        ]
    },
    {
        id: "module7",
        moduleNumber: 7,
        title: "Exploración consciente y vínculo en movimiento",
        icon: "🎯",
        description: "El vínculo más fuerte no se construye únicamente en casa. Se fortalece cuando humano y perro aprenden a explorar el mundo juntos desde confianza, regulación emocional y cooperación natural.",
        imageUrl: "/course_images/module3_manada_1778029643088.png",
        weeks: [
            { 
                id: "m7w1", 
                week: 1, 
                objective: "Grounding emocional y autorregulación en la naturaleza", 
                enfoque: "Los entornos naturales ayudan al perro y al humano a reducir sobrecarga sensorial y recuperar equilibrio emocional.",
                experienciaFormativa: "El binomio aprende a desacelerar y sincronizarse mediante contacto consciente con la tierra, árboles y sonidos naturales.",
                entrenamientoCentral: "Grounding humano–canino y regulación emocional en exteriores.",
                microPracticas: [
                    "Caminata silenciosa en áreas verdes",
                    "Respiración consciente junto al perro",
                    "Exploración olfativa libre y segura",
                    "Pausas de observación del entorno",
                    "Contacto físico relajado",
                    "Caminata sin presión ni exigencia"
                ],
                aprendizajeHumano: "Muchos perros se regulan mejor cuando el humano también desacelera.",
                transformacionEsperada: "Aumento de la calma, el enfoque natural y la conexión emocional profunda.",
                time: "20–30 min en exteriores", 
                alternatives: "Practicar en un entorno familiar antes de ir a una zona boscosa o parque grande.", 
                exercises: "Grounding humano–canino y regulación emocional en exteriores.",
                completed: false 
            },
            { 
                id: "m7w2", 
                week: 2, 
                objective: "Senderismo emocional y exploración consciente", 
                enfoque: "Caminar juntos largas distancias fortalece cooperación, confianza y lectura mutua del entorno.",
                experienciaFormativa: "El binomio aprende a moverse como una unidad emocionalmente sincronizada.",
                entrenamientoCentral: "Senderismo junior y aventura regulada.",
                microPracticas: [
                    "Caminatas largas en bosque o campo",
                    "Exploración de senderos naturales",
                    "Descansos conscientes",
                    "Seguimiento libre con supervisión",
                    "Gestión emocional ante nuevos estímulos",
                    "Ritmos de caminata sincronizados"
                ],
                aprendizajeHumano: "La conexión profunda aparece cuando el paseo deja de ser una obligación.",
                transformacionEsperada: "Estabilidad ambiental, presencia consciente y conexión natural con el tutor.",
                time: "1–2 aventuras semanales", 
                alternatives: "Llevar agua y premios de alto valor para mantener la motivación durante rutas largas.", 
                exercises: "Senderismo junior y aventura regulada en espacios naturales.",
                completed: false 
            },
            { 
                id: "m7w3", 
                week: 3, 
                objective: "Comunicación intuitiva y cooperación en exteriores", 
                enfoque: "En espacios abiertos, la comunicación emocional vale más que la obediencia rígida.",
                experienciaFormativa: "El perro aprende a regresar voluntariamente y mantenerse conectado desde la confianza y el enfoque.",
                entrenamientoCentral: "Cooperación funcional en escenarios naturales.",
                microPracticas: [
                    "Llamado emocional a distancia",
                    "Seguimiento libre supervisado",
                    "Contacto visual espontáneo",
                    "Pausas de reconexión",
                    "Exploración con retorno voluntario",
                    "Juegos de búsqueda y orientación"
                ],
                aprendizajeHumano: "La verdadera confianza aparece cuando el perro decide volver por conexión, no por miedo.",
                transformacionEsperada: "Aumento de la cooperación natural y la atención voluntaria en exteriores.",
                time: "20–30 min por práctica", 
                alternatives: "Usar una correa larga de 10 metros para seguridad en las primeras sesiones de exploración.", 
                exercises: "Cooperación funcional en escenarios naturales y juegos de búsqueda.",
                completed: false 
            },
            { 
                id: "m7w4", 
                week: 4, 
                objective: "Aventuras conscientes y consolidación del binomio", 
                enfoque: "La aventura compartida fortalece el vínculo emocional y genera memorias positivas profundas.",
                experienciaFormativa: "El binomio integra regulación, exploración y confianza en una experiencia real de convivencia.",
                entrenamientoCentral: "Experiencia guiada de aventura humano–canina.",
                microPracticas: [
                    "Ruta de senderismo consciente",
                    "Descansos de grounding",
                    "Exploración natural segura",
                    "Trabajo de calma en exteriores",
                    "Cierre emocional de experiencia",
                    "Registro de sensaciones y avances"
                ],
                aprendizajeHumano: "El vínculo se fortalece en experiencias compartidas, no únicamente en ejercicios.",
                transformacionEsperada: "Sincronía emocional profunda, regulación ambiental y cooperación espontánea.",
                time: "1 experiencia larga guiada", 
                alternatives: "Invitar a un fotógrafo o amigo para documentar la 'aventura de graduación' del binomio.", 
                exercises: "Ruta de senderismo consciente y cierre emocional de la experiencia.",
                completed: false 
            },
        ]
    }
];
