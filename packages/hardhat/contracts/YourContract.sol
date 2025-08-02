//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Útil para depuración. Eliminar al desplegar en una red en vivo.
import "hardhat/console.sol";

// Usar OpenZeppelin para heredar implementaciones probadas en batalla (ERC20, ERC721, etc)
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * Un contrato inteligente que permite cambiar una variable de estado del contrato y rastrear los cambios.
 * También permite al propietario retirar el Ether del contrato.
 * @author BuidlGuidl
 */
contract YourContract is ERC721 {
    IERC20 public usdcToken; // Instancia del contrato MockUSDC
    uint256 private _workSealIdCounter; // Contador para los IDs de WorkSeal
    mapping(uint256 => WorkSeal) public workSeals; // Mapeo de ID de WorkSeal a la estructura WorkSeal

    // Evento para notificar la acuñación de un nuevo WorkSeal
    event WorkSealMinted(uint256 indexed workSealId, uint256 indexed projectId, address indexed recipient, string ipfsHash);

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

    // Evento para notificar que un proyecto ha sido marcado como completado
    event ProjectCompleted(uint256 indexed projectId, address indexed employer);

    // Evento para notificar que un proyecto ha sido marcado como pagado
    event ProjectPaid(uint256 indexed projectId, address indexed employer);

    // Mapeo para rastrear los saldos de staking de cada usuario
    mapping(address => uint256) public stakedBalances;

    // Eventos para staking
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    // Variables de Estado
    address public immutable owner;
    

    // Constructor: Llamado una vez al desplegar el contrato
    // Revisar packages/hardhat/deploy/00_deploy_your_contract.ts
    constructor(address _owner, address _usdcTokenAddress) ERC721("WorkProofWorkSeal", "WPWS") {
        owner = _owner;
        _workSealIdCounter = 0;
        usdcToken = IERC20(_usdcTokenAddress);
    }

    

    /**
     * @dev Permite al empleador acuñar un WorkSeal (NFT) para un proyecto completado.
     * @param _projectId ID del proyecto para el cual se acuña el WorkSeal.
     * @param _ipfsHash Hash IPFS de los metadatos del WorkSeal.
     */
    function mintWorkSeal(
        uint256 _projectId,
        string memory _ipfsHash
    ) public {
        // Asegurarse de que el proyecto exista y esté completado y pagado
        require(projects[_projectId].employer == msg.sender, "Solo el empleador del proyecto puede acunar el WorkSeal");
        require(projects[_projectId].completed, "El proyecto debe estar completado para acunar un WorkSeal");
        require(projects[_projectId].paid, "El proyecto debe estar pagado para acunar un WorkSeal");

        _workSealIdCounter++;
        uint256 newItemId = _workSealIdCounter;
        _mint(projects[_projectId].worker, newItemId);

        workSeals[newItemId] = WorkSeal({
            projectId: _projectId,
            issuer: msg.sender,
            recipient: projects[_projectId].worker,
            ipfsHash: _ipfsHash,
            issueDate: block.timestamp
        });

        emit WorkSealMinted(newItemId, _projectId, projects[_projectId].worker, _ipfsHash);
    }

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

        // El empleador debe aprobar el gasto de USDC por parte del contrato
        require(usdcToken.transferFrom(msg.sender, address(this), _paymentAmount), "Transferencia de USDC fallida");

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

    /**
     * @dev Permite al empleador marcar un proyecto como completado.
     * @param _projectId ID del proyecto a marcar como completado.
     */
    function markProjectCompleted(uint256 _projectId) public {
        require(projects[_projectId].employer == msg.sender, "Solo el empleador puede marcar el proyecto como completado");
        require(!projects[_projectId].completed, "El proyecto ya esta marcado como completado");

        projects[_projectId].completed = true;
        emit ProjectCompleted(_projectId, msg.sender);
    }

    /**
     * @dev Permite al empleador marcar un proyecto como pagado.
     * @param _projectId ID del proyecto a marcar como pagado.
     */
    function markProjectPaid(uint256 _projectId) public {
        require(projects[_projectId].employer == msg.sender, "Solo el empleador puede marcar el proyecto como pagado");
        require(!projects[_projectId].paid, "El proyecto ya esta marcado como pagado");

        // Transferir el pago en USDC al trabajador
        require(usdcToken.transfer(projects[_projectId].worker, projects[_projectId].paymentAmount), "Fallo la transferencia de USDC al trabajador");

        projects[_projectId].paid = true;
        emit ProjectPaid(_projectId, msg.sender);
    }

    /**
     * @dev Permite a los usuarios depositar fondos para staking.
     */
    function stake() public payable {
        require(msg.value > 0, "Debe enviar ETH para hacer staking");
        stakedBalances[msg.sender] += msg.value;
        emit Staked(msg.sender, msg.value);
    }

    /**
     * @dev Permite a los usuarios retirar sus fondos apostados.
     * @param _amount Cantidad a retirar.
     */
    function unstake(uint256 _amount) public {
        require(_amount > 0, "La cantidad a retirar debe ser mayor que cero");
        require(stakedBalances[msg.sender] >= _amount, "Fondos insuficientes para retirar");

        stakedBalances[msg.sender] -= _amount;
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Fallo al retirar fondos");
        emit Unstaked(msg.sender, _amount);
    }
}
