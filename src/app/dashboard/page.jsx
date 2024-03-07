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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateModelStandard = () => {
    if (!defaultModel) {
      toast.error("Default model is not selected");
      return;
    }

    fetch(`http://localhost:5000/models/${defaultModel.id}`, {
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
    fetch("http://localhost:5000/models", {
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
                <ModelStatistics key={model.id} statistics={model} />
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
