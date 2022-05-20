import { config } from "./connection";

const {Connection, Request} = require("tedious");

export const executeSQL = (sql : string, callback : (e:any,r:any)=> void) => {
    console.log(sql)
    const rows : any[] = []
    let connection = new Connection(config)
    connection.connect((err : any) => {
        if (err) return callback(err, null);
        const request = new Request(sql, (err : any, rowCount : number) => {
          connection.close();
          if (err) return callback(err, null);
          callback(null, rows);
        });
        request.on('row', (columns:any) => {
            columns.forEach((column:any) => {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    rows.push(column.value)
                }
            });

        });
        connection.execSql(request);
      });
}
