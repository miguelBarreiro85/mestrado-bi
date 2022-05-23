import { Connection } from "tedious";
import { config } from "./connection";
import { TYPES } from "tedious";
import { Request } from "tedious";
import { loremIpsum, LoremIpsum } from "lorem-ipsum";

const DateGenerator = require("random-date-generator");

const connection = new Connection(config);

interface assistenciaI {
   id_produto:number
   id_funcionario: number
   id_pessoa: number
   id_linha_venda?:  number | null
   horas_trabalho: number
   avaria:string
   data:string
   descricao_rep:string
   total:number
}

interface funcI {
  id:number
  precoH:number
}

const getClientsFromLeiria = () : Promise<number[]> => new Promise((resolve,reject) => {
    const ids : number[] = []
    const request = new Request(
        "select p.id from pessoa p inner join codigo_postal on p.id_codigo_postal = codigo_postal.id and codigo_postal.CP4 = 2410",
        (err, rowCount) => {
          if (err) {
            reject(false);
          }    
            resolve(ids);
          }
      );
  
      request.on("row", (columns) => {
        columns.forEach((column) => {
          if (column.value === null || column.value === undefined) {
            console.log("NULL or und");
          } else {
            ids.push(column.value);
          }
        });
      });
      connection.execSql(request);
})
const insertAssistencias = () => new Promise( async (resolve,reject) => {
    let startDate = new Date(2000, 1, 1);
    let endDate = new Date(2022, 5, 10);
    const cIds = await getClientsFromLeiria()
    const funcs = await getFuncionarios()
    const assistencias : assistenciaI[] = []
    for(let i=0; i< 500; i++) {
        const horasT = Math.round(Math.random() * 3) + 1
        const funcId = Math.round(Math.random() * 39) + 1
        const func  =  funcs.filter(func => func.id === funcId)[0]  
        
        const idCliente = cIds[Math.round(Math.random() * (cIds.length - 1)) + 1]
        const hasSale = Math.round(Math.random())
        let prodId = Math.round(Math.random() * 1000) + 1
        let saleId : number | null = null
        if (hasSale) {
            //Temos de saber qual a linha de venda e qual o produto
            //vendas do cliente, buscar o id
            try {
              ({prodId, saleId}= await getProdIdSaleId(idCliente))
            } catch (err) {
            }
           
        }
        const dataA : Date = DateGenerator.getRandomDateInRange(
            startDate,
            endDate
          );
        
        const assistencia : assistenciaI = {
            id_funcionario: funcId,
            id_pessoa: idCliente,
            id_produto: prodId,
            avaria: loremIpsum(),
            descricao_rep: loremIpsum(),
            data: dataA.toLocaleDateString(),
            horas_trabalho: horasT,
            id_linha_venda: saleId,
            total: horasT * func.precoH
        }
        assistencias.push(assistencia)
    }
    
    const bulkLoad = connection.newBulkLoad(
      //@ts-ignore
      "dbo.assistencia",{keepNulls: true},
      //@ts-ignore
      function (error, rowCount) {
        if (error) {
          reject(false);
        }
        console.log("inserted %d rows", rowCount);
        resolve(true);
      }
    );

    // setup your columns - always indicate whether the column is nullable
    bulkLoad.addColumn("id_produto", TYPES.Int, { nullable: false });
    bulkLoad.addColumn("id_funcionario", TYPES.Int, { nullable: false });
    bulkLoad.addColumn("id_pessoa", TYPES.Int, { nullable: false });
    bulkLoad.addColumn("id_linha_venda", TYPES.Int, { nullable: true });
    bulkLoad.addColumn("horas_trabalho", TYPES.Float, { nullable: false });
    bulkLoad.addColumn("avaria", TYPES.VarChar, {length:400, nullable: false });
    bulkLoad.addColumn("data", TYPES.VarChar, {length:50, nullable: false });
    bulkLoad.addColumn("descricao_rep", TYPES.VarChar, {length:400, nullable: false });
    bulkLoad.addColumn("total", TYPES.Float, { nullable: false });
    
    
    const assistenciasSorted = assistencias.sort((a,b) => {
      const aD = new Date(a.data).getTime()
      const bD = new Date(b.data).getTime()
      return aD < bD ? -1 : 1

    })

    // @ts-ignore
    connection.execBulkLoad(bulkLoad, assistenciasSorted);
})


const getFuncionarios = () : Promise<funcI[]> => new Promise((resolve,reject) => {
  const funcs : funcI[] = []
  const request = new Request(
    "select id, preco_hora from dbo.funcionario",
    (err: any, rowCount: number) => {
      if (err) {
        reject(false);
      }
    }
  );
  request.on("row", (columns: any) => {
    funcs.push({id: columns[0].value, precoH: columns[1].value});
  });
  request.on("requestCompleted", () => resolve(funcs));
  connection.execSql(request);
});

const getProdIdSaleId = (cId : number) : Promise<{prodId:number, saleId:number}> => new Promise((resolve,reject) => {
  const res : any = {}
  const request = new Request(
    "select TOP 1 id_venda, id_produto from dbo.linha_venda lv inner join dbo.venda v on v.id = lv.id_venda and v.id_pessoa = @cId ",
    (err: any, rowCount: number) => {
      if (err) {
        reject(false);
      }
      if(rowCount === 0) {
        reject(false)
      }
    }
  );
  request.on("row", (columns: any) => {
    res.saleId = columns[0].value
    res.prodId = columns[1].value
  });
  request.addParameter('cId',TYPES.Int,cId)
  request.on("requestCompleted", () => resolve(res));
  connection.execSql(request);
})

connection.on("connect", async function (err) {
  if (err) {
    console.log("ERROR", err);
    return;
  }
  // await insertSales().catch((e: any) => {
  //   console.log(e);
  // });
  await insertAssistencias().catch((e: any) => {
    console.log(e);
  });
  connection.close();
});

connection.connect();