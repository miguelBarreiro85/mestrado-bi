"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    server: '192.168.144.1',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: 'LMsb9170+' //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: false,
        database: 'electroPT' //update me
    }
};
/*
https://stackoverflow.com/questions/25577248/node-js-mssql-tedius-connectionerror-failed-to-connect-to-localhost1433-conn
*/ 
