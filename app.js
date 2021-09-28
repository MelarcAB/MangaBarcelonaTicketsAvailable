const express = require('express')
const fs = require('fs');
var request = require("request");
var nodemailer = require('nodemailer');

const app = express()
const port = 9797


//Tiempo entre peticiones a la URL
const timer = ms => new Promise(res => setTimeout(res, waitSecs))
//Tiempo entre envío de emails
const timerMail = ms => new Promise(res => setTimeout(res, 3000))



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


initVars()







function petitionRepeat() {
    console.log("> Obteniendo contenido de la web " + URL);
    request(URL_TO_CHECK, function (error, response, body) {
        // Mostrar status petición
        //console.log('statusCode:', response && response.statusCode); 

        if (error == null) {
            // var contiene_keywords = checkData();

            console.log('> Datos recibidos de la URL: '); // Print the HTML for the Google homepage.
            //console.log('>Datos recibidos de la URL: '+checkData, body); // Print the HTML for the Google homepage.

        } else {
            console.log('> Error al obtener datos de la URL:\n', error); // Print the HTML for the Google homepage.
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
//test 2
async function makePetition() {

    do {
        petitionRepeat();
        await timer(waitSecs); // esperar por cada peticion
    } while (status_repeat);

}

//makePetition();
//sendEmailAlerts()
sendEmails();

async function sendEmails() {
    var emails_to_send = emails.split(",");

    for (let i = 0; i < emails_to_send.length; i++) {
        sendEmailAlert(emails_to_send[i]);
        await timerMail();
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
            console.log(">Email enviado a " + email);
    });

}






/***************************** 


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Iniciado web server en http://localhost:${port}`)
})
*/