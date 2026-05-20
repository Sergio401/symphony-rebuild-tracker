import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';

const cxItemsTable = pgTable('cx_items', {
  id: text('id').primaryKey(),
  module: text('module').notNull().default(''),
  type: text('type').notNull().default('mejora'),
  priority: text('priority').notNull().default(''),
  description: text('description').notNull().default(''),
  status: text('status').notNull().default('sin-evaluar'),
  position: integer('position').notNull().default(0),
});

const cxPrinciplesTable = pgTable('cx_principles', {
  id: text('id').primaryKey(),
  section: integer('section').notNull().default(0),
  sectionTitle: text('section_title').notNull().default(''),
  title: text('title').notNull().default(''),
  description: text('description').notNull().default(''),
  referenceIds: text('reference_ids').notNull().default('[]'),
  position: integer('position').notNull().default(0),
});

type CXItemSeed = {
  id: string;
  module: string;
  type: string;
  priority: string;
  description: string;
};

type CXPrincipleSeed = {
  id: string;
  section: number;
  sectionTitle: string;
  title: string;
  description: string;
  referenceIds: string[];
};

const PRINCIPLES: CXPrincipleSeed[] = [
  // Section 1: Búsquedas y filtros
  {
    id: 'p1-1',
    section: 1,
    sectionTitle: 'Búsquedas y filtros',
    title: 'Siempre soportar búsqueda parcial ("contiene")',
    description: 'Nunca exigir que el usuario escriba el nombre exacto de un elemento. Toda búsqueda y filtro de texto debe usar operador "contiene" por defecto. Cuando el contexto lo requiera, ofrecer también el operador "es" (coincidencia exacta) como opción complementaria, con resultados en formato de lista seleccionable.',
    referenceIds: ['CX-329','CX-331','CX-332','CX-351','CX-368','CX-390','CX-391','CX-430','CX-444','CX-455','CX-461','CX-476','CX-496','CX-500','CX-510','CX-514','CX-518','CX-534'],
  },
  {
    id: 'p1-2',
    section: 1,
    sectionTitle: 'Búsquedas y filtros',
    title: 'Múltiples filtros del mismo campo deben usar lógica OR',
    description: 'Cuando el usuario aplica varios valores de "contiene" para el mismo campo, el sistema debe interpretarlos con lógica OR (buscar registros que contengan cualquiera de los valores), no AND. La lógica AND para el mismo campo prácticamente nunca retorna resultados y frustra al usuario.',
    referenceIds: ['CX-534'],
  },
  {
    id: 'p1-3',
    section: 1,
    sectionTitle: 'Búsquedas y filtros',
    title: 'Resultados de búsqueda deben mostrar contexto',
    description: 'Cuando el usuario busca un grupo o elemento, los resultados deben mostrar la ruta completa (path) del elemento en la jerarquía, no solo el nombre del nodo. Sin el path, el usuario no puede distinguir entre elementos con nombres similares.',
    referenceIds: ['CX-331','CX-391','CX-394'],
  },
  {
    id: 'p1-4',
    section: 1,
    sectionTitle: 'Búsquedas y filtros',
    title: 'El campo de búsqueda no debe moverse al hacer scroll',
    description: 'El input de búsqueda debe permanecer fijo (sticky) en la parte superior del panel. Si el usuario hace scroll en el árbol de resultados, el campo de búsqueda debe seguir visible y accesible.',
    referenceIds: ['CX-464'],
  },
  {
    id: 'p1-5',
    section: 1,
    sectionTitle: 'Búsquedas y filtros',
    title: 'Filtros con botón "Aplicar" explícito',
    description: 'Los filtros no deben ejecutarse mientras el usuario los está construyendo. Debe existir un botón "Aplicar" para que el filtro se ejecute solo cuando el usuario haya terminado de configurarlo. Aplicar filtros incrementalmente causa lentitud y confusión.',
    referenceIds: ['CX-406','CX-408'],
  },
  {
    id: 'p1-6',
    section: 1,
    sectionTitle: 'Búsquedas y filtros',
    title: 'Permitir selección múltiple y "Seleccionar todo"',
    description: 'Cuando se muestran resultados de búsqueda que el usuario debe seleccionar (equipos, elementos de red, KPIs), siempre debe existir una opción de "seleccionar todos los resultados visibles". Forzar selección uno a uno es inviable cuando hay decenas o cientos de resultados.',
    referenceIds: ['CX-369','CX-397','PM-043','PM-054','PM-112'],
  },
  // Section 2: Paginación y listas
  {
    id: 'p2-1',
    section: 2,
    sectionTitle: 'Paginación y listas',
    title: 'Nunca usar "Cargar más" — siempre paginación real',
    description: 'El patrón "Load More" / "Carregar mais" está explícitamente rechazado por los usuarios. Genera sensación de lista infinita, pierde el header de las columnas al hacer scroll, y no permite saber cuántos registros existen. Usar siempre paginación con controles de página, indicador de total de registros, y opción de cambiar registros por página.',
    referenceIds: ['CX-417','CX-428','CX-454','CX-462','CX-511'],
  },
  {
    id: 'p2-2',
    section: 2,
    sectionTitle: 'Paginación y listas',
    title: 'Tamaño de página configurable y generoso',
    description: 'El tamaño de página por defecto debe ser suficientemente grande (mínimo 25 registros). El usuario debe poder cambiar la cantidad de registros por página. Páginas de 10 registros fuerzan paginación excesiva.',
    referenceIds: ['CX-370','CX-380','CX-381','PM-021'],
  },
  {
    id: 'p2-3',
    section: 2,
    sectionTitle: 'Paginación y listas',
    title: 'Paginación debe permitir saltar a la última página',
    description: 'Cuando el dataset es grande (miles de páginas), debe existir un control para ir directamente a la primera o última página, no solo avanzar/retroceder una a una.',
    referenceIds: ['PM-035'],
  },
  {
    id: 'p2-4',
    section: 2,
    sectionTitle: 'Paginación y listas',
    title: 'Ordenación alfabética por defecto',
    description: 'Toda lista debe estar ordenada alfabéticamente por nombre como comportamiento por defecto. Esto aplica a listas de KPIs, grupos, catálogos, dropdowns, y cualquier colección enumerable. El usuario debe poder ordenar por cualquier columna visible.',
    referenceIds: ['CX-355','CX-378','CX-444','CX-425','CX-429','CX-523','PM-004','PM-006','PM-014','PM-028','PM-029','PM-040','PM-066','PM-098'],
  },
  {
    id: 'p2-5',
    section: 2,
    sectionTitle: 'Paginación y listas',
    title: 'Nuevos registros deben aparecer al inicio',
    description: 'Cuando el usuario crea un registro nuevo (grupo, tarea, etc.), el sistema debe posicionar ese registro al inicio de la lista o navegar automáticamente a él, para que el usuario pueda confirmar que se creó correctamente.',
    referenceIds: ['CX-442','CX-450','CX-457','PM-040'],
  },
  // Section 3: Paneles, tabs y layout
  {
    id: 'p3-1',
    section: 3,
    sectionTitle: 'Paneles, tabs y layout',
    title: 'Todo panel lateral debe ser redimensionable',
    description: 'Cualquier panel, tab o sidebar que muestre contenido variable (nombres largos de KPIs, nombres de grupos, árboles de navegación) debe permitir al usuario cambiar su ancho arrastrando el borde. Colapsar/expandir no es suficiente — el usuario necesita ajustar el ancho para leer contenido de ambos lados simultáneamente.',
    referenceIds: ['CX-335','CX-357','CX-360','CX-389','CX-409','CX-452','PM-075'],
  },
  {
    id: 'p3-2',
    section: 3,
    sectionTitle: 'Paneles, tabs y layout',
    title: 'Columnas de tabla deben mostrar contenido completo',
    description: 'Las columnas deben tener un ancho mínimo suficiente para mostrar el contenido típico. Cuando el contenido es largo, el usuario debe poder ver el texto completo sin depender de tooltips (hover). Columnas como "nombre de regla" o "nombre de KPI" frecuentemente truncan información crítica.',
    referenceIds: ['CX-473','PM-075','PM-001'],
  },
  {
    id: 'p3-3',
    section: 3,
    sectionTitle: 'Paneles, tabs y layout',
    title: 'Tabs deben poder reordenarse',
    description: 'En pantallas de detalle con múltiples tabs (ej: catálogo de MO), el usuario debe poder reorganizar el orden de las pestañas según su flujo de trabajo.',
    referenceIds: ['CX-448'],
  },
  // Section 4: Traducción e internacionalización
  {
    id: 'p4-1',
    section: 4,
    sectionTitle: 'Traducción e internacionalización',
    title: 'Todo texto visible debe estar traducido',
    description: 'No debe existir ninguna cadena de texto en inglés visible al usuario final en un entorno configurado en español o portugués. Esto incluye labels de filtros, valores de status, operadores, nombres de ejes de gráficos, mensajes de error, tooltips, alertas, botones y formatos de fecha. Los 73 ítems de traducción reportados demuestran que este es un problema sistémico — en la nueva app debe resolverse con un sistema de i18n robusto, no caso por caso.',
    referenceIds: ['CX-375','CX-379','CX-423','CX-481','CX-498','CX-499','CX-501','PM-003','PM-007','PM-008','PM-009','PM-010','PM-011','PM-012','PM-015','PM-016','PM-018','PM-019','PM-020','PM-022','PM-023','PM-024','PM-025','PM-026','PM-032','PM-034','PM-036','PM-037','PM-038','PM-039','PM-041','PM-042','PM-044','PM-045','PM-046','PM-047','PM-048','PM-049','PM-050','PM-053','PM-055','PM-056','PM-057','PM-058','PM-059','PM-061','PM-063','PM-064','PM-065','PM-067','PM-068','PM-069','PM-070','PM-071','PM-072','PM-076','PM-077','PM-078','PM-079','PM-080','PM-081','PM-085','PM-086','PM-087','PM-090','PM-091','PM-092','PM-094','PM-096','PM-097','PM-100','PM-101','PM-102','PM-103','PM-104','PM-106','PM-107'],
  },
  {
    id: 'p4-2',
    section: 4,
    sectionTitle: 'Traducción e internacionalización',
    title: 'Mantener términos técnicos en inglés cuando corresponda',
    description: 'Ciertos términos técnicos del dominio deben mantenerse en inglés porque son estándar de la industria: "Discovery", "Discovery Mapping", "Polling", "Stack". Traducirlos genera confusión. El criterio: si el equipo de operaciones usa el término en inglés en su día a día, mantenerlo.',
    referenceIds: ['CX-498','CX-499'],
  },
  {
    id: 'p4-3',
    section: 4,
    sectionTitle: 'Traducción e internacionalización',
    title: 'Formatos regionales correctos',
    description: 'Los separadores decimales deben respetar la configuración regional. En Brasil, el separador decimal es coma (,), no punto (.). Las fechas deben respetar el formato local. Los valores booleanos deben mostrarse en el idioma del usuario (Sí/No), nunca como true/false.',
    referenceIds: ['CX-341','PM-027','PM-064','PM-092','PM-156'],
  },
  // Section 5: Validación y feedback
  {
    id: 'p5-1',
    section: 5,
    sectionTitle: 'Validación y feedback',
    title: 'Validar campos obligatorios antes de guardar',
    description: 'Nunca permitir guardar registros con campos obligatorios vacíos. La validación debe ser inline (en el campo) con mensaje descriptivo, no solo al momento del submit.',
    referenceIds: ['CX-354','CX-432','CX-456','CX-512'],
  },
  {
    id: 'p5-2',
    section: 5,
    sectionTitle: 'Validación y feedback',
    title: 'Validar longitud máxima de campos en frontend',
    description: 'Todo campo de texto debe tener un límite de caracteres validado en el frontend. La app legacy permite ingresar textos que exceden el límite de la base de datos (255 caracteres), causando errores crípticos del backend. Implementar maxLength en el input y mostrar contador de caracteres para campos largos.',
    referenceIds: ['PM-113','PM-114','PM-115','PM-119','PM-125','PM-126','PM-127','PM-147','PM-153'],
  },
  {
    id: 'p5-3',
    section: 5,
    sectionTitle: 'Validación y feedback',
    title: 'Validar valores numéricos con rangos lógicos',
    description: 'Los campos numéricos (tiempo mínimo, tiempo máximo, intervalos, etc.) no deben aceptar valores fuera de rango (ej: 0 cuando el mínimo es 1, o valores negativos). La validación debe ser de rango, no solo de tipo.',
    referenceIds: ['PM-122','PM-135','PM-145','PM-146','PM-148','PM-150'],
  },
  {
    id: 'p5-4',
    section: 5,
    sectionTitle: 'Validación y feedback',
    title: 'Errores descriptivos, nunca mensajes técnicos',
    description: 'Cuando ocurre un error, el mensaje debe ser comprensible para el usuario final. Nunca mostrar errores de base de datos, stack traces o mensajes técnicos. Para errores de duplicados: "Ya existe un registro con ese nombre". Para errores de longitud: "El campo supera el máximo de X caracteres".',
    referenceIds: ['CX-424','PM-151'],
  },
  {
    id: 'p5-5',
    section: 5,
    sectionTitle: 'Validación y feedback',
    title: 'Validar antes de permitir guardado inconsistente',
    description: 'No permitir que una categoría sea su propio padre. No permitir crear tareas con fechas pasadas. No permitir espacios al inicio de nombres. Estas validaciones de lógica de negocio deben estar en el frontend.',
    referenceIds: ['PM-031','PM-083','PM-141','PM-149'],
  },
  // Section 6: Performance y estados de carga
  {
    id: 'p6-1',
    section: 6,
    sectionTitle: 'Performance y estados de carga',
    title: 'Siempre mostrar indicador de carga',
    description: 'Toda operación asíncrona (cargar árbol de grupos, ejecutar filtro, buscar equipos, exportar) debe mostrar un indicador de carga. Nunca dejar al usuario frente a una pantalla congelada o en blanco sin feedback de que algo está ocurriendo.',
    referenceIds: ['CX-358','CX-328','CX-342','CX-343','CX-344','CX-367','CX-395','CX-427','CX-441','CX-453','CX-466'],
  },
  {
    id: 'p6-2',
    section: 6,
    sectionTitle: 'Performance y estados de carga',
    title: 'Operaciones largas deben notificar al completarse',
    description: 'Cuando una operación toma más de unos segundos (sincronización de grupo dinámico, exportación grande), el usuario debe recibir una notificación al completarse, incluso si navegó a otra parte de la aplicación.',
    referenceIds: ['CX-399','CX-416'],
  },
  // Section 7: Navegación y contexto
  {
    id: 'p7-1',
    section: 7,
    sectionTitle: 'Navegación y contexto',
    title: 'No resetear el contexto al cambiar de elemento',
    description: 'Cuando el usuario tiene un Stack seleccionado y cambia de objeto (interfaz), el Stack debe mantenerse seleccionado. El contexto del usuario (filtros activos, selecciones previas) debe preservarse durante la navegación dentro del mismo módulo.',
    referenceIds: ['CX-336','CX-346','CX-470'],
  },
  {
    id: 'p7-2',
    section: 7,
    sectionTitle: 'Navegación y contexto',
    title: 'La búsqueda no debe romper el árbol de navegación',
    description: 'Después de buscar y seleccionar un resultado, el árbol debe expandirse para mostrar el contexto del elemento encontrado (sus padres, su ubicación en la jerarquía). No mostrar el resultado aislado sin contexto.',
    referenceIds: ['CX-353','CX-373','PM-157'],
  },
  {
    id: 'p7-3',
    section: 7,
    sectionTitle: 'Navegación y contexto',
    title: 'Navegación en wizards debe permitir saltar pasos',
    description: 'En flujos multi-paso (creación de reportes, configuración de alarmas), el usuario debe poder navegar directamente a cualquier paso ya completado, sin tener que recorrer secuencialmente los pasos anteriores.',
    referenceIds: ['CX-374','PM-082'],
  },
  {
    id: 'p7-4',
    section: 7,
    sectionTitle: 'Navegación y contexto',
    title: 'Links de navegación cruzada entre módulos',
    description: 'Desde Inventario, el usuario debe poder navegar directamente a KPI View para ese equipo. Desde la lista de alarmas, debe poder navegar al detalle del KPI. Los módulos no deben ser islas; el flujo operativo cruza entre ellos constantemente.',
    referenceIds: ['CX-412','CX-468'],
  },
  // Section 8: Datos y exportaciones
  {
    id: 'p8-1',
    section: 8,
    sectionTitle: 'Datos y exportaciones',
    title: 'Nombres de archivos exportados deben ser descriptivos',
    description: 'Los archivos exportados (Excel, CSV) deben incluir en su nombre: el nombre del reporte o entidad, y la fecha/hora de generación. Nunca usar nombres genéricos del sistema.',
    referenceIds: ['CX-383'],
  },
  {
    id: 'p8-2',
    section: 8,
    sectionTitle: 'Datos y exportaciones',
    title: 'Exportaciones deben respetar el contexto',
    description: 'Al exportar datos, exportar solo los campos relevantes al tipo de entidad seleccionada, no todos los campos del sistema. El usuario no necesita todas las propiedades — solo las que corresponden al tipo de equipo que está exportando.',
    referenceIds: ['CX-403','CX-415','CX-445'],
  },
  {
    id: 'p8-3',
    section: 8,
    sectionTitle: 'Datos y exportaciones',
    title: 'Envíos SFTP deben organizarse por fecha',
    description: 'Los archivos enviados por SFTP deben organizarse automáticamente en carpetas con formato de fecha (YYYYMMDD), no acumularse todos en una sola carpeta.',
    referenceIds: ['PM-155'],
  },
  // Section 9: Tooltips e información contextual
  {
    id: 'p9-1',
    section: 9,
    sectionTitle: 'Tooltips e información contextual',
    title: 'Tooltips deben mostrar información curada, no todo',
    description: 'Al hacer hover sobre un elemento, mostrar solo los campos relevantes (ej: ifAlias, ifSpeed para interfaces). Mostrar todos los campos disponibles es tan inútil como no mostrar ninguno.',
    referenceIds: ['CX-330'],
  },
  {
    id: 'p9-2',
    section: 9,
    sectionTitle: 'Tooltips e información contextual',
    title: 'Unidades correctas siempre',
    description: 'Los gráficos deben mostrar las unidades correctas (Gbps, no Bbps). Los porcentajes deben mostrarse como porcentajes (50%), no como decimales (0.5). Las unidades deben respetar la configuración del KPI.',
    referenceIds: ['CX-340','PM-140'],
  },
  // Section 10: Limpieza de datos legacy
  {
    id: 'p10-1',
    section: 10,
    sectionTitle: 'Limpieza de datos legacy',
    title: 'Datos de prueba no deben existir en producción',
    description: 'Antes de exponer cualquier catálogo (localizaciones, tipos de equipo, parámetros, KPIs, OIDs, proveedores), se debe hacer una limpieza de registros de prueba, datos incompletos y entradas duplicadas del entorno legacy. El usuario no debe ver registros como "Fornecedor Fk" o localizaciones de prueba.',
    referenceIds: ['CX-333','CX-419','CX-456','CX-458','CX-459','CX-512'],
  },
];

const ITEMS: CXItemSeed[] = [
  // ─── KPI View & Navigator — Bugs ───────────────────────────────────────────
  { id:'CX-330', module:'KPI View & Navigator', type:'bug', priority:'alta', description:'Tooltip de interfaces muestra demasiada información. Debe mostrar solo ifAlias, ifSpeed, ifConnector' },
  { id:'CX-332', module:'KPI View & Navigator', type:'bug', priority:'alta', description:'Búsqueda de grupos no muestra el total de resultados que coinciden con la cadena buscada' },
  { id:'CX-338', module:'KPI View & Navigator', type:'bug', priority:'alta', description:'Los valores MIN, MAX y AVG de KPIs ya no son visibles en los gráficos (antes lo eran)' },
  { id:'CX-340', module:'KPI View & Navigator', type:'bug', priority:'alta', description:'Unidades incorrectas en los gráficos (muestra Bbps en lugar de Gbps)' },
  { id:'CX-345', module:'KPI View & Navigator', type:'bug', priority:'alta', description:'Interfaces que tienen datos en KPI View no muestran información al buscarlas en Navigator' },
  { id:'CX-346', module:'KPI View & Navigator', type:'bug', priority:'alta', description:'Al cambiar de grupo, la interfaz retorna al grupo previamente seleccionado impidiendo la navegación' },
  { id:'CX-348', module:'KPI View & Navigator', type:'bug', priority:'alta', description:'Cuando un admin edita un Stack de otro usuario, el creador pierde capacidad de edición' },
  { id:'PM-112', module:'KPI View & Navigator', type:'bug', priority:'alta', description:'Se perdió la capacidad de selección múltiple de objetos en un grupo — antes se podía seleccionar varios, ahora es uno a uno' },
  { id:'PM-120', module:'KPI View & Navigator', type:'bug', priority:'baja', description:"El campo 'Hora' no se comporta de forma responsiva al seleccionar más de tres opciones de horario" },
  { id:'PM-123', module:'KPI View & Navigator', type:'bug', priority:'alta', description:'La búsqueda de grupos en KPI View y Navigator no retorna todos los resultados (limitado a ~10)' },
  { id:'PM-134', module:'KPI View & Navigator', type:'bug', priority:'media', description:'Equipamientos que aparecen en reportes no se muestran en KPI View para el mismo grupo' },
  { id:'PM-135', module:'KPI View & Navigator', type:'bug', priority:'baja', description:"El campo 'Valor' permite insertar números extremadamente largos sin validación ni límite visible" },
  { id:'PM-140', module:'KPI View & Navigator', type:'bug', priority:'baja', description:'Valores del eje Y en porcentaje se muestran como decimal (0.5 en lugar de 50%)' },
  { id:'PM-144', module:'KPI View & Navigator', type:'bug', priority:'media', description:'Datos duplicados en la fuente se muestran de forma incoherente: aparecen al agregar pero no sin agregar' },

  // ─── KPI View & Navigator — Features ──────────────────────────────────────
  { id:'CX-337', module:'KPI View & Navigator', type:'feature', priority:'media', description:'Permitir otros formatos de gráfico además de líneas (barras, etc.)' },
  { id:'CX-350', module:'KPI View & Navigator', type:'feature', priority:'media', description:'Pre-seleccionar un Stack automáticamente al seleccionar un grupo u objeto' },
  { id:'CX-352', module:'KPI View & Navigator', type:'feature', priority:'alta', description:'Navegación tipo drill-down en árbol sin abrir nuevas pantallas' },
  { id:'CX-468', module:'KPI View & Navigator', type:'feature', priority:'alta', description:'Colores de interfaces según estado de coleta: verde=colectando, gris=sin colecta, blanco=sin discovery >1 mes, amarillo/rojo=umbral violado' },
  { id:'CX-469', module:'KPI View & Navigator', type:'feature', priority:'alta', description:'Funcionalidad de colecta online solicitada por el equipo NOC' },
  { id:'CX-489', module:'KPI View & Navigator', type:'feature', priority:'media', description:'Compartir Stacks con usuarios específicos (similar a HPM)' },
  { id:'CX-490', module:'KPI View & Navigator', type:'feature', priority:'alta', description:'Comparar un KPI con datos de los últimos 7 días' },
  { id:'CX-491', module:'KPI View & Navigator', type:'feature', priority:'alta', description:'Visualizar en los gráficos de KPI los alarmes que fueron accionados' },
  { id:'PM-131', module:'KPI View & Navigator', type:'feature', priority:'alta', description:'Recolectar y reprocesar datos atrasados después de fallos de colecta para llenar gaps en gráficos' },

  // ─── KPI View & Navigator — Mejoras ───────────────────────────────────────
  { id:'CX-327', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'Usuarios nuevos no saben dónde iniciar en KPI View — falta guía de onboarding' },
  { id:'CX-328', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'Lentitud en filtros de búsqueda de equipamiento' },
  { id:'CX-329', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'Búsqueda parcial no muestra todos los resultados posibles' },
  { id:'CX-331', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'Búsqueda de objeto no muestra los grupos donde se encuentra la interfaz' },
  { id:'CX-334', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'Leyendas de gráficos borrosas y con información de agregación innecesaria' },
  { id:'CX-335', module:'KPI View & Navigator', type:'mejora', priority:'media', description:'Paneles laterales (Navigator y lista de KPIs) no son redimensionables' },
  { id:'CX-336', module:'KPI View & Navigator', type:'mejora', priority:'media', description:'Al cambiar de interfaz, se pierde la selección de Stack activo' },
  { id:'CX-339', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'El rango de tiempo por defecto debe ser 24h, no 5h' },
  { id:'CX-342', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'Lentitud en búsqueda de equipamientos en Navigator' },
  { id:'CX-343', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'Lentitud intermitente al filtrar MO por nombre de KPI' },
  { id:'CX-344', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'Consulta de datos para una interfaz específica tarda ~30 segundos' },
  { id:'CX-347', module:'KPI View & Navigator', type:'mejora', priority:'media', description:'Pantalla de creación de Stack confusa — falta guía y es lenta' },
  { id:'CX-351', module:'KPI View & Navigator', type:'mejora', priority:'media', description:"Filtros 'contiene' deben permitir combinación (nombre + tipo de interfaz)" },
  { id:'CX-353', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'Después de buscar y seleccionar un grupo, al salir del filtro el árbol no se expande' },
  { id:'CX-463', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'El equipo NOC tiene dificultades recurrentes para seleccionar grupos en Navigator' },
  { id:'CX-464', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'El cuadro de búsqueda se mueve al hacer scroll en el árbol, dificultando la búsqueda' },
  { id:'CX-465', module:'KPI View & Navigator', type:'mejora', priority:'media', description:'Garantizar que datos agregados de grupo estén completos para evitar puntos muy bajos' },
  { id:'CX-470', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'Al navegar en el árbol y abrir ramas, se vuelve al objeto previamente seleccionado' },
  { id:'CX-534', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:"Filtros 'contiene' múltiples para el mismo campo usan AND en vez de OR" },
  { id:'CX-535', module:'KPI View & Navigator', type:'mejora', priority:'alta', description:'Debe mostrarse el nombre del filtro MO Flex activo en la pantalla de KPI View' },
  { id:'CX-526', module:'KPI View & Navigator', type:'mejora', priority:'', description:'Mejorar eje X de gráficos con referencia a días/semanas/meses' },
  { id:'CX-527', module:'KPI View & Navigator', type:'mejora', priority:'', description:'Agregación default no debe superar 1 semana' },
  { id:'CX-528', module:'KPI View & Navigator', type:'mejora', priority:'', description:'Al exportar gráfico, la barra de zoom deja espacio en blanco' },
  { id:'CX-529', module:'KPI View & Navigator', type:'mejora', priority:'', description:'Permitir copiar las leyendas de los gráficos' },
  { id:'PM-002', module:'KPI View & Navigator', type:'mejora', priority:'media', description:'Fallos al generar datos en KPI View — mediciones ausentes, filtros no dependientes' },
  { id:'PM-033', module:'KPI View & Navigator', type:'mejora', priority:'baja', description:'Al insertar múltiples IPs en filtro, no se informa si hay un límite' },
  { id:'PM-035', module:'KPI View & Navigator', type:'mejora', priority:'baja', description:'Navegación en paginación no permite ir directamente a la última página' },
  { id:'PM-073', module:'KPI View & Navigator', type:'mejora', priority:'media', description:'KPI View permite seleccionar solo 4 métricas por vez (incluso para un solo día y ruta)' },
  { id:'PM-086', module:'KPI View & Navigator', type:'mejora', priority:'baja', description:"Botón 'Configuración del eje' queda activo cuando se muestra la tabla (debería solo con gráfico)" },
  { id:'PM-124', module:'KPI View & Navigator', type:'mejora', priority:'baja', description:'Indicar cuáles KPIs no pueden usarse con tablas pre-agregadas por diferencia de granularidad' },
  { id:'PM-138', module:'KPI View & Navigator', type:'mejora', priority:'baja', description:'Mejorar la experiencia de asignación de gráficos a Stacks (categoría y conjunto)' },
  { id:'PM-154', module:'KPI View & Navigator', type:'mejora', priority:'media', description:'Navigator muestra datos con 1 hora de atraso — el default debería ser últimas 24h con el último dato' },
  { id:'PM-157', module:'KPI View & Navigator', type:'mejora', priority:'', description:'Búsqueda por Device muestra solo primer nivel del árbol — al consultar, el grupo del dispositivo no muestra ítems' },

  // ─── KPI View & Navigator — Traducción ────────────────────────────────────
  { id:'PM-012', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-015', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-016', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-018', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-023', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-034', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-045', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-046', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-050', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-057', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-058', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-059', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-061', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-067', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-070', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-071', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-077', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-078', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-080', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-081', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-087', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-096', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-100', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-103', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },
  { id:'PM-104', module:'KPI View & Navigator', type:'traduccion', priority:'', description:'Labels de filtros, ejes de gráficos, mensajes de "no results", formato de fechas y nombres de campos en inglés que deben estar en portugués/español' },

  // ─── Relatório — Bugs ─────────────────────────────────────────────────────
  { id:'CX-361', module:'Relatório', type:'bug', priority:'alta', description:'Al editar un reporte y cambiar el período, aparece un popup de aviso en cada cambio' },
  { id:'CX-368', module:'Relatório', type:'bug', priority:'alta', description:"El filtro 'contiene' no registra el valor la primera vez — hay que ingresarlo dos veces" },
  { id:'PM-113', module:'Relatório', type:'bug', priority:'baja', description:"Campo 'Nombre de tarea' sin validación de 255 chars — error de DB no se muestra al usuario" },
  { id:'PM-114', module:'Relatório', type:'bug', priority:'media', description:"Campo 'Descripción' sin validación de 255 chars — mismo problema" },
  { id:'PM-115', module:'Relatório', type:'bug', priority:'media', description:"Campo 'Agendar Crontab' sin validación de 255 chars — mismo problema" },
  { id:'PM-119', module:'Relatório', type:'bug', priority:'media', description:"Campo 'Categoría nombre' (actualización) sin validación de longitud" },
  { id:'PM-121', module:'Relatório', type:'bug', priority:'media', description:"Campo 'Tabla Pre-agregada' no muestra opciones cuando se selecciona 'Temporal padrão'" },
  { id:'PM-125', module:'Relatório', type:'bug', priority:'media', description:"Campo 'Nombre del Relatório' sin validación de longitud — error de DB" },
  { id:'PM-126', module:'Relatório', type:'bug', priority:'media', description:"Campo 'Categoría nombre' (inserción) sin validación de longitud" },
  { id:'PM-127', module:'Relatório', type:'bug', priority:'media', description:"Campo 'Descripción de tarea' sin validación de longitud" },
  { id:'PM-128', module:'Relatório', type:'bug', priority:'alta', description:'Horas en formato 24h pero con indicadores AM/PM (mezcla de formatos)' },
  { id:'PM-129', module:'Relatório', type:'bug', priority:'alta', description:'Reporte TIWS_Teste_Agg falla al generar — se traba la configuración' },
  { id:'PM-130', module:'Relatório', type:'bug', priority:'media', description:'Tasks de reportes privados no visibles para perfil de desempeño — problema de políticas' },
  { id:'PM-133', module:'Relatório', type:'bug', priority:'alta', description:"Al seleccionar campo 'Último Relatório' en filtro, se cambia a 'Período de Tiempo'" },
  { id:'PM-137', module:'Relatório', type:'bug', priority:'media', description:'Usuarios con perfil de desempeño deberían tener acceso full al módulo de relatórios' },
  { id:'PM-147', module:'Relatório', type:'bug', priority:'media', description:'Nombre de tarea de 255 chars oculta los botones de acción (responsividad)' },
  { id:'PM-149', module:'Relatório', type:'bug', priority:'baja', description:'Categoría se puede definir como su propio padre — desaparece del árbol' },
  { id:'PM-151', module:'Relatório', type:'bug', priority:'media', description:'Mensaje de error técnico de DB visible al usuario al crear categoría duplicada' },
  { id:'PM-152', module:'Relatório', type:'bug', priority:'baja', description:'Pop-up de edición de categoría se cierra al hacer clic fuera — pierde cambios' },
  { id:'PM-153', module:'Relatório', type:'bug', priority:'media', description:"Campo 'Categoría Pai' muestra un registro de 255 chars que afecta usabilidad" },

  // ─── Relatório — Features ─────────────────────────────────────────────────
  { id:'CX-356', module:'Relatório', type:'feature', priority:'media', description:'Separar menús de edición y creación de reportes — permitir acciones desde la pantalla de navegación' },
  { id:'CX-365', module:'Relatório', type:'feature', priority:'media', description:'Preview del reporte antes de guardarlo (puede ser limitado a pocos elementos)' },
  { id:'CX-372', module:'Relatório', type:'feature', priority:'alta', description:'Seleccionar todos los hijos de un nodo padre (ej: seleccionar todo CORE)' },
  { id:'CX-525', module:'Relatório', type:'feature', priority:'media', description:'Opción de comprimir reportes generados en ZIP antes de enviarlos' },
  { id:'CX-530', module:'Relatório', type:'feature', priority:'alta', description:'Configurar reportes con fecha relativa y períodos específicos (ej: D-1, solo 09:00 y 15:00)' },
  { id:'PM-118', module:'Relatório', type:'feature', priority:'media', description:'Cambiar valores nulos por vacíos en reportes generados' },

  // ─── Relatório — Mejoras ──────────────────────────────────────────────────
  { id:'CX-357', module:'Relatório', type:'mejora', priority:'media', description:'Tabs laterales deben ser redimensionables para leer nombres de reporte largos' },
  { id:'CX-358', module:'Relatório', type:'mejora', priority:'alta', description:'Árbol de categorías muy lento al abrir — sin indicador de carga' },
  { id:'CX-360', module:'Relatório', type:'mejora', priority:'alta', description:'Modal de selección de KPIs debe ser más grande — puede ocupar toda la pantalla' },
  { id:'CX-362', module:'Relatório', type:'mejora', priority:'media', description:'Selector de función de agregación requiere scroll innecesario' },
  { id:'CX-364', module:'Relatório', type:'mejora', priority:'media', description:'UX de nombrado de sheets/planillas en reportes necesita mejorar' },
  { id:'CX-366', module:'Relatório', type:'mejora', priority:'alta', description:'Confusión entre propiedades del MO y MOs relacionados — nombres idénticos causan confusión' },
  { id:'CX-367', module:'Relatório', type:'mejora', priority:'alta', description:'Búsqueda de equipos extremadamente lenta, con diferente comportamiento entre Chrome y Edge' },
  { id:'CX-369', module:'Relatório', type:'mejora', priority:'alta', description:"Falta botón 'seleccionar todos' los equipos resultado de una búsqueda" },
  { id:'CX-370', module:'Relatório', type:'mejora', priority:'alta', description:'No se puede cambiar la cantidad de registros por página en resultados de consulta' },
  { id:'CX-374', module:'Relatório', type:'mejora', priority:'media', description:'Edición de reportes obliga a pasar por todos los pasos — debería permitir saltar a cualquier paso' },
  { id:'CX-376', module:'Relatório', type:'mejora', priority:'alta', description:'Agendamiento vía crontab no es amigable — necesita interfaz intuitiva con combos' },
  { id:'CX-377', module:'Relatório', type:'mejora', priority:'media', description:'Debería ser posible agendar ejecución desde la pantalla de creación del reporte' },
  { id:'CX-378', module:'Relatório', type:'mejora', priority:'alta', description:'Reportes en agendamiento no están en orden alfabético' },
  { id:'CX-383', module:'Relatório', type:'mejora', priority:'alta', description:'Nombres de archivos generados no corresponden al nombre del reporte — incluir nombre + fecha/hora' },
  { id:'CX-385', module:'Relatório', type:'mejora', priority:'media', description:'Ejecutar manualmente una tarea agendada directamente desde la lista sin entrar al detalle' },
  { id:'CX-532', module:'Relatório', type:'mejora', priority:'alta', description:'Permitir ordenar el orden de visualización de KPIs en el reporte' },
  { id:'PM-001', module:'Relatório', type:'mejora', priority:'media', description:'Campo de nombre de reporte con 255 chars oculta botones de acción' },
  { id:'PM-017', module:'Relatório', type:'mejora', priority:'media', description:"Reportes antiguos con status 'Failed' no se pueden eliminar y aparecen con campos vacíos" },
  { id:'PM-030', module:'Relatório', type:'mejora', priority:'media', description:"Botón 'Finalizar' solo se habilita al abrir config de agregaciones, aunque no se cambie nada" },
  { id:'PM-031', module:'Relatório', type:'mejora', priority:'baja', description:'Permite crear categorías con espacio al inicio del nombre' },
  { id:'PM-052', module:'Relatório', type:'mejora', priority:'media', description:"Campo 'Categoría Pai' no permite digitar para buscar — solo seleccionar de lista" },
  { id:'PM-060', module:'Relatório', type:'mejora', priority:'baja', description:"Campo 'Período de Tiempo' usa operador 'contains' — debería usar 'between'" },
  { id:'PM-083', module:'Relatório', type:'mejora', priority:'media', description:"Campo 'Agendar Crontab' acepta letras — debería validar solo números y caracteres cron válidos" },
  { id:'PM-084', module:'Relatório', type:'mejora', priority:'media', description:'Filtro de período transforma valores de fecha a formato no amigable al confirmar' },
  { id:'PM-089', module:'Relatório', type:'mejora', priority:'alta', description:'Filtro de período en agendamiento transforma fecha a formato técnico ilegible' },
  { id:'PM-105', module:'Relatório', type:'mejora', priority:'media', description:"Al seleccionar campo 'Período' en filtro, el propio campo desaparece" },
  { id:'PM-111', module:'Relatório', type:'mejora', priority:'baja', description:'Campo limitado a 255 chars sin restricción visible en búsqueda de equipos' },
  { id:'PM-117', module:'Relatório', type:'mejora', priority:'media', description:'Campo DateTime del reporte no refleja el período de agregación configurado' },
  { id:'PM-139', module:'Relatório', type:'mejora', priority:'baja', description:"Búsqueda de categoría inexistente no muestra mensaje de 'sin resultados'" },
  { id:'PM-141', module:'Relatório', type:'mejora', priority:'alta', description:'Permite crear tareas de agendamiento con fecha/hora en el pasado' },
  { id:'PM-142', module:'Relatório', type:'mejora', priority:'alta', description:'No hay trazabilidad de dependencias entre reportes y otros módulos — falta gestión de logs' },
  { id:'PM-155', module:'Relatório', type:'mejora', priority:'media', description:'Archivos enviados por SFTP deben organizarse en carpetas con fecha' },

  // ─── Alarmes — Bugs ───────────────────────────────────────────────────────
  { id:'PM-122', module:'Alarmes', type:'bug', priority:'media', description:"Campo 'Integridad' permite hasta 309 caracteres sin validación adecuada" },
  { id:'PM-145', module:'Alarmes', type:'bug', priority:'baja', description:"Campo 'Tiempo min' permite valor 0" },
  { id:'PM-146', module:'Alarmes', type:'bug', priority:'baja', description:"Campo 'Días de intervalos' permite valor 0" },
  { id:'PM-148', module:'Alarmes', type:'bug', priority:'media', description:"Campo 'Tempos' permite valor 0" },
  { id:'PM-150', module:'Alarmes', type:'bug', priority:'media', description:"Campo 'Tiempo Max' permite valor 0" },

  // ─── Alarmes — Features ───────────────────────────────────────────────────
  { id:'CX-471', module:'Alarmes', type:'feature', priority:'alta', description:'Visualizar ocurrencias de alarma directamente en la lista de alarmes' },
  { id:'CX-486', module:'Alarmes', type:'feature', priority:'alta', description:'Limpieza manual de alarmas — capacidad de clear manual' },
  { id:'PM-160', module:'Alarmes', type:'feature', priority:'', description:'Funcionalidad de reconocimiento (acknowledge) y desactivación de alarmas con registro de usuario y fecha' },
  { id:'PM-162', module:'Alarmes', type:'feature', priority:'', description:'Historial completo de eventos de un alarma desde inicio hasta resolución (clear)' },

  // ─── Alarmes — Mejoras ────────────────────────────────────────────────────
  { id:'CX-472', module:'Alarmes', type:'mejora', priority:'alta', description:'Mostrar nombre del grupo en columna separada' },
  { id:'CX-473', module:'Alarmes', type:'mejora', priority:'alta', description:"Columna 'nombre de regla límite' trunca nombres — ancho insuficiente" },
  { id:'CX-474', module:'Alarmes', type:'mejora', priority:'media', description:'Campo AlarmId puede removerse para mejor uso del espacio' },
  { id:'CX-475', module:'Alarmes', type:'mejora', priority:'alta', description:'Separar elemento alarmado y grupo de KPIs en columnas distintas' },
  { id:'CX-476', module:'Alarmes', type:'mejora', priority:'alta', description:"Filtros deben soportar 'es' y 'contiene' con selección múltiple" },
  { id:'CX-477', module:'Alarmes', type:'mejora', priority:'alta', description:'Revisar campos visibles en lista — usar como referencia los campos del HPM' },
  { id:'CX-478', module:'Alarmes', type:'mejora', priority:'alta', description:'Valor del alarma debe mostrarse en las columnas' },
  { id:'CX-479', module:'Alarmes', type:'mejora', priority:'media', description:'Permitir guardar filtros pre-configurados' },
  { id:'CX-480', module:'Alarmes', type:'mejora', priority:'alta', description:'Horarios sin mostrar zona horaria — usar horario Brasil sin indicador de TZ' },
  { id:'CX-481', module:'Alarmes', type:'mejora', priority:'alta', description:'ID del tipo de alarma debe indicar que es el ID del TEMS' },
  { id:'CX-482', module:'Alarmes', type:'mejora', priority:'alta', description:'Modal de búsqueda de grupo en Limiares debe mejorar (igual que otros módulos)' },
  { id:'CX-483', module:'Alarmes', type:'mejora', priority:'alta', description:'Mejorar label para exclusión de valores pico (dividir en dos: más altos / más bajos)' },
  { id:'CX-484', module:'Alarmes', type:'mejora', priority:'alta', description:'Validación cruzada de campos — no permitir valores fuera de rango en comparación lógica' },
  { id:'CX-485', module:'Alarmes', type:'mejora', priority:'media', description:'Valor de Clear debe ser editable por el usuario, no solo autodeterminado' },
  { id:'CX-533', module:'Alarmes', type:'mejora', priority:'alta', description:'Al configurar alarma de comparación histórica, backend debe setear parámetros automáticamente' },
  { id:'PM-005', module:'Alarmes', type:'mejora', priority:'baja', description:"Campo 'ID Externo' debería renombrarse a 'Interface' para mayor claridad" },
  { id:'PM-051', module:'Alarmes', type:'mejora', priority:'baja', description:"Al editar categoría, el mensaje dice 'creada con éxito' en vez de 'editada'" },
  { id:'PM-095', module:'Alarmes', type:'mejora', priority:'baja', description:"Filtro de elementos de red solo permite buscar por equipamiento — agregar filtro por 'Tipo'" },

  // ─── Alarmes — Traducción ─────────────────────────────────────────────────
  { id:'PM-003', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-007', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-008', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-010', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-011', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-019', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-022', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-024', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-025', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-038', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-041', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-044', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-048', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-049', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-053', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-055', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-068', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-069', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-072', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-076', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-085', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-091', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-097', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },
  { id:'PM-101', module:'Alarmes', type:'traduccion', priority:'', description:'Operadores de criticidad, estados (Enabled/Disabled/Cleared/Critical/Major/Minor), títulos de filtros, botones y campos de formulario en inglés' },

  // ─── Catálogo & Métricas — Bugs ───────────────────────────────────────────
  { id:'CX-460', module:'Catálogo & Métricas', type:'bug', priority:'alta', description:'Campos de latitud/longitud no se muestran correctamente al 100% de zoom' },
  { id:'PM-132', module:'Catálogo & Métricas', type:'bug', priority:'media', description:'Interfaz permite incluir caracteres de fórmulas (+, -, /, *) en nombres de contadores' },

  // ─── Catálogo & Métricas — Features ──────────────────────────────────────
  { id:'CX-426', module:'Catálogo & Métricas', type:'feature', priority:'media', description:'Campo para indicar si un contador está siendo colectado (con lógica de actualización automática)' },

  // ─── Catálogo & Métricas — Mejoras ───────────────────────────────────────
  { id:'CX-354', module:'Catálogo & Métricas', type:'mejora', priority:'media', description:'Campos obligatorios vacíos — validar y completar según lógica' },
  { id:'CX-417', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:"Reemplazar 'cargar más' por paginación real con header fijo" },
  { id:'CX-418', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:"Filtros de contadores deben mejorar — lista infinita por familia, necesitan 'contiene' y 'es'" },
  { id:'CX-419', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:"Limpiar lista de proveedores — eliminar registros inútiles como 'Fornecedor Fk'" },
  { id:'CX-420', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:'Al crear un OID, el contador debe generarse automáticamente en el catálogo' },
  { id:'CX-424', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:'Carga masiva debe informar qué fila y columna causó el error' },
  { id:'CX-428', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:"Reemplazar 'cargar más' por paginación en catálogo de KPIs" },
  { id:'CX-432', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:'Unidad obligatoria y funciones de agregación detalladas por KPI' },
  { id:'CX-433', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:'Permitir crear fórmula durante la creación del KPI (no solo al editarlo después)' },
  { id:'CX-435', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:'Carga masiva de KPIs: documentar diferencia numerador/denominador y tipos de contador' },
  { id:'CX-438', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:'Selección de categorías demasiado compleja — permitir ingreso manual con pre-filtro por dominio' },
  { id:'CX-442', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:'Creación de nuevo parámetro debe estar al inicio, no al final. Lista debe ser paginada' },
  { id:'CX-443', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:'Evaluar consolidar catálogos distribuidos en diferentes menús en un solo lugar' },
  { id:'CX-447', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:'Modal de selección de KPIs en MO debe mejorar — KPIs en orden alfabético, modal más grande' },
  { id:'CX-449', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:'Validar mapeo de Equipment Types existentes al tipo de equipo deseado' },
  { id:'CX-452', module:'Catálogo & Métricas', type:'mejora', priority:'media', description:'Tabs en catálogo de MO deben ser redimensionables' },
  { id:'CX-454', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:'Paginación real en catálogo de tipos de equipo' },
  { id:'CX-462', module:'Catálogo & Métricas', type:'mejora', priority:'media', description:"Reemplazar 'cargar más' por paginación en catálogo de credenciales" },
  { id:'CX-488', module:'Catálogo & Métricas', type:'mejora', priority:'alta', description:'Permitir uso de Regex en catálogo de KPIs' },
  { id:'PM-093', module:'Catálogo & Métricas', type:'mejora', priority:'media', description:'Falta filtro por categoría de KPI — lista no está en orden alfabético' },
  { id:'PM-136', module:'Catálogo & Métricas', type:'mejora', priority:'media', description:'Definir restricciones de integridad: todo equipo debe tener Equipment Type, todo ET debe tener MO, todo MO debe tener al menos un KPI' },
  { id:'PM-143', module:'Catálogo & Métricas', type:'mejora', priority:'media', description:'Permitir habilitar/deshabilitar uso de delta desde el frontend' },

  // ─── Inventário & NE Grouping — Bugs ─────────────────────────────────────
  { id:'CX-412', module:'Inventário & NE Grouping', type:'bug', priority:'alta', description:"Acceder a KPI View desde Inventario muestra error 'Ops something went wrong'" },

  // ─── Inventário & NE Grouping — Features ─────────────────────────────────
  { id:'PM-109', module:'Inventário & NE Grouping', type:'feature', priority:'media', description:"Campos 'modelo' y 'device function' del equipo padre no disponibles como filtros en sus hijos (interfaces, CPU, etc.)" },
  { id:'PM-158', module:'Inventário & NE Grouping', type:'feature', priority:'', description:'Carga en lote de equipamientos en grupos estáticos' },
  { id:'PM-159', module:'Inventário & NE Grouping', type:'feature', priority:'', description:'Permitir filtros en grupos dinámicos basados en grupos estáticos existentes' },

  // ─── Inventário & NE Grouping — Mejoras ──────────────────────────────────
  { id:'CX-386', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'Excluir grupos/categorías en desuso (test, obsoletos)' },
  { id:'CX-387', module:'Inventário & NE Grouping', type:'mejora', priority:'media', description:'Separar grupos de poller en pestaña o menú independiente' },
  { id:'CX-388', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'Permisos: no todos los usuarios deben poder editar grupos de colecta' },
  { id:'CX-389', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'Tabs en pantalla de grupos deben ser redimensionables' },
  { id:'CX-390', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'250 resultados de búsqueda no son manejables — mejorar UX (filtrar en árbol expandido)' },
  { id:'CX-391', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'Resultados de búsqueda de grupos no muestran el path completo' },
  { id:'CX-394', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'Mejorar navegación para encontrar la categoría destino al crear grupo — mostrar path completo' },
  { id:'CX-395', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'Búsqueda de equipos en grupo estático lenta — considerar pre-filtrado' },
  { id:'CX-396', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'Filtro de equipos en grupo estático necesita más opciones (similar a Inventario, pre-filtrar por MO)' },
  { id:'CX-397', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'"Seleccionar todos" los equipos del resultado — actualmente es página por página' },
  { id:'CX-398', module:'Inventário & NE Grouping', type:'mejora', priority:'media', description:'Filtro de grupo dinámico confuso — demasiadas opciones pueden causar selección excesiva' },
  { id:'CX-399', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'Preview de grupo dinámico: reducir timeout y notificar cuánto tardará la sincronización' },
  { id:'CX-400', module:'Inventário & NE Grouping', type:'mejora', priority:'media', description:'Filtrar por regla de Discovery y regla de búsqueda en grupos dinámicos' },
  { id:'CX-402', module:'Inventário & NE Grouping', type:'mejora', priority:'media', description:'Mostrar el ID numérico del grupo asignado por Symphony' },
  { id:'CX-404', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'Mejorar ayuda de carga masiva — documento con instrucciones paso a paso' },
  { id:'CX-406', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:"Filtros se aplican mientras se construyen — necesitan botón 'Aplicar'" },
  { id:'CX-408', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'Edición de filtro lenta y no permite eliminar la primera opción seleccionada' },
  { id:'CX-409', module:'Inventário & NE Grouping', type:'mejora', priority:'media', description:'Tabs de localización necesitan ser redimensionables' },
  { id:'CX-410', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'Duplicación aparente entre propiedades y atributos (DEVICENAME, DEVICE_NAME, hostname)' },
  { id:'CX-411', module:'Inventário & NE Grouping', type:'mejora', priority:'media', description:'Separar propiedades según origen: Discovery, carga masiva, manual, NetCompass' },
  { id:'CX-414', module:'Inventário & NE Grouping', type:'mejora', priority:'media', description:'Mejorar experiencia de eliminación de equipos — simplificar flujo' },
  { id:'CX-415', module:'Inventário & NE Grouping', type:'mejora', priority:'alta', description:'Exportar solo propiedades/atributos que corresponden al tipo de equipo' },
  { id:'CX-416', module:'Inventário & NE Grouping', type:'mejora', priority:'media', description:'Notificar al usuario cuando creación de grupo dinámico largo finalice' },
  { id:'PM-156', module:'Inventário & NE Grouping', type:'mejora', priority:'media', description:'Exportación de IPs convierte true/false a VERDADEIRO/FALSO en Excel brasileño' },

  // ─── SNMP & Poller — Features ─────────────────────────────────────────────
  { id:'CX-506', module:'SNMP & Poller', type:'feature', priority:'alta', description:'Objetos descubiertos que excedan el máximo deben ir a cuarentena (aprobación del usuario), no ser rechazados' },
  { id:'CX-516', module:'SNMP & Poller', type:'feature', priority:'alta', description:'Validar todas las credenciales durante discovery (no solo la primera que responde)' },
  { id:'CX-522', module:'SNMP & Poller', type:'feature', priority:'media', description:'Evaluar si el DN personalizado debería siempre ser el DN del Discovery' },
  { id:'CX-524', module:'SNMP & Poller', type:'feature', priority:'media', description:'Asistente para crear DN en reglas personalizadas y mappings con validación de sintaxis' },
  { id:'PM-110', module:'SNMP & Poller', type:'feature', priority:'alta', description:'Función INDEX IGNORE — gestión de máscaras SNMP en Discovery' },

  // ─── SNMP & Poller — Mejoras ──────────────────────────────────────────────
  { id:'CX-384', module:'SNMP & Poller', type:'mejora', priority:'alta', description:'Garantizar consistencia entre datos de Discovery y datos de colecta para enriquecimiento' },
  { id:'CX-496', module:'SNMP & Poller', type:'mejora', priority:'alta', description:"Filtros de Discovery Mapping deben soportar 'es' y 'contiene'" },
  { id:'CX-497', module:'SNMP & Poller', type:'mejora', priority:'media', description:'Tab de IPs de Discovery debe aparecer primero (antes de Regras, Mapping, Ejecuciones)' },
  { id:'CX-500', module:'SNMP & Poller', type:'mejora', priority:'alta', description:"Filtros de Discovery deben soportar 'es' y 'contiene'" },
  { id:'CX-502', module:'SNMP & Poller', type:'mejora', priority:'media', description:'Desde el registro de IP, pre-configurar vendor y modelos como lista asociada' },
  { id:'CX-503', module:'SNMP & Poller', type:'mejora', priority:'media', description:'Al digitar vendor, pre-filtrar reglas de Discovery que aplican a ese vendor' },
  { id:'CX-504', module:'SNMP & Poller', type:'mejora', priority:'alta', description:'Solo mostrar MOs correspondientes a SNMP' },
  { id:'CX-505', module:'SNMP & Poller', type:'mejora', priority:'alta', description:'MOs en estructura de árbol similar a KPI View' },
  { id:'CX-507', module:'SNMP & Poller', type:'mejora', priority:'alta', description:'Remover limitación del objeto poller (frontend y backend)' },
  { id:'CX-508', module:'SNMP & Poller', type:'mejora', priority:'media', description:'Simplificar estructura de registros DNS — ejemplo + validación de sintaxis' },
  { id:'CX-509', module:'SNMP & Poller', type:'mejora', priority:'alta', description:'Mejorar navegación del catálogo de OID-propiedad para facilitar mapeo' },
  { id:'CX-510', module:'SNMP & Poller', type:'mejora', priority:'alta', description:"Filtros de OID deben soportar 'es' y 'contiene'" },
  { id:'CX-511', module:'SNMP & Poller', type:'mejora', priority:'alta', description:"Reemplazar 'cargar más' por paginación en catálogo de OID" },
  { id:'CX-512', module:'SNMP & Poller', type:'mejora', priority:'alta', description:'OIDs con campos obligatorios vacíos deben ser corregidos' },
  { id:'CX-514', module:'SNMP & Poller', type:'mejora', priority:'alta', description:"Filtros de Reglas de Discovery deben soportar 'es' y 'contiene'" },
  { id:'CX-515', module:'SNMP & Poller', type:'mejora', priority:'media', description:'Pre-filtrar Mappings por proveedor si ya hay IPs y reglas configuradas' },
  { id:'CX-517', module:'SNMP & Poller', type:'mejora', priority:'alta', description:'Agendamiento de Discovery no debe usar crontab crudo — interfaz intuitiva' },
  { id:'CX-518', module:'SNMP & Poller', type:'mejora', priority:'alta', description:"Filtros de Reglas de Polling deben soportar 'es' y 'contiene'" },
  { id:'CX-519', module:'SNMP & Poller', type:'mejora', priority:'alta', description:'Campos ilegibles en baja resolución — revisar dimensionamiento responsivo' },
  { id:'CX-520', module:'SNMP & Poller', type:'mejora', priority:'alta', description:"Solo mostrar grupos con etiqueta 'poller' en el selector" },
  { id:'CX-521', module:'SNMP & Poller', type:'mejora', priority:'alta', description:'No debe ser necesario insertar OIDs manualmente y luego configurar fórmulas — seleccionar KPIs y que el backend vincule OIDs automáticamente' },
  { id:'PM-116', module:'SNMP & Poller', type:'mejora', priority:'alta', description:'Interfaces que no reportan KPIs deben aparecer en BD con NaN, no desaparecer' },

  // ─── Superset — Features ──────────────────────────────────────────────────
  { id:'CX-492', module:'Superset', type:'feature', priority:'alta', description:'Creación de dashboards más simple (HPM permite copiar gráficos — Superset es más complejo)' },
  { id:'CX-494', module:'Superset', type:'feature', priority:'alta', description:'Cada UF/regional requiere nueva fuente de datos — fullpath a veces no retorna resultados' },
  { id:'CX-495', module:'Superset', type:'feature', priority:'media', description:'Alarmes como señales puntuales en vez de barras (barras son invasivas en el gráfico)' },
  { id:'PM-161', module:'Superset', type:'feature', priority:'', description:'Mostrar gaps de datos en dashboards de la misma manera que KPI View (esencial para NOC)' },
  { id:'CX-536', module:'Superset', type:'feature', priority:'', description:'Organizar dashboards y charts de Superset en carpetas' },

  // ─── Superset — Mejoras ───────────────────────────────────────────────────
  { id:'CX-466', module:'Superset', type:'mejora', priority:'alta', description:'Lentitud en carga de dashboards POP_UF_3G' },
  { id:'CX-467', module:'Superset', type:'mejora', priority:'alta', description:'No es claro cuándo ocurrieron alarmes ni qué KPI los disparó — usar marcadores con colores' },
  { id:'CX-493', module:'Superset', type:'mejora', priority:'alta', description:'El link para incluir dashboard en Symphony no es visible para todos los usuarios' },

  // ─── Transversal ──────────────────────────────────────────────────────────
  { id:'CX-341', module:'Transversal', type:'mejora', priority:'alta', description:'Exportar a CSV/Excel: separador decimal debe ser coma (,) para Brasil, no punto (.)' },
  { id:'CX-355', module:'Transversal', type:'mejora', priority:'alta', description:'Todas las listas deben estar ordenadas alfabéticamente por defecto' },
  { id:'CX-382', module:'Transversal', type:'mejora', priority:'alta', description:'Equipo de desempeño necesita poder editar/eliminar/crear cualquier entidad de performance (contadores, KPIs, reportes, fórmulas, límites) sin depender del creador original' },

  // ─── Administración de Usuarios ───────────────────────────────────────────
  { id:'CX-349', module:'Administración de Usuarios', type:'mejora', priority:'alta', description:"Se necesita un rol de 'administrador de desempeño' que tenga privilegios sobre entidades de performance sin ser admin del sistema" },
  { id:'PM-013', module:'Administración de Usuarios', type:'mejora', priority:'media', description:'Insertar filtros de búsqueda en las pantallas de gestión administrativa' },

  // ─── Documentación ────────────────────────────────────────────────────────
  { id:'CX-537', module:'KPI View & Navigator', type:'documentacion', priority:'', description:'Manual de usuario para módulo KPI View & Navigator' },
  { id:'CX-538', module:'Administración de Usuarios', type:'documentacion', priority:'', description:'Manual de usuario para módulo Administración de Usuarios' },
  { id:'CX-539', module:'Catálogo & Métricas', type:'documentacion', priority:'', description:'Manual de usuario para módulo Catálogo & Métricas' },
  { id:'CX-540', module:'Relatório', type:'documentacion', priority:'', description:'Manual de usuario para módulo Relatório' },
  { id:'CX-541', module:'SNMP & Poller', type:'documentacion', priority:'', description:'Manual de usuario para módulo SNMP & Poller' },
  { id:'CX-542', module:'Inventário & NE Grouping', type:'documentacion', priority:'', description:'Manual de usuario para módulo Inventário & NE Grouping' },
  { id:'CX-543', module:'Superset', type:'documentacion', priority:'', description:'Manual de usuario para módulo Superset' },
  { id:'CX-544', module:'Alarmes', type:'documentacion', priority:'', description:'Manual de usuario para módulo Alarmes' },
  { id:'CX-545', module:'Transversal', type:'documentacion', priority:'', description:'Manual de usuario transversal (funcionalidades comunes entre módulos)' },

  // ─── Cancelados / Duplicados ──────────────────────────────────────────────
  { id:'CX-381', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-380] Mismo ítem sobre tamaño de página' },
  { id:'CX-425', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-355] Ordenación de columnas' },
  { id:'CX-429', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-355] Ordenación de columnas' },
  { id:'CX-487', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — rechazado]' },
  { id:'CX-523', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-355] Ordenación de columnas' },
  { id:'PM-004', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-355] Ordenación' },
  { id:'PM-006', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-355] Ordenación' },
  { id:'PM-014', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-355] Ordenación' },
  { id:'PM-021', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-370] Tamaño de página' },
  { id:'PM-027', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-341] Separador decimal' },
  { id:'PM-028', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-355] Ordenación' },
  { id:'PM-029', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-355] Ordenación' },
  { id:'PM-040', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-355] Ordenación' },
  { id:'PM-043', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-369] Seleccionar todos' },
  { id:'PM-054', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-369] Seleccionar todos' },
  { id:'PM-062', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-340] Unidades incorrectas' },
  { id:'PM-066', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-355] Ordenación' },
  { id:'PM-075', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-335] Panel redimensionable' },
  { id:'PM-082', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-374] Navegación en wizard' },
  { id:'PM-098', module:'Transversal', type:'cancelado', priority:'', description:'[Cancelado — duplicado de CX-355] Ordenación' },
];

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
  const db = drizzle(sql);

  console.log('Seeding CX principles...');
  for (let i = 0; i < PRINCIPLES.length; i++) {
    const p = PRINCIPLES[i];
    await db
      .insert(cxPrinciplesTable)
      .values({
        id: p.id,
        section: p.section,
        sectionTitle: p.sectionTitle,
        title: p.title,
        description: p.description,
        referenceIds: JSON.stringify(p.referenceIds),
        position: i,
      })
      .onConflictDoNothing();
  }
  console.log(`  ${PRINCIPLES.length} principios insertados.`);

  console.log('Seeding CX items...');
  for (let i = 0; i < ITEMS.length; i++) {
    const item = ITEMS[i];
    await db
      .insert(cxItemsTable)
      .values({
        id: item.id,
        module: item.module,
        type: item.type,
        priority: item.priority,
        description: item.description,
        status: 'sin-evaluar',
        position: i,
      })
      .onConflictDoNothing();
  }
  console.log(`  ${ITEMS.length} ítems insertados.`);

  await sql.end();
  console.log('Done!');
}

main().catch((err) => { console.error(err); process.exit(1); });
