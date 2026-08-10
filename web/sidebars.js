// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: "doc",
      id: "cours/rencontre1", // Doit matcher le nom du document qui est dans docs/01-cours/. Les chiffres au début (ex : 01-) sont ignorés.
      customProps: { // Attention, il faut recompiler à chaque modification dans sidebar.js pour que les modifications s'appliquent.
        calendrier: {
          "Simon": [
            {"1010": "2026-01-26"},
            {"1020": "2026-01-26"},
            {"1030": "2026-01-27"},
            {"1040": "2026-01-27"}
          ]
        },
        tooltip: "visible" // Valeurs possibles visible ou cache, valeur par défaut "visible"
      }
    },
    {
      type: "doc",
      id: "cours/rencontre2",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-02-02"},
            {"1020": "2026-02-02"},
            {"1030": "2026-02-03"},
            {"1040": "2026-02-03"}
          ]
        }
      }
    },
    {
      type: "doc",
      id: "cours/rencontre3",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-02-09"},
            {"1020": "2026-02-09"},
            {"1030": "2026-02-10"},
            {"1040": "2026-02-10"}
          ]
        }
      }
    },
    {
      type: "doc",
      id: "cours/rencontre4",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-02-16"},
            {"1020": "2026-02-16"},
            {"1030": "2026-02-17"},
            {"1040": "2026-02-17"}
          ]
        }
      }
    },
    {
      type: "doc",
      id: "cours/rencontre5",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-02-23"},
            {"1020": "2026-02-23"},
            {"1030": "2026-02-24"},
            {"1040": "2026-02-24"}
          ]
        }
      }
    },
    {
      type: "doc",
      id: "cours/rencontre6",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-03-02"},
            {"1020": "2026-03-02"},
            {"1030": "2026-03-03"},
            {"1040": "2026-03-03"}
          ]
        }
      }
    },
    {
      type: "doc",
      id: "cours/rencontre7",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-03-09"},
            {"1020": "2026-03-09"},
            {"1030": "2026-03-10"},
            {"1040": "2026-03-10"}
          ]
        }
      },
      "className": "remise-tp1"
    },
    {
      type: "doc",
      id: "cours/rencontre8",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-03-23"},
            {"1020": "2026-03-23"},
            {"1030": "2026-03-24"},
            {"1040": "2026-03-24"}
          ]
        }
      },
      "className": "examen"
    },
    {
      type: "doc",
      id: "cours/rencontre9",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-03-30"},
            {"1020": "2026-03-30"},
            {"1030": "2026-04-07"},
            {"1040": "2026-04-07"}
          ]
        }
      }
    },
    {
      type: "doc",
      id: "cours/rencontre10",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-04-20"},
            {"1020": "2026-04-20"},
            {"1030": "2026-04-14"},
            {"1040": "2026-04-14"}
          ]
        }
      }
    },
    {
      type: "doc",
      id: "cours/rencontre11",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-04-27"},
            {"1020": "2026-04-27"},
            {"1030": "2026-04-21"},
            {"1040": "2026-04-21"}
          ]
        }
      }
    },
    {
      type: "doc",
      id: "cours/rencontre12",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-05-04"},
            {"1020": "2026-05-04"},
            {"1030": "2026-04-28"},
            {"1040": "2026-04-28"}
          ]
        }
      },
      "className": "remise-tp2-partielle"
    },
    {
      type: "doc",
      id: "cours/rencontre13",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-05-11"},
            {"1020": "2026-05-11"},
            {"1030": "2026-05-05"},
            {"1040": "2026-05-05"}
          ]
        }
      }
    },
    {
      type: "doc",
      id: "cours/rencontre14",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-05-18"},
            {"1020": "2026-05-18"},
            {"1030": "2026-05-12"},
            {"1040": "2026-05-12"}
          ]
        }
      }
    },
    {
      type: "doc",
      id: "cours/rencontre15",
      customProps: {
        calendrier: {
          "Simon": [
            {"1010": "2026-05-25"},
            {"1020": "2026-05-25"},
            {"1030": "2026-05-26"},
            {"1040": "2026-05-26"}
          ]
        }
      },
      "className": "remise-tp2-finale"
    }
  ],
  "tp": [
    {
      type: "autogenerated",
      "dirName": "02-tp"
    }
  ],
  "recettes": [
    {
      type: "autogenerated",
      "dirName": "03-recettes"
    }
  ],
  "aidememoire": [
    {
      type: "autogenerated",
      "dirName": "04-aidememoire"
    }
  ]
};

module.exports = sidebars;
