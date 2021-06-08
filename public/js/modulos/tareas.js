import axios from "axios";
import Swal from 'sweetalert2';
import {actualizarAvance} from '../funciones/avance';

const tareas = document.querySelector('.listado-pendientes');

if(tareas){
    tareas.addEventListener('click', e => {

        // console.log(e.target.classList);

        if(e.target.classList.contains('fa-check-circle')){

            // console.log('Actualizando...');

            const icono = e.target;
            const idTarea = icono.parentElement.parentElement.dataset.tarea;

            // console.log(idtarea);
            
            //request hacia /tareas/:id
            const url = `${location.origin}/tareas/${idTarea}`;

            // console.log(url);

            axios.patch(url,{idTarea})
                .then(function(respuesta){
                    if(respuesta.status === 200){
                        icono.classList.toggle('completo');

                        actualizarAvance();
                    }
                })
        }

        if(e.target.classList.contains('fa-trash')){
            const tareaHTML = e.target.parentElement.parentElement;
            const idTarea = tareaHTML.dataset.tarea;

            Swal.fire({
                title: 'Deseas borrar esta tarea?',
                text: "Una tarea eliminada no se puede recuperar",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Si, Borrar',
                cancelButtonText: 'No, Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {

                    const url = `${location.origin}/tareas/${idTarea}`;

                    //enviar el delete por emdio de axios
                    axios.delete(url,{params: {idTarea}})
                        .then(function(respuesta){
                            if(respuesta.status === 200){
                                //Eliminar el nodo
                                tareaHTML.parentElement.removeChild(tareaHTML);

                                //Opcional una alerta
                                Swal.fire(
                                    'Tarea eliminada',
                                    respuesta.data,
                                    'success'
                                )

                                actualizarAvance();
                            }
                        });
                }
            })
        }
    });
}

export default tareas;