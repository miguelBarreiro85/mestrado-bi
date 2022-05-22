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
   id_linha_venda?:  number
   horas_trabalho?: number
   avaria?:string
   data?:string
   descricao_rep?:string
   total?:number
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
    //procurar funcionario
    //procurar pessoa
    //procurar produto
    //procurar linha de venda
    //gerar texto aleatorio para descricao e avaria
    //calcular total com base no preco_hora e horas de trabalho
    let startDate = new Date(2000, 1, 1);
    let endDate = new Date(2022, 5, 10);
    const cIds = await getClientsFromLeiria()
    for(let i=0; i< 1000; i++) {
        const idCliente = cIds[Math.round(Math.random() * cIds.length)]
        const tV = Math.round(Math.random())
        let prodId = 0
        let saleId : number | null = 0
        if (tV) {
            //Temos de saber qual a linha de venda e qual o produto
            //vendas do cliente, buscar o id
            try {
                ({prodId, saleId} = await getProdIdSaleId(idCliente))
            } catch (err) {
                saleId = null
                prodId = Math.random
            }
           
        }
        if(prodId)
        const dataA: Date = DateGenerator.getRandomDateInRange(
            startDate,
            endDate
          );
          const horasT = Math.round(Math.random() * 3) + 1
        const assistencia : assistenciaI = {
            id_funcionario: Math.round(Math.random() * 39) + 1,
            id_pessoa: idCliente,
            id_produto: Math.round(Math.random() * 1000) + 1,
            avaria: loremIpsum(),
            descricao_rep: loremIpsum(),
            data: dataA.toLocaleDateString(),
            horas_trabalho: horasT,
            id_linha_venda:

        }

    }
})

const getProdIdSaleId = (cId) : Promise<{prodId:number, saleId:number}> => new Promise((resolve,reject) => {
    resolve({prodId: 0, saleId: 0})
})