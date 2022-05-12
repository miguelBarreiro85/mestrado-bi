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
const tedious_1 = require("tedious");
const tedious_2 = require("tedious");
const connection_1 = require("./connection");
const csv = require('csv-parser');
const fs = require('fs');
const RandExp = require('randexp'); // must require on node
const connection = new tedious_1.Connection(connection_1.config);
const getClients = () => new Promise((resolve, reject) => {
    let pessoas = [];
    fs.createReadStream('pessoas.csv')
        .pipe(csv(['nif', 'nome', 'genero', 'data_nasc', 'id_codigo_postal']))
        .on('data', (row) => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-ignore
        [row.primeiro_nome, row.ultimo_nome] = row.nome.split(' ');
        row.contacto = new RandExp('(91|93|92|96)[0-9]{7}').gen();
        // @ts-ignore
        row.email = row.nome.replace(' ', '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + new RandExp(/(@gmail\.com|@msn\.com|@sapo\.pt|@yahoo\.com|@ipleiria\.pt)/).gen();
        // @ts-ignore
        row.id_codigo_postal = parseInt(row.id_codigo_postal);
        delete row.nome;
        pessoas.push(row);
    }))
        .on('end', () => {
        resolve(pessoas);
    });
});
function insertClients() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const pessoas = yield getClients();
            const bulkLoad = connection.newBulkLoad('dbo.pessoa', function (error, rowCount) {
                if (error) {
                    console.log(error);
                }
                console.log('inserted %d rows', rowCount);
                resolve(true);
            });
            // setup your columns - always indicate whether the column is nullable
            bulkLoad.addColumn('primeiro_nome', tedious_2.TYPES.VarChar, { length: 50, nullable: false });
            bulkLoad.addColumn('ultimo_nome', tedious_2.TYPES.VarChar, { length: 50, nullable: false });
            bulkLoad.addColumn('contacto', tedious_2.TYPES.VarChar, { length: 13, nullable: false });
            bulkLoad.addColumn('nif', tedious_2.TYPES.VarChar, { length: 9, nullable: true });
            bulkLoad.addColumn('genero', tedious_2.TYPES.VarChar, { length: 10, nullable: true });
            bulkLoad.addColumn('email', tedious_2.TYPES.VarChar, { length: 50, nullable: true });
            bulkLoad.addColumn('data_nasc', tedious_2.TYPES.VarChar, { length: 50, nullable: true });
            bulkLoad.addColumn('id_codigo_postal', tedious_2.TYPES.Int, { nullable: false });
            // execute
            // @ts-ignore
            connection.execBulkLoad(bulkLoad, pessoas);
        }));
    });
}
connection.connect();
connection.on('connect', function (err) {
    return __awaiter(this, void 0, void 0, function* () {
        if (err) {
            console.log("ERROR", err);
            return;
        }
        const res = yield insertClients();
        if (!res) {
            console.log("Erro ao inserir pessoas");
        }
        connection.close();
    });
});
