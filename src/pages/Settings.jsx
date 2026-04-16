// pages/Settings.jsx
import Layout from "../components/Layout";
import "../styles/settings.css";

export default function Settings() {
  return (
    <Layout>
      <div className="settings-container">
        <h2 className="settings-title">Settings</h2>

        {/* Preferences */}
        <div className="settings-card">
          <h3>Preferences</h3>
          <br />
          <div className="checkbox-group">
            <input type="radio" name="mode" />
            <label>Light Mode</label>
          </div>

          <div className="checkbox-group">
            <input type="radio" name="mode" />
            <label>Dark Mode</label>
          </div>

          <button className="primary-btn">Save Preferences</button>
        </div>
      </div>
    </Layout>
  );
}
