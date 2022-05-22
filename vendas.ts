import { Connection, Request } from "tedious";
import { config } from "./connection";
import { TYPES } from "tedious";
import { exit } from "process";
import { executeSQL } from "./Utils";
import { cursorTo } from "readline";
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

interface linhaVenda {
  id_venda: number;
  id_produto: number;
  quantidade: number;
  preco_unit: number;
  preco_unit_iva: number;
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

const insertSales = () =>
  new Promise<venda[]>(async (resolve, reject) => {
    const clientIds = await getIds.catch((e) => {
      console.log(e);
      exit();
    });
    let startDate = new Date(2000, 2, 2);
    let endDate = new Date(2022, 5, 10);
    const vendas: venda[] = [];
    for (let i = 0; i < 15000; i++) {
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

    const vendasSorted = vendas.sort((a,b) => {
      const ad = new Date(a.data)
      const ab = new Date(b.data)
      return ad.getTime() < ab.getTime() ? -1 : 1
    })
    // execute
    // @ts-ignore
    connection.execBulkLoad(bulkLoad, vendasSorted);
  });

const getProductsIds = (): Promise<number[]> =>
  new Promise((resolve, reject) => {
    const pIds: number[] = [];
    const request = new Request(
      "select id from dbo.produto",
      (err: any, rowCount: number) => {
        if (err) {
          reject(false);
        }
      }
    );
    request.on("row", (columns: any) => {
      columns.forEach((column: any) => {
        if (column.value === null) {
          console.log("NULL");
        } else {
          pIds.push(column.value);
        }
      });
    });
    request.on("requestCompleted", () => resolve(pIds));
    connection.execSql(request);
  });

const getLastCostPrice = (pID: number): Promise<number> =>
  new Promise((resolve, reject) => {
    let res: any = null;
    const request = new Request(
      "select TOP 1 preco_unit from dbo.linha_compra where id_produto = @pID order by id DESC",
      (err) => {
        if (err) {
          console.log(err)
          reject(err);
        }
      }
    );
    request.on("row", (columns: any) => {
      columns.forEach((column: any) => {
        if (column.value === null) {
          console.log("NULL");
        } else {
          res = column.value;
        }
      });
    });
    request.on("requestCompleted", () => resolve(res));
    request.addParameter("pID", TYPES.Int, pID);
    connection.execSql(request);
  });

const insertSalesRows = () =>
  new Promise(async (resolve: any, reject: any) => {
    const linhasVendas: linhaVenda[] = [];
    const pIds = await getProductsIds();
    for (let idV = 1; idV <= 15000; idV++) {
      const qP = Math.floor(Math.random() * 10) + 1;
      const linhasVenda: linhaVenda[] = [];
      for (let j = 1; j <= qP; j++) {
        const pId = Math.floor(Math.random() * (pIds.length - 1) + 1);
        const pLastCostPrice = await getLastCostPrice(pId);
        const lv: linhaVenda = {
          id_produto: pId,
          id_venda: idV,
          preco_unit: Math.floor(pLastCostPrice * 1.1),
          preco_unit_iva: Math.floor(pLastCostPrice * 1.1 * 1.23),
          quantidade: Math.floor(Math.random() * 9) + 1,
        };
        linhasVenda.push(lv);
      }
      await updateSale(linhasVenda, idV).catch(e => console.log(e));
      linhasVendas.push(...linhasVenda)
    }
    
    const bulkLoad = connection.newBulkLoad(
      "dbo.linha_venda",
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
    bulkLoad.addColumn("id_venda", TYPES.Int, { nullable: false });
    bulkLoad.addColumn("id_produto", TYPES.Int, { nullable: false });
    bulkLoad.addColumn("quantidade", TYPES.Float, { nullable: false });
    bulkLoad.addColumn("preco_unit", TYPES.Float, { nullable: false });
    bulkLoad.addColumn("preco_unit_iva", TYPES.Float, { nullable: false });
    // @ts-ignore
    connection.execBulkLoad(bulkLoad, linhasVendas);
  });

const updateSale = (linhasVenda: linhaVenda[], idV: number) =>
  new Promise((resolve, reject) => {
    const request = new Request(
      "update dbo.venda set total=@total, total_iva=@totalIva where id=@idV ",
      (err: any, rowCount: number) => {
        if (err) {
          console.log(err)
          reject(false);
        }
      }
    );
    const total = linhasVenda.reduce((prev, cur, i) => prev + cur.preco_unit * cur.quantidade,0);
    request.addParameter("total", TYPES.Float, total);
    request.addParameter("totalIVa", TYPES.Float, total * 1.23);
    request.addParameter("idV", TYPES.Int, idV);
    request.on("requestCompleted", () => resolve(true));
    connection.execSql(request);
  });

connection.on("connect", async function (err) {
  if (err) {
    console.log("ERROR", err);
    return;
  }
  // await insertSales().catch((e: any) => {
  //   console.log(e);
  // });
  await insertSalesRows().catch((e: any) => {
    console.log(e);
  });
  connection.close();
});

connection.connect();
