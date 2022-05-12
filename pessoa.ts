import { Connection } from "tedious";
import { TYPES } from "tedious";
import { config } from "./connection";

const csv = require('csv-parser');
const fs = require('fs');
const RandExp = require('randexp'); // must require on node

const connection = new Connection(config)

export interface pessoa {
  nif: number,
  nome?: string,
  genero: string,
  data_nasc: string,
  id_codigo_postal: number,
  primeiro_nome?: string,
  ultimo_nome?: string,
  contacto?: string,
  email?: string
}

const getClients = () => new Promise<pessoa[]>((resolve, reject) => {
  let pessoas: pessoa[] = []
  fs.createReadStream('pessoas.csv')
    .pipe(csv(['nif','nome','genero','data_nasc','id_codigo_postal']))
    .on('data', async (row: pessoa) => {
      // @ts-ignore
      [row.primeiro_nome, row.ultimo_nome] = row.nome.split(' ')
      row.contacto = new RandExp('(91|93|92|96)[0-9]{7}').gen()
      // @ts-ignore
      row.email = row.nome.replace(' ', '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + new RandExp(/(@gmail\.com|@msn\.com|@sapo\.pt|@yahoo\.com|@ipleiria\.pt)/).gen()
      // @ts-ignore
      row.id_codigo_postal = parseInt(row.id_codigo_postal)
      delete row.nome
      pessoas.push(row)
    })
    .on('end', () => {
      resolve(pessoas)
    });
})

async function insertClients() {
  return new Promise(async (resolve, reject) => {
    const pessoas = await getClients()
    const bulkLoad = connection.newBulkLoad('dbo.pessoa', function (error , rowCount) {
      if (error) {
        console.log(error)
      }
      console.log('inserted %d rows', rowCount);
      resolve(true)
    });

    // setup your columns - always indicate whether the column is nullable
    bulkLoad.addColumn('primeiro_nome', TYPES.VarChar, { length: 50, nullable: false });
    bulkLoad.addColumn('ultimo_nome', TYPES.VarChar, { length: 50, nullable: false });
    bulkLoad.addColumn('contacto', TYPES.VarChar, { length: 13, nullable: false });
    bulkLoad.addColumn('nif', TYPES.VarChar, { length: 9, nullable: true });
    bulkLoad.addColumn('genero', TYPES.VarChar, { length: 10, nullable: true });
    bulkLoad.addColumn('email', TYPES.VarChar, { length: 50, nullable: true });
    bulkLoad.addColumn('data_nasc', TYPES.VarChar, { length: 50, nullable: true });
    bulkLoad.addColumn('id_codigo_postal', TYPES.Int, { nullable: false });


    // execute
    // @ts-ignore
    connection.execBulkLoad(bulkLoad, pessoas);
  })
}

connection.connect();   

connection.on('connect', async function (err) {
  if(err) {
      console.log("ERROR",err);
      return;
  }
  const res = await insertClients()
  if(!res){
    console.log("Erro ao inserir pessoas")
  }
  connection.close();
});

