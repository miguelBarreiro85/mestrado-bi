import { Connection } from "tedious";
import { TYPES } from "tedious";
import { config } from "./connection";
import { Request } from "tedious";

const DateGenerator = require("random-date-generator");
const csv = require("csv-parser");
const fs = require("fs");
const RandExp = require("randexp"); // must require on node

const connection = new Connection(config);

export interface pessoa {
  nif: number;
  nome?: string;
  genero: string;
  data_nasc: string;
  id_codigo_postal: number;
  primeiro_nome?: string;
  ultimo_nome?: string;
  contacto?: string;
  email?: string;
}

const getClients = (location : string = '') =>
  new Promise<pessoa[]>(async (resolve, reject) => {
    let startDate = new Date(1940, 2, 2);
    let endDate = new Date(2008, 3, 3);
    let pessoas: pessoa[] = [];
    const nomesH = await getNomes("./nomes/nomesmasculino.csv");
    const nomesM = await getNomes("./nomes/nomesfeminino.csv");
    const apelidos = await getNomes("./nomes/apelidos.csv");
    const codigosPostais = await getCPs(location);
    console.log("Codigos postais done");
    for (let i = 0; i < 5000; i++) {
      const iH = Math.floor(Math.random() * (nomesH.length - 1));
      const iM = Math.floor(Math.random() * (nomesM.length - 1));
      const iAH = Math.floor(Math.random() * (apelidos.length - 1));
      const iAM = Math.floor(Math.random() * (apelidos.length - 1));
      const iCPH = Math.floor(Math.random() * (codigosPostais.length - 1));
      const iCPM = Math.floor(Math.random() * (codigosPostais.length - 1));
      const H: pessoa = {
        primeiro_nome: nomesH[iH],
        ultimo_nome: apelidos[iAH],
        data_nasc: DateGenerator.getRandomDateInRange(startDate, endDate).toLocaleDateString(),
        id_codigo_postal: codigosPostais[iCPH],
        email:
          nomesH[iH]
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") +
          apelidos[iAH]
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") +
          new RandExp(
            /(@gmail\.com|@msn\.com|@sapo\.pt|@yahoo\.com|@ipleiria\.pt)/
          ).gen(),
        genero: "Masculino",
        contacto: new RandExp("(91|93|92|96)[0-9]{7}").gen(),
        nif: new RandExp("(5)[0-9]{8}").gen(),
      };
      const M: pessoa = {
        primeiro_nome: nomesM[iM],
        ultimo_nome: apelidos[iAM],
        data_nasc: DateGenerator.getRandomDateInRange(startDate, endDate).toLocaleDateString(),
        id_codigo_postal: codigosPostais[iCPM],
        email:
          nomesM[iM]
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") +
          apelidos[iAM]
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") +
          new RandExp(
            /(@gmail\.com|@msn\.com|@sapo\.pt|@yahoo\.com|@ipleiria\.pt)/
          ).gen(),
        genero: "Feminino",
        contacto: new RandExp("(91|93|92|96)[0-9]{7}").gen(),
        nif: new RandExp("(5)[0-9]{8}").gen(),
      };
      pessoas.push(H, M);
    }
    resolve(pessoas);
  });

function getCPs(location: string = ''): Promise<number[]> {
  return new Promise((resolve, reject) => {
    let ids: number[] = [];
    const query = location === '' ? "select cp.id from dbo.codigo_postal as cp" : 
      "select cp.id from dbo.codigo_postal as cp inner join dbo.concelho as con on con.id = cp.id_concelho inner join dbo.distrito d on d.id = con.id_distrito and d.designacao like @distrito"
    const request = new Request(
      query,
      (err: any) => {
        if (err) {
          reject(false);
        }
        resolve(ids);
      }
    );
    if (location !== '') {
      request.addParameter('distrito', TYPES.NVarChar, location);
    }
    request.on("row", (columns) => {
      columns.forEach((column) => {
        if (column.value === null) {
          console.log("NULL");
        } else {
          ids.push(column.value);
        }
      });
    });
    connection.execSql(request);
  });
}

function getNomes(caminho: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    let nomes: string[] = [];
    fs.createReadStream(caminho)
      .pipe(csv(["nome"]))
      .on("data", async (nome: any) => {
        nomes.push(nome.nome);
      })
      .on("end", () => {
        resolve(nomes);
      });
  });
}

async function insertClients() {
  return new Promise(async (resolve, reject) => {
    const pessoas = await getClients();
    const pessoasL = await getClients('Leiria')
    
    console.log(pessoas.length,pessoasL.length)
    console.log("JA TENHO PESSOAS");
    const bulkLoad = connection.newBulkLoad(
      "dbo.pessoa",
      function (error, rowCount) {
        if (error) {
          console.log(error);
        }
        console.log("inserted %d rows", rowCount);
        resolve(true);
      }
    );

    // setup your columns - always indicate whether the column is nullable
    bulkLoad.addColumn("primeiro_nome", TYPES.VarChar, {
      length: 50,
      nullable: false,
    });
    bulkLoad.addColumn("ultimo_nome", TYPES.VarChar, {
      length: 50,
      nullable: false,
    });
    bulkLoad.addColumn("contacto", TYPES.VarChar, {
      length: 13,
      nullable: false,
    });
    bulkLoad.addColumn("nif", TYPES.VarChar, { length: 9, nullable: true });
    bulkLoad.addColumn("genero", TYPES.VarChar, { length: 10, nullable: true });
    bulkLoad.addColumn("email", TYPES.VarChar, { length: 50, nullable: true });
    bulkLoad.addColumn("data_nasc", TYPES.VarChar, {
      length: 50,
      nullable: true,
    });
    bulkLoad.addColumn("id_codigo_postal", TYPES.Int, { nullable: false });

    // execute
    // @ts-ignore
    connection.execBulkLoad(bulkLoad, [...pessoas,...pessoasL]);
  });
}

connection.on("connect", async function (err) {
  if (err) {
    console.log("ERROR", err);
    return;
  }
  const res = await insertClients();
  if (!res) {
    console.log("Erro ao inserir pessoas");
  }
  connection.close();
});

connection.connect();
