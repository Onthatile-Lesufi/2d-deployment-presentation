import React, { useEffect, useState } from "react";

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
          {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
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
  const renderTable = (apps, showStatusDropdown = true, showRegister = false) => (
    <table style={{ width: "100%", borderCollapse: "collapse", background: "#181818" }}>
      <thead>
        <tr style={{ background: "#222" }}>
          <th style={{ padding: 8, border: "1px solid #444", color: "#e1bb3e" }}>Business Name</th>
          <th style={{ padding: 8, border: "1px solid #444", color: "#e1bb3e" }}>Owner</th>
          <th style={{ padding: 8, border: "1px solid #444", color: "#e1bb3e" }}>Email</th>
          <th style={{ padding: 8, border: "1px solid #444", color: "#e1bb3e" }}>Business Type</th>
          <th style={{ padding: 8, border: "1px solid #444", color: "#e1bb3e" }}>Product Types</th>
          <th style={{ padding: 8, border: "1px solid #444", color: "#e1bb3e" }}>Website/SocialMedia</th>
          <th style={{ padding: 8, border: "1px solid #444", color: "#e1bb3e" }}>License</th>
          <th style={{ padding: 8, border: "1px solid #444", color: "#e1bb3e" }}>Submitted</th>
          <th style={{ padding: 8, border: "1px solid #444", color: "#e1bb3e" }}>Status</th>
          {showRegister && (
            <th style={{ padding: 8, border: "1px solid #444", color: "#e1bb3e" }}>Register</th>
          )}
        </tr>
      </thead>
      <tbody>
        {apps.map(app => (
          <tr key={app._id} style={{ background: "#111" }}>
            <td style={{ padding: 8, border: "1px solid #333", color: "#fff" }}>{app.businessName}</td>
            <td style={{ padding: 8, border: "1px solid #333", color: "#fff" }}>{app.ownerName}</td>
            <td style={{ padding: 8, border: "1px solid #333", color: "#fff" }}>{app.email}</td>
            <td style={{ padding: 8, border: "1px solid #333", color: "#fff" }}>{app.businessType}</td>
            <td style={{ padding: 8, border: "1px solid #333", color: "#fff" }}>{app.productTypes}</td>
            <td style={{ padding: 8, border: "1px solid #333" }}>
              {app.website ? (
                <a href={app.website} target="_blank" rel="noopener noreferrer" style={{ color: "#e1bb3e" }}>
                  {app.website}
                </a>
              ) : "-"}
            </td>
            <td style={{ padding: 8, border: "1px solid #333" }}>
              {app.liquorLicenseFile && (
                <button
                  style={{
                    background: "#e1bb3e",
                    color: "#350b0f",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 14px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                  onClick={() => setLicenseUrl(getLicenseFileUrl(app.liquorLicenseFile))}
                >
                  View
                </button>
              )}
            </td>
            <td style={{ padding: 8, border: "1px solid #333", color: "#fff" }}>
              {new Date(app.createdAt).toLocaleString()}
            </td>
            <td style={{ padding: 8, border: "1px solid #333", color: "#e1bb3e", position: "relative" }}>
              {showStatusDropdown ? (
                <>
                  <button
                    style={{
                      background: "#e1bb3e",
                      color: "#350b0f",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 18px",
                      fontWeight: 700,
                      cursor: "pointer",
                      minWidth: 100
                    }}
                    onClick={() => setStatusDropdown(statusDropdown === app._id ? null : app._id)}
                  >
                    {app.status || "Pending"}
                  </button>
                  {statusDropdown === app._id && (
                    <div
                      style={{
                        position: "absolute",
                        top: "110%",
                        left: 0,
                        background: "#fff",
                        border: "1px solid #e1bb3e",
                        borderRadius: 6,
                        zIndex: 10,
                        minWidth: 120,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.18)"
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
                            padding: "10px 0",
                            cursor: "pointer",
                            borderBottom: status === "Rejected" ? "none" : "1px solid #eee"
                          }}
                          onClick={() => handleStatusChange(app._id, status)}
                          disabled={app.status === status}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <span>{app.status}</span>
              )}
            </td>
            {showRegister && (
              <td style={{ padding: 8, border: "1px solid #333" }}>
                <button
                  style={{
                    background: "#2d6cdf",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 18px",
                    fontWeight: 700,
                    cursor: "pointer"
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
  );

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
          {activeTab === "pending" && renderTable(pendingApps, true, false)}
          {activeTab === "approved" && renderTable(approvedApps, false, true)}
          {activeTab === "rejected" && renderTable(rejectedApps, false, false)}
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

// After successful seller login, set isSeller: true in localStorage
// Example login handler:
const handleSellerLogin = async (e) => {
  e.preventDefault();
  // ...existing code for login...
  // On successful login:
  localStorage.setItem(
    "loggedInUser",
    JSON.stringify({
      username: sellerUsername,
      email: sellerEmail,
      isSeller: true
    })
  );
  // ...existing code...
};