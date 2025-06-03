// (c) Copyright 2021 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// declare variables in the global scope.

// change signalName to valid I/O signal name.
var di1;
var valueDI1;
var estado;
var estadoProceso;
var executionMonitor; // Variable global para mantener una única instancia
let callbackAttached = false; // Flag para saber si ya añadimos el callback, para evitar que se duplique 
var task;
var properties;
let selectedCafe;
let selectedVasos;
let myDonut;
let  nombresCafe;
let cantidadvasos;
let myToggle;
let myToggle2;
let FinalProceso;
let stockCafe = {
    Espresso: 2,
    Latte: 2,
    Capuchino: 2
};

var myLineChart ;
let sliderValues = {
    Slider: 0,
    Slider2: 0,
    Slider3: 0
};

let sliderUpdateFlags = {
    Slider: false,
    Slider2: false,
    Slider3: false
};

// Historial de datos para el gráfico
let chartData = {
    Slider: [[0, 0]], // Valor inicial para el primer punto en X=0
    Slider2: [[0, 0]], // Valor inicial para el primer punto en X=0
    Slider3: [[0, 0]]  // Valor inicial para el primer punto en X=0
};
const ResultadosEncuestas = "$HOME/ResultadosEncuestas.txt";
const DatosProceso      = "$HOME/DatosProceso.txt";
const TaskPropertiesFile    = "$HOME/TaskProperties.txt";
let updateCount = 1; // eje X


/*This procedure will be executed when the html page has finished loading.*/
window.addEventListener("load", async function () {
    fpComponentsEnableLog(); //Enables the console
    createMainContent();//Creates all components in the settings tab 
});

/* CONTENT MAIN  VIEW  */
function createMainContent() {
    Create_radio();
    Create_Switch();
    Create_StartEx_Button();
    Create_StopEx_Button();
    Create_LineChart();
    updateChart();
    Create_Slider();
    Create_Slider2();
    Create_Slider3();
    Menu();
   // Create_Button2();
    Create_PieChart();
    Create_Toggle();
    Create_Toggle2();
    Create_Button();
    Create_Popup();
    MonitorEstados();
    MostrarEstadoSeñales(filter);
    PropiedadesTareas();
    ComprobarEstado();
    Espresso();
    Latte();
    Capuchino();
    Ejecutar();
    EstadoCafe();
    Estado_Variable_FinalProceso();
}

/*Radio buttons Auto-Manual, only one radio button can be active*/
function Create_radio() {
    try {
        radio1 = new FPComponents.Radio_A();
        radio1.attachToId("sc-radio-1");
        radio1.onclick = () => {
            radio2.checked = false;//Clicking on radio 1 disables radio 2.
            RWS.Controller.setOperationMode('manual'); //Sets controller to manual mode
        }
 
        radio2 = new FPComponents.Radio_A();
        radio2.attachToId("sc-radio-2");
        radio2.onclick = () => {
            radio1.checked = false;//Clicking on radio 2 disables radio 1.
            RWS.Controller.setOperationMode('automatic'); //Sets controller to automatic mode
        }
        Load_Manual_Auto(radio1, radio2);
    } catch (e) { console.log("Error with the radio buttons!"); }
}
/*Switch Motors On-Off*/
function Create_Switch() {
    try {
        Switch1 = new FPComponents.Switch_A();
        Switch1.scale = 1.5;//Set the switch to a 1.5 scale.
        Switch1.attachToId("sc-switch-1");
        Switch1.onchange = async function () {
            //Check switch position before turn on or turn off the motors
            if (Switch1.active == false) {
                console.log("to_off");
                await RWS.Controller.setMotorsState('motors_off'); //Turn off the motors
            } else {
                console.log("to_on");
                await RWS.Controller.setMotorsState('motors_on'); //Turn on the motors
            }
        }
        Load_Motor_State(Switch1);
    } catch (e) { console.log("Error with the switch button!"); }
}
/* CREATE Start Execution BUTTON */
function Create_StartEx_Button() {
    try {
        startExButton = new FPComponents.Button_A();
        startExButton.attachToId("Start_Program_Button");
        startExButton.text = "Start";
        startExButton.onclick = async function () {
            try {
                //Realiza un procedimiento para iniciar el programa
                await RWS.Rapid.resetPP();//Sets the Program Pointer to main
                await RWS.Controller.setMotorsState('motors_on'); //Turns the motors on
                Switch1.active = true; //After switching the motors to on, the motor switch is updated.
                await RWS.Rapid.startExecution({ //Starts the execution of the program with the desired features
                    regainMode: 'continue',
                    executionMode: 'continue',
                    cycleMode: 'forever',
                    condition: 'none',
                    stopAtBreakpoint: false,
                    enableByTSP: true
                });
            } catch (error) {
                console.log("Error with the start procedure!");
            }
        };

    } catch (e) { console.log("Error with the Start Execution buttons!"); }
}
/* CREATE Stop Execution BUTTON */
function Create_StopEx_Button() {
    try {
        stopExButton = new FPComponents.Button_A();
        stopExButton.attachToId("Stop_Program_Button");
        stopExButton.text = "Stop";
        stopExButton.onclick = async function () {
            await RWS.Rapid.stopExecution({
                stopMode: 'stop',//You can stop cycles, instructions or programs, in this case putting 'stop' we stop the program.
                useTSP: 'normal'//With 'normal' we only stop the normal tasks, not the static ones.
            });
        };

    } catch (e) { console.log("Something has gone wrong with the radio buttons!", "ERROR " + e); }
}
/*Function to set the radio buttons to their initial state*/
async function Load_Manual_Auto(radio1, radio2) {
    var state = await RWS.Controller.getOperationMode();
    if (state == 'automatic') {
        console.log("The controller is in automatic mode");
        radio2.checked = true;
        radio1.checked = false;
    } else {
        console.log("The controller is in manual mode");
        radio1.checked = true;
        radio2.checked = false;
    }
}
/*Function to set the switch to its initial state*/
async function Load_Motor_State(Switch1) {
    var state = await RWS.Controller.getControllerState();
    console.log(state);
    if (state == 'motors_on') {
        Switch1.active = true;
    } else {
        Switch1.active = false;
    }
}
function Menu(){
    var myMenu = new FPComponents.Menu_A(); 
    myMenu.model = { 
        content: [ 
            { 
                type: "gap" 
            }, 
            { 
                type: "label", 
                label: "My Menu" 
            }, 
            {
                type: "gap" 
            },  
            {
                type: "button", 
                label: "Encuesta de calidad", 
                icon: "A.png", 
                arrow: true, 
                onclick: () => { switchView("LiftKit-Settings-subview") }//Clicking, 'switchView' function will be execute.
            }, 
            {
                type: "button", 
                label: "Control settings", 
                icon: "A.png", 
                arrow: true, 
                onclick: () => { switchView("LiftKit-Settings-subview2") }//Clicking, 'switchView' function will be execute.
            }, 
            { 
                type: "gap" 
            } 
        ] 
    }; 
    myMenu.attachToId("LiftKit-main-grid-area-Menu");   
}
/*function Create_Button2(){
    try{
        var myButton = new FPComponents.Button_A();
        myButton.text = "RESTABLECER";
        myButton.onclick = async function () {
            stockCafe = {
                Espresso: 2,
                Latte: 2,
                Capuchino: 2
            };
            console.log("✅ Stock reiniciado");
        }
        myButton.attachToId("H");
    }catch (e) { console.log("Something has gone wrong with the button!"); } //A popup is displayed if something has gone wrong
}*/
async function EstadoCafe() {

    try {
        estado= await RWS.Rapid.getData('T_ROB1','Module1','EstadoProceso');
        const estadoProceso = await estado.getValue(); 
        //console.log(estadoProceso);

        if (estadoProceso==0){
            myDonut.model = [ 
                [100 ,  'Inicio' ], 
                ]; 
                myDonut.bottomText = "0%";
        }else if (estadoProceso==1){
            myDonut.model = [ 
                [20,  'Vaso ' ],
                [80,  'Restante ' ],  
                ]; 
                myDonut.bottomText = "20%";
        }else if (estadoProceso==2){
            myDonut.model = [ 
                [40,  'Capusula %' ],
                [60,  '% Restante' ], 
                ]; 
                myDonut.bottomText = "40%";
        }else if (estadoProceso==3) {
            myDonut.model = [ 
                [60 ,  'Boton pulsado' ],
                [40,  '% Restante' ],  
                ]; 
                myDonut.bottomText = "60%";
        }else if (estadoProceso==4) {
            myDonut.model = [ 
                [80 ,  'Coger café' ],
                [20,  '% Restante' ],  
                ]; 
                myDonut.bottomText = "80%";
        }else if (estadoProceso==5) {
            myDonut.model = [ 
                [100 ,  'Café listo' ],
                ]; 
                myDonut.bottomText = "100%";
        }
        myDonut.model = myDonut.model;
    }catch (err) {
        console.error("Error al leer EstadoProceso:", err);
    }
}
function Create_PieChart(){
    myDonut = new FPComponents.Piechart_A(); 
    myDonut.showLabels = false;   // ← aquí ocultas la leyenda de la derecha
    myDonut.model = [ 
    [100 ,  'Inicio' ], 
    [ 0, 'Esperando' ], 
    ]; 
    EstadoCafe();
    myDonut.topText = "CAFÉ"; 
    myDonut.centerText = "PROGRESO"; 
    myDonut.bottomText = ":)"; 
    myDonut.size = 150; 
    myDonut.attachToId("PieChart");
     // Comenzar monitoreo periódico del estado RAPID
     setInterval(EstadoCafe, 2000); // cada 2 segundos
    
}
async function Ejecutar(){
    if (selectedCafe !== null && selectedVasos !== null) {
        console.log("Se ha llamado a Ejecutar()");
            if (selectedCafe !== null){
                // Create_Popup();
                 switch (selectedCafe) {
                     case 0:
                        Espresso();
                     break;
                     case 1:
                        Latte();
                     break;
                     case 2:
                        Capuchino();
                     break;
                 }
            }
            await EstadoCafe();
        }
}
async function Capuchino() {
    console.log ("CAPUCHINOO");
    const estado = await ComprobarEstado();
    if (estado==='stopped'){
        MonitorEstados();
        const task = await RWS.Rapid.getTask('T_ROB1');
        await RWS.Rapid.resetPP();
        console.log(`CANTIDAD VASOSSSS: ${selectedVasos}`);
        try {
            await RWS.Rapid.setDataValue('T_ROB1', 'Module1', 'TipoCafe', 3);
            if (selectedVasos==0){
                await RWS.Rapid.setDataValue('T_ROB1','Module1','numVasos',1);
            }else if(selectedVasos==1) {
                await RWS.Rapid.setDataValue('T_ROB1','Module1','numVasos',2);
            }
        } catch (error) {
            console.error("Error en SetDataValue:", error);
        }
        await RWS.Controller.setMotorsState('motors_on');
        await RWS.Rapid.startExecution({
            regainMode: 'continue',
            executionMode: 'continue',
            cycleMode: 'once',
            condition: 'none',
            stopAtBreakpoint: false,
            enableByTSP: true
        });
        PropiedadesTareas(); 
    }
}
async function Latte(){
    console.log ("LATEEE");
    const estado = await ComprobarEstado();
    if (estado==='stopped'){
        MonitorEstados();
        const task = await RWS.Rapid.getTask('T_ROB1');
        await RWS.Rapid.resetPP();
        try {
            await RWS.Rapid.setDataValue('T_ROB1', 'Module1', 'TipoCafe', 2);
            if (selectedVasos==0){
                await RWS.Rapid.setDataValue('T_ROB1','Module1','numVasos',1);
            }else {
                await RWS.Rapid.setDataValue('T_ROB1','Module1','numVasos',2);
            }
        } catch (error) {
            console.error("Error en SetDataValue:", error);
        }
        await RWS.Controller.setMotorsState('motors_on');
        await RWS.Rapid.startExecution({
            regainMode: 'continue',
            executionMode: 'continue',
            cycleMode: 'once',
            condition: 'none',
            stopAtBreakpoint: false,
            enableByTSP: true
        });
        PropiedadesTareas();
        // Reiniciar selección para evitar múltiples ejecuciones
        //selectedCafe = null;
        //selectedVasos = null;
    }
}
async function Espresso () {
    console.log ("ESPRESOOO");
    const estado = await ComprobarEstado();
    if (estado==='stopped'){
        MonitorEstados();
        const task = await RWS.Rapid.getTask('T_ROB1');
        await RWS.Rapid.resetPP();
        try {
            await RWS.Rapid.setDataValue('T_ROB1', 'Module1', 'TipoCafe', 1);
            if (selectedVasos==0){
                await RWS.Rapid.setDataValue('T_ROB1','Module1','numVasos',1);
            }else {
                await RWS.Rapid.setDataValue('T_ROB1','Module1','numVasos',2);
            }
        } catch (error) {
            console.error("Error en SetDataValue:", error);
        }
        await RWS.Controller.setMotorsState('motors_on');
        await RWS.Rapid.startExecution({
            regainMode: 'continue',
            executionMode: 'continue',
            cycleMode: 'once',
            condition: 'none',
            stopAtBreakpoint: false,
            enableByTSP: true
        });
        PropiedadesTareas();
        // Reiniciar selección para evitar múltiples ejecuciones
        //selectedCafe = null;
        //selectedVasos = null;
    }
}
function Create_Popup(){
    const vasosValidos = [0, 1];
    if (selectedCafe !== null && selectedVasos !== null && vasosValidos.includes(selectedVasos) ) {
    const mensaje = `Ha seleccionado ${cantidadvasos[selectedVasos]} vasos de ${nombresCafe[selectedCafe]}. ¿Desea continuar?`
    FPComponents.Popup_A.confirm( 
        "PREPARAR CAFÉ",
        mensaje, 
        function (action) { 
                if (action == FPComponents.Popup_A.OK) {
                    const tipos = ["Espresso", "Latte", "Capuchino"]; 
                    const tipo = tipos[selectedCafe];
                    if (selectedVasos === 0) {
                        stockCafe[tipo] = stockCafe[tipo] -1;
                    } else if (selectedVasos === 1) {
                        stockCafe[tipo] = stockCafe[tipo] - 2;
                    }
                    console.log(`Stock (DESPUES)de ${tipo}: ${stockCafe[tipo]}`);
                    Ejecutar();
                } else if (action == FPComponents.Popup_A.CANCEL) { 
                    console.log("Operación cancela."); 
                    myToggle.setToggled(0, false, true);
                    myToggle.setToggled(1, false, true);
                    myToggle.setToggled(2, false, true);
                    myToggle2.setToggled(0, false, true);
                    myToggle2.setToggled(1, false, true); 
                } 
        });
    }
}
function Create_Toggle() {
    nombresCafe = ["Espresso", "Latte", "Capuchino"];
    myToggle = new FPComponents.Toggle_A();
    myToggle.multi = false;
    myToggle.singleAllowNone = true;
    myToggle.onclick = async function(state) {
        const seleccion = state.all;
        const indiceSeleccionado = seleccion.indexOf(true);
        selectedCafe=indiceSeleccionado;
        console.log(`Tipo de café seleccionado: ${nombresCafe[selectedCafe]}`);    
    }
    myToggle.model = [
        { text: "Café Espresso", icon: "espresso.png" },
        { text: "Café Latte", icon: "latte.png" },
        { text: "Café Capuchino",icon: "capuchino.png"}
    ];

    myToggle.attachToId("toggle");
}
function Create_Toggle2(){
    cantidadvasos = ["1", "2"];
    myToggle2 = new FPComponents.Toggle_A(); 
    myToggle2.multi = false;
    myToggle2.singleAllowNone = true;
    myToggle2.onclick = async function(state) {
        const seleccion = state.all;
        const indiceSeleccionado = seleccion.indexOf(true);
        console.log(`VASOSSSSS SELECIONADO: ${indiceSeleccionado}`);
        selectedVasos=indiceSeleccionado;
        console.log(`Seleccione cuanto cafes desea: ${cantidadvasos[selectedVasos]}`);
        const tipos = ["Espresso", "Latte", "Capuchino"];
        let cantidadPedida;
        estado= await RWS.Rapid.getData('T_ROB1','Module1','EstadoProceso');
        let EstadoProceso = await estado.getValue(); 
        if (selectedVasos === 0) {
            cantidadPedida = 1;
        } else {
            cantidadPedida = 2;
        }
        const tipo = tipos[selectedCafe];
        if (stockCafe[tipo] < cantidadPedida) {
            console.log (`⚠️ Ya no quedan unidades disponibles para ${tipo}`);
            Create_Popup3();
            // Es para quitar la selección del usuario, puesto que no quedan unidades de ese tipo de café
            myToggle.setToggled(0, false, true);
            myToggle.setToggled(1, false, true);
            myToggle.setToggled(2, false, true);
            myToggle2.setToggled(0, false, true);
            myToggle2.setToggled(1, false, true);
            return;
        }else {
            console.log (`SELECTEDVASOS : ${selectedVasos}`);
            console.log(`Stock (ANTES) de ${tipo}: ${stockCafe[tipo]}`);
            if (selectedVasos == 0 && stockCafe[tipo]==1)
            {
                console.log("⚠️ Entró en el IF de Seleccion=1 por stock==1 y selectedVasos==0");
                await RWS.Rapid.setDataValue('T_ROB1','Module1','Seleccion',1);
            }
            else{
                await RWS.Rapid.setDataValue('T_ROB1','Module1','Seleccion',0);
            }
            Create_Popup();
            
        }
    }
    myToggle2.model = [ 
    { text: "1" ,icon: "tazacafe.png"}, 
    { text: "2",icon: "tazacafe.png" }  
] 
myToggle2.attachToId("toggle2");
}
async function ComprobarEstado() {
    const estado = await RWS.Rapid.getExecutionState(); // VER EL ESTADO DEL ROBOT
    if (estado === 'stopped') { // SI NO SE ESTÁ EJECUTANDO NADA, COMIENZA 
        console.log("RAPID está parado, vamos a iniciar el programa");
    }else if (estado === 'running') { // SI HAY ALGUNA INSTRUCCIÓN REALIZANDOSE, NO HACE CASO A LA PULSACIÓN DEL BOTÓN
    console.log("RAPID ya está ejecutándose, no se puede iniciar otro ciclo aún.");
    }
    return estado;
} 
async function PropiedadesTareas() {
     // Para ver las propiedades de la tarea 
     var task = await RWS.Rapid.getTask('T_ROB1'); 
     await new Promise(res => setTimeout(res, 100));
     var properties = await task.getProperties();
     // Nos saca por pantalla todas las propiedades 
     console.log(JSON.stringify(properties, null, 2));
     // Nos saca por pantalla las propiedades que nosotros le hemos indicado
     if (properties.hasOwnProperty('name')) 
         console.log(`Nombre del Task:  = ${properties['name']}`); 
     if (properties.hasOwnProperty('taskType')) 
         console.log(`Tipo de Task: = ${properties['taskType']}`); 
     if (properties.hasOwnProperty('taskState')) 
         console.log(`Estado del Task: = ${properties['taskState']}`);                        
     if (properties.hasOwnProperty('isMotionTask')) 
         console.log(`¿Es Task de movimineto  = ${properties['isMotionTask']}`);                        
     if (properties.hasOwnProperty('executionType')) { 
         console.log(`Execution type = ${properties['executionType']}`); 
     }
    saveTaskProperties(properties);
}
async function MostrarEstadoSeñales(filter, exact= false){
    // FUNCIÓN PARA VER EL ESTADO DE LAS VARIABLES QUE QUERAMOS 
    // como dentro de la funcion usamos await tiene que ser una función async 
    try {
        // Como habrá veces que queramos que nos saque por pantalla los valores de todas las varaibles 
        // y otras veces querramos que simplemente nos saque una señal en específico. A la función le 
        // he añadido exact=false, suponiendo que en la gran mayoría de veces vamos a sacar el registro 
        // entero. Por ello las llamadas a la función se hacen de la sigueinte forma:
        // MostrarEstadoSeñales({ name: 'LocaL_IO', type: '[DI,DO]' }); -> cuando sea busqueda GENERAL 
        // MostrarEstadoSeñales({ name: 'Local_IO_0_DI1', type: '[DI]' }, true); -> cuando sea ESPECÍFICA 
        if (exact===false)
        {
            const signals = await RWS.IO.searchSignals(filter);
            if (signals.length > 0) {
                for (let i = 0; i < signals.length; i++) {
                    const testValue = await signals[i].getValue();
                    console.log(`${signals[i].getName()} = ${testValue}`);
                }
            } else {
                console.log("No se encontraron señales con ese filtro.");
            }
        }
        else {
            // IMPORTANTE !!!! CON EL CÓDIGO DE ARRIBA NOS SACA POR PANTALLA POR EJEMPLO SI EN EL NOMBRE
            // PONEMOS DI1 NO SACA: DI1,DI11,DI12... POR ESO EL SIGUIENTE CÓDIGO ES PARA FILTRAR EXACTAMENTE
            // POR LO QUE QUEREMOS, EN EL CASO DE QUE ESTEMOS BUSCANDO ALGO ESPECÍFICO. 

            // Paso 1: Buscar todas las señales que coincidan con el filtro
            const signals = await RWS.IO.searchSignals(filter);  

            // Paso 2: Filtrar solo aquellas señales cuyo nombre sea exactamente igual al filtro
            // Creamos un array vacío donde vamos a meter la señal que estamos buscando exactamente
            const exacta = [];
            for (let i = 0; i < signals.length; i++) {
                // Esperar el nombre de la señal y comparar
                // Guardamos en signalName los nombres de las señales, para ahora compararlas en el if 
                const signalName = await signals[i].getName();
                //Comparamos la señal que acabamos de guardar en signalName con en nombre exacto del filtro
                if (signalName === filter.name) {
                    // SI son exactamente iguales, lo guardamos en el array. Push se usa en JS para escibir al final del array.
                    exacta.push(signals[i]);
                }
            }
            // Paso 3: Si se encontraron señales exactas
            if (exacta.length > 0) {
                for (let i = 0; i < exacta.length; i++) {
                    // Paso 4: Obtener el valor de la señal
                    const testValue = await exacta[i].getValue();
                    // Una vez que hemos encontrado la señal exacta, la sacamos por pantalla
                    console.log(`${exacta[i].getName()} = ${testValue}`);
                }
            } else {
                console.log("No se encontraron señales que coincidan exactamente.");
            }
        }
    }catch (e) { console.log("Error al obtener señales:", e); }

}
async function Estado_Variable_FinalProceso() {
    estado= await RWS.Rapid.getData('T_ROB1','Module1','FinalProceso');
    FinalProceso = await estado.getValue();    
    console.log(`FINALPROCESO: ${FinalProceso}`); 
}
async function MonitorEstados() {
    // ---- MONITOR DE ESTADO ---- ver si la rutina está terminada o va a comenzar
    // Lo ponemos antes de empezar la ejecución para que tambien detecte el primer cambio, 
    // de parado a empezar a ejecutar
    // Solo creamos y subscribimos el monitor una vez para evitar múltiples callbacks
    if (!executionMonitor) {   
        executionMonitor = RWS.Rapid.getMonitor('execution');
        await executionMonitor.subscribe();
    }
    // Solo añadir el callback una vez
    if (!callbackAttached) {
        // Se realiza de forma automática, a cualquier cambio se realizará la función 
        executionMonitor.addCallbackOnChanged(async eventData => {
            await Estado_Variable_FinalProceso();
            const contadorVasos = await RWS.Rapid.getData('T_ROB1','Module1','contadorVasos');
            const cafesServidos = await contadorVasos.getValue();
            if (eventData === 'stopped') {
               // Estado_Variable_FinalProceso();
                console.log(`la variable FINALPROCESO: ${FinalProceso}`); 
                if (FinalProceso===1 && selectedVasos===1 &&cafesServidos===2){
                    console.log("he entrado en el if de tarea finalizada para la encuesta");
                    Create_Popup2(); 
                    selectedCafe = null;
                    selectedVasos = null;
                }else if (FinalProceso===1 && selectedVasos===0){
                    console.log("he entrado en el if de tarea finalizada para la encuesta");
                    Create_Popup2(); 
                    selectedCafe = null;
                    selectedVasos = null;
                }
                else if (FinalProceso===0){
                    Create_Popup4();
                }
                else {
                    console.log("no se cumplen las condiciones del if ");
                }
                myToggle.setToggled(0, false, true);
                myToggle.setToggled(1, false, true);
                myToggle.setToggled(2, false, true);
                myToggle2.setToggled(0, false, true);
                myToggle2.setToggled(1, false, true);
                console.log(" RUTINA TERMINADA");
               
            } else if (eventData === 'running') {
                console.log(" COMENZANDO RUTINA");
            }
        });
        // Marcar que ya hemos añadido el callback para no repetirlo en el futuro
        callbackAttached = true;
    } 
}

function Create_Popup2(){
    FPComponents.Popup_A.confirm( 
        "CAFÉ LISTO!",
        "Retire su café, por favor.\n\n¿Te gustaría responder una breve encuesta de calidad?",
        function (action) { 
            if (action == FPComponents.Popup_A.OK) { 
                switchView("LiftKit-Settings-subview");
            } else if (action == FPComponents.Popup_A.CANCEL) { 
                console.log("Operación cancela."); 
            } 
    });
} 
function Create_Popup3(){
    const tipos = ["Espresso", "Latte", "Capuchino"];
    const tipo = tipos[selectedCafe];
    let mensajePopup="";
    if (stockCafe[tipo]==0) {
        mensajePopup=[
            `⚠️ Lo sentimos, ya no quedan unidades de ${tipo}.`,
            "Por favor, seleccione otro tipo de café."
        ];
    }else if (stockCafe[tipo]==1)
    {
        mensajePopup = [
            `⚠️ Solo queda **una** unidad de ${tipo}.`,
            "Por favor, seleccione solo un vaso o elija otro tipo de café."
        ];
    }
    FPComponents.Popup_A.confirm( 
        "Stock insuficiente",
        mensajePopup,
    );
}
function Create_Popup4(){
    FPComponents.Popup_A.confirm( 
        "PARADA DE EMERGENCIA",
    );
    
}
function Create_Button(){
    try{
        var myButton = new FPComponents.Button_A();
        myButton.text = "CANCELAR PEDIDO";
        myButton.onclick = async function () {
            const estado = await RWS.Rapid.getExecutionState(); // VER EL ESTADO DEL ROBOT
            // En función del estado del robot hará una cosa u otra
            const tipos = ["Espresso", "Latte", "Capuchino"];
            const tipo = tipos[selectedCafe];
            const estado_varible = await RWS.Rapid.getData('T_ROB1','Module1','EstadoProceso');
            const EstadoProceso = await estado_varible.getValue();  
            const contadorVasos = await RWS.Rapid.getData('T_ROB1','Module1','contadorVasos');
            const cafesServidos = await contadorVasos.getValue();
            if (estado === 'running'){ 
                await RWS.Rapid.stopExecution({  // PARA DE INMEDIATO LA EJECUCIÓN
                stopMode: 'quick_stop',  // Interviene aun que no se haya termiando la tarea,
                //  esto se puede cambiar y por ejemplo parar el robot cuando haya terminado 
                // de realizar la tarea 
                useTSP: 'normal' 
                });
                console.log(`ESTADOOOO PROCESOOO ES: ${EstadoProceso}`);
                console.log(`SELECTEDVASOS CONDICIÓN IF : ${selectedVasos}`);
                if (EstadoProceso===0){
                    if (selectedVasos===0)
                    {
                        console.log("HE ENTRADO A SUMAR");
                        stockCafe[tipo] = stockCafe[tipo] +1; 
                    }else if (selectedVasos===1 &&cafesServidos===0)
                    {
                        stockCafe[tipo] = stockCafe[tipo] + 2;
                    }else if (selectedVasos===1 && cafesServidos===1)
                    {
                        stockCafe[tipo] = stockCafe[tipo] + 1;
                    }
                    else {
                        console.log("NO SE CUMPLE CONDICIONES");
                    }
                }else {
                    console.log("NO HE ENTRADO EN EL IF PRINCIPAL");
                }



                /*if (selectedVasos === 0 && EstadoProceso=== 0) {
                    console.log("HE ENTRADO A SUMAR");
                    stockCafe[tipo] = stockCafe[tipo] +1;
                } else if (selectedVasos === 1&& EstadoProceso=== 0) {
                    stockCafe[tipo] = stockCafe[tipo] + 2;
                }
                else {
                    console.log("NO SE CUMPLE CONDICIONES");
                }*/
                console.log(`Stock (DESPUES)de ${tipo}: ${stockCafe[tipo]}`);
            }
            await setTimeout(() => {}, 2000);  // Espera 2000ms 
            // Vuelve a mirar el estado del robot
            const state = await RWS.Rapid.getExecutionState();
            if (state === 'stopped')
            { 
                console.log('STOPPED RAPID'); 
                // robot a la posición incial.
                var task = await RWS.Rapid.getTask('T_ROB1');
                // Mover el puntero a la rutina seleccionada   
                //await task.movePPToRoutine('INICIO', false, 'Module1');
                try {
                    // SUPER IMPORTANTE!!! Si hacemos un reset del programa rapid, justo despues de movePPToRoutine
                    // el puntero que se crea con esta función para llevar acabo Path_20, lo elimina y por eso no 
                    // se mueve el robot, hace el amago porque se establece el puntero pero en cuestión de 
                    // milisegundos al borrarlo no se lleva acabo la rutina. Por eso ponemos movePPToRoutine 
                    // justo despues del RESETPP!!!
                    await RWS.Rapid.resetPP ();
                    await task.movePPToRoutine('INICIO', false, 'Module1');
                    await RWS.Controller.setMotorsState ('motors_on');
                    await RWS.Rapid.startExecution({
                        regainMode: 'continue',
                        executionMode: 'continue',
                        cycleMode: 'once',
                        condition: 'none', 
                        stopAtBreakpoint: false,
                        enableByTSP : true
                });
                setTimeout(() => {}, 2000); 
            
                }catch (e){
                    console.log("erorr");
                }
            } 
        };
        myButton.attachToId("BotonEMG");
    }catch (e) { console.log("Something has gone wrong with the EMG button!"); } //A popup is displayed if something has gone wrong
}

function Create_Slider (){
    var slider = new FPComponents.Slider_A(); 
    slider.tickStep = 1; 
    slider.displayTicks = true; 
    slider.min = 0; 
    slider.max = 10; 
    slider.value = 0; 
    slider.enabled = true; 
    slider.label = "Porcentaje: "; 
    slider.unit = " %"; 
    slider.width = 200; 
    slider.attachToId("Slider");
    slider.onrelease = function(value){  
        sliderValues.Slider = value;             // Guarda último valor
        sliderUpdateFlags.Slider = true;         // Marca que se usó
        console.log(`Slider 1 valor actualizado: ${value}`); 
        checkAndUpdateChart();                   // Revisa si ya se pueden guardar los 3
    }
}

function Create_Slider2 (){
    var slider = new FPComponents.Slider_A(); 
    slider.tickStep = 1; 
    slider.displayTicks = true; 
    slider.min = 0; 
    slider.max = 10; 
    slider.value = 0; 
    slider.enabled = true; 
    slider.label = "Porcentaje: "; 
    slider.unit = " %"; 
    slider.width = 200; 
    slider.attachToId("Slider2"); 
    slider.onrelease = function(value){  
        sliderValues.Slider2 = value;             // Guarda último valor
        sliderUpdateFlags.Slider2 = true;         // Marca que se usó
        console.log(`Slider 2 valor actualizado: ${value}`); 
        checkAndUpdateChart();                   // Revisa si ya se pueden guardar los 3
    }
}

function Create_Slider3 (){
    var slider = new FPComponents.Slider_A(); 
    slider.tickStep = 1; 
    slider.displayTicks = true; 
    slider.min = 0; 
    slider.max = 10; 
    slider.value = 0; 
    slider.enabled = true; 
    slider.label = "Porcentaje: "; 
    slider.unit = " %"; 
    slider.width = 200; 
    slider.attachToId("Slider3"); 
    slider.onrelease = function(value){  
        sliderValues.Slider3 = value;             // Guarda último valor
        sliderUpdateFlags.Slider3 = true;         // Marca que se usó
        console.log(`Slider 3 valor actualizado: ${value}`);
        checkAndUpdateChart();                   // Revisa si ya se pueden guardar los 3
    }
}

function checkAndUpdateChart() {
    if (sliderUpdateFlags.Slider && sliderUpdateFlags.Slider2 && sliderUpdateFlags.Slider3) {
        // Aseguramos que siempre se añaden los nuevos valores, pero ahora se puede dibujar la línea desde el principio
        chartData.Slider.push([updateCount, sliderValues.Slider]);
        chartData.Slider2.push([updateCount, sliderValues.Slider2]);
        chartData.Slider3.push([updateCount, sliderValues.Slider3]);

        updateCount++;  // Incrementamos el contador del eje X
        updateChart();  // Actualizamos el gráfico
        saveSurveyResults();
        

        // Reiniciar los flags para la siguiente ronda
        sliderUpdateFlags = {
            Slider: false,
            Slider2: false,
            Slider3: false
        };
        setTimeout(function() {
            Create_Popup5(); // Llama al popup de finalización después de un retraso
        }, 800); // Retraso de 1 segundo (1000 ms)


    }
}

function Create_LineChart(){
    myLineChart = new FPComponents.Linechart_A(); 
    myLineChart.width = 300; 
    myLineChart.height = 400;   
    myLineChart.attachToId("LineChart"); 
}

function updateChart() {
    if (!myLineChart) return;

    const model = [
        {
            points: chartData.Slider,
            red: 255, green: 0, blue: 0,
            thickness: 2,
            dots: true
        },
        {
            points: chartData.Slider2,
            red: 0, green: 128, blue: 255,
            thickness: 2,
            dots: true
        },
        {
            points: chartData.Slider3,
            red: 0, green: 200, blue: 0,
            thickness: 2,
            dots: true
        }
    ];
    myLineChart.model = model;
}
function Create_Popup5(){
    FPComponents.Popup_A.confirm( 
        "GRACIAS POR COMPLETAR LA ENCUESTA",
        "", 
        function (action) { 
            if (action == FPComponents.Popup_A.OK) { 
                switchView("LiftKit-main-grid-container");
            } else if (action == FPComponents.Popup_A.CANCEL) { 
                console.log("Operación cancela."); 
            } 
    });
}
async function saveSurveyResults() {
    const date = new Date().toISOString();
    const entry = `${date} - PREGUNTA1: ${sliderValues.Slider}, PREGUNTA2: ${sliderValues.Slider2}, PREGUNTA3: ${sliderValues.Slider3}\n`;

    try {
        // 3.1) Intentar leer archivo existente
        let file = await RWS.FileSystem.getFile(ResultadosEncuestas);
        let currentContent = await file.getContents();
        // 3.2) Añadir nueva línea y guardar
        currentContent += entry;
        file.setContents(currentContent);
        await file.save(true);
        console.log("Encuesta guardada en archivo existente.");
    } 
    catch (readError) {
        console.warn("No existe el archivo o fallo al leerlo, creando uno nuevo.", readError);
        try {
            // 3.3) Crear fichero desde cero y escribir
            let newFile = await RWS.FileSystem.createFileObject(ResultadosEncuestas);
            newFile.setContents(entry);
            await newFile.save(true);
            console.log("Archivo creado y encuesta guardada.");
        } 
        catch (createError) {
            console.error("Error creando o guardando archivo:", createError);
        }
    }
}