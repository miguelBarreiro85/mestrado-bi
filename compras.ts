import { Connection } from "tedious";
import { config } from "./connection";
import { TYPES } from "tedious";
import { Request } from "tedious";
const DateGenerator = require("random-date-generator");

const connection = new Connection(config);

interface compra {
  id_fornecedor: number;
  data: string;
  total?: number;
  total_iva?: number;
  data_vencimento?: string;
}

interface linhaCompra {
  id_compra: number;
  id_produto: number;
  quantidade: number;
  preco_unit: number;
  preco_unit_iva: number;
}

function insertCompras() {
  return new Promise<compra[]>(async (resolve, reject) => {
    const fIds = [1, 2, 3, 4, 5];
    let startDate = new Date(2000, 2, 2);
    let endDate = new Date(2022, 5, 10);
    const compras: compra[] = [];
    for (let i = 0; i < 150000; i++) {
      const dataCompra: Date = DateGenerator.getRandomDateInRange(
        startDate,
        endDate
      );
      const compra: compra = {
        id_fornecedor: Math.floor(Math.random() * 4),
        data: dataCompra.toLocaleDateString(),
        data_vencimento: new Date(
          dataCompra.setMonth(dataCompra.getMonth() + 2)
        ).toLocaleDateString(),
      };
      compras.push(compra);
    }

    const bulkLoad = connection.newBulkLoad(
      "dbo.compra",
      function (error, rowCount) {
        if (error) {
          console.log(error);
          reject(false);
        }
        console.log("inserted %d rows", rowCount);
        resolve(compras);
      }
    );

    // setup your columns - always indicate whether the column is nullable
    bulkLoad.addColumn("id_fornecedor", TYPES.Int, { nullable: false });
    bulkLoad.addColumn("data", TYPES.VarChar, { length: 50, nullable: false });
    bulkLoad.addColumn("data_vencimento", TYPES.VarChar, {
      length: 50,
      nullable: false,
    });

    // execute
    // @ts-ignore
    connection.execBulkLoad(bulkLoad, compras);
  });
}

function getLastPrice(pID: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const request = new Request(
      "select preco_unit from dbo.linha_compra where id_produto like @id",
      (err, rowCount, rows) => {
        if (err) {
          reject(0);
        }
        if (rowCount === 0 || rowCount === undefined) {
          resolve(Math.floor(Math.random() * (800 - 200) + 200));
        } else {
          //console.log("ROWS", rows, rowCount);
          resolve(rows[0].value);
        }
      }
    );
    request.addParameter("id", TYPES.Int, pID);

    request.on("row", (columns) => {
      columns.forEach((column) => {
        if (column.value === null) {
          console.log("NULL");
        } else {
          console.log("VALUE:", column.value);
        }
      });
    });
    connection.execSql(request);
  });
}

function insertRows(): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    const cIds = [...Array(150000).keys()];
    const linhasCompra: linhaCompra[] = [];

    cIds.forEach(async (v) => {
      const pID = Math.floor(Math.random() * 1000);
      const preco_unit: number = await getLastPrice(pID);
      const lc: linhaCompra = {
        id_compra: v,
        id_produto: pID,
        preco_unit: preco_unit,
        quantidade: Math.floor(Math.random() * (10 - 1) + 1),
        preco_unit_iva: preco_unit * 1.23,
      };
      linhasCompra.push(lc);
    });
    

    const bulkLoad = connection.newBulkLoad(
      "dbo.linha_compra",
      function (error, rowCount) {
        if (error) {
          console.log(error);
          reject(false);
        }
        console.log("inserted %d rows", rowCount);
        resolve(true);
      }
    );

    // setup your columns - always indicate whether the column is nullable
    bulkLoad.addColumn("id_compra", TYPES.Int, { nullable: false });
    bulkLoad.addColumn("id_produto", TYPES.Int, { nullable: false });
    bulkLoad.addColumn("quantidade", TYPES.Float, { nullable: false });
    bulkLoad.addColumn("preco_unit", TYPES.Float, { nullable: false });
    bulkLoad.addColumn("preco_unit_iva", TYPES.Float, { nullable: false });

    // execute
    // @ts-ignore
    connection.execBulkLoad(bulkLoad, compras);
  });
}

connection.connect(async (err) => {
  if (err) {
    console.log("ERROR", err);
    return;
  }
  //await insertCompras().catch((e) => console.log("Erro ao inserir compras"));
  await insertRows();

  connection.close();
});
