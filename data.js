// ============================================================
// SUSHINICE – DATA LAYER
// ============================================================

const MENU_DATA = {
  sopas: [
    {
      id: 1, name: "Wakame", category: "Sopas / Ramen",
      desc: "Alga marina en caldo dashi con tofu y cebollín",
      price: 48,
      img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80"
    },
    {
      id: 2, name: "Tori Ramen", category: "Sopas / Ramen",
      desc: "Fideo udón en caldo de pollo con huevo, nori y bambú",
      price: 105,
      img: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80"
    },
    {
      id: 3, name: "Ebi Ramen", category: "Sopas / Ramen",
      desc: "Camarón jugoso en caldo tonkotsu con fideos y cebollín",
      price: 115,
      img: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80"
    },
    {
      id: 4, name: "Tempura Ramen", category: "Sopas / Ramen",
      desc: "Verduras y 4 camarones capeados sobre caldo base dorado",
      price: 120,
      img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80"
    },
    {
      id: 5, name: "Kaisen Ramen", category: "Sopas / Ramen",
      desc: "Combinación de mariscos premium: pulpo, calamar, camarón",
      price: 135,
      img: "https://images.unsplash.com/photo-1576577445504-6af96477db52?w=400&q=80"
    },
    {
      id: 6, name: "Gomoku Ramen", category: "Sopas / Ramen",
      desc: "Mariscos y carne de res en caldo intenso con verduras",
      price: 135,
      img: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80"
    }
  ],
  ensaladas: [
    {
      id: 7, name: "Kany Ensalada", category: "Ensaladas",
      desc: "Base lechuga italiana y romana, espinacas, zanahoria, pepino, betabel y surimi",
      price: 75,
      img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80"
    },
    {
      id: 8, name: "Tori Ensalada", category: "Ensaladas",
      desc: "Tiras de milanesa de pollo asada o empanizada sobre base verde",
      price: 90,
      img: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&q=80"
    },
    {
      id: 9, name: "Abocado", category: "Ensaladas",
      desc: "Ensalada fresca con aguacate cremoso, ajonjolí y aderezo japonés",
      price: 80,
      img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80"
    }
  ],
  kushiagues: [
    {
      id: 10, name: "Tori Kushiague", category: "Kushiagues",
      desc: "Brocheta de pollo empanizada, crujiente y jugosa",
      price: 18,
      img: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80"
    },
    {
      id: 11, name: "Sakana Kushiague", category: "Kushiagues",
      desc: "Brocheta de pescado empanizado con toque de limón",
      price: 18,
      img: "https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=400&q=80"
    },
    {
      id: 12, name: "Shake Salmón", category: "Kushiagues",
      desc: "Brocheta de salmón fresco, empanizado y sellado perfectamente",
      price: 25,
      img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80"
    },
    {
      id: 13, name: "Ebi Camarón", category: "Kushiagues",
      desc: "Brocheta de camarón premium empanizado, dorado y crujiente",
      price: 23,
      img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80"
    },
    {
      id: 14, name: "Queso Kushiague", category: "Kushiagues",
      desc: "Brocheta con queso gratinado, perfecta para los amantes del queso",
      price: 18,
      img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80"
    }
  ],
  rolls: [
    {
      id: 15, name: "Dragon Roll", category: "Rolls",
      desc: "Roll relleno de langostino y pepino, cubierto de aguacate y salsa unagi",
      price: 165,
      img: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80"
    },
    {
      id: 16, name: "Philadelphia Roll", category: "Rolls",
      desc: "Salmón fresco, queso Philadelphia y pepino. Clásico infalible",
      price: 120,
      img: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&q=80"
    },
    {
      id: 17, name: "Volcano Roll", category: "Rolls",
      desc: "Roll horneado con mezcla de mariscos gratinada, explosión de sabor",
      price: 155,
      img: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80"
    },
    {
      id: 18, name: "Rainbow Roll", category: "Rolls",
      desc: "California roll cubierto con variedad de pescados y aguacate multicolor",
      price: 175,
      img: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400&q=80"
    },
    {
      id: 19, name: "Spicy Tuna Roll", category: "Rolls",
      desc: "Atún fresco mezclado con salsa picante, pepino y aguacate",
      price: 145,
      img: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&q=80"
    },
    {
      id: 20, name: "Nice Special Roll", category: "Rolls",
      desc: "Nuestro roll signature: camarón tempura, salmón, aguacate y salsa especial SushiNice",
      price: 195,
      img: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80"
    }
  ],
  bebidas: [
    {
      id: 21, name: "Sake Frío", category: "Bebidas",
      desc: "Sake japonés premium servido frío en copa tradicional",
      price: 85,
      img: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80"
    },
    {
      id: 22, name: "Té Verde Matcha", category: "Bebidas",
      desc: "Té matcha ceremonial preparado al momento, caliente o frío",
      price: 45,
      img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80"
    },
    {
      id: 23, name: "Limonada Yuzu", category: "Bebidas",
      desc: "Limonada artesanal con yuzu japonés, fresca y aromática",
      price: 55,
      img: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80"
    },
    {
      id: 24, name: "Agua de Jamaica", category: "Bebidas",
      desc: "Jamaica natural preparada diariamente, sin azúcar añadida",
      price: 35,
      img: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=80"
    }
  ]
};

// AI Responses database
const AI_RESPONSES = {
  keywords: {
    picante: {
      reply: "Para los amantes del picante, te recomiendo el **Spicy Tuna Roll** ($145) — atún fresco con nuestra salsa picante exclusiva. También prueba el **Karubi Ramen** con toque picante. ¿Qué tan intenso te gusta el picor?",
      items: [19, 6]
    },
    salmon: {
      reply: "Excelente elección. El salmón es nuestra especialidad. Te recomiendo el **Philadelphia Roll** ($120) con queso cremoso, o el **Shake Kushiague** ($25). El **Nice Special Roll** ($195) también lleva salmón premium y es nuestro más pedido.",
      items: [16, 12, 20]
    },
    camaron: {
      reply: "Los camarones aquí son increíbles. Prueba el **Ebi Ramen** ($115) con camarones en caldo tonkotsu, o el **Ebi Kushiague** ($23). Para algo más especial, el **Nice Special Roll** lleva camarón tempura dorado.",
      items: [3, 13, 20]
    },
    vegetal: {
      reply: "Para los amantes de lo vegetariano, tenemos el **Wakame** ($48) con alga marina, el **Yasai Ramen** ($80) solo con verduras, y la **Ensalada Abocado** ($80) con aguacate fresco. ¿Te gustaría algo frío o caliente?",
      items: [1, 9]
    },
    recomendacion: {
      reply: "Nuestros 3 más pedidos esta semana: **Nice Special Roll** ($195) nuestro signature, **Dragon Roll** ($165) favorito de todos, y el **Kaisen Ramen** ($135) para días de frío. ¿Cuál te llama más la atención?",
      items: [20, 15, 5]
    },
    economico: {
      reply: "Nuestras mejores opciones accesibles: **Wakame** ($48), **Sakana Ramen** ($42), y los **Kushiagues** desde $18. Para rolls, el **Philadelphia** ($120) es el más accesible y delicioso.",
      items: [1, 10, 16]
    },
    default: {
      reply: "Bienvenido a SushiNice. Puedo ayudarte a encontrar el platillo ideal. Cuéntame si prefieres algo **picante**, **con salmón**, **camarón**, **vegetariano**, o si buscas algo **económico**. También puedo decirte qué está de moda esta semana.",
      items: []
    }
  }
};

// Sales prediction data
const SALES_DATA = {
  days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  actual: [8200, 7100, 9300, 8800, 12400, 15600, 14200],
  prediction: [8500, 7400, 9100, 9200, 13000, 16200, 14800],
  topItems: [
    { name: 'Nice Special Roll', pct: 94 },
    { name: 'Dragon Roll', pct: 87 },
    { name: 'Philadelphia Roll', pct: 82 },
    { name: 'Kaisen Ramen', pct: 76 },
    { name: 'Ebi Ramen', pct: 71 }
  ]
};

// Simulated active orders
const ACTIVE_ORDERS = [
  { id: '#001', items: 'Dragon Roll x2, Ebi Ramen x1', total: '$445', status: 'pending', time: '2 min' },
  { id: '#002', items: 'Nice Special Roll x1, Sake Frío x2', total: '$365', status: 'ready', time: '8 min' },
  { id: '#003', items: 'Philadelphia Roll x3, Matcha x2', total: '$450', status: 'pending', time: '5 min' },
  { id: '#004', items: 'Kaisen Ramen x2, Volcano Roll x1', total: '$425', status: 'ready', time: '12 min' }
];
