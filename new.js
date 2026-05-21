const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'log.txt');

// =========================
// LOG FUNCTION
// =========================
function log(msg) {
    const time = new Date().toLocaleString();
    const text = `[${time}] ${msg}\n`;
    console.log(text);
    fs.appendFile(LOG_FILE, text, () => {});
}

// =========================
// TYPING EFFECT (Reusable)
// =========================
async function typing(message, delay = 1500) {
    const chat = await message.getChat();
    await chat.sendStateTyping();
    await new Promise(resolve => setTimeout(resolve, delay));
}

// =========================
// CLIENT SETUP
// =========================
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "sdn1bot" // ganti kalau mau beda
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// =========================
// ANTI SPAM COOLDOWN
// =========================
const cooldown = new Map();
function isCooldown(user) {
    if (cooldown.has(user)) return true;
    cooldown.set(user, true);
    setTimeout(() => cooldown.delete(user), 5000);
    return false;
}

// =========================
// ADMIN LOAD
// =========================
let ADMIN_NUMBERS = [];
if (fs.existsSync('admin.txt')) {
    ADMIN_NUMBERS = fs.readFileSync('admin.txt', 'utf-8')
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);
}

// =========================
// STATE
// =========================
const daftarOnline = new Set();
const firstGreeting = new Set();
let lastSend = {}; // menyimpan waktu terakhir kirim gambar

const menu = `Terima kasih telah menghubungi *SDN 1 Sukamanah*.
Layanan Informasi Digital
Silakan pilih menu berikut:

1️⃣ Info sekolah
2️⃣ Pengumuman
3️⃣ Kontak sekolah
4️⃣ Penerimaan Murid Baru
5️⃣ Logo sekolah
6️⃣ Keunggulan Sekolah
7️⃣ Download File

🌐 Kunjungi website kami:
https://sdn1sukamanah.my.id/


Balas dengan angka sesuai menu.
Tekan 0 kapan saja untuk kembali.`;

// =========================
// EVENTS
// =========================
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Scan QR WhatsApp');
});

client.on('ready', () => {
    console.log('Bot siap digunakan!');
});

// =========================
// MAIN MESSAGE HANDLER
// =========================
async function kirimGreeting(user) {
    const media = MessageMedia.fromFilePath('./gambar/ucapan.jpg');

    await client.sendMessage(user, media, {
        caption: `👋 Selamat datang di layanan informasi digital
*SDN 1 Sukamanah*`
    });
}

client.on('message', async (message) => {

let sender = message.from;

if (sender.includes('@c.us')) {
    sender = sender.split('@')[0];
}

const text = message.body.trim().toLowerCase();

console.log("Admin list:", ADMIN_NUMBERS);
console.log("Sender:", sender);
console.log("FROM:", message.from);
console.log("AUTHOR:", message.author);
console.log("BODY:", message.body);

// =========================
// CEK JUMLAH PENDAFTAR
// =========================
if (text === '#jumlah') {

let web = 0;
let wa = 0;

if (fs.existsSync('ppdb_web.txt')) {
    const data = fs.readFileSync('ppdb_web.txt','utf8');
    web = (data.match(/Waktu:/g) || []).length;
}

if (fs.existsSync('daftar.txt')) {
    const data = fs.readFileSync('daftar.txt','utf8');
    wa = (data.match(/Waktu:/g) || []).length;
}

const total = web + wa;

await message.reply(
`📊 DATA PENDAFTAR PPDB

Total : ${total} pendaftar`
);

return;
}
// =========================
// PENDAFTARAN DARI WEBSITE
// =========================
if (message.body.trim().toUpperCase().startsWith('#PPDBWEB')) {

    const waktu = new Date().toLocaleString('id-ID');

    fs.appendFileSync('ppdb_web.txt',
`Waktu: ${waktu}
Data:
${message.body}
-------------------------
`);

  await message.reply(
`✅ Data pendaftaran telah diterima.

Terima kasih telah melakukan pendaftaran awal PPDB SDN 1 Sukamanah melalui website.

Selanjutnya, mohon orang tua/wali calon siswa datang langsung ke sekolah pada jam kerja untuk:

• Mengisi formulir pendaftaran lengkap
• Menyerahkan berkas persyaratan

Berkas yang perlu dibawa:
• Fotokopi Kartu Keluarga
• Fotokopi Akta Kelahiran

📍 Silakan datang ke SDN 1 Sukamanah pada hari dan jam kerja.

Jam pelayanan:
• Senin – Jumat
• 08.00 – 13.00 WIB

Terima kasih.`
    );

    // kirim notifikasi ke admin
    for (const admin of ADMIN_NUMBERS) {
    await client.sendMessage(admin + "@c.us",
`📢 PENDAFTAR PPDB DARI WEBSITE

${message.body}`
    );
}

    return;
}
    if (message.from.includes('@g.us')) return;

    if (isCooldown(message.from)) return;
	daftarOnline.add(message.from);

if (!firstGreeting.has(message.from)) {
    firstGreeting.add(message.from);
    await kirimGreeting(message.from);
    await typing(message,1500);
}
     

    // Kembali ke menu
    if (text === '0') {
    daftarOnline.delete(message.from);

    await message.reply(menu);
    return;
}

// Salam
if (
    text.includes('assalamualaikum') ||
    text.includes("assalamu'alaikum") ||
    text.includes('asalamualaikum') ||
    text.includes('assalamu alaikum') ||
    text === 'salam'
) {
    await message.reply("Wa'alaikumussalam Wr. Wb. 🙏");

    await typing(message,1500);

    await message.reply(menu);

    return;
}

    // MENU 1
    if (text === '1') {
        await typing(message);
        await message.reply(
`🏫 *SDN 1 SUKAMANAH*
📍 Jl. DR. Moch. Hatta No.252
🗺️ https://maps.app.goo.gl/g8LJ9wx391HQ1qTT9
⏰ Senin - Jumat 07.00 – 12.45
📷 IG: sdn1sukamanahcipedes
website: https://sdn1sukamanah.my.id/

Tekan 0 untuk kembali.`
        );
        return;
    }
// =========================
    // MENU 2 (PENGUMUMAN + GAMBAR RAMADAN TETAP ADA)
    // =========================
    if (text === '2') {

        const chat = await message.getChat();
        await chat.sendStateTyping();
        await new Promise(resolve => setTimeout(resolve, 2000));

        await client.sendMessage(message.from,
`📚 *PENGUMUMAN*

Pendaftaraan PPDB SDN 1 Sukamanah sudah dibuka!

Silakan kunjungi website kami untuk informasi lebih lanjut:
https://sdn1sukamanah.my.id/ppdb.html
`
        );

        await chat.sendStateTyping();
        await new Promise(resolve => setTimeout(resolve, 1500));

        const filePath = path.join(__dirname, 'gambar', 'images.jpg');

        if (fs.existsSync(filePath)) {
            try {
                const media = MessageMedia.fromFilePath(filePath);
                await client.sendMessage(message.from, media);
            } catch (err) {
                console.log('Error kirim gambar:', err);
                await message.reply('Gagal mengirim gambar.');
            }
        } else {
            await message.reply('File gambar tidak ditemukan.');
        }

        await message.reply("\nTekan 0 untuk kembali ke menu utama.");
        return;
    }


    // MENU 3
    if (text === '3') {
        await typing(message);
        await message.reply("📞 WA Sekolah: 087734686477\n\nTekan 0 untuk kembali.");
        return;
    }

    // MENU 4
    if (text === '4') {
        await typing(message);
        await message.reply(
`👥 *PENERIMAAN MURID BARU*

4️⃣1️⃣ Persyaratan
4️⃣2️⃣ Daftar Online

Tekan 0 untuk kembali.`
        );
        return;
    }

    // MENU 41
    if (text === '41') {
        await typing(message);
        await message.reply(
`📋 *Persyaratan*
- Fotokopi KTP Orang Tua
- Fotokopi KK
- Akta Kelahiran

💰 GRATIS

Tekan 0 untuk kembali.`
        );
        return;
    }

    // MENU 42
    if (text === '42') {
    await typing(message);
    await message.reply(
`📝 PENDAFTARAN ONLINE SDN 1 SUKAMANAH

Silakan lakukan pendaftaran melalui website berikut:

🌐 https://sdn1sukamanah.my.id/daftar.html

Setelah mengisi formulir, data akan langsung masuk ke sistem sekolah.

Terima kasih.`
);
    return;
}

    // =========================
    // MENU 6 - KEUNGGULAN
    // =========================
    if (text === '6') {
		const chat = await message.getChat();
    await chat.sendStateTyping();

    await new Promise(resolve => setTimeout(resolve, 1500));
        await message.reply(
`*Keunggulan SDN 1 SUKAMANAH*
- Sekolah ramah anak
- Guru berpengalaman
- Program pendidikan karakter
- Ekstrakurikuler
- Gratis biaya pendidikan
- Lingkungan aman dan nyaman dilengkapi kamera pengawas CCTV 24 jam\n\nTekan 0 untuk kembali.
`
        );
        return;
    }



    // =========================
    // MENU 7 DOWNLOAD
    // =========================
    if (text === '7') {
		const chat = await message.getChat();
    await chat.sendStateTyping();

    await new Promise(resolve => setTimeout(resolve, 1500));
        await message.reply(
`📂 *DOWNLOAD FILE*

7️⃣1️⃣ Formulir Pendaftaran
7️⃣2️⃣ agenda kegiatan bulan ramadhan
7️⃣3️⃣ Kalender Akademik

Tekan 0 untuk kembali.`
        );
        return;
    }

    if (text === '71' || text === '72' || text === '73') {

        let fileName = '';

        if (text === '71') fileName = 'formulir.pdf';
        if (text === '72') fileName = 'agenda kegiatan bulan ramadhan.pdf';
        if (text === '73') fileName = 'kalender.pdf';

        const filePath = path.join(__dirname, 'file', fileName);

        if (fs.existsSync(filePath)) {

            const media = MessageMedia.fromFilePath(filePath);
            await client.sendMessage(message.from, media);

            await message.reply("\nTekan 0 untuk kembali ke menu utama.");
        } else {
            await message.reply('⚠ File tidak ditemukan.\n\nTekan 0 untuk kembali.');
        }

        return;
    }


    // DEFAULT
    await message.reply(menu);
});

// =========================
// ERROR HANDLER
// =========================
process.on('unhandledRejection', error => {
    console.error('Unhandled Rejection:', error);
});

// =========================
// RECONNECT
// =========================
client.on('disconnected', reason => {
    log(`Bot disconnected: ${reason}`);
    setTimeout(() => {
        client.destroy();
        client.initialize();
    }, 5000);
});

client.initialize();
