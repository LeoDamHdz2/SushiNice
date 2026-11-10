// NiceBot uses current menu item IDs; names and prices always come from MySQL.
const AI_RESPONSES = {
  keywords: {
    picante: {
      intro: "Si te gusta el picante, prueba",
      items: [19]
    },
    salmon: {
      intro: "Si prefieres salmón, te recomiendo",
      items: [16, 12, 20]
    },
    camaron: {
      intro: "Si buscas camarón, puedes elegir",
      items: [3, 13, 20]
    },
    vegetal: {
      intro: "Si buscas algo con verduras o algas, puedes probar",
      items: [1, 9]
    },
    recomendacion: {
      intro: "Algunas opciones del menú que puedes probar son",
      items: [20, 15, 5]
    },
    economico: {
      intro: "Estas son las opciones de menor precio",
      items: []
    },
    default: {
      intro: "Cuéntame si prefieres algo picante, con salmón, camarón, vegetariano o económico.",
      items: []
    }
  }
};
