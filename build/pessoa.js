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
const tedious_3 = require("tedious");
const DateGenerator = require("random-date-generator");
const csv = require("csv-parser");
const fs = require("fs");
const RandExp = require("randexp"); // must require on node
const connection = new tedious_1.Connection(connection_1.config);
const getClients = () => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    let startDate = new Date(1940, 2, 2);
    let endDate = new Date(2008, 3, 3);
    let pessoas = [];
    const nomesH = yield getNomes("./nomes/nomesmasculino.csv");
    const nomesM = yield getNomes("./nomes/nomesfeminino.csv");
    const apelidos = yield getNomes("./nomes/apelidos.csv");
    console.log("CSVs DONE");
    const codigosPostais = yield getCPs();
    console.log("Codigos postais done");
    for (let i = 0; i < 5000; i++) {
        const iH = Math.floor(Math.random() * (nomesH.length - 1));
        const iM = Math.floor(Math.random() * (nomesM.length - 1));
        const iAH = Math.floor(Math.random() * (apelidos.length - 1));
        const iAM = Math.floor(Math.random() * (apelidos.length - 1));
        const iCPH = Math.floor(Math.random() * (codigosPostais.length - 1));
        const iCPM = Math.floor(Math.random() * (codigosPostais.length - 1));
        const H = {
            primeiro_nome: nomesH[iH],
            ultimo_nome: apelidos[iAH],
            data_nasc: DateGenerator.getRandomDateInRange(startDate, endDate),
            id_codigo_postal: codigosPostais[iCPH],
            email: nomesH[iH]
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") +
                apelidos[iH]
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "") +
                new RandExp(/(@gmail\.com|@msn\.com|@sapo\.pt|@yahoo\.com|@ipleiria\.pt)/).gen(),
            genero: "Masculino",
            contacto: new RandExp("(91|93|92|96)[0-9]{7}").gen(),
            nif: new RandExp("(5)[0-9]{8}").gen(),
        };
        const M = {
            primeiro_nome: nomesM[iM],
            ultimo_nome: apelidos[iAM],
            data_nasc: DateGenerator.getRandomDateInRange(startDate, endDate),
            id_codigo_postal: codigosPostais[iCPM],
            email: nomesM[iM]
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") +
                apelidos[iAM]
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "") +
                new RandExp(/(@gmail\.com|@msn\.com|@sapo\.pt|@yahoo\.com|@ipleiria\.pt)/).gen(),
            genero: "Feminino",
            contacto: new RandExp("(91|93|92|96)[0-9]{7}").gen(),
            nif: new RandExp("(5)[0-9]{8}").gen(),
        };
        pessoas.push(H, M);
    }
    resolve(pessoas);
}));
function getCPs() {
    return new Promise((resolve, reject) => {
        let ids = [];
        const request = new tedious_3.Request("select cp.id from dbo.codigo_postal as cp", (err) => {
            if (err) {
                reject(false);
            }
            resolve(ids);
        });
        request.on("row", (columns) => {
            columns.forEach((column) => {
                if (column.value === null) {
                    console.log("NULL");
                }
                else {
                    ids.push(column.value);
                }
            });
        });
        connection.execSql(request);
    });
}
function getNomes(caminho) {
    return new Promise((resolve, reject) => {
        let nomes = [];
        fs.createReadStream(caminho)
            .pipe(csv(["nome"]))
            .on("data", (nome) => __awaiter(this, void 0, void 0, function* () {
            nomes.push(nome);
        }))
            .on("end", () => {
            resolve(nomes);
        });
    });
}
function insertClients() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const pessoas = yield getClients();
            console.log("JA TENHO PESSOAS", pessoas);
            const bulkLoad = connection.newBulkLoad("dbo.pessoa", function (error, rowCount) {
                if (error) {
                    console.log(error);
                }
                console.log("inserted %d rows", rowCount);
                resolve(true);
            });
            // setup your columns - always indicate whether the column is nullable
            bulkLoad.addColumn("primeiro_nome", tedious_2.TYPES.VarChar, {
                length: 50,
                nullable: false,
            });
            bulkLoad.addColumn("ultimo_nome", tedious_2.TYPES.VarChar, {
                length: 50,
                nullable: false,
            });
            bulkLoad.addColumn("contacto", tedious_2.TYPES.VarChar, {
                length: 13,
                nullable: false,
            });
            bulkLoad.addColumn("nif", tedious_2.TYPES.VarChar, { length: 9, nullable: true });
            bulkLoad.addColumn("genero", tedious_2.TYPES.VarChar, { length: 10, nullable: true });
            bulkLoad.addColumn("email", tedious_2.TYPES.VarChar, { length: 50, nullable: true });
            bulkLoad.addColumn("data_nasc", tedious_2.TYPES.VarChar, {
                length: 50,
                nullable: true,
            });
            bulkLoad.addColumn("id_codigo_postal", tedious_2.TYPES.Int, { nullable: false });
            // execute
            // @ts-ignore
            connection.execBulkLoad(bulkLoad, pessoas);
        }));
    });
}
connection.on("connect", function (err) {
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
connection.connect();
