/**
 * data.js — Vocabulario para Bingo de las Letras (1º grado)
 * Palabras ilustradas con emoji para alumnos de 6-7 años.
 * Cada letra tiene al menos 15 opciones para generar variedad entre tableros.
 */

const ALPHABET = [
  'A','B','C','D','E','F','G','H','I','J',
  'L','M','N','O','P','R','S','T','U','V','Z'
];

const WORDS = {
  A: [
    {e:'🍍',w:'Ananá'},  {e:'🌳',w:'Árbol'},      {e:'🐝',w:'Abeja'},
    {e:'🦅',w:'Águila'},   {e:'💧',w:'Agua'},         {e:'🪭',w:'Abanico'},
    {e:'⚓',w:'Ancla'},    {e:'🦓',w:'Asno'},         {e:'🧅',w:'Ajo'},
    {e:'🍇',w:'Arándano'}, {e:'🕷️',w:'Araña'},       {e:'🪗',w:'Acordeón'},
    {e:'🐊',w:'Animal'},   {e:'🚗',w:'Auto'},       {e:'🚑',w:'Ambulancia'},
  ],
  B: [
    {e:'🎈',w:'Balón'},    {e:'🏀',w:'Basket'},      {e:'🛥️',w:'Bote'},
    {e:'🐋',w:'Ballena'},  {e:'🍌',w:'Banana'},        {e:'🍬',w:'Bombón'},
    {e:'🥊',w:'Boxeo'},    {e:'🪣',w:'Balde'},         {e:'🍞',w:'Bizcocho'},
    {e:'😘',w:'Beso'},  {e:'🎸',w:'Bajo'},          {e:'👄',w:'Boca'},
    {e:'🦋',w:'Bicho'},    {e:'💃',w:'Bailarina'},     {e:'🌊',w:'Brisa'},
  ],
  C: [
    {e:'🐴',w:'Caballo'},  {e:'🚗',w:'Coche'},         {e:'🐊',w:'Cocodrilo'},
    {e:'🌸',w:'Clavel'},   {e:'🦀',w:'Cangrejo'},      {e:'🍫',w:'Chocolate'},
    {e:'🌽',w:'Choclo'},   {e:'🪑',w:'Cama'},          {e:'🧢',w:'Corbata'},
    {e:'🐙',w:'Calamar'},  {e:'🎵',w:'Canción'},       {e:'🌈',w:'Cielo'},
    {e:'🦁',w:'Cachorro'}, {e:'🚀',w:'Cohete'},         {e:'🌾',w:'Campo'},
  ],
  D: [
    {e:'🍬',w:'Dulce'},    {e:'🐬',w:'Delfín'},        {e:'🎲',w:'Dado'},
    {e:'💎',w:'Diamante'}, {e:'🦷',w:'Diente'},        {e:'🌊',w:'Duna'},
    {e:'👆',w:'Dedo'},     {e:'🪄',w:'Duende'},        {e:'🦕',w:'Dinosaurio'},
    {e:'🍩',w:'Dona'},    {e:'🌙',w:'Día'},           {e:'🏠',w:'Domicilio'},
     
  ],
  E: [
    {e:'⭐',w:'Estrella'}, {e:'🐘',w:'Elefante'},      {e:'🌿',w:'Espiga'},
    {e:'🦔',w:'Erizo'},    {e:'🪞',w:'Espejo'},        {e:'📚',w:'Escuela'},
    {e:'✏️',w:'Escritura'},{e:'🦅',w:'Espátula'},      {e:'🌊',w:'Espuma'},
    {e:'🌍',w:'Ecuador'},  {e:'🏢',w:'Edificio'},       {e:'🐍',w:'Escama'},
    {e:'🎡',w:'Estudio'},  {e:'🧆',w:'Ensalada'},      {e:'🌙',w:'Eclipse'},
  ],
  F: [
    {e:'🍓',w:'Frutilla'}, {e:'🔥',w:'Fuego'},         {e:'🌸',w:'Flor'},
    {e:'🎶',w:'Flauta'},   {e:'🦩',w:'Flamenco'},      {e:'⚽',w:'Fútbol'},
    {e:'📸',w:'Foto'},     {e:'🍑',w:'Frambuesa'},     {e:'🏰',w:'Fortaleza'},
    {e:'🧁',w:'Flan'},     {e:'🥗',w:'Fideos'},        {e:'🦊',w:'Felino'},
    {e:'💪',w:'Fuerte'},   {e:'😫',w:'Feo'},        {e:'👻',w:'Fantasma'},
  ],
  G: [
    {e:'🐱',w:'Gato'},     {e:'🌀',w:'Galaxia'},       {e:'🌻',w:'Girasol'},
    {e:'🐓',w:'Gallina'},  {e:'🏔️',w:'Glaciar'},      {e:'🎸',w:'Guitarra'},
    {e:'🎈',w:'Globo'},    {e:'🐛',w:'Gusano'},        {e:'🍇',w:'Guinda'},
    {e:'🎩',w:'Galera'},   {e:'🐾',w:'Garras'},        {e:'🧎‍➡️',w:'Gigante'},
    {e:'🍮',w:'Gelatina'},    {e:'🧤',w:'Guante'},       {e:'😂',w:'Gracioso'},
  ],
  H: [
    {e:'🌿',w:'Hoja'},     {e:'🧊',w:'Hielo'},         {e:'🏠',w:'Hogar'},
    {e:'🦔',w:'Hurón'},    {e:'🚪',w:'Heladera'},       {e:'🔨',w:'Herramienta'},
    {e:'🐴',w:'Herradura'},{e:'🧠',w:'Huevo'},         {e:'🌙',w:'Hilo'},
    {e:'🎩',w:'Hada'},     {e:'🪐',w:'Horizonte'},     {e:'🍧',w:'Helado'},
    {e:'👧',w:'Hija'},     {e:'🌊',w:'Huracán'},           {e:'🚁',w:'Helicóptero'},
  ],
  I: [
    {e:'🏖',w:'Imagen'},     {e:'🏝️',w:'Isla'},         {e:'🧍🏿‍♂️',w:'Indio'},
    {e:'🦎',w:'Iguana'},   {e:'🔥',w:'Incendio'},      {e:'🪲',w:'Insecto'},
    {e:'🏠',w:'Iglesia'},  {e:'🧲',w:'Imán'},          {e:'🌊',w:'Inundación'},
    {e:'🎵',w:'Instrumento'},{e:'👨‍✈️',w:'Inspector'},   {e:'🌙',w:'Invierno'},
    {e:'🌸',w:'Iris'},     {e:'🎈',w:'Inflable'},      {e:'🪐',w:'Interior'},
  ],
  J: [
    {e:'🦒',w:'Jirafa'},   {e:'🌺',w:'Jazmín'},        {e:'⚾',w:'Juego'},
    {e:'🐾',w:'Jaguar'},   {e:'🎡',w:'Jardín'},        {e:'🍬',w:'Jalea'},
    {e:'💎',w:'Joya'},     {e:'🔑',w:'Jaula'},         {e:'🥩',w:'Jamón'},
    {e:'💉',w:'Jeringa'},  {e:'🌙',w:'Junio'},         {e:'🏺',w:'Jarro'},
    {e:'🧔‍♀️',w:'Jacinta'},     {e:'🏝️',w:'Jungla'},         {e:'🧼',w:'Jabón'},
  ],
  L: [
    {e:'🦁',w:'León'},     {e:'🌙',w:'Luna'},          {e:'🦎',w:'Lagarto'},
    {e:'📚',w:'Libro'},    {e:'🌊',w:'Lago'},          {e:'🐺',w:'Lobo'},
    {e:'🍋',w:'Limón'},    {e:'💡',w:'Lámpara'},       {e:'🌸',w:'Lavanda'},
    {e:'🪕',w:'Lira'},     {e:'🦋',w:'Libélula'},      {e:'🌿',w:'Laurel'},
    {e:'🌷',w:'Lila'},     {e:'🪁',w:'Látigo'},        {e:'🗝',w:'Llavero'},
  ],
  M: [
    {e:'🍎',w:'Manzana'},  {e:'🦋',w:'Mariposa'},      {e:'🐒',w:'Mono'},
    {e:'🌊',w:'Mar'},      {e:'🎵',w:'Música'},        {e:'🌸',w:'Margarita'},
    {e:'🍑',w:'Melocotón'},{e:'🏔️',w:'Montaña'},      {e:'🎩',w:'Mago'},
    {e:'🌽',w:'Maíz'},     {e:'🔍',w:'Misterio'},      {e:'🐝',w:'Miel'},
    {e:'👮🏿‍♂️',w:'Marino'},     {e:'🐭',w:'Ratón'},         {e:'🦁',w:'Melena'},
  ],
  N: [
    {e:'🍊',w:'Naranja'},  {e:'❄️',w:'Nieve'},         {e:'☁️',w:'Nube'},
    {e:'👃🏿',w:'Nariz'},  {e:'📝',w:'Noticia'},       {e:'🎵',w:'Nota'},
    {e:'🌙',w:'Noche'},    {e:'🌥️',w:'Nublado'},        {e:'💻',w:'Notebook'},
    {e:'👰‍♀️',w:'Novia'},    {e:'🌸',w:'Narciso'},       {e:'🧩',w:'Nudos'},
    {e:'🛸',w:'Nave'},     {e:'🔔',w:'Nochebuena'},    {e:'🌊',w:'Niebla'},
  ],
  O: [
    {e:'🐑',w:'Oveja'},    {e:'🐻',w:'Oso'},           {e:'🌸',w:'Orquídea'},
    {e:'👁️',w:'Ojo'},     {e:'🌊',w:'Océano'},        {e:'🌿',w:'Orégano'},
    {e:'🎵',w:'Orquesta'}, {e:'👂',w:'Oreja'},        {e:'🐾',w:'Oca'},
    {e:'🌙',w:'Otoño'},    {e:'🏺',w:'Olla'},          {e:'🪲',w:'Oruga'},
    {e:'🌺',w:'Olivia'},   {e:'👧',w:'Omar'},         {e:'🦉',w:'Olmo'},
  ],
  P: [
    {e:'🐟',w:'Pez'},      {e:'🦜',w:'Pájaro'},        {e:'🍍',w:'Piña'},
    {e:'🌸',w:'Petunia'},  {e:'⚽',w:'Pelota'},        {e:'🍕',w:'Pizza'},
    {e:'🏠',w:'Puerta'},   {e:'🎠',w:'Paloma'},        {e:'🌿',w:'Perejil'},
    {e:'🎵',w:'Piano'},    {e:'🌊',w:'Playa'},         {e:'🍑',w:'Pera'},
    {e:'🐾',w:'Pulpo'},    {e:'🏀',w:'Pelota'},          {e:'🦆',w:'Pato'},
  ],
  R: [
    {e:'🐸',w:'Rana'},     {e:'🐭',w:'Ratón'},         {e:'🌹',w:'Rosa'},
    {e:'🎵',w:'Rima'},     {e:'🌊',w:'Río'},           {e:'🌙',w:'Roca'},
    {e:'🚲',w:'Rueda'},    {e:'🌿',w:'Romero'},        {e:'💐',w:'Ramo'},
    {e:'🍎',w:'Remolacha'},{e:'⭐',w:'Rayos'},         {e:'🪄',w:'Ritual'},
    {e:'😃',w:'Risa'},   {e:'🏔️',w:'Roca'},         {e:'🤴🏿',w:'Rey'},
  ],
  S: [
    {e:'🌞',w:'Sol'},      {e:'🐍',w:'Serpiente'},     {e:'🪐',w:'Saturno'},
    {e:'📢',w:'Sirena'},   {e:'🌭',w:'Salchicha'},          {e:'🏠',w:'Silla'},
    {e:'🎩',w:'Sombrero'}, {e:'🌿',w:'Salvia'},        {e:'🍓',w:'Sandía'},
    {e:'🧂',w:'Salero'},   {e:'🧂',w:'Sal'},         {e:'⛱️',w:'Sombrilla'},
    {e:'⭐',w:'Serafín'},  {e:'🐾',w:'Sabueso'},       {e:'🐸',w:'Sapo'},
  ],
  T: [
    {e:'🐢',w:'Tortuga'},  {e:'🌹',w:'Tulipán'},       {e:'🦁',w:'Tigre'},
    {e:'☕',w:'Taza'},  {e:'🍅',w:'Tomate'},        {e:'🎵',w:'Tambor'},
    {e:'🌊',w:'Tornado'},  {e:'⏰',w:'Tiempo'},        {e:'🚈',w:'Tren'},
    {e:'🐂',w:'Toro'},     {e:'☘️',w:'Trébol'},        {e:'💎',w:'Tesoro'},
    {e:'🎡',w:'Torre'},    {e:'🐾',w:'Tapir'},         {e:'⛵',w:'Tubo'},
  ],
  U: [
    {e:'🦄',w:'Unicornio'},{e:'🍇',w:'Uva'},           {e:'🦄🦄',w:'Unicornios'},
    {e:'🎵',w:'Ukelele'},  {e:'🥼',w:'Uniforme'},          {e:'🌙',w:'Universo'},
    {e:'👨🏿',w:'Ulises'},   {e:'📦',w:'Urna'},           {e:'👆🏿',w:'Uñas'},
    {e:'📝',w:'Útiles'},   {e:'📦📦',w:'Urnas'},         {e:'🤚🏿',w:'Uñas'},
    {e:'📌',w:'Ubicación'},{e:'🏃🏿‍♀️',w:'Ultimo'},     {e:'🦤',w:'Urraca'},
  ],
  V: [
    {e:'🐮',w:'Vaca'},     {e:'🌪️',w:'Viento'},       {e:'🌿',w:'Verbena'},
    {e:'🎵',w:'Violín'},   {e:'⭐',w:'Venus'},         {e:'🏞️',w:'Volcán'},
    {e:'🌸',w:'Violeta'},  {e:'🧊',w:'Ventisca'},      {e:'💜',w:'Violeta'},
    {e:'🏺',w:'Vasija'},   {e:'🦋',w:'Velo'},          {e:'🍇',w:'Vid'},
    {e:'🪄',w:'Varita'},   {e:'👩',w:'Valentina'},     {e:'💪',w:'Valiente'},
  ],
  Z: [
    {e:'🦓',w:'Zorrino'},    {e:'💎💎',w:'Zafiros'},        {e:'🥕',w:'Zanahoria'},
    {e:'🎃',w:'Zapallo'},  {e:'👟👟',w:'Zapatillas'},       {e:'💨',w:'Zonda'},
    {e:'🧍🏿‍♀️',w:'Zombie'},   {e:'🐾',w:'Zorro'},         {e:'🧍🏿‍♀️🧍🏿‍♀️',w:'Zombies'},
    {e:'🦊',w:'Zorrito'},  {e:'💎',w:'Zafiro'},        {e:'👞👞',w:'Zapatos'},
    {e:'👟',w:'Zapatilla'},{e:'🐦',w:'Zorzal'},        {e:'👞',w:'Zapato'},
  ],
};

const FREE_CELL = { e: '⭐', w: 'Libre', isFree: true };

const TOTAL_BOARDS  = 20;
const GRID_COLS     = 9;
const GRID_ROWS     = 3;
const TOTAL_CELLS   = GRID_COLS * GRID_ROWS; // 27
const WORD_CELLS    = 15;
