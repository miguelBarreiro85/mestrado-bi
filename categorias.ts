import { Request } from "tedious";
import { TYPES } from "tedious";
import { Connection } from "tedious";
import { config } from "./connection";

const connection = new Connection(config);
export interface categoriaI {
    designacao: string;
    pai: 0 | string;
    catID?: number;
    pID?:number;
}
export const categorias : categoriaI[] = [
    { designacao: "linha_castanha", pai: 0 },
    { designacao: "linha_branca", pai: 0 },
    { designacao: "encastre", pai: 0 },
    { designacao: "televisores", pai: "linha_castanha" },
    { designacao: "amplificadores_audio", pai: "linha_castanha" },
    { designacao: "colunas_audio", pai: "linha_castanha" },
    { designacao: "sound_bars", pai: "linha_castanha" },
    { designacao: "subwoofers", pai: "linha_castanha" },
    { designacao: "maquinas_lavar_roupa", pai: "linha_branca" },
    { designacao: "maquinas_lavar_louca", pai: "linha_branca" },
    { designacao: "maquinas_secar_roupa", pai: "linha_branca" },
    { designacao: "frigorificos", pai: "linha_branca" },
    { designacao: "arcas", pai: "linha_branca" },
    { designacao: "fogoes", pai: "linha_branca" },
    { designacao: "placas_gas", pai: "encastre" },
    { designacao: "placas_eletricas", pai: "encastre" },
    { designacao: "placas_inducao", pai: "encastre" },
    { designacao: "exaustores", pai: "encastre" },
    { designacao: "microondas", pai: "encastre" },
    { designacao: "fornos", pai: "encastre" },
]

export const insertCategories = () => new Promise(async (resolve, reject) => {

    let i = 0;
    for (let cat of categorias) {
        if (cat.pai !== 0) {
            let pID = await getPartentCatId(cat.pai)
            cat.pID = pID
        } else {
            cat.pID = 0
        }
        await insertCategory(cat)
    }
    resolve(true)

    

    function insertCategory(cat: categoriaI) {
        return new Promise((resolve, reject) => {
            const request = new Request("INSERT dbo.categoria (designacao,id_categoria_pai) OUTPUT INSERTED.id VALUES (@designacao,@id_pai);", function (err) {
                if (err) {
                    console.log(err);
                    reject(false);
                }
                resolve(true)
            });
            request.addParameter('designacao', TYPES.NVarChar, cat.designacao);
            request.addParameter('id_pai', TYPES.Int, cat.pID === 0 ? null : cat.pID);
            request.on('row', function (columns) {
                columns.forEach(function (column) {
                    if (column.value === null) {
                        console.log('NULL');
                    } else {
                        console.log("Category id of inserted item is " + column.value);
                    }
                });
            });
            connection.execSql(request);
        })
    }

    function getPartentCatId(pCat :string) : Promise<number> {
        return new Promise((resolve, reject) => {
            let pCatId = 0;
            const request = new Request('select id from dbo.categoria where designacao like @designacao', (err, rowCount) => {
                if (err) {
                    reject(0)
                }
                resolve(pCatId);
            });
            request.addParameter('designacao', TYPES.NVarChar, pCat);
            request.on('row', (columns) => {
                columns.forEach((column) => {
                    if (column.value === null) {
                        console.log('NULL');
                    } else {
                        pCatId = column.value;
                    }
                });
            });
            connection.execSql(request);
        });
    }

})


