import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";

// SellerRegisterModal component
function SellerRegisterModal({ application, onClose, onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistering(true);
    setError("");
    try {
      // You should have a backend endpoint for registering sellers
      const res = await fetch("/api/sellers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: application.email,
          username,
          password,
          businessName: application.businessName,
          ownerName: application.ownerName,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Registration failed");
        setRegistering(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        setRegistering(false);
        setSuccess(false);
        onRegister && onRegister();
        onClose();
      }, 1200);
    } catch {
      setError("Registration failed");
      setRegistering(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.5)",
      zIndex: 4000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        minWidth: 350,
        padding: 32,
        position: "relative",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12,
            background: "none", border: "none", fontSize: 22, color: "#9b1c23", cursor: "pointer"
          }}
          aria-label="Close"
        >×</button>
        <h2 style={{ color: "#9b1c23", marginBottom: 18, textAlign: "center" }}>
          Register Seller Account
        </h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <b>Business:</b> {application.businessName}
            <br />
            <b>Email:</b> {application.email}
          </div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #e9c4b4",
              fontSize: 16,
              marginBottom: 8
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #e9c4b4",
              fontSize: 16,
              marginBottom: 8
            }}
          />
          {error && <div style={{ color: "white", marginBottom: 8 }}>{error}</div>}
          <button
            type="submit"
            style={{
              background: "#e1bb3e",
              color: "#350b0f",
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              fontWeight: 700,
              fontSize: 18,
              cursor: registering ? "not-allowed" : "pointer",
              opacity: registering ? 0.7 : 1
            }}
            disabled={registering}
          >
            {registering ? "Registering..." : "Register"}
          </button>
          {success && (
            <div style={{ color: "#2e7d32", marginTop: 8, textAlign: "center" }}>
              Seller registered!
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [licenseUrl, setLicenseUrl] = useState(null);
  const [statusDropdown, setStatusDropdown] = useState(null); // app._id of open dropdown
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "approved" | "rejected"
  const [showSellerRegister, setShowSellerRegister] = useState(null); // application object

  // Dropdown state and refs
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const statusBtnRefs = useRef({});

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!statusDropdown) return;
    const handleClick = (e) => {
      // If click is inside the dropdown, do nothing
      const dropdown = document.getElementById("status-dropdown-portal");
      if (dropdown && dropdown.contains(e.target)) return;
      setStatusDropdown(null);
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setStatusDropdown(null);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [statusDropdown]);

  useEffect(() => {
    // Fetch all seller applications from backend
    async function fetchApplications() {
      setLoading(true);
      try {
        const res = await fetch("/api/seller/applications");
        const data = await res.json();
        setApplications(data);
      } catch {
        setApplications([]);
      }
      setLoading(false);
    }
    fetchApplications();
  }, []);

  // Seller access control
  useEffect(() => {
    // Only allow access if:
    // - user is admin (isAdmin: true in localStorage)
    // - OR user is a seller (username ends with "seller" and logged in via seller login)
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem("loggedInUser"));
      } catch {
        return null;
      }
    })();

    // If not admin and not seller, redirect or block
    if (
      !user ||
      (
        !user.isAdmin &&
        !(user.username && user.username.toLowerCase().endsWith("seller") && user.isSeller)
      )
    ) {
      window.location.href = "/"; // or show a message/redirect elsewhere
    }
  }, []);

  // Helper to resolve file path for local uploads
  const getLicenseFileUrl = (filePath) => {
    if (!filePath) return "";
    // If already absolute (e.g. S3 or GCS), return as is
    if (/^https?:\/\//.test(filePath)) return filePath;
    // Otherwise, serve from public folder
    return process.env.PUBLIC_URL + filePath;
  };

  // Handle status change
  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/seller/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setApplications(applications =>
          applications.map(app =>
            app._id === appId ? { ...app, status: newStatus } : app
          )
        );
        setStatusDropdown(null);
      } else {
        alert("Failed to update status");
      }
    } catch {
      alert("Failed to update status");
    }
  };

  // Split applications by status
  const pendingApps = applications.filter(app => !app.status || app.status === "Pending");
  const approvedApps = applications.filter(app => app.status === "Approved");
  const rejectedApps = applications.filter(app => app.status === "Rejected");

  // Table rendering helper
  const renderTable = (
    apps,
    showStatusDropdown = true,
    showRegister = false,
    statusDropdown,
    setStatusDropdown,
    dropdownPos,
    setDropdownPos,
    statusBtnRefs
  ) => {
    // Helper to open dropdown and set position
    const openDropdown = (appId) => {
      const btn = statusBtnRefs.current[appId];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
      setStatusDropdown(appId);
    };

    return (
      <div style={{
        overflowX: "auto",
        borderRadius: 16,
        background: "#181818",
        boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
        marginBottom: 32,
        border: "1.5px solid rgb(0, 0, 0)",
        padding: 0,
        minWidth: 900,
        maxWidth: "100%",
        position: "relative"
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          background: "none",
          borderRadius: 16,
          overflow: "hidden",
          fontFamily: '"Merriweather", serif',
        }}>
          <thead>
            <tr style={{
              background: "linear-gradient(90deg,rgb(26, 26, 26) 0%,rgb(26, 26, 26) 100%)",
              color: "#e1bb3e",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: 0.5,
            }}>
              <th style={{ padding: "16px 10px", border: "none", textAlign: "left" }}>Business Name</th>
              <th style={{ padding: "16px 10px", border: "none", textAlign: "left" }}>Owner</th>
              <th style={{ padding: "16px 10px", border: "none", textAlign: "left" }}>Email</th>
              <th style={{ padding: "16px 10px", border: "none", textAlign: "left" }}>Business Type</th>
              <th style={{ padding: "16px 10px", border: "none", textAlign: "left" }}>Product Types</th>
              <th style={{ padding: "16px 10px", border: "none", textAlign: "left" }}>Website/SocialMedia</th>
              <th style={{ padding: "16px 10px", border: "none", textAlign: "left" }}>License</th>
              <th style={{ padding: "16px 10px", border: "none", textAlign: "left" }}>Submitted</th>
              <th style={{ padding: "16px 10px", border: "none", textAlign: "left" }}>Status</th>
              {showRegister && (
                <th style={{ padding: "16px 10px", border: "none", textAlign: "left" }}>Register</th>
              )}
            </tr>
          </thead>
          <tbody>
            {apps.map((app, idx) => (
              <tr
                key={app._id}
                style={{
                  background: idx % 2 === 0 ? "#1a0406" : "#181818",
                  color: "#fff",
                  fontSize: 15,
                  transition: "background 0.2s",
                  borderRadius: 12,
                  boxShadow: idx % 2 === 0 ? "0 1px 0rgb(255, 255, 255)" : "none",
                }}
                onMouseOver={e => e.currentTarget.style.background = "#2a070b"}
                onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? "#1a0406" : "#181818"}
              >
                <td style={{ padding: "14px 10px", border: "none", fontWeight: 600, color: "#fff" }}>{app.businessName}</td>
                <td style={{ padding: "14px 10px", border: "none" }}>{app.ownerName}</td>
                <td style={{ padding: "14px 10px", border: "none" }}>{app.email}</td>
                <td style={{ padding: "14px 10px", border: "none" }}>{app.businessType}</td>
                <td style={{ padding: "14px 10px", border: "none" }}>{app.productTypes}</td>
                <td style={{ padding: "14px 10px", border: "none" }}>
                  {app.website ? (
                    <a href={app.website} target="_blank" rel="noopener noreferrer"
                      style={{
                        color: "#fff",
                        textDecoration: "underline",
                        fontWeight: 500,
                        wordBreak: "break-all"
                      }}>
                      {app.website}
                    </a>
                  ) : "-"
                  }
                </td>
                <td style={{ padding: "14px 10px", border: "none" }}>
                  {app.liquorLicenseFile && (
                    <button
                      style={{
                        background: "linear-gradient(90deg, #e1bb3e 60%, #e1bb3e 100%)",
                        color: "#350b0f",
                        border: "none",
                        borderRadius: 8,
                        padding: "7px 18px",
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: "pointer",
                        boxShadow: "inset 2px 2px 6px #fff3, inset -2px -2px 6px #0007",
                        transition: "background 0.2s"
                      }}
                      onClick={() => setLicenseUrl(getLicenseFileUrl(app.liquorLicenseFile))}
                    >
                      View
                    </button>
                  )}
                </td>
                <td style={{ padding: "14px 10px", border: "none", color: "#fff" }}>
                  {new Date(app.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: "14px 10px", border: "none", position: "relative" }}>
                  {showStatusDropdown ? (
                    <>
                      <button
                        ref={el => statusBtnRefs.current[app._id] = el}
                        style={{
                          background: app.status === "Approved"
                            ? "linear-gradient(90deg,rgb(62, 225, 62) 60%, rgb(62, 225, 62)100%)"
                            : app.status === "Rejected"
                              ? "linear-gradient(90deg, #9b1c23 60%, #e35537 100%)"
                              : "#e1bb3e",
                          color: app.status === "Rejected" ? "#fff" : "#350b0f",
                          border: "none",
                          borderRadius: 8,
                          padding: "7px 18px",
                          fontWeight: 700,
                          fontSize: 15,
                          cursor: "pointer",
                          minWidth: 100,
                          boxShadow: "inset 2px 2px 6px #fff3, inset -2px -2px 6px #0007",
                          transition: "background 0.2s"
                        }}
                        onClick={() => openDropdown(app._id)}
                      >
                        {app.status || "Pending"}
                      </button>
                      {/* Portal for dropdown */}
                      {statusDropdown === app._id && ReactDOM.createPortal(
                        <div
                          id="status-dropdown-portal"
                          style={{
                            position: "absolute",
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                            minWidth: dropdownPos.width,
                            background: "#fff",
                            border: "1.5px solid #e1bb3e",
                            borderRadius: 8,
                            zIndex: 9999,
                            boxShadow: "0 2px 16px rgba(0,0,0,0.28)",
                            overflow: "hidden"
                          }}
                        >
                          {["Approved", "Rejected"].map(status => (
                            <button
                              key={status}
                              style={{
                                display: "block",
                                width: "100%",
                                background: "none",
                                border: "none",
                                color: "#350b0f",
                                fontWeight: 700,
                                padding: "12px 0",
                                cursor: "pointer",
                                borderBottom: status === "Rejected" ? "none" : "1px solid #eee",
                                fontSize: 15,
                                transition: "background 0.2s",
                              }}
                              onClick={() => { handleStatusChange(app._id, status); setStatusDropdown(null); }}
                              disabled={app.status === status}
                              onMouseOver={e => e.currentTarget.style.background = "#e1bb3e22"}
                              onMouseOut={e => e.currentTarget.style.background = "none"}
                            >
                              {status}
                            </button>
                          ))}
                        </div>,
                        document.body
                      )}
                    </>
                  ) : (
                    <span style={{
                      color: app.status === "Approved" ? "#429b22" : app.status === "Rejected" ? "#e35537" : "#fff",
                      fontWeight: 700
                    }}>{app.status}</span>
                  )}
                </td>
                {showRegister && (
                  <td style={{ padding: "14px 10px", border: "none" }}>
                    <button
                      style={{
                        background: "linear-gradient(90deg,rgb(121, 155, 34) 60%, rgb(121, 155, 34) 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "7px 18px",
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: "pointer",
                        boxShadow: "inset 2px 2px 6px #fff3, inset -2px -2px 6px #0007",
                        transition: "background 0.2s"
                      }}
                      onClick={() => setShowSellerRegister(app)}
                    >
                      Register
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{
      padding: 32,
      minHeight: "100vh",
      background: "#000",
      color: "#fff"
    }}>
      <h2 style={{ color: "#e1bb3e", marginBottom: 24 }}>Seller Applications</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <button
          style={{
            background: activeTab === "pending" ? "#e1bb3e" : "#222",
            color: activeTab === "pending" ? "#350b0f" : "#e1bb3e",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer"
          }}
          onClick={() => setActiveTab("pending")}
        >
          Pending Applications
        </button>
        <button
          style={{
            background: activeTab === "approved" ? "#e1bb3e" : "#222",
            color: activeTab === "approved" ? "#350b0f" : "#e1bb3e",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer"
          }}
          onClick={() => setActiveTab("approved")}
        >
          Accepted Applications
        </button>
        <button
          style={{
            background: activeTab === "rejected" ? "#e1bb3e" : "#222",
            color: activeTab === "rejected" ? "#350b0f" : "#e1bb3e",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer"
          }}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected Applications
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {activeTab === "pending" &&
            renderTable(
              pendingApps,
              true,
              false,
              statusDropdown,
              setStatusDropdown,
              dropdownPos,
              setDropdownPos,
              statusBtnRefs
            )}
          {activeTab === "approved" &&
            renderTable(
              approvedApps,
              false,
              true,
              statusDropdown,
              setStatusDropdown,
              dropdownPos,
              setDropdownPos,
              statusBtnRefs
            )}
          {activeTab === "rejected" &&
            renderTable(
              rejectedApps,
              false,
              false,
              statusDropdown,
              setStatusDropdown,
              dropdownPos,
              setDropdownPos,
              statusBtnRefs
            )}
        </>
      )}
      {/* License popup */}
      {licenseUrl && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.85)",
          zIndex: 3000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "#222",
            borderRadius: 12,
            padding: 24,
            maxWidth: "90vw",
            maxHeight: "90vh",
            position: "relative",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
          }}>
            <button
              onClick={() => setLicenseUrl(null)}
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                background: "#e1bb3e",
                color: "#350b0f",
                border: "none",
                borderRadius: 8,
                padding: "6px 18px",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer"
              }}
            >
              Close
            </button>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ color: "#e1bb3e", marginBottom: 16 }}>Liquor License Upload</h3>
              {/* Show image or PDF */}
              {licenseUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img
                  src={licenseUrl}
                  alt="Liquor License"
                  style={{ maxWidth: "80vw", maxHeight: "70vh", borderRadius: 8, background: "#fff" }}
                />
              ) : (
                <iframe
                  src={licenseUrl}
                  title="Liquor License"
                  style={{ width: "80vw", height: "70vh", border: "none", background: "#fff", borderRadius: 8 }}
                />
              )}
            </div>
          </div>
        </div>
      )}
      {/* Seller Register Modal */}
      {showSellerRegister && (
        <SellerRegisterModal
          application={showSellerRegister}
          onClose={() => setShowSellerRegister(null)}
          onRegister={() => {
            // Optionally refresh applications or show a toast
          }}
        />
      )}
    </div>
  );
}
