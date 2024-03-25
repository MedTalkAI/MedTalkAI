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
  const [benchmarks, setBenchmarks] = useState([]);
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
  const fetchBenchmarks = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/transcriptions/model/${defaultModel.id}}`
        );
        if (response.ok) {
          const data = await response.json();
          setBenchmarks(data);
        } else {
          throw new Error("Failed to fetch benchmarks");
        }
      } catch (error) {
        console.error('Failed to fetch benchmarks:', error);
      }
    };
    
    useEffect(() => {
      fetchBenchmarks();
    }, []);
  
    const csvData = [
      {
        ID: "ID",
        Audio_Source: "Audio_Source",
        Model_ID: "Model_ID",
        Transcription: "Transcription",
        Date: "Date",
        Kappa: "Kappa",
        User_ID: "User_ID",
        Anamnese_ID: "Anamnese_ID",
        Corrections_Quantity: "Corrections_Quantity",
        Latest_Correction: "Latest_Correction",
        WER: "WER",
        BLEU: "BLEU",
        COSINE_SIMILARITY: "COSINE_SIMILARITY"
      },
        benchmarks.map(benchmark => ({
        ID: benchmark.id,
        Audio_Source: benchmark.audio_src,
        Model_ID: benchmark.model_id,
        Transcription: benchmark.transcription,
        Date: benchmark.date,
        Kappa: benchmark.kappa,
        User_ID: benchmark.user_id,
        Anamnese_ID: benchmark.anamnese_id,
        Corrections_Quantity: benchmark.corrections_quantity,
        Latest_Correction: benchmark.latest_correction,
        WER: parseFloat(benchmark.wer).toFixed(2),
        BLEU: parseFloat(benchmark.bleu).toFixed(2),
        COSINE_SIMILARITY: parseFloat(benchmark.cosine).toFixed(2)
      }))
    ];
    //até aqui, isso era só testes.
    

  return (
    <div className={Style.Dashboard}>
      <Navbar path="/dashboard" />
      <div className={Style.content}>
        <ToastContainer />
        <main>
          <div className={Style.sides}>
            <h1 className={Style.title}>Model Dashboard</h1>
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
          <div className={Style.models}>
            <div className={Style.modelStatistics}>
              {models.map((model) => (
                <ModelStatistics key={model.id} statistics={model} tableData={csvData} />//ver como passo o dado pro componente
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
