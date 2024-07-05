"use client";

import Navbar from "@/components/Navbar";
import Style from "./Dashboard.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactLoading from "react-loading";
import { useEffect, useState } from "react";
import ModelStatistics from "@/components/ModelStatistics";
import Modal from "react-modal";
import CheckAuthExpiration from "@/hooks/CheckAuthExpiration";

const Dashboard = () => {
  const [defaultModel, setDefaultModel] = useState(null);
  const [standardModel, setStandardModel] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [csvContent, setCsvContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateModelStandard = () => {
    if (!defaultModel) {
      toast.error("Default model is not selected");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/models/${defaultModel.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          typeof window !== "undefined" && window.localStorage
            ? localStorage.getItem("access_token")
            : ""
        }`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update standard model");
        }
        return response.json();
      })
      .then((data) => {
        setStandardModel(JSON.parse(JSON.stringify(defaultModel)));
        toast.success("Standard model updated successfully");
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error updating standard model");
      })
      .finally(() => {
        setIsModalOpen(false);
      });
  };

  const handleConfirmUpdate = () => {
    updateModelStandard();
  };

  const handleCancelUpdate = () => {
    setDefaultModel(models.find((model) => model.standard));
    setIsModalOpen(false);
  };

  useEffect(() => {
    function getModels() {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/models`, {
        headers: {
          Authorization: `Bearer ${
            typeof window !== "undefined" && window.localStorage
              ? localStorage.getItem("access_token")
              : ""
          }`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (models.length === 0) {
            setModels(
              data.sort((a, b) => {
                if (a.standard === b.standard) {
                  return a.name.localeCompare(b.name); // Sort alphabetically by name
                }
                return a.standard ? -1 : 1; // Move standard models before non-standard ones
              })
            );
            setDefaultModel(data.find((model) => model.standard));
            setStandardModel(
              JSON.parse(JSON.stringify(data.find((model) => model.standard)))
            );
            setLoading(false);
          }
        });

      const standard = models.find((model) => model.standard);
      if (standard) {
        setDefaultModel(standard);
      }
    }

    getModels();

    const interval = setInterval(getModels, 120000); // 120000 milissegundos = 2 minutos
    return () => clearInterval(interval);
  }, [models]);

  function handleRecalculateMetrics() {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/models/recalculate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${
          typeof window !== "undefined" && window.localStorage
            ? localStorage.getItem("access_token")
            : ""
        }`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to recalculate metrics");
        }
        return response.json();
      })
      .then((data) => {
        // setModels(data);
        toast.success("Metrics recalculated successfully! Please Reload.");
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error recalculating metrics");
      });
  }

  //já que preciso tratar como blob irei modificar aqui.
  function saveCsv(id) {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/models/${id}/csv`, {
      headers: {
        Authorization: `Bearer ${
          typeof window !== "undefined" && window.localStorage
            ? localStorage.getItem("access_token")
            : ""
        }`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao obter o arquivo");
        }
        return response.text(); // Obter o conteúdo do arquivo como texto
      })
      .then((csvContent) => {
        // Cria um link temporário para download do arquivo
        const url = window.URL.createObjectURL(
          new Blob([csvContent], { type: "text/csv" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "arquivo.csv");
        // Adiciona o link ao documento e aciona o clique para iniciar o download
        document.body.appendChild(link);
        link.click();
        // Remove o link do documento
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Erro:", error);
      });
  }

  return (
    <div className={Style.Dashboard}>
      <Navbar path="/dashboard" />
      <div className={Style.content}>
        <CheckAuthExpiration />
        <ToastContainer />
        <main>
          <div className={Style.sides}>
            <h1 className={Style.title}>Model Dashboard</h1>
            {!loading && models.length != 0 && (
              <div className={Style.benchmarkAndGroupSelect}>
                <button
                  className={Style.benchmark}
                  onClick={handleRecalculateMetrics}
                >
                  <span class="material-symbols-outlined">analytics</span>
                  Recalculate Metrics
                </button>
                <div className={Style.groupSelect}>
                  <h2>Default Model</h2>
                  {models.length > 0 && (
                    <select
                      onChange={(e) => {
                        const selectedModel = models.find(
                          (model) => model.id == e.target.value
                        );
                        setDefaultModel(selectedModel);
                        setIsModalOpen(true);
                      }}
                      value={defaultModel ? defaultModel.id : ""}
                    >
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}
          </div>
          {loading && (
            <div className={Style.loading}>
              <ReactLoading
                type="spinningBubbles"
                color="#001D3B"
                height={"100px"}
                width={"100px"}
              />
              <p>Loading...</p>
            </div>
          )}
          {!loading && models.length == 0 && (
            <div className={Style.error}>
              <p>No models found.</p>
            </div>
          )}
          {!loading && models.length != 0 && (
            <div className={Style.models}>
              <div className={Style.modelStatistics}>
                {models.map((model) => (
                  <ModelStatistics
                    key={model.id}
                    model={model}
                    onCsvDownloader={saveCsv}
                    className={Style.modelItem}
                    isStandard={standardModel?.id === model.id}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCancelUpdate}
        contentLabel="Confirmação de Atualização"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "400px",
            height: "200px",
            margin: "auto",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            backgroundColor: "#fff",
          },
        }}
      >
        <h2>Update Standard Model</h2>
        <p>Are you sure you want to update the standard model?</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className={Style.buttonOk} onClick={handleConfirmUpdate}>
            Yes
          </button>
          <button className={Style.buttonCancel} onClick={handleCancelUpdate}>
            No
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
