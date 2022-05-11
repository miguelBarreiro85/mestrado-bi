import { Connection } from "tedious";
var TYPES = require('tedious').TYPES;

const csv = require('csv-parser');
const fs = require('fs');
var RandExp = require('randexp'); // must require on node

interface Cliente {
  nif: number,
  nome: string,
  genero: string,
  data_nasc: string,
  id_codigo_postal: string,
  primeiro_nome?: string,
  ultimo_nome?: string,
  contacto?: string,
  email?: string
}

const getClients = () => new Promise<Cliente[]>((resolve, reject) => {
  let clientes: Cliente[] = []
  fs.createReadStream('clientes.csv')
    .pipe(csv())
    .on('data', (row: Cliente) => {
      [row.primeiro_nome, row.ultimo_nome] = row.nome.split(' ')
      row.contacto = new RandExp('(91|93|92|96)[0-9]{7}').gen()
      row.email = row.nome.replace(' ', '').toLowerCase() + new RandExp(/(@gmail\.com|@msn\.com|@sapo\.pt|@yahoo\.com|@ipleiria\.pt)/).gen()
      clientes.push(row)
    })
    .on('end', () => {
      resolve(clientes)
    });
})




function insertClients(connection: Connection) {
  return new Promise(async (resolve, reject) => {
    const clientes = await getClients()
    const bulkLoad = connection.newBulkLoad('dbo.pessoa', function (error, rowCount) {
      console.log('inserted %d rows', rowCount);
      resolve(true)
    });

    // setup your columns - always indicate whether the column is nullable
    bulkLoad.addColumn('primeiro_nome', TYPES.NVarChar, { length: 50, nullable: false });
    bulkLoad.addColumn('ultimo_nome', TYPES.NVarChar, { length: 50, nullable: false });
    bulkLoad.addColumn('contacto', TYPES.NVarChar, { length: 50, nullable: false });
    bulkLoad.addColumn('nif', TYPES.NVarChar, { length: 50, nullable: false });
    bulkLoad.addColumn('genero', TYPES.Int, { nullable: false });
    bulkLoad.addColumn('email', TYPES.Int, { nullable: false });


    // execute
    const produtos = await getProducts(connection);
    connection.execBulkLoad(bulkLoad, produtos);
  })
}


