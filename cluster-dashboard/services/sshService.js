const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const os = require('os');

class SshService {
  /**
   * Sifre veya SSH Key ile uzaktaki Linux sunucusunda komut calistirir
   */
  async execute({ host, port = 22, username = 'root', password, privateKeyPath, command, onLog = () => {} }) {
    return new Promise((resolve, reject) => {
      const conn = new Client();

      conn.on('ready', () => {
        onLog(`[SSH] ${host}:${port} sunucusuna bağlanıldı. Komut yürütülüyor...`);
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          stream.on('close', (code) => {
            conn.end();
            if (code === 0) {
              resolve(true);
            } else {
              reject(new Error(`Komut hata kodu ${code} ile sonlandı.`));
            }
          });

          stream.on('data', (data) => {
            onLog(data.toString());
          });

          stream.stderr.on('data', (data) => {
            onLog(data.toString());
          });
        });
      });

      conn.on('error', (err) => {
        reject(err);
      });

      conn.on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
        if (prompts && prompts.length > 0) {
          finish(prompts.map(() => password || ''));
        } else {
          finish([password || '']);
        }
      });

      const config = {
        host,
        port: parseInt(port, 10) || 22,
        username,
        readyTimeout: 30000
      };

      if (password) {
        config.password = password;
        config.tryKeyboard = true;
      }

      // Eger yerel key varsa ekle
      let keyFile = privateKeyPath;
      if (!keyFile) {
        const edKey = path.join(os.homedir(), '.ssh', 'id_ed25519');
        const rsaKey = path.join(os.homedir(), '.ssh', 'id_rsa');
        if (fs.existsSync(edKey)) keyFile = edKey;
        else if (fs.existsSync(rsaKey)) keyFile = rsaKey;
      }

      if (keyFile && fs.existsSync(keyFile)) {
        try {
          config.privateKey = fs.readFileSync(keyFile);
        } catch {}
      }

      conn.connect(config);
    });
  }

  /**
   * Uzaktaki sunucuda komut calistirip ciktisini (stdout) yakalar
   */
  async execCapture({ host, port = 22, username = 'root', password, privateKeyPath, command }) {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let stdout = '';
      let stderr = '';

      conn.on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          stream.on('close', (code) => {
            conn.end();
            resolve({ code, stdout, stderr });
          });

          stream.on('data', (data) => {
            stdout += data.toString();
          });

          stream.stderr.on('data', (data) => {
            stderr += data.toString();
          });
        });
      });

      conn.on('error', (err) => {
        reject(err);
      });

      conn.on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
        if (prompts && prompts.length > 0) {
          finish(prompts.map(() => password || ''));
        } else {
          finish([password || '']);
        }
      });

      const config = {
        host,
        port: parseInt(port, 10) || 22,
        username,
        readyTimeout: 15000
      };

      if (password) {
        config.password = password;
        config.tryKeyboard = true;
      }

      let keyFile = privateKeyPath;
      if (!keyFile) {
        const edKey = path.join(os.homedir(), '.ssh', 'id_ed25519');
        const rsaKey = path.join(os.homedir(), '.ssh', 'id_rsa');
        if (fs.existsSync(edKey)) keyFile = edKey;
        else if (fs.existsSync(rsaKey)) keyFile = rsaKey;
      }

      if (keyFile && fs.existsSync(keyFile)) {
        try {
          config.privateKey = fs.readFileSync(keyFile);
        } catch {}
      }

      conn.connect(config);
    });
  }
}

module.exports = new SshService();
