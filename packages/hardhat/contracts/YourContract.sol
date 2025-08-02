//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Útil para depuración. Eliminar al desplegar en una red en vivo.
import "hardhat/console.sol";

// Usar OpenZeppelin para heredar implementaciones probadas en batalla (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Un contrato inteligente que permite cambiar una variable de estado del contrato y rastrear los cambios.
 * También permite al propietario retirar el Ether del contrato.
 * @author BuidlGuidl
 */
contract YourContract {
    // Structs for WorkProof
    struct WorkSeal {
        uint256 projectId;
        address issuer;
        address recipient;
        string ipfsHash; // IPFS hash for WorkSeal metadata
        uint256 issueDate;
    }

    struct Project {
        string title;
        string description;
        uint256 paymentAmount; // Cantidad en stablecoin (ej. USDC, USDT)
        address employer;
        address worker;
        uint256 deadline;
        bool completed;
        bool paid;
    }

    uint256 public projectIdCounter; // Contador para los IDs de proyecto
    mapping(uint256 => Project) public projects; // Mapeo de ID de proyecto a la estructura Project

    // Evento para notificar la creación de un nuevo proyecto
    event ProjectCreated(uint256 indexed projectId, address indexed employer, address worker, string title, uint256 paymentAmount);

    // Variables de Estado
    address public immutable owner;
    string public greeting = "Construyendo Aplicaciones Imparables!!!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    mapping(address => uint) public userGreetingCounter;

    // Eventos: una forma de emitir registros desde el contrato inteligente que pueden ser escuchados por partes externas
    event GreetingChange(address indexed greetingSetter, string newGreeting, bool premium, uint256 value);

    // Constructor: Llamado una vez al desplegar el contrato
    // Revisar packages/hardhat/deploy/00_deploy_your_contract.ts
    constructor(address _owner) {
        owner = _owner;
    }

    // Modificador: usado para definir un conjunto de reglas que deben cumplirse antes o después de que se ejecute una función
    // Revisar la función withdraw()
    modifier isOwner() {
        // msg.sender: variable predefinida que representa la dirección de la cuenta que llamó a la función actual
        require(msg.sender == owner, "No es el Propietario");
        _;
    }

    /**
     * Función que permite a cualquiera cambiar la variable de estado "greeting" del contrato e incrementar los contadores
     *
     * @param _newGreeting (string memory) - nuevo saludo a guardar en el contrato
     */
    function setGreeting(string memory _newGreeting) public payable {
        // Imprimir datos en la consola de la cadena hardhat. Eliminar al desplegar en una red en vivo.
        console.log("Estableciendo nuevo saludo '%s' desde %s", _newGreeting, msg.sender);

        // Cambiar variables de estado
        greeting = _newGreeting;
        totalCounter += 1;
        userGreetingCounter[msg.sender] += 1;

        // msg.value: variable global incorporada que representa la cantidad de ether enviada con la transacción
        if (msg.value > 0) {
            premium = true;
        } else {
            premium = false;
        }

        // emit: palabra clave usada para disparar un evento
        emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, msg.value);
    }

    /**
     * Función que permite al propietario retirar todo el Ether del contrato
     * La función solo puede ser llamada por el propietario del contrato como se define en el modificador isOwner
     */
    function withdraw() public isOwner {
        (bool success, ) = owner.call{ value: address(this).balance }("");
        require(success, "Fallo al enviar Ether");
    }

    /**
     * Función que permite al contrato recibir ETH
     */
    receive() external payable {}

    /**
     * @dev Permite a un empleador crear un nuevo proyecto.
     * @param _title Título del proyecto.
     * @param _description Descripción del proyecto.
     * @param _paymentAmount Cantidad de pago para el proyecto en stablecoin.
     * @param _worker Dirección del trabajador asignado al proyecto.
     * @param _deadline Fecha límite para la finalización del proyecto (timestamp).
     */
    function createProject(
        string memory _title,
        string memory _description,
        uint256 _paymentAmount,
        address _worker,
        uint256 _deadline
    ) public {
        // Asegurarse de que el empleador no sea la dirección cero y que el trabajador no sea la dirección cero
        require(msg.sender != address(0), "La direccion del empleador no puede ser cero");
        require(_worker != address(0), "La direccion del trabajador no puede ser cero");
        require(_paymentAmount > 0, "El monto de pago debe ser mayor que cero");
        require(_deadline > block.timestamp, "La fecha limite debe ser en el futuro");

        projectIdCounter++;
        projects[projectIdCounter] = Project({
            title: _title,
            description: _description,
            paymentAmount: _paymentAmount,
            employer: msg.sender,
            worker: _worker,
            deadline: _deadline,
            completed: false,
            paid: false
        });

        emit ProjectCreated(projectIdCounter, msg.sender, _worker, _title, _paymentAmount);
    }
}
