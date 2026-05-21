import pandas as pd

data = []
temp = {}

with open('ppdb_web.txt', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:  # skip baris kosong
            continue
        if line.startswith("Nama Siswa:"):
            temp["Nama Siswa"] = line.split(":",1)[1].strip()
        elif line.startswith("Tempat/Tgl Lahir:"):
            temp["Tempat/Tgl Lahir"] = line.split(":",1)[1].strip()
        elif line.startswith("Jenis Kelamin:"):
            temp["Jenis Kelamin"] = line.split(":",1)[1].strip()
        elif line.startswith("Alamat:"):
            temp["Alamat"] = line.split(":",1)[1].strip()
        elif line.startswith("Nama Orang Tua:"):
            temp["Nama Orang Tua"] = line.split(":",1)[1].strip()
        elif line.startswith("No WA Orang Tua:"):
            temp["No WA Orang Tua"] = line.split(":",1)[1].strip()
            data.append(temp.copy())
            temp = {}

df = pd.DataFrame(data)
df.to_excel('ppdb.xlsx', index=False)
print("Berhasil convert ke ppdb.xlsx!")