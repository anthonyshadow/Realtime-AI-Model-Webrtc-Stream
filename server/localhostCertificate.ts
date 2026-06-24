import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type LocalhostCertificate = {
  key: Buffer;
  cert: Buffer;
};

const CERT_DIR = ".cert";
const KEY_FILE = "localhost.key";
const CERT_FILE = "localhost.crt";

export function getLocalhostCertificate(projectRoot: string): LocalhostCertificate {
  const certDir = path.join(projectRoot, CERT_DIR);
  const keyPath = path.join(certDir, KEY_FILE);
  const certPath = path.join(certDir, CERT_FILE);

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    createLocalhostCertificate(certDir, keyPath, certPath);
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
}

function createLocalhostCertificate(certDir: string, keyPath: string, certPath: string) {
  fs.mkdirSync(certDir, { recursive: true });

  try {
    execFileSync(
      "openssl",
      [
        "req",
        "-x509",
        "-newkey",
        "rsa:2048",
        "-nodes",
        "-sha256",
        "-days",
        "365",
        "-keyout",
        keyPath,
        "-out",
        certPath,
        "-subj",
        "/CN=localhost",
        "-addext",
        "subjectAltName=DNS:localhost,IP:127.0.0.1",
      ],
      { stdio: "ignore" },
    );
  } catch (error) {
    throw new Error(
      "Could not create a local HTTPS certificate. Install openssl or add .cert/localhost.key and .cert/localhost.crt manually.",
      { cause: error },
    );
  }
}
