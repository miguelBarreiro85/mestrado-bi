var RandExp = require('randexp'); // must require on node
const Ean = require('ean-generator');

let produtos = [
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


for(let i=0; i<=1000; i++) {
    let produto = {};
    let i = Math.floor(Math.random() * (17))
    const marcaI = Math.floor(Math.random() * produtos[i].marcas.length)
    const modelo = 
    produto.designacao = produtos[i].tipo + ' ' + produtos[i].marcas[marcaI] + ' ' + new RandExp('[A-Z0-9]{3,6}').gen()
    produto.marca = produtos[i].marcas[marcaI];
    produto.ean = new Ean(['030', '031', '039']).createMultiple({size: 1})[0]
    produto.familia = produtos[i].familia
    produto.ns = new Ean(['125', '569', '788','659','789','963']).createMultiple({size: 1})[0]
    console.log(produto)
    
}
console.log(produtos.length)