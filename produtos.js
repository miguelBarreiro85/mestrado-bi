var RandExp = require('randexp'); // must require on node
const Ean = require('ean-generator');

let produtosI = [
    {tipo :"Televisor", marcas: ["LG","SAMSUNG","SONY","SHARP"], familia: "televisores" },
    {tipo :"Amplificador audio", marcas: ["MARANTZ","DENNON","BOSE","YAMAHA"],familia: "amplificadores_audio" },
    {tipo :"colunas audio", marcas: ["MARANTZ","DENNON","BOSE","YAMAHA"],familia: "colunas_audio"},
    {tipo :"sound bar", marcas: ["LG","SAMSUNG","SONY","SHARP"],familia: "sound_bars" },
    {tipo :"subwoofer", marcas: ["MARANTZ","DENNON","BOSE","YAMAHA"],familia: "subwoofers"},
    {tipo :"maquina lavar roupa", marcas: ["BOSCH","SIEMENS","BALAY","BEKO","TEKA","MIELE"],familia: "maquinas_lavar_roupa"},
    {tipo :"maquinas lavar louca", marcas: ["BOSCH","SIEMENS","BALAY","BEKO","TEKA","MIELE"],familia: "maquinas_lavar_louca" },
    {tipo :"maquinas secar roupa", marcas: ["BOSCH","SIEMENS","BALAY","BEKO","TEKA","MIELE"],familia: "maquinas_secar_roupa" },
    {tipo :"frigorifico", marcas: ["BOSCH","SIEMENS","BALAY","BEKO","TEKA","MIELE"],familia: "frigorificos"},
    {tipo :"arca", marcas: ["BOSCH","SIEMENS","BALAY","BEKO","TEKA","MIELE"] ,familia: "arcas"},
    {tipo :"fogão", marcas: ["BOSCH","SIEMENS","BALAY","BEKO","TEKA","MIELE"],familia: "fogoes"},
    {tipo :"placa gas", marcas: ["BOSCH","SIEMENS","BALAY","BEKO","TEKA","MIELE"],familia: "placas_gas" },
    {tipo :"placa eletrica", marcas: ["BOSCH","SIEMENS","BALAY","BEKO","TEKA","MIELE"] ,familia: "placas_eletricas"},
    {tipo :"placa inducao", marcas: ["BOSCH","SIEMENS","BALAY","BEKO","TEKA","MIELE"],familia: "placas_inducao"},
    {tipo :"exaustor", marcas: ["BOSCH","SIEMENS","BALAY","BEKO","TEKA","MIELE"],familia: "exaustores"},
    {tipo :"microondas", marcas: ["BOSCH","SIEMENS","BALAY","BEKO","TEKA","MIELE"],familia: "microondas"},
    {tipo :"forno", marcas: ["BOSCH","SIEMENS","BALAY","BEKO","TEKA","MIELE"],familia: "fornos"}
];

const produtos = [];
for(let i=0; i<=1000; i++) {
    let produto = {};
    let i = Math.floor(Math.random() * (17))
    const marcaI = Math.floor(Math.random() * produtosI[i].marcas.length)
    const modelo = 
    produto.designacao = produtosI[i].tipo + ' ' + produtosI[i].marcas[marcaI] + ' ' + new RandExp('[A-Z0-9]{3,6}').gen()
    produto.marca = produtosI[i].marcas[marcaI];
    produto.ean = new Ean(['030', '031', '039']).createMultiple({size: 1})[0]
    produto.familia = produtosI[i].familia
    produto.ns = new Ean(['125', '569', '788','659','789','963']).createMultiple({size: 1})[0]
    produtos.push(produto)   
}


function addProducts(connection){
    return new Promise(resolve,reject) {
        function insertProduct(prod) {
            const bulkLoad = connection.newBulkLoad('dbo.produto', {}, function (error, rowCount) {
                console.log('inserted %d rows', rowCount);
              });
              
              // setup your columns - always indicate whether the column is nullable
              bulkLoad.addColumn('designacao', TYPES.NVarChar, { length: 50, nullable: false });
              bulkLoad.addColumn('marca', TYPES.NVarChar, { length: 50, nullable: true });
              bulkLoad.addColumn('ean', TYPES.NVarChar, { nullable: true });
              bulkLoad.addColumn('id_categoria', TYPES.Int, { nullable: true });
              bulkLoad.addColumn('ean', TYPES.Int, { nullable: true });
              bulkLoad.addColumn('numero_serio', TYPES.NVarChar, { length: 50, nullable: true });
              
              // execute
              connection.execBulkLoad(bulkLoad, [
                { myInt: 7, myString: 'hello' },
                { myInt: 23, myString: 'world' }
              ]);
    
        }
    
        getPartentCatId = (pCat) => new Promise((resolve, reject) => {
            let pCatId = false;
            const request = new Request('select id from dbo.categoria where designacao like @designacao', (err, rowCount) => {
                if (err) {
                    reject(false)
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
    
}
console.log(produtosI.length)