
// const bodyParser = require('body-parser');
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const oracledb = require('oracledb');
// const path = require('path');
// const sql = require('./db.js'); // Assuming db.js is in the same directory
import express from 'express';  
import bodyParser from 'body-parser';
import dotenv from "dotenv"
dotenv.config()
import cors from "cors"
import path from "path"
import sql from "./db.js"

import { fileURLToPath } from 'url';

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', async (req, res) => {
    console.log("GET REQUEST ")
    console.log(process.env.USER_NAME + ' ' + process.env.PSWD + ' ' + process.env.CONNECTION_STRING);
    let connection;
    console.log(req.body.email + " " + req.body.password)
    try {
        // connection = await oracledb.getConnection({
        //     user: process.env.USER_NAME,
        //     password: process.env.PSWD,
        //     connectString: process.env.CONNECTION_STRING
        // });

        console.log(`SELECT name, email FROM first_table WHERE email = '${req.body.email}' AND password = '${req.body.password}'`)
        const result = await sql`
        SELECT name, email 
        FROM first_table 
        WHERE email = ${req.body.email} AND password = ${req.body.password}
        `;

        console.log("Successfully fetched data");
        console.log(result);
        if (result.length > 0) {
            console.log("User exists")
            res.send({
                "message": "User exists",
                "name": result,
                "email": "",
            })
        }
        else {
            console.log("User does not exist")
            res.send({ "message": "User does not exist" })
        }
        // res.send(result.rows);

    } catch (err) {
        console.error('Error executing query: ', err);
    } finally {
        // if (connection) {
            try {
                // await connection.close();
                console.log('Connection closed');
                // res.redirect("http://localhost:3000");
            } catch (err) {
                console.error('Error closing connection: ', err);
                res.send({ "message": "Error closing connection" })
            }
        // }
    }
});

app.post('/signup', async (req, res) => {
    let connection;
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    console.log("POST REQUEST")
    console.log(name + " " + email + " " + password)
    if (name != null || email !== null || password !== null) {
        console.log("Inside if condition")
        try {
            // connection = await oracledb.getConnection({
            //     user: process.env.USER_NAME,
            //     password: process.env.PSWD,
            //     connectString: process.env.CONNECTION_STRING
            // });

            const result = await sql`
                INSERT INTO first_table (name, email, password) 
                VALUES (${name}, ${email}, ${password})
            `;

            console.log("Successfully inserted data");
            console.log(result.count + " rows inserted");

            


            // await connection.commit();
            console.log("Successfully inserted data");
            console.log(result.rowsAffected + " rows inserted");

            const r = await sql`SELECT * FROM first_table`;
            res.send({
                "message": "Successfully inserted data",
                "name": r.rows,
                "email": email
            })
            console.log(r.rows);

        } catch (err) {
            console.error('Error executing query: ', err);
        } finally {
            if (connection) {
                try {
                    // await connection.close();
                } catch (err) {
                    console.error('Error closing connection: ', err);
                }
            }
        }
    }
    else{
        res.send({
            "message": "Error closing connection",
            "name": "Name",
            "email": "Email"
        })
    }
});

//create server
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});





// for oracle database we can get the table name using 
// select table_name from user_tables;
// Then we can get the column names using
// select column_name from user_tab_columns where table_name = 'table_name';
// Then we can get the data using
// select column_name_here from table_name;
// To insert data we can use
// insert into table_name (column_name_here) values ('value_here');