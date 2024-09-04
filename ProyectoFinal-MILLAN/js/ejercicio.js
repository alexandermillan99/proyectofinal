document.addEventListener('DOMContentLoaded', () => {
    const formEstudiante = document.querySelector('#form-estudiante');
    const tablaEstudiantes = document.querySelector('#tabla-estudiantes tbody');
    const listadoEstudiantes = document.querySelector('#listado-estudiantes');
    const estudianteIdInput = document.querySelector('#estudiante-id');
    const notificationArea = document.querySelector('#notification-area');

    let estudiantes = [];

   
    fetch('./data/estudiantes.json')
        .then(response => response.json())
        .then(data => {
            estudiantes = data;
            estudiantes.forEach(est => agregarEstudianteDOM(est));
        })
        .catch(error => mostrarNotificacion('Error al cargar los estudiantes.', 'error'));


    function agregarEstudianteDOM(est) {
        const card = document.createElement('div');
        card.classList.add('estudiante-card');
        card.dataset.id = est.id;

        card.innerHTML = `
            <img src="${est.imagen}" alt="${est.nombre}">
            <h4>${est.nombre}</h4>
        `;

        card.addEventListener('click', () => seleccionarEstudiante(est.id, card));

        listadoEstudiantes.appendChild(card);
    }

    function seleccionarEstudiante(id, card) {
        listadoEstudiantes.querySelectorAll('.estudiante-card')
            .forEach(tarjeta => tarjeta.classList.remove('selected'));

        card.classList.add('selected');
        estudianteIdInput.value = id;
    }

    formEstudiante.addEventListener('submit', (event) => {
        event.preventDefault();

        const estudianteId = parseInt(estudianteIdInput.value);
        const notas = [1, 2, 3].map(num => parseFloat(document.querySelector(`#nota${num}`).value));

        if (estudianteId && notas.every(nota => !isNaN(nota))) {
            const estudiante = estudiantes.find(est => est.id === estudianteId);
            agregarEstudianteTabla(estudiante, ...notas);
            formEstudiante.reset();
            mostrarNotificacion(`Las notas de ${estudiante.nombre} se han registrado correctamente.`);
        } else {
            mostrarNotificacion('Por favor, completa todos los campos correctamente.', 'error');
        }
    });

    function agregarEstudianteTabla(estudiante, nota1, nota2, nota3) {
        const promedio = calcularPromedio([nota1, nota2, nota3]);
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td><img src="${estudiante.imagen}" alt="${estudiante.nombre}" width="50"></td>
            <td>${estudiante.nombre}</td>
            <td>${nota1}</td>
            <td>${nota2}</td>
            <td>${nota3}</td>
            <td>${promedio.toFixed(1)}</td>
            <td><button class="remove-btn">Eliminar</button></td>
        `;

        fila.querySelector('.remove-btn').addEventListener('click', () => {
            fila.remove();
            mostrarNotificacion(`Las notas de ${estudiante.nombre} han sido eliminadas.`);
            guardarDatos();
        });

        tablaEstudiantes.appendChild(fila);
        guardarDatos();
    }

    function calcularPromedio(notas) {
        return notas.reduce((acc, nota) => acc + nota, 0) / notas.length;
    }

    function mostrarNotificacion(mensaje, tipo = 'success') {
        notificationArea.textContent = mensaje;
        notificationArea.className = tipo;
        setTimeout(() => {
            notificationArea.textContent = '';
            notificationArea.className = '';
        }, 3000);
    }

    function guardarDatos() {
        const datos = Array.from(tablaEstudiantes.querySelectorAll('tr')).map(fila => {
            const [img, nombre, nota1, nota2, nota3, promedio] = Array.from(fila.querySelectorAll('td'));
            return {
                imagen: img.querySelector('img').src,
                nombre: nombre.textContent,
                notas: [parseFloat(nota1.textContent), parseFloat(nota2.textContent), parseFloat(nota3.textContent)],
                promedio: parseFloat(promedio.textContent)
            };
        });

        localStorage.setItem('datosEstudiantes', JSON.stringify(datos));
    }

    function cargarDatosAlmacenados() {
        const datos = JSON.parse(localStorage.getItem('datosEstudiantes'));
        if (datos) {
            datos.forEach(est => agregarEstudianteTabla(est, ...est.notas));
        }
    }

    cargarDatosAlmacenados();
});
