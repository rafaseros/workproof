"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth/useScaffoldContractWrite";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const CreateProject: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [workerAddress, setWorkerAddress] = useState("");
  const [deadline, setDeadline] = useState("");

  const { data: yourContract } = useDeployedContractInfo("YourContract");

  const { writeAsync: approveUSDC, isLoading: isApproving } = useScaffoldContractWrite({
    contractName: "MockUSDC",
    functionName: "approve",
    args: [yourContract?.address, parseEther(paymentAmount || "0")],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Aprobación de USDC blockHash: ", txnReceipt.blockHash);
      alert("USDC aprobado exitosamente! Ahora puedes crear el proyecto.");
    },
  });

  const { writeAsync: createProjectAsync, isLoading: isCreatingProject } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "createProject",
    args: [title, description, parseEther(paymentAmount || "0"), workerAddress, BigInt(Math.floor(new Date(deadline).getTime() / 1000))],
    value: parseEther("0"), // Payment is now in USDC, not ETH
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash: ", txnReceipt.blockHash);
      alert("Proyecto creado exitosamente!");
      // Reset form fields
      setTitle("");
      setDescription("");
      setPaymentAmount("");
      setWorkerAddress("");
      setDeadline("");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectedAddress) {
      alert("Por favor, conecta tu billetera para crear un proyecto.");
      return;
    }
    if (!yourContract?.address) {
      alert("El contrato YourContract no está desplegado.");
      return;
    }

    try {
      // Primero, aprobar el gasto de USDC por parte del contrato YourContract
      await approveUSDC();
      // Luego, crear el proyecto
      await createProjectAsync();
    } catch (error) {
      console.error("Error al crear el proyecto:", error);
      alert("Error al crear el proyecto. Consulta la consola para más detalles.");
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">Crear Nuevo Proyecto</span>
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8 w-full max-w-md mx-auto">
          <input
            type="text"
            placeholder="Título del Proyecto"
            className="input input-bordered w-full"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Descripción del Proyecto"
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          ></textarea>
          <input
            type="number"
            placeholder="Monto de Pago (USDC)"
            className="input input-bordered w-full"
            value={paymentAmount}
            onChange={e => setPaymentAmount(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Dirección del Trabajador"
            className="input input-bordered w-full"
            value={workerAddress}
            onChange={e => setWorkerAddress(e.target.value)}
            required
          />
          <input
            type="date"
            placeholder="Fecha Límite"
            className="input input-bordered w-full"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary w-full" disabled={isApproving || isCreatingProject}>
            {isApproving ? "Aprobando USDC..." : isCreatingProject ? "Creando Proyecto..." : "Crear Proyecto"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
