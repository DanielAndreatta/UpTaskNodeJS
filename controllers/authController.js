const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos Campos son Obligatorios'
});

//Funcion para revisar si el usuario esta logueado o no
exports.usuarioAutenticado = (req,res,next) => {

    //si el usuario esta autenticado adelante
    if(req.isAuthenticated()){
        return next();
    }

    //sino esta autenticado redirigir el formulario
    return res.redirect('/iniciar-sesion');
}

//funcion para cerrar sesion
exports.cerrarSesion = (req,res) => {
    req.session.destroy(()=>{
        res.redirect('/iniciar-sesion'); //al cerrar sesion nos lleva al login
    })
}

//genera un token si el usuario es valido
exports.enviarToken = async (req,res) => {
    //verificar que el usuario existe
    const {email} = req.body;
    const usuario = await Usuarios.findOne({where:{email}});
    
    // console.log(usuario);
    //Si no existe el usuario
    if(!usuario){
        req.flash('error','No existe esa cuenta');
        res.redirect('/reestablecer');
        // res.render('reestablecer',{
        //     nombrePagina: 'Reestablecer tu Contraseña',
        //     mensajes: req.flash()
        // })
    } else {

        //usuario existe
        usuario.token = crypto.randomBytes(20).toString('hex');
        usuario.expiracion = Date.now() + 3600000;

        //guardarlos en la base de datos
        await usuario.save();

        //url de reset
        const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;
        // console.log(resetUrl);
 
        //res.redirect(resetUrl); //para pruebas
        // Enviar el correo con el Token
        await enviarEmail.enviar({
            usuario,
            subject: 'Password Reset',
            resetUrl,
            archivo : 'reestablecer-Password'
        });

        // terminar la ejecucion
        req.flash('correcto', 'Se envió un mensaje tu correo');
        res.redirect('/iniciar-sesion');

    }

}

exports.validarToken = async (req,res) => {
    const usuario = await Usuarios.findOne({
        where:{
            token: req.params.token
        }
    });

    if (!usuario) {
        req.flash('error', 'No Válido');
        res.redirect('/reestablecer');
    }

    // formulario para generar el password
    res.render('resetPassword', {
        nombrePagina: 'Reestablecer Contraseña'
    })
    // console.log(usuario);
}


// cambia el password por uno nuevo
exports.actualizarPassword = async (req, res) => {
    // console.log(req.params.token);

    // verifica el token valido pero tambien la fecha de expiracion
    const usuario = await Usuarios.findOne({
        where: { 
            token: req.params.token,
            expiracion: {
               [Op.gte] : Date.now()
            }
        }
    });

    // console.log(usuario);

    // verificamos si el usuario existe
    if (!usuario) {
        req.flash('error', 'No es Válido, Tiempo expirado');
        res.redirect('/reestablecer');
    };

    // hashear el nuevo password

    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    usuario.token = null;
    usuario.expiracion = null;

    // guardamos el nuevo password
    await usuario.save();

    req.flash('correcto', 'Tu password se ha modificado correctamente');
    res.redirect('/iniciar-sesion');

}