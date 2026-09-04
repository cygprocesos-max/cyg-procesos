/* =============================================================
   manifest.js — Datos de marca de Costantini & Gallotti
   -------------------------------------------------------------
   Este es el ÚNICO archivo que hay que editar para completar los
   datos pendientes. Buscá los campos vacíos ("") marcados abajo
   con PENDIENTE y completalos. El sitio se adapta solo.
   ============================================================= */
(function () {
  "use strict";

  window.__BRAND__ = {
    name: "Costantini & Gallotti",
    shortName: "C&G",
    tagline: "Consultoría de procesos para PyMEs",

    /* ---------------------------------------------------------
       Datos de contacto. Los que quedan en "" se muestran en el
       sitio como [PENDIENTE: ...] en vez de inventarse.
       --------------------------------------------------------- */
    contact: {
      email: "cygprocesos@gmail.com",
      whatsapp: "5491140294276",          // formato internacional, solo dígitos
      whatsappLabel: "+54 9 11 4029-4276",
      city: "Buenos Aires, Argentina"
    },

    social: {
      linkedinTomas: "",      // PENDIENTE: LinkedIn de Tomás
      linkedinFrancisco: "",  // PENDIENTE: LinkedIn de Francisco
      extra: ""               // PENDIENTE: Instagram u otra web de referencia
    },

    founders: [
      {
        id: "tomas",
        name: "Tomás Costantini Orrego",
        role: "Implementación técnica",
        detail: "Automatizaciones, integraciones y desarrollo.",
        initials: "TC"
      },
      {
        id: "francisco",
        name: "Francisco Joaquín Gallotti",
        role: "Análisis de negocio",
        detail: "Relevamiento, procesos y estrategia.",
        initials: "FG"
      }
    ]
  };
})();
