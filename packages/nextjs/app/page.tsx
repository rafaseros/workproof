"use client";

import type { NextPage } from "next";
import Link from "next/link";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";
import { useReadContracts } from "wagmi";
import { useEffect, useState } from "react";
import { getContract } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { usePublicClient } from "wagmi";
import { getContractAbi } from "~~/utils/scaffold-eth/contract";

// Definición local de la interfaz Project basada en el contrato Solidity
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

const Home: NextPage = () => {
  const { data: projectIdCounter, isLoading: isLoadingCounter } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "projectIdCounter",
  });

  const { targetNetwork } = useTargetNetwork();
  const publicClient = usePublicClient({ chainId: targetNetwork.id });
  const contractAbi = getContractAbi("YourContract");

  const projectCalls = Array.from({ length: Number(projectIdCounter || 0) }, (_, i) => ({
    address: targetNetwork.contracts.YourContract.address,
    abi: contractAbi,
    functionName: "projects",
    args: [BigInt(i + 1)],
  }));

  const { data: fetchedProjectsData, isLoading: isLoadingProjectsData } = useReadContracts({
    contracts: projectCalls,
  });

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (fetchedProjectsData) {
      const parsedProjects: Project[] = fetchedProjectsData.map((projectData: any) => {
        if (projectData.result) {
          return {
            title: projectData.result[0],
            description: projectData.result[1],
            paymentAmount: projectData.result[2],
            employer: projectData.result[3],
            worker: projectData.result[4],
            deadline: projectData.result[5],
            completed: projectData.result[6],
            paid: projectData.result[7],
          };
        }
        return null; // O manejar el error de alguna manera
      }).filter(Boolean) as Project[]; // Filtrar cualquier proyecto nulo
      setProjects(parsedProjects);
    }
  }, [fetchedProjectsData]);

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">Proyectos WorkProof</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col">
            {isLoadingCounter || isLoadingProjectsData ? (
              <p>Cargando proyectos...</p>
            ) : (
              <div>
                <p>Total de proyectos: {projectIdCounter ? projectIdCounter.toString() : "0"}</p>
                {projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                    {projects.map((project, index) => (
                      <Link href={`/project/${index + 1}`} key={index} passHref>
                        <div className="card bg-base-100 shadow-xl p-4 cursor-pointer hover:shadow-2xl transition-shadow duration-200">
                          <h2 className="card-title">{project.title}</h2>
                          <p>{project.description}</p>
                          <p>Monto: {project.paymentAmount.toString()}</p>
                          <p>Empleador: {project.employer}</p>
                          <p>Trabajador: {project.worker}</p>
                          <p>Fecha Límite: {new Date(Number(project.deadline) * 1000).toLocaleDateString()}</p>
                          <p>Completado: {project.completed ? "Sí" : "No"}</p>
                          <p>Pagado: {project.paid ? "Sí" : "No"}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p>No hay proyectos disponibles.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
