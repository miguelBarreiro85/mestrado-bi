import { Connection } from "tedious";
import { config } from "./connection";
import { TYPES } from "tedious";
import { exit } from "process";
import { executeSQL } from "./Utils";
const DateGenerator = require("random-date-generator");

const connection = new Connection(config);

//1 - busca clientes
//2 - buscar funcionarios para vendas
//3 - Gerar Data
//2 - Inserir vendas
//3 - busca produtos
//4 - cria linhas de venda (quantidade e preco unit)
//5 - Atualizar total da venda

interface venda {
  id_pessoa: number;
  data: string;
  total?: number;
  total_iva?: number;
}

const getIds = new Promise<number[]>((resolve, reject) => {
  let ids: number[] = [];
  executeSQL("select id from dbo.pessoa", (err, res) => {
    if (err) {
      console.log(err);
    } else {
      resolve(res);
    }
  });
});

const insertSales = new Promise<venda[]>(async (resolve, reject) => {
  const clientIds = await getIds.catch((e) => {
    console.log(e);
    exit();
  });
  let startDate = new Date(2000, 2, 2);
  let endDate = new Date(2022, 5, 10);
  const vendas: venda[] = [];
  for (let i = 0; i < 150000; i++) {
    const venda: venda = {
      id_pessoa: Math.floor(Math.random() * (clientIds.length - 1)),
      data: DateGenerator.getRandomDateInRange(
        startDate,
        endDate
      ).toLocaleDateString(),
    };
    vendas.push(venda);
  }

  const bulkLoad = connection.newBulkLoad(
    "dbo.venda",
    function (error, rowCount) {
      if (error) {
        console.log(error);
        reject(false);
      }
      console.log("inserted %d rows", rowCount);
      resolve(vendas);
    }
  );

  // setup your columns - always indicate whether the column is nullable
  bulkLoad.addColumn("id_pessoa", TYPES.Int, { nullable: false });
  bulkLoad.addColumn("data", TYPES.VarChar, { length: 50, nullable: false });

  // execute
  // @ts-ignore
  connection.execBulkLoad(bulkLoad, vendas);
});

const insertSalesRows = new Promise((resolve : any, reject: any) => {
  for (let i = 1; i < 150000; i++ ) {
    //quantos produtos por venda
    //buscar o id do produto
    //gerar um preço de venda + 20% que o preço de compra
    
  }
})

connection.on("connect", async function (err) {
  if (err) {
    console.log("ERROR", err);
    return;
  }
  await insertSales.catch((e) => {
    console.log(e);
  });
  await insertSalesRows
  connection.close();
});

connection.connect();
