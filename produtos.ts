import { Connection } from "tedious";
import { Request } from "tedious";
import { TYPES } from "tedious";
import { config } from "./connection";
import { categorias, categoriaI } from "./categorias";
const RandExp = require("randexp");
import Ean from "ean-generator";

const connection = new Connection(config);

interface produtoI {
  id_categoria?: number;
  tipo?: string;
  marcas?: string[];
  familia?: string;
  marca?: string;
  designacao?: string;
  ean?: string;
  numero_serie?: string;
  taxa_iva?: number;
}

const marcasGrandesDomesticos = ["BOSCH", "SIEMENS", "BALAY", "BEKO", "TEKA", "MIELE"];

let produtosI: produtoI[] = [
  {
    tipo: "Televisor",
    marcas: ["LG", "SAMSUNG", "SONY", "SHARP"],
    familia: "televisores",
  },
  {
    tipo: "Amplificador audio",
    marcas: ["MARANTZ", "DENNON", "BOSE", "YAMAHA"],
    familia: "amplificadores_audio",
  },
  {
    tipo: "colunas audio",
    marcas: ["MARANTZ", "DENNON", "BOSE", "YAMAHA"],
    familia: "colunas_audio",
  },
  {
    tipo: "sound bar",
    marcas: ["LG", "SAMSUNG", "SONY", "SHARP"],
    familia: "sound_bars",
  },
  {
    tipo: "subwoofer",
    marcas: ["MARANTZ", "DENNON", "BOSE", "YAMAHA"],
    familia: "subwoofers",
  },
  {
    tipo: "maquina lavar roupa",
    marcas: marcasGrandesDomesticos,
    familia: "maquinas_lavar_roupa",
  },
  {
    tipo: "maquinas lavar louca",
    marcas: marcasGrandesDomesticos,
    familia: "maquinas_lavar_louca",
  },
  {
    tipo: "maquinas secar roupa",
    marcas: marcasGrandesDomesticos,
    familia: "maquinas_secar_roupa",
  },
  {
    tipo: "frigorifico",
    marcas: marcasGrandesDomesticos,
    familia: "frigorificos",
  },
  {
    tipo: "arca",
    marcas: marcasGrandesDomesticos,
    familia: "arcas",
  },
  {
    tipo: "fogão",
    marcas: marcasGrandesDomesticos,
    familia: "fogoes",
  },
  {
    tipo: "placa gas",
    marcas: marcasGrandesDomesticos,
    familia: "placas_gas",
  },
  {
    tipo: "placa eletrica",
    marcas: marcasGrandesDomesticos,
    familia: "placas_eletricas",
  },
  {
    tipo: "placa inducao",
    marcas: marcasGrandesDomesticos,
    familia: "placas_inducao",
  },
  {
    tipo: "exaustor",
    marcas: marcasGrandesDomesticos,
    familia: "exaustores",
  },
  {
    tipo: "microondas",
    marcas: marcasGrandesDomesticos,
    familia: "microondas",
  },
  {
    tipo: "forno",
    marcas: marcasGrandesDomesticos,
    familia: "fornos",
  },
];

function getCatID(cat: categoriaI): Promise<number> {
  return new Promise((resolve, reject) => {
    let catID: number = 0;
    const request = new Request(
      "select id from dbo.categoria where designacao like @designacao",
      (err) => {
        if (err) {
          reject(0);
        }
        resolve(catID);
      }
    );
    request.addParameter("designacao", TYPES.NVarChar, cat.designacao);
    request.on("row", (columns) => {
      columns.forEach((column) => {
        if (column.value === null) {
          console.log("NULL");
        } else {
          catID = column.value;
        }
      });
    });
    connection.execSql(request);
  });
}

async function getProducts() {
  const produtos = [];
  const catMap = [...categorias];
  for (let cat of catMap) {
    let catID = await getCatID(cat);
    console.log(catID);
    if (cat.pai === 0) {
      continue;
    }
    cat.catID = catID;
    console.log(cat);
  }
  // console.log(catMap)
  for (let i = 0; i <= 1000; i++) {
    let produto: produtoI = {};
    let i = Math.floor(Math.random() * 17);
    //@ts-ignore
    const marcaI = Math.floor(Math.random() * produtosI[i].marcas.length);
    produto.id_categoria = catMap.filter(
      (cat) => cat.designacao === produtosI[i].familia
    )[0].catID;
    //console.log("produto",produto.id_categoria)

    produto.designacao =
      produtosI[i].tipo +
      " " +
      //@ts-ignore
      produtosI[i].marcas[marcaI] +
      " " +
      new RandExp("[A-Z0-9]{3,6}").gen();
    //@ts-ignore
    produto.marca = produtosI[i].marcas[marcaI];
    produto.ean = new Ean(["030", "031", "039"]).createMultiple({ size: 1 })[0];
    produto.familia = produtosI[i].familia;
    produto.numero_serie = new Ean([
      "125",
      "569",
      "788",
      "659",
      "789",
      "963",
    ]).createMultiple({ size: 1 })[0];
    produto.taxa_iva = 23;
    produtos.push(produto);
  }
  return produtos;
}

function addProducts() {
  return new Promise(async (resolve, reject) => {
    const bulkLoad = connection.newBulkLoad(
      "dbo.produto",
      function (error: any, rowCount: any) {
        console.log("inserted %d rows", rowCount, error);
        resolve(true);
      }
    );

    // setup your columns - always indicate whether the column is nullable
    bulkLoad.addColumn("designacao", TYPES.NVarChar, {
      length: 50,
      nullable: false,
    });
    bulkLoad.addColumn("marca", TYPES.NVarChar, {
      length: 50,
      nullable: false,
    });
    bulkLoad.addColumn("ean", TYPES.NVarChar, { length: 50, nullable: false });
    bulkLoad.addColumn("numero_serie", TYPES.NVarChar, {
      length: 50,
      nullable: false,
    });
    bulkLoad.addColumn("id_categoria", TYPES.Int, { nullable: false });
    bulkLoad.addColumn("taxa_iva", TYPES.Float, { nullable: false });

    // execute
    const produtos = await getProducts();
    //@ts-ignore
    connection.execBulkLoad(bulkLoad, produtos);
  });
}
console.log(produtosI.length);



connection.on("connect", async function (err) {
  if (err) {
    console.log("ERROR", err);
    return;
  }
  console.log("Connected");
  const res = await addProducts();
  if (!res) {
    console.log("Erro ao adicionar produtos");
    connection.close();
  }
  connection.close();
});

connection.connect();
