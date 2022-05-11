var RandExp = require('randexp'); // must require on node
const Ean = require('ean-generator');
const categorias = require('./categorias')
var TYPES = require('tedious').TYPES;
var Request = require('tedious').Request;


let produtosI = [
    { tipo: "Televisor", marcas: ["LG", "SAMSUNG", "SONY", "SHARP"], familia: "televisores" },
    { tipo: "Amplificador audio", marcas: ["MARANTZ", "DENNON", "BOSE", "YAMAHA"], familia: "amplificadores_audio" },
    { tipo: "colunas audio", marcas: ["MARANTZ", "DENNON", "BOSE", "YAMAHA"], familia: "colunas_audio" },
    { tipo: "sound bar", marcas: ["LG", "SAMSUNG", "SONY", "SHARP"], familia: "sound_bars" },
    { tipo: "subwoofer", marcas: ["MARANTZ", "DENNON", "BOSE", "YAMAHA"], familia: "subwoofers" },
    { tipo: "maquina lavar roupa", marcas: ["BOSCH", "SIEMENS", "BALAY", "BEKO", "TEKA", "MIELE"], familia: "maquinas_lavar_roupa" },
    { tipo: "maquinas lavar louca", marcas: ["BOSCH", "SIEMENS", "BALAY", "BEKO", "TEKA", "MIELE"], familia: "maquinas_lavar_louca" },
    { tipo: "maquinas secar roupa", marcas: ["BOSCH", "SIEMENS", "BALAY", "BEKO", "TEKA", "MIELE"], familia: "maquinas_secar_roupa" },
    { tipo: "frigorifico", marcas: ["BOSCH", "SIEMENS", "BALAY", "BEKO", "TEKA", "MIELE"], familia: "frigorificos" },
    { tipo: "arca", marcas: ["BOSCH", "SIEMENS", "BALAY", "BEKO", "TEKA", "MIELE"], familia: "arcas" },
    { tipo: "fogão", marcas: ["BOSCH", "SIEMENS", "BALAY", "BEKO", "TEKA", "MIELE"], familia: "fogoes" },
    { tipo: "placa gas", marcas: ["BOSCH", "SIEMENS", "BALAY", "BEKO", "TEKA", "MIELE"], familia: "placas_gas" },
    { tipo: "placa eletrica", marcas: ["BOSCH", "SIEMENS", "BALAY", "BEKO", "TEKA", "MIELE"], familia: "placas_eletricas" },
    { tipo: "placa inducao", marcas: ["BOSCH", "SIEMENS", "BALAY", "BEKO", "TEKA", "MIELE"], familia: "placas_inducao" },
    { tipo: "exaustor", marcas: ["BOSCH", "SIEMENS", "BALAY", "BEKO", "TEKA", "MIELE"], familia: "exaustores" },
    { tipo: "microondas", marcas: ["BOSCH", "SIEMENS", "BALAY", "BEKO", "TEKA", "MIELE"], familia: "microondas" },
    { tipo: "forno", marcas: ["BOSCH", "SIEMENS", "BALAY", "BEKO", "TEKA", "MIELE"], familia: "fornos" }
];

function getCatID(connection,cat) {
    return new Promise((resolve, reject) => {
        let catID = false;
        const request = new Request('select id from dbo.categoria where designacao like @designacao', (err, rowCount) => {
            if (err) {
                reject(false)
            }
            resolve(catID)
        });
        request.addParameter('designacao', TYPES.NVarChar, cat.designacao);
        request.on('row', (columns) => {
            columns.forEach((column) => {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    catID = column.value;
                }
            });
        });
        connection.execSql(request);
    })

}

async function getProducts(connection) {
    const produtos = [];
    const catMap = [...categorias.categories]
    for (let cat of catMap) {
        let catID = await getCatID(connection,cat);
        console.log(catID)
        if (cat.pai === 0) {
            continue
        }
        cat.catID = catID
        console.log(cat)
    }
    // console.log(catMap)
    for (let i = 0; i <= 1000; i++) {
        let produto = {};
        let i = Math.floor(Math.random() * (17))
        const marcaI = Math.floor(Math.random() * produtosI[i].marcas.length)
        produto.id_categoria = catMap.filter(cat => cat.designacao === produtosI[i].familia)[0].catID
        //console.log("produto",produto.id_categoria)
        produto.designacao = produtosI[i].tipo + ' ' + produtosI[i].marcas[marcaI] + ' ' + new RandExp('[A-Z0-9]{3,6}').gen()
        produto.marca = produtosI[i].marcas[marcaI];
        produto.ean = new Ean(['030', '031', '039']).createMultiple({ size: 1 })[0]
        produto.familia = produtosI[i].familia
        produto.numero_serie = new Ean(['125', '569', '788', '659', '789', '963']).createMultiple({ size: 1 })[0]
        produtos.push(produto)
    }
    return produtos
}



function addProducts(connection) {
    return new Promise( async (resolve, reject) => {
        const bulkLoad = connection.newBulkLoad('dbo.produto', {}, function (error, rowCount) {
            console.log('inserted %d rows', rowCount, error);
            resolve(true)
        });

        // setup your columns - always indicate whether the column is nullable
        bulkLoad.addColumn('designacao', TYPES.NVarChar, { length: 50, nullable: false });
        bulkLoad.addColumn('marca', TYPES.NVarChar, { length: 50, nullable: false });
        bulkLoad.addColumn('ean', TYPES.NVarChar, { length: 50, nullable: false });
        bulkLoad.addColumn('numero_serie', TYPES.NVarChar, { length: 50, nullable: false });
        bulkLoad.addColumn('id_categoria', TYPES.Int, { nullable: false });


        // execute
        const produtos = await getProducts(connection);
        connection.execBulkLoad(bulkLoad, produtos);
    })
}
console.log(produtosI.length)

exports.addProducts = addProducts