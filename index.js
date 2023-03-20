//get the data in .env file
const bodyParser = require('body-parser');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const path = require('path');
//import port
const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', async (req, res) => {
    console.log("GET REQUEST ")
    console.log(process.env.USER_NAME + ' ' + process.env.PSWD + ' ' + process.env.CONNECTION_STRING);
    let connection;
    console.log(req.body.email + " " + req.body.password)
    try {
        connection = await oracledb.getConnection({
            user: process.env.USER_NAME,
            password: process.env.PSWD,
            connectString: process.env.CONNECTION_STRING
        });

        const result = await connection.execute(
            `SELECT * FROM first_table WHERE name='${req.body.name}' AND email = '${req.body.email}' AND password = '${req.body.password}'`,
        );
        console.log("Successfully fetched data");
        console.log(result.rows);
        if (result.rows.length > 0) {
            console.log("User exists")
            res.send("User exists")
        } 
        else {
            console.log("User does not exist")
            res.send("User does not exist")
        }


        // res.send(result.rows);

    } catch (err) {
        console.error('Error executing query: ', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Connection closed');
                // res.redirect("http://localhost:3000");
            } catch (err) {
                console.error('Error closing connection: ', err);
            }
        }
    }
});

app.post('/signup', async (req, res) => {
    console.log(process.env.USER_NAME + ' ' + process.env.PSWD + ' ' + process.env.CONNECTION_STRING);
    let connection;
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    console.log("POST REQUEST")
    console.log(name + " " + email + " " + password)
    try {
        connection = await oracledb.getConnection({
            user: process.env.USER_NAME,
            password: process.env.PSWD,
            connectString: process.env.CONNECTION_STRING
        });

        const result = await connection.execute(
            `INSERT INTO first_table (name, email, password) VALUES ('${name}', '${email}', '${password}')`,
        );
        await connection.commit();
        console.log("Successfully inserted data");
        console.log(result.rowsAffected + " rows inserted");

        const r = await connection.execute(
            `SELECT * FROM first_table`,
        );
        console.log(r.rows);

    } catch (err) {
        console.error('Error executing query: ', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Connection closed');
            } catch (err) {
                console.error('Error closing connection: ', err);
            }
        }
    }
});

//create server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
