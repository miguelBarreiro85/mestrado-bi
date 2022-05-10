var Connection = require('tedious').Connection;
var Categorias = require('./categorias');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var config = {
    server: '172.28.48.1',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'sa', //update me
            password: 'LMsb9170+'  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: false,
        database: 'electroPT'  //update me
    }
};
var connection = new Connection(config);
connection.on('connect', async function (err) {
    if(err) {
        console.log("ERROR",err);
        return;
    }
    // If no error, then good to proceed.
    console.log("Connected");
    let res = await Categorias.insertCategories(connection);
    if(!res){
        console.log("Erro ao adicionar categorias");
        connection.close();
    }
    console.log("Categorias adicionadas com sucesso");
    connection.close();
});

connection.connect();   

/*
https://stackoverflow.com/questions/25577248/node-js-mssql-tedius-connectionerror-failed-to-connect-to-localhost1433-conn
*/ 