export const config = {
    server: '172.25.240.1',  //update me
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
/*
https://stackoverflow.com/questions/25577248/node-js-mssql-tedius-connectionerror-failed-to-connect-to-localhost1433-conn
*/ 