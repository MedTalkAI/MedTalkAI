"use client";

import Navbar from "@/components/Navbar";
import Style from "./Dashboard.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import ModelStatistics from "@/components/ModelStatistics";
import Modal from "react-modal";

const Dashboard = () => {
  const [defaultModel, setDefaultModel] = useState(null);
  const [models, setModels] = useState([]);
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
        Authorization: `Bearer ${typeof window !== "undefined" && window.localStorage
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
        console.log(data);
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/models`, {
      headers: {
        Authorization: `Bearer ${typeof window !== "undefined" && window.localStorage
          ? localStorage.getItem("access_token")
          : ""
          }`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (models.length === 0) {
          setModels(data);
          console.log(data.find((model) => model.standard));
          setDefaultModel(data.find((model) => model.standard));
        }
      });

    const standard = models.find((model) => model.standard);
    if (standard) {
      setDefaultModel(standard);
    }
  }, []);

  useEffect(() => {
    console.log("models");
    console.log(JSON.stringify(models));
  }, [models]);

  //já que preciso tratar como blob irei modificar aqui.
  function saveCsv(id) {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/models/${id}/csv`, {
    headers: {
      Authorization: `Bearer ${typeof window !== "undefined" && window.localStorage
        ? localStorage.getItem("access_token")
        : ""
        }`,
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao obter o arquivo');
      }
      return response.text(); // Obter o conteúdo do arquivo como texto
    })
    .then(csvContent => {
      // Cria um link temporário para download do arquivo
      const url = window.URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'arquivo.csv');
      // Adiciona o link ao documento e aciona o clique para iniciar o download
      document.body.appendChild(link);
      link.click();
      // Remove o link do documento
      document.body.removeChild(link);
    })
    .catch(error => {
      console.error('Erro:', error);
    });
}
const handleBenchmark = () => {
  //implementar 
};



  return (
    <div className={Style.Dashboard}>
      <Navbar path="/dashboard" />
      <div className={Style.content}>
        <ToastContainer />
        <main>
          <div className={Style.sides}>
            <h1 className={Style.title}>Model Dashboard</h1>
            <div className={Style.benchmarkAndGroupSelect}>
              <button onClick={()=>handleBenchmark()} className={Style.exportarBenchmark}>
                Benchmark
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
          </div>
          <div className={Style.models}>
            <div className={Style.modelStatistics}>
              {models.map((model) => (
                <ModelStatistics key={model.id} statistics={model} onCsvDownloader={saveCsv} />
              ))}
            </div>
          </div>
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
