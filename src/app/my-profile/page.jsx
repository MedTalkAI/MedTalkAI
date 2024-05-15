"use client";

import Navbar from "@/components/Navbar";
import Style from "./MyProfile.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CheckAuthExpiration from "@/hooks/CheckAuthExpiration";

const MyProfile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState({});
  const [buttonSelected, setButtonSelected] = useState(null);

  const router = useRouter();

  const nameRef = useRef();
  const emailRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();

  const updateProfile = async () => {
    setIsModalOpen(false);
    const formData = new FormData();
    formData.append("name", nameRef.current.value);
    formData.append("email", emailRef.current.value);
    formData.append("username", usernameRef.current.value);
    formData.append("password", passwordRef.current.value);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/update`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${
            typeof window !== "undefined" && window.localStorage
              ? localStorage.getItem("access_token")
              : ""
          }`,
        },
        body: formData,
      }
    );

    if (response.status === 201) {
      toast.success("Profile updated successfully!");
    }
  };

  const handleDelete = async () => {
    setIsModalOpen(false);
    const formData = new FormData();
    formData.append("username", user.username);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/delete`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${
            typeof window !== "undefined" && window.localStorage
              ? localStorage.getItem("access_token")
              : ""
          }`,
        },
        body: formData,
      }
    );

    if (response.status === 204) {
      toast.success("Account deleted successfully!");
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_type");
      }
      router.push("/");
    }
  };

  const handleDo = () => {
    if (buttonSelected === "delete") {
      handleDelete();
    } else {
      updateProfile();
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
    }
    router.push("/");
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storagedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storagedUser);
      console.log(storagedUser.username);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            typeof window !== "undefined" && window.localStorage
              ? localStorage.getItem("access_token")
              : ""
          }`,
        },
      }).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            setUser(data);
          });
        }
      });
    }
  }, []);

  return (
    <div>
      <Navbar path="/my-profile" />
      <div className={Style.content}>
        <CheckAuthExpiration />
        <ToastContainer />
        <main>
          <div className={Style.profile}>
            <div className={Style.info}>
              <div>
                <h3>Your information</h3>
                <p>
                  This is your personal information. If you want to update,
                  change the specific value and the save it.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setButtonSelected("delete");
                }}
              >
                DELETE ACCOUNT
              </button>
            </div>
            <form>
              <div className={Style.input}>
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  className="name"
                  value={user.name}
                  onChange={(e) => {
                    setUser({ ...user, name: e.target.value });
                  }}
                  ref={nameRef}
                />
              </div>
              <div className={Style.input}>
                <label htmlFor="email">Your Email</label>
                <input
                  type="email"
                  id="email"
                  className="email"
                  value={user.email}
                  onChange={(e) => {
                    setUser({ ...user, email: e.target.value });
                  }}
                  ref={emailRef}
                />
              </div>
              <div className={Style.input}>
                <label htmlFor="username">Your Username</label>
                <input
                  type="text"
                  id="username"
                  className="username"
                  value={user.username}
                  onChange={(e) => {
                    setUser({ ...user, username: e.target.value });
                  }}
                  ref={usernameRef}
                />
              </div>
              <div className={Style.input}>
                <label htmlFor="password">Redefine Your Password</label>
                <input
                  type="password"
                  id="password"
                  className="password"
                  placeholder="**************"
                  ref={passwordRef}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "end" }}>
                <button
                  className={Style.button}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsModalOpen(true);
                    setButtonSelected("update");
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
          <div className={Style.Logout}>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </main>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCancel}
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
        {buttonSelected === "delete" ? (
          <>
            <h2>Deletion Confirmation</h2>
            <p>Are you sure you want to delete your account?</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className={Style.buttonOk} onClick={handleDo}>
                Yes
              </button>
              <button className={Style.buttonCancel} onClick={handleCancel}>
                No
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Update Confirmation</h2>
            <p>Are you sure you want to update your account?</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className={Style.buttonOk} onClick={handleDo}>
                Yes
              </button>
              <button className={Style.buttonCancel} onClick={handleCancel}>
                No
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MyProfile;
