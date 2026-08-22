import process from "node:process";
import readline from "node:readline";
import { getPayload } from "payload";
import config from "../payload.config";

const email = process.argv[2]?.trim();

if (!email) {
  console.error(
    "Email wajib diberikan. Contoh: pnpm --filter @ahi/cms create-admin admin@example.com",
  );
  process.exitCode = 1;
} else {
  try {
    const payload = await getPayload({ config });
    const existingUsers = await payload.find({
      collection: "users",
      limit: 1,
      overrideAccess: true,
    });

    if (existingUsers.totalDocs > 0) {
      console.error(
        "Bootstrap admin ditolak: database sudah memiliki setidaknya satu user.",
      );
      process.exitCode = 1;
    } else if (!process.stdin.isTTY || !process.stdout.isTTY) {
      console.error("Password harus dimasukkan melalui terminal interaktif.");
      process.exitCode = 1;
    } else {
      const password = await readHiddenPassword("Password admin: ");

      if (!password) {
        console.error("Password tidak boleh kosong.");
        process.exitCode = 1;
      } else {
        await payload.create({
          collection: "users",
          data: {
            _verified: true,
            email,
            password,
            name: "Administrator",
            role: "admin",
          },
          overrideAccess: true,
        });
        console.log(`Admin pertama berhasil dibuat untuk ${email}.`);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kesalahan tidak dikenal.";
    console.error(`Gagal membuat admin pertama: ${message}`);
    process.exitCode = 1;
  }
}

function readHiddenPassword(prompt) {
  return new Promise((resolve, reject) => {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdout.write(prompt);

    let password = "";

    const finish = (error) => {
      process.stdin.off("keypress", onKeypress);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");

      if (error) reject(error);
      else resolve(password);
    };

    const onKeypress = (character, key) => {
      if (key?.ctrl && key.name === "c") {
        finish(new Error("Pembuatan admin dibatalkan."));
      } else if (key?.name === "return" || key?.name === "enter") {
        finish();
      } else if (key?.name === "backspace") {
        password = password.slice(0, -1);
      } else if (character && !key?.ctrl && !key?.meta) {
        password += character;
      }
    };

    process.stdin.on("keypress", onKeypress);
  });
}
