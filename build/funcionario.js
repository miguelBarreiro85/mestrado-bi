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
const process_1 = require("process");
const tedious_1 = require("tedious");
const tedious_2 = require("tedious");
const connection_1 = require("./connection");
const connection = new tedious_1.Connection(connection_1.config);
function getPessoas() {
    return new Promise((resolve, reject) => {
        console.log("GET PESSOAS");
        let pessoas = [];
        const request = new tedious_2.Request("select p.id from dbo.pessoa as p inner join dbo.codigo_postal as cp on p.id_codigo_postal = cp.id inner join dbo.concelho as con on con.id = cp.id_concelho inner join dbo.distrito d on d.id = con.id_distrito and d.designacao like 'Leiria' order by p.id offset 0 rows FETCH NEXT 20 ROWS ONLY", (err) => {
            if (err) {
                reject(false);
            }
            resolve(pessoas);
        });
        request.on('row', (columns) => {
            console.log(columns);
            let pessoa = {};
            columns.forEach((column) => {
                if (column.value === null) {
                    console.log('NULL');
                }
                else {
                    pessoas.push({ id_pessoa: column.value });
                }
            });
        });
        connection.execSql(request);
    });
}
connection.on('connect', function (err) {
    return __awaiter(this, void 0, void 0, function* () {
        if (err) {
            console.log("ERROR", err);
            return;
        }
        let pessoas = yield getPessoas();
        if (!pessoas) {
            console.log("erro");
            connection.close();
            process_1.exit;
        }
        pessoas = pessoas.map((pessoa) => {
            pessoa.preco_hora = Math.floor(Math.random() * (50 - 20) + 20);
            pessoa.ordenado_mensal = Math.floor(Math.random() * (3000 - 800) + 800);
            return pessoa;
        });
        console.log(pessoas);
        connection.close();
    });
});
connection.connect();
