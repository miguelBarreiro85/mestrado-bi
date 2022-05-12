import { exit } from "process";
import { Connection } from "tedious";
import { Request } from "tedious";
import { TYPES } from "tedious";
import { config } from "./connection";

const connection = new Connection(config)

function getPessoas() {
    return new Promise((resolve, reject) => {
        console.log("GET PESSOAS")
        let pessoas: Object[] = []
        const request = new Request("select p.id from dbo.pessoa as p inner join dbo.codigo_postal as cp on p.id_codigo_postal = cp.id inner join dbo.concelho as con on con.id = cp.id_concelho inner join dbo.distrito d on d.id = con.id_distrito and d.designacao like 'Leiria' order by p.id offset 0 rows FETCH NEXT 20 ROWS ONLY", (err: any) => {
            if (err) {
                reject(false)
            }
            resolve(pessoas);
        });
        request.on('row', (columns) => {
            console.log(columns)
            let pessoa : any = {}
            columns.forEach((column) => {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    pessoas.push({id_pessoa: column.value})
                }
            });

        });
        connection.execSql(request);
    });
}

connection.on('connect', async function (err) {
    if (err) {
        console.log("ERROR", err);
        return;
    }
    let pessoas : any = await getPessoas()
    if(!pessoas) {
        console.log("erro")
        connection.close()
        exit
    }
    pessoas = pessoas.map((pessoa : any) => {
        pessoa.preco_hora = Math.floor(Math.random() * (50 - 20) + 20)
        pessoa.ordenado_mensal = Math.floor(Math.random() * (3000 - 800) + 800)
        return pessoa
    })
    console.log(pessoas)
    connection.close();
});

connection.connect();

