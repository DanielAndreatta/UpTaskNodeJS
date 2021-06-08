const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');

exports.proyectosHome = async (req,res)=>{

    // console.log(res.locals.usuario);

    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where:{usuarioId}});

    res.render('index',{
        nombrePagina : 'Proyectos',
        proyectos
    })
}

exports.formularioProyecto = async (req,res) => {
    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where:{usuarioId}});
    res.render('nuevoProyecto',{
        nombrePagina : 'Nuevo Proyecto',
        proyectos
    })
}

exports.nuevoProyecto = async (req,res) => {
    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where:{usuarioId}});
    //res.send('Enviaste el Formulario');

    //Enviar a la consola lo que el usuario escriba
    //console.log(req.body);

    //Validar que tengamos algo en el input
    const {nombre} = req.body;

    let errores = [];

    if(!nombre){
        errores.push({'texto':'Agrega un nombre al proyecto'})
    }

    //Si hay errores
    if(errores.length>0){
        res.render('nuevoProyecto',{
            nombrePagina : 'Nuevo Proyecto',
            errores,
            proyectos
        })
    }else{
        //No hay errores
        //Insertar en la BD
        const usuarioId = res.locals.usuario.id;
        await Proyectos.create({nombre,usuarioId});
        res.redirect('/');
    }
}

exports.proyectoPorUrl = async (req,res,next) => {
    //res.send(req.params.url);
    const usuarioId = res.locals.usuario.id;
    const proyectosPromise = Proyectos.findAll({where:{usuarioId}});
    

    const proyectoPromise = Proyectos.findOne({
        where:{
            url: req.params.url,
            usuarioId
        }
    });

    const [proyectos,proyecto] = await Promise.all([proyectosPromise,proyectoPromise]);
    
    //Consultar tareas del proyecto actual

    const tareas = await Tareas.findAll({
        where: {
            proyectoId: proyecto.id
        }
        // ,
        // include: [
        //     {model: Proyectos}
        // ]
    });

    if(!proyecto) return next();

    //render a la vista
    res.render('tareas',{
        nombrePagina: 'Tareas del Proyecto',
        proyecto,
        proyectos,
        tareas
    })  
}

exports.formularioEditar = async (req,res) => {

    const usuarioId = res.locals.usuario.id;
    const proyectosPromise = Proyectos.findAll({where:{usuarioId}});
 
    const proyectoPromise = Proyectos.findOne({
        where:{
            id: req.params.id,
            usuarioId
        }
    });

    const [proyectos,proyecto] = await Promise.all([proyectosPromise,proyectoPromise]);

    //render a la vista
    res.render('nuevoProyecto',{
        nombrePagina : 'Editar Proyecto',
        proyectos,
        proyecto
    })
}

exports.actualizarProyecto = async (req,res) => {
    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where:{usuarioId}});
    //res.send('Enviaste el Formulario');

    //Enviar a la consola lo que el usuario escriba
    //console.log(req.body);

    //Validar que tengamos algo en el input
    const {nombre} = req.body;

    let errores = [];

    if(!nombre){
        errores.push({'texto':'Agrega un nombre al proyecto'})
    }

    //Si hay errores
    if(errores.length>0){
        res.render('nuevoProyecto',{
            nombrePagina : 'Nuevo Proyecto',
            errores,
            proyectos
        })
    }else{
        //No hay errores
        //Insertar en la BD
        await Proyectos.update(
            {nombre: nombre},
            {where: {id: req.params.id}}
        );
        res.redirect('/');
    }
}

exports.eliminarProyecto = async (req,res,next) => {
    //req, query o params
    //console.log(req.params);
    const{urlProyecto} = req.query;
    const resultado = await Proyectos.destroy({where: {url: urlProyecto}});

    if(!resultado){
        return next();
    }

    res.status(200).send('Proyecto Eliminado Correctamente');
}