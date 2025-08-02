"use client";

import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth/useScaffoldContractWrite";
import { useReadContracts, useAccount } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getContractAbi } from "~~/utils/scaffold-eth/contract";
import { Address } from "~~/components/scaffold-eth";

interface Project {
  title: string;
  description: string;
  paymentAmount: bigint;
  employer: string;
  worker: string;
  deadline: bigint;
  completed: boolean;
  paid: boolean;
}

interface WorkSeal {
  projectId: bigint;
  issuer: string;
  recipient: string;
  ipfsHash: string;
  issueDate: bigint;
}

const UserProfile: NextPage = () => {
  const params = useParams();
  const userAddress = params.address as string;
  const { address: connectedAddress } = useAccount();

  const { targetNetwork } = useTargetNetwork();
  const contractAbi = getContractAbi("YourContract");

  // Fetch staked balance
  const { data: stakedBalance, isLoading: isLoadingStakedBalance } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "stakedBalances",
    args: [userAddress],
  });

  // Fetch projectIdCounter to get all projects
  const { data: projectIdCounter, isLoading: isLoadingProjectIdCounter } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "projectIdCounter",
  });

  const projectCalls = Array.from({ length: Number(projectIdCounter || 0) }, (_, i) => ({
    address: targetNetwork.contracts.YourContract.address,
    abi: contractAbi,
    functionName: "projects",
    args: [BigInt(i + 1)],
  }));

  const { data: allProjectsData, isLoading: isLoadingAllProjectsData } = useReadContracts({
    contracts: projectCalls,
  });

  // Fetch workSealIdCounter to get all WorkSeals
  const { data: workSealIdCounter, isLoading: isLoadingWorkSealIdCounter } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "_workSealIdCounter",
  });

  const workSealCalls = Array.from({ length: Number(workSealIdCounter || 0) }, (_, i) => ({
    address: targetNetwork.contracts.YourContract.address,
    abi: contractAbi,
    functionName: "workSeals",
    args: [BigInt(i + 1)],
  }));

  const { data: allWorkSealsData, isLoading: isLoadingAllWorkSealsData } = useReadContracts({
    contracts: workSealCalls,
  });

  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userWorkSeals, setUserWorkSeals] = useState<WorkSeal[]>([]);

  useEffect(() => {
    if (allProjectsData) {
      const projectsAsEmployer: Project[] = [];

      allProjectsData.forEach((projectData: any) => {
        if (projectData.result) {
          const project: Project = {
            title: projectData.result[0],
            description: projectData.result[1],
            paymentAmount: projectData.result[2],
            employer: projectData.result[3],
            worker: projectData.result[4],
            deadline: projectData.result[5],
            completed: projectData.result[6],
            paid: projectData.result[7],
          };

          if (project.employer.toLowerCase() === userAddress.toLowerCase() || project.worker.toLowerCase() === userAddress.toLowerCase()) {
            projectsAsEmployer.push(project);
          }
        }
      });
      setUserProjects(projectsAsEmployer);
    }
  }, [allProjectsData, userAddress]);

  useEffect(() => {
    if (allWorkSealsData) {
      const seals: WorkSeal[] = [];
      allWorkSealsData.forEach((workSealData: any) => {
        if (workSealData.result) {
          const workSeal: WorkSeal = {
            projectId: workSealData.result[0],
            issuer: workSealData.result[1],
            recipient: workSealData.result[2],
            ipfsHash: workSealData.result[3],
            issueDate: workSealData.result[4],
          };
          if (workSeal.recipient.toLowerCase() === userAddress.toLowerCase()) {
            seals.push(workSeal);
          }
        }
      });
      setUserWorkSeals(seals);
    }
  }, [allWorkSealsData, userAddress]);

  const { writeAsync: markCompletedAsync } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "markProjectCompleted",
    args: [BigInt(0)], // Placeholder, will be set dynamically
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash: ", txnReceipt.blockHash);
      alert("Proyecto marcado como completado!");
    },
  });

  const { writeAsync: markPaidAsync } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "markProjectPaid",
    args: [BigInt(0)], // Placeholder, will be set dynamically
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash: ", txnReceipt.blockHash);
      alert("Proyecto marcado como pagado!");
    },
  });

  const { writeAsync: mintWorkSealAsync } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "mintWorkSeal",
    args: [BigInt(0), ""], // Placeholder, will be set dynamically
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash: ", txnReceipt.blockHash);
      alert("Work Seal acuñado exitosamente!");
    },
  });

  const handleMarkCompleted = async (projectId: bigint) => {
    try {
      await markCompletedAsync({ args: [projectId] });
    } catch (error) {
      console.error("Error al marcar como completado:", error);
      alert("Error al marcar como completado. Consulta la consola para más detalles.");
    }
  };

  const handleMarkPaid = async (projectId: bigint) => {
    try {
      await markPaidAsync({ args: [projectId] });
    } catch (error) {
      console.error("Error al marcar como pagado:", error);
      alert("Error al marcar como pagado. Consulta la consola para más detalles.");
    }
  };

  const handleMintWorkSeal = async (projectId: bigint) => {
    const ipfsHash = prompt("Por favor, ingresa el IPFS Hash para el Work Seal:");
    if (!ipfsHash) return;
    try {
      await mintWorkSealAsync({ args: [projectId, ipfsHash] });
    } catch (error) {
      console.error("Error al acuñar Work Seal:", error);
      alert("Error al acuñar Work Seal. Consulta la consola para más detalles.");
    }
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">Perfil de Usuario</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Dirección:</p>
            <Address address={userAddress} />
            <p className="my-2 font-medium">Saldo Staked: {isLoadingStakedBalance ? "Cargando..." : stakedBalance?.toString() || "0"} ETH</p>

            {connectedAddress?.toLowerCase() === userAddress.toLowerCase() && (
              <div className="flex flex-col gap-4 mt-4 w-full max-w-md">
                <h2 className="text-center text-2xl font-bold">Staking</h2>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Monto a Stakear (ETH)"
                    className="input input-bordered w-full"
                    value={stakeAmount}
                    onChange={e => setStakeAmount(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={handleStake}>
                    Stakear
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Monto a Retirar (ETH)"
                    className="input input-bordered w-full"
                    value={unstakeAmount}
                    onChange={e => setUnstakeAmount(e.target.value)}
                  />
                  <button className="btn btn-secondary" onClick={handleUnstake}>
                    Retirar
                  </button>
                </div>
              </div>
            )}
          </div>

          <h2 className="text-center text-2xl font-bold mt-8">Proyectos</h2>
          {isLoadingProjectIdCounter || isLoadingAllProjectsData ? (
            <p>Cargando proyectos...</p>
          ) : userProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {userProjects.map((project, index) => (
                <div key={index} className="card bg-base-100 shadow-xl p-4">
                  <h2 className="card-title">{project.title}</h2>
                  <p>{project.description}</p>
                  <p>Monto: {project.paymentAmount.toString()}</p>
                  <p>Empleador: {project.employer}</p>
                  <p>Trabajador: {project.worker}</p>
                  <p>Fecha Límite: {new Date(Number(project.deadline) * 1000).toLocaleDateString()}</p>
                  <p>Completado: {project.completed ? "Sí" : "No"}</p>
                  <p>Pagado: {project.paid ? "Sí" : "No"}</p>
                  {connectedAddress?.toLowerCase() === project.employer.toLowerCase() && (
                    <div className="card-actions justify-end mt-4">
                      {!project.completed && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleMarkCompleted(BigInt(index + 1))} // Usar index + 1 como projectId
                        >
                          Marcar Completado
                        </button>
                      )}
                      {!project.paid && (
                        <button
                          className="btn btn-sm btn-secondary ml-2"
                          onClick={() => handleMarkPaid(BigInt(index + 1))} // Usar index + 1 como projectId
                        >
                          Marcar Pagado
                        </button>
                      )}
                      {project.completed && project.paid && (
                        <button
                          className="btn btn-sm btn-accent ml-2"
                          onClick={() => handleMintWorkSeal(BigInt(index + 1))} // Usar index + 1 como projectId
                        >
                          Acuñar Work Seal
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No hay proyectos asociados a este usuario.</p>
          )}

          <h2 className="text-center text-2xl font-bold mt-8">Work Seals</h2>
          {isLoadingWorkSealIdCounter || isLoadingAllWorkSealsData ? (
            <p>Cargando Work Seals...</p>
          ) : userWorkSeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {userWorkSeals.map((seal, index) => (
                <div key={index} className="card bg-base-100 shadow-xl p-4">
                  <h2 className="card-title">Work Seal #{seal.projectId.toString()}</h2>
                  <p>Emisor: {seal.issuer}</p>
                  <p>Receptor: {seal.recipient}</p>
                  <p>IPFS Hash: {seal.ipfsHash}</p>
                  <p>Fecha de Emisión: {new Date(Number(seal.issueDate) * 1000).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay Work Seals asociados a este usuario.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfile;
