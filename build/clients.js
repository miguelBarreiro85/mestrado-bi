"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var TYPES = require('tedious').TYPES;
const csv = require('csv-parser');
const fs = require('fs');
var RandExp = require('randexp'); // must require on node
const getClients = () => new Promise((resolve, reject) => {
    let clientes = [];
    fs.createReadStream('clientes.csv')
        .pipe(csv())
        .on('data', (row) => {
        [row.primeiro_nome, row.ultimo_nome] = row.nome.split(' ');
        row.contacto = new RandExp('(91|93|92|96)[0-9]{7}').gen();
        row.email = row.nome.replace(' ', '').toLowerCase() + new RandExp(/(@gmail\.com|@msn\.com|@sapo\.pt|@yahoo\.com|@ipleiria\.pt)/).gen();
        clientes.push(row);
    })
        .on('end', () => {
        resolve(clientes);
    });
});
function insertClients(connection) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const clientes = yield getClients();
        const bulkLoad = connection.newBulkLoad('dbo.pessoa', function (error, rowCount) {
            console.log('inserted %d rows', rowCount);
            resolve(true);
        });
        // setup your columns - always indicate whether the column is nullable
        bulkLoad.addColumn('primeiro_nome', TYPES.NVarChar, { length: 50, nullable: false });
        bulkLoad.addColumn('marca', TYPES.NVarChar, { length: 50, nullable: false });
        bulkLoad.addColumn('ean', TYPES.NVarChar, { length: 50, nullable: false });
        bulkLoad.addColumn('numero_serie', TYPES.NVarChar, { length: 50, nullable: false });
        bulkLoad.addColumn('id_categoria', TYPES.Int, { nullable: false });
        // execute
        const produtos = yield getProducts(connection);
        connection.execBulkLoad(bulkLoad, produtos);
    }));
}
