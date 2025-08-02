"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { NextPage } from "next";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";
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

const ProjectDetails: NextPage = () => {
  const params = useParams();
  const projectId = params.id ? BigInt(params.id as string) : undefined;

  const { targetNetwork } = useTargetNetwork();
  const contractAbi = getContractAbi("YourContract");

  const { data: project, isLoading: isLoadingProject } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "projects",
    args: projectId ? [projectId] : undefined,
    enabled: projectId !== undefined, // Solo habilitar si projectId está definido
  });

  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    if (project && project.length > 0) {
      setCurrentProject({
        title: project[0],
        description: project[1],
        paymentAmount: project[2],
        employer: project[3],
        worker: project[4],
        deadline: project[5],
        completed: project[6],
        paid: project[7],
      });
    }
  }, [project]);

  if (isLoadingProject) {
    return (
      <div className="flex items-center flex-col grow pt-10">
        <p>Cargando detalles del proyecto...</p>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex items-center flex-col grow pt-10">
        <p>Proyecto no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">Detalles del Proyecto</span>
        </h1>
        <div className="flex justify-center items-center space-x-2 flex-col mt-8">
          <div className="card bg-base-100 shadow-xl p-8 w-full max-w-2xl">
            <h2 className="card-title text-2xl mb-4">{currentProject.title}</h2>
            <p className="mb-2"><strong>Descripción:</strong> {currentProject.description}</p>
            <p className="mb-2"><strong>Monto de Pago:</strong> {currentProject.paymentAmount.toString()} ETH</p>
            <p className="mb-2"><strong>Empleador:</strong> <Address address={currentProject.employer} /></p>
            <p className="mb-2"><strong>Trabajador:</strong> <Address address={currentProject.worker} /></p>
            <p className="mb-2"><strong>Fecha Límite:</strong> {new Date(Number(currentProject.deadline) * 1000).toLocaleDateString()}</p>
            <p className="mb-2"><strong>Completado:</strong> {currentProject.completed ? "Sí" : "No"}</p>
            <p className="mb-2"><strong>Pagado:</strong> {currentProject.paid ? "Sí" : "No"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
