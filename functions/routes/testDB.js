var express = require('express');
var router = express.Router();

let accountID = 'ac61b4a50072a479baebb47ac6093beb';
let dbID = '55501be3-4450-4888-93c7-bbbf0d883137';
let apiToken = '5V5wfxWoIPdEXpCDBK65Kw1mh3d9mdw3raDwgz09';
let queryUrl = `https://api.cloudflare.com/client/v4/accounts/${accountID}/d1/database/${dbID}/query`;
let headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${apiToken}`
};

router.post('/set' , async (req , res) => {

    let data = req.body.data;

    if(!data) {

        return res.json({msg: "something wrong"});
    }

    let dbHeader = await fetch(queryUrl , {

        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            "sql": `INSERT INTO testtable (data) VALUES (?)`,
            "params": [data]
        })
    })

    let dbBody = await dbHeader.json();

    console.log(dbBody);

    if(!dbBody) {

        return res.json({msg: 'something wrong'});
    }

    return res.json(dbBody.result);
})

router.post('/get' , async (req , res) => {

    let id = req.body.id;

    if(!id) {

        return res.json({msg: 'something wrong'});
    }

    let dbHeader  = await fetch(queryUrl , {

        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            "sql": `SELECT * FROM testtable WHERE id = ?`,
            "params": [id]
        })
    })

    let dbBody = await dbHeader.json();

    console.log(dbBody);

    if(!dbBody) {

        return res.json({msg: 'something wrong'});
    }

    return res.json(dbBody.result);
})

module.exports = router;