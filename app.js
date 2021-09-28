const express = require('express')
const fs = require('fs');
var request = require("request");
var nodemailer = require('nodemailer');

const app = express()
const port = 9797


//Tiempo entre peticiones a la URL
const timer = ms => new Promise(res => setTimeout(res, waitSecs))
//Tiempo entre envío de emails
const timerMail = ms => new Promise(res => setTimeout(res, 500))


const ejecutarEnvioCorreos = async () => {
    const result = await sendEmails()
  }


//VARIABLES
//from json
var URL = "";
var emails = "";
var waitSecs = 0;
var email_sender = ""
var email_password = ""
var keywords = ""

//local vars
var status_repeat = true;


//start functions
console.log("-- INICIANDO APP --")
initVars()
makePetitions()






function petitionRepeat() {
    console.log("> Obteniendo contenido de la web " + URL);
    request(URL, function (error, response, body) {
        // Mostrar status petición
        //console.log('statusCode:', response && response.statusCode); 

        if (error == null) {
            // var contiene_keywords = checkData();

            console.log('> Datos recibidos de la URL. ');
            console.log('> Buscando keywords... [' + keywords + ']');
            //console.log('>Datos recibidos de la URL: '+checkData, body); // Print the HTML for the Google homepage.
            if (checkData(body)) {
                console.log("> Se han encontrado coincidencias. Se enviarán los email.")
                ejecutarEnvioCorreos()
            } else {
                console.log("> No se han encontrado coincidencias.")
            }

        } else {
            console.log('> Error al obtener datos de la URL:\n', error);
        }

    });
}




function initVars() {
    try {
        const jsonString = fs.readFileSync("./datos.json");
        const datos = JSON.parse(jsonString);
        URL = datos.URL;
        emails = datos.emails;
        waitSecs = datos.delay;
        email_sender = datos.email_sender
        email_password = datos.email_password
        keywords = datos.keywords

    } catch (err) {
        console.log(">ERROR al leer datos.json :" + err);
        return;
    }
}

async function exitApp() {
    console.log("> Se terminará la ejecución de la app.")
    process.exit()
};

async function makePetitions() {

    do {
        petitionRepeat();
        await timer(waitSecs); // esperar por cada peticion
    } while (status_repeat);

}

//makePetition();
//sendEmailAlerts()
//sendEmails();

async function sendEmails() {
    var emails_to_send = emails.split(",");

    for (let i = 0; i < emails_to_send.length; i++) {
        sendEmailAlert(emails_to_send[i]);

        if (i + 1 == emails_to_send.length) {
            await timerMail()

            await exitApp()

        } else {
            await timerMail()

        }
    }



}






//Send email de alerta
function sendEmailAlert(email) {
    var transporter = nodemailer.createTransport({
        host: 'mail.melarcab.com',
        port: 465,
        secure: true,
        auth: {
            user: email_sender,
            pass: email_password
        }
    });

    var mailOptions = {
        from: '"MelarcAB DEV > SALON MANGA ENTRADAS" <' + email_sender + '>',
        to: email,
        subject: "MANGA BARCELONA : PODRÍAN ESTAR DISPONIBLES LAS ENTRADAS",
        html: "<h1>MANGA BARCELONA ENTRADAS</h1><p>El bot ha detectado coincidencias en la página del salón del manga. <br>Podrían haber publicado la compra de las entradas. Hecha un vistazo -> </p> <a href='https://www.manga-barcelona.com/es/inicio.cfm'>CLIC PARA IR A LA WEB</a>"
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err);
        else
            console.log("> Email enviado a " + email);
    });

}


function checkData(data = "") {
    if (data != "") {
        let encontrado = false;
        let arr_keywords = keywords.split(",");
        for (var i = 0; i < arr_keywords.length; i++) {
            let actual_keyword = (arr_keywords[i])
            if (data.includes(actual_keyword)) {
                encontrado = true
            }
        }
        return encontrado;
    }
    return false;
}




/***************************** 


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Iniciado web server en http://localhost:${port}`)
})
*/