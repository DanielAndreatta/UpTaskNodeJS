//import express from 'express';

const express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

// importar las variables
require('dotenv').config({ path: 'variables.env'});

//helpers con algunas funciones
const helpers = require('./helpers');

//Crear la conexión a la BD
const db = require('./config/db');

//Importar el modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync()
    .then(() => console.log('Conectado al Servidor'))
    .catch(error => console.log(error))

//crear una app de express
const app = express();

//Donde cargar los archivos estaticos
app.use(express.static('public'));

//Habilitar Pug
app.set('view engine','pug');

// app.use(express.json());
//Habilitar bodyParser para leer datos del formulario
// app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({ extended: true }));

//Añadir la carpeta de la vistas
app.set('views',path.join(__dirname,'./views'));

//agregar flash messages
app.use(flash());

app.use(cookieParser());

//sessiones nos permiten navegar entre distintas paginas sin volvernos a autenticar
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//Pasar var dump a la aplicación
app.use((req,res,next) => {
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
    next();
})

//Aprendiendo Middleware
app.use((req,res,next) => {
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
})

app.use('/',routes());

// serividor y puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host, () => {
    console.log('El Servidor esta funcionando');
});


// require('./handlers/email'); para verificar que se envien los mails de recuperacion de pasword

