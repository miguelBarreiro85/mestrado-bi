import { exit } from "process";
import { Connection } from "tedious";
import { Request } from "tedious";
import { TYPES } from "tedious";
import { config } from "./connection";

const connection = new Connection(config)

function getPessoas() {
    return new Promise((resolve, reject) => {
        let pessoas: Object[] = []
        const request = new Request("select p.id from dbo.pessoa as p inner join dbo.codigo_postal as cp on p.id_codigo_postal = cp.id inner join dbo.concelho as con on con.id = cp.id_concelho inner join dbo.distrito d on d.id = con.id_distrito and d.designacao like 'Leiria' order by p.id offset 0 rows FETCH NEXT 20 ROWS ONLY", (err: any) => {
            if (err) {
                reject(false)
            }
            resolve(pessoas);
        });
        request.on('row', (columns) => {
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

function insertFuncionarios(funcionarios : any) {
    return new Promise((resolve, reject) => {
        console.log("Adicionar funcionarios!!")
        const bulkLoad = connection.newBulkLoad('dbo.funcionario', function (error , rowCount) {
            if (error) {
              console.log("ERRO",error)
              reject(false)
            }
            console.log('inserted %d rows', rowCount);
            resolve(true)
          });
          // setup your columns - always indicate whether the column is nullable
          bulkLoad.addColumn('id_pessoa', TYPES.Int, { length: 50, nullable: false });
          bulkLoad.addColumn('preco_hora', TYPES.Float, { nullable: false });
          bulkLoad.addColumn('ordenado_mensal', TYPES.Float, { nullable: false });
          // @ts-ignore
          connection.execBulkLoad(bulkLoad, funcionarios);
    })
}

connection.on('connect', async function (err) {
    if (err) {
        console.log("ERROR", err);
        return;
    }
    let funcionarios : any = await getPessoas()
    if(!funcionarios) {
        console.log("erro")
        connection.close()
        exit
    }
    funcionarios = funcionarios.map((pessoa : any) => {
        pessoa.preco_hora = Math.floor(Math.random() * (50 - 20) + 20)
        pessoa.ordenado_mensal = Math.floor(Math.random() * (3000 - 800) + 800)
        return pessoa
    })
    const res : any = await insertFuncionarios(funcionarios).catch(err => {
        console.log("Deu erro ao inserir os funcionarios")
    })
    if(res){
        console.log("Funcionarios inseridos")
    }
    connection.close();
});

connection.connect();

