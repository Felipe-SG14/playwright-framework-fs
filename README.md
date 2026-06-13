# Playwright Test Automation Core Framework

A reusable, highly scalable, and strictly typed test automation core built on top of Playwright and TypeScript. This framework is designed to be packaged and distributed as an independent Node.js library module, exposing a centralized API to abstract architectural complexity from consumer test repositories.

---

## Key Features

* **Encapsulated Architecture:** Controlled exports using modern Node.js conditional subpath exports.
* **Custom Fixture Wrappers:** Simplifies the test execution lifecycle via dependency injection.
* **Multi-Reporter Ready:** Out-of-the-box support for Playwright HTML, JUnit XML, and Allure results.
* **Strict Typing:** Designed under TypeScript rules for maximum runtime reliability.

---

## Dependencies

To keep the distribution package lightweight and prevent version misalignment in client environments, core dependencies are split strategically.

### Development Dependencies (Internal)
These tools are used to compile, type-check, and validate the framework during core development:
* `typescript`
* `@types/node`
* `allure-playwright`

### Peer Dependencies (Consumer Mandated)
The consuming project **must** host these dependencies in its root to avoid conflicting execution contexts:
* `@playwright/test`

---

## Installation Guide

Follow these steps to set up the framework locally for development or to configure a consumer machine.

### 1. Prerequisites
Ensure you have **Node.js** installed globally on your machine.
* **Recommended Version:** Node.js v20 or higher.
* Verify your installation by running:
    ```bash
    node -v
    npm -v
    ```

### 2. Framework Project Setup
Clone this repository, then install the internal developer dependencies using `npm`:
```bash
npm install
```

### 3. Global Allure CLI Installation (Required for Reporting)
To keep target test repositories clean, this framework offloads report compilation to the host machine. **Allure CLI must be installed globally** on the consumer's local machine or CI/CD runner to process test results.

#### Recommended Installation Method (Via Node.js/npm):
Since you already have Node.js installed, the easiest way to install Allure globally is using `npm`:
```bash
npm install -g allure-commandline
```

#### Choose the installation method for your Operating System:

* **Windows (Using Scoop):**
    ```powershell
    scoop install allure
    ```
* **macOS (Using Homebrew):**
    ```bash
    brew install allure
    ```
* **Linux (Debian/Ubuntu systems):**
    ```bash
    sudo apt-get install allure
    ```

Verify that the command-line tool is globally accessible by running:
```bash
allure --version
```