<!--
This README is formatted for GitHub.
-->

# SigNoz Datasource for Grafana

[![CI](https://github.com/mannprerak2/signoz-datasource/actions/workflows/ci.yml/badge.svg)](https://github.com/mannprerak2/signoz-datasource/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/mannprerak2/signoz-datasource)](LICENSE)

This is an open-source Grafana data source plugin that allows you to connect to [SigNoz](https://signoz.io/).

With this plugin, you can query and visualize data from SigNoz directly within your Grafana dashboards, combining the power of Grafana's visualization with SigNoz's comprehensive observability data.

## ✨ Features

> Note: you may find a lot of things incomplete compared to Signoz UI, feel free to contribute to this plugin.

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Data Sources** | | |
| Traces | ✅ Supported | Query trace data from SigNoz. |
| Metrics | ❌ Not Yet | Planned for a future release. |
| Logs | ❌ Not Yet | Planned for a future release. |
| **Querying** | | |
| Query Builder | ✅ Supported | Build queries using a visual interface. |
| ClickHouse SQL | ❌ Not Yet | Direct SQL querying is planned. |
| PromQL | ❌ Not Yet | PromQL support is planned. |
| **Visualizations** | | |
| Graph Panel | ✅ Supported | Visualize time-series data. |
| Table Panel | ❌ Not Yet | Planned for a future release. |
| Trace View | ❌ Not Yet | Planned for a future release. |
| Template Variables | ✅ Supported | Create dynamic dashboards. |

## 📋 Requirements

*   **Grafana 9.0+**
*   A running instance of **SigNoz**.

## 🚀 Getting Started

1.  **Install the plugin**:
    *   The easiest way is to use the [Grafana Plugin Catalog](https://grafana.com/grafana/plugins/).
    *   Alternatively, you can download the latest release from the [Releases](https://github.com/mannprerak2/mannprerak2-signoz-datasource/releases) page and manually install it.

2.  **Configure the data source**:
    *   In Grafana, navigate to **Configuration > Data Sources**.
    *   Click **Add data source** and search for "SigNoz".
    *   Enter the URL for your SigNoz query service (e.g., `https://signoz.yourdomain.com`).
    *   Click **Save & Test** to verify the connection.

## 👨‍💻 Development

This project is built using the Grafana plugin tools. We welcome contributions!

### Prerequisites

*   Node.js v20+
*   npm
*   Docker

### Quickstart

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mannprerak2/signoz-datasource.git
    cd signoz-datasource
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the plugin:**
    *   For development (with watch mode):
        ```bash
        npm run dev
        ```
    *   For a production build:
        ```bash
        npm run build
        ```

4.  **Run a local Grafana for testing:**
    This command spins up a Grafana instance with the plugin pre-installed.
    ```bash
    npm run server
    ```
    You can then access Grafana at `http://localhost:3000`.

### Other Commands

*   **Run unit tests:** `npm run test`
*   **Run end-to-end tests:** `npm run e2e`
*   **Lint files:** `npm run lint` or `npm run lint:fix`

## 🤝 Contributing

We welcome contributions! If you'd like to contribute, please:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and ensure tests pass.
4.  Submit a pull request with a clear description of your changes.

Please open an issue to discuss any significant changes before starting work.

## 📜 License

This project is licensed under the Apache-2.0 License - see the LICENSE file for details.
