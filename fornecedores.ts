import { Connection } from "tedious";
import { TYPES } from "tedious";
import { config } from "./connection";
import { Request } from "tedious";
const connection = new Connection(config);

interface fornecedor {
  id_codigo_postal: number;
  desconto: number;
  nif: string;
  morada: string;
  email: string;
  contacto: string;
  designacao: string;
}

const fornecedores: fornecedor[] = [
  {
    id_codigo_postal: 110663,
    desconto: 3,
    nif: "509502652",
    morada: "Rua rei da memoria 14",
    email: "mlpbarreiro@gmail.com",
    contacto: "26292512",
    designacao: "MLPBARREIRO",
  },
  {
    id_codigo_postal: 76565,
    desconto: 2,
    nif: "501290273",
    morada:
      "Parque Industrial da Figueira da Foz Rua das Olaias, 85 L Apartado 165",
    email: "geral@sorefoz.pt",
    contacto: "233401900",
    designacao: "SOREFOZ",
  },
  {
    id_codigo_postal: 72768,
    desconto: 3,
    nif: "503843415",
    morada: "Zona Industrial de Condeixa-A-Nova 3150-194 COIMBRA",
    email: "macorlux@gmail.com",
    contacto: "254569523",
    designacao: "MACORLUX",
  },
  {
    id_codigo_postal: 71496,
    desconto: 3,
    nif: "501469044",
    morada: "Rua rei da memoria 14",
    email: "orima@gmail.com",
    contacto: "231467420",
    designacao: "ORIMA",
  },
  {
    id_codigo_postal: 215014,
    desconto: 3,
    nif: "500758662",
    morada: "Av. Fontes Pereira de Melo 292, Porto",
    email: "orima@gmail.com",
    contacto: "226167300",
    designacao: "AUFERMA",
  },
];

function inserirFornecedores() {
  return new Promise((resolve, reject) => {
    const bulkLoad = connection.newBulkLoad(
      "dbo.fornecedor",
      function (error, rowCount) {
        if (error) {
          console.log(error);
          reject(error);
        }
        console.log("inserted %d rows", rowCount);
        resolve(true);
      }
    );

    bulkLoad.addColumn("id_codigo_postal", TYPES.Int, { nullable: false });
    bulkLoad.addColumn("desconto", TYPES.Int, { nullable: false });
    bulkLoad.addColumn("nif", TYPES.VarChar, { length: 13, nullable: false });
    bulkLoad.addColumn("morada", TYPES.VarChar, {
      length: 100,
      nullable: false,
    });
    bulkLoad.addColumn("email", TYPES.VarChar, { length: 50, nullable: false });
    bulkLoad.addColumn("contacto", TYPES.VarChar, {
      length: 13,
      nullable: false,
    });
    bulkLoad.addColumn("designacao", TYPES.VarChar, {
      length: 50,
      nullable: false,
    });

    // execute
    // @ts-ignore
    connection.execBulkLoad(bulkLoad, fornecedores);
  });
}

connection.connect(async (err) => {
  if (err) {
    console.log("ERROR", err);
    return;
  }
  const res = await inserirFornecedores();
  if (!res) {
    console.log("Erro ao inserir pessoas");
  }
  connection.close();
});
