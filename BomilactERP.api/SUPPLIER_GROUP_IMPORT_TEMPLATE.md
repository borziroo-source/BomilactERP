# Beszállító Csoport Import - Sablon Útmutató

## Gyors Leírás

Ez a dokumentum lépésről lépésre vezetik végig az Excel fájl helyes formázásán a beszállító csoport importálásához.

## Excel Sablon Létrehozása

### Lépés 1: Az Excel Fájl Megnyitása

1. Nyissuk meg a Microsoft Excel vagy egy kompatibilis alkalmazást (LibreOffice Calc, stb.)
2. Hozzunk létre egy új munkafüzetet

### Lépés 2: Fülek (Sheets) Létrehozása

Az alábbi szerkezettel hozzunk létre füleket:

**Fül nevei (példák):**
- Budapest
- Debrecen
- Miskolc
- Szeged
- total (ez kimaradni fog az importálásból)

### Lépés 3: Excel Fül Szerkezete

Mindegyik fülön (kivéve a "total") az alábbi formátum szükséges:

```
1. sor:  [Cég neve vagy üres]
2. sor:  [Fejléc szöveg]
3. sor:  [Fejléc szöveg]
4. sor:  [Fejléc szöveg]
5. sor:  [Fejléc szöveg]

OSZLOPOK (kötelezően):
A oszlop: Sorszám vagy üres
B oszlop: NÉV (kötelező)
C oszlop: CNP/UI (adóazonosító)
D oszlop: KÓD EXPLOATÁCIÓ (üzemeltetési kód)

ADATOK SOROK:
6. sor:   [Sorszám] | [Beszállító Neve] | [CNP/UI] | [Exp. Kód]
7. sor:   [Sorszám] | [Beszállító Neve] | [CNP/UI] | [Exp. Kód]
8. sor:   [Sorszám] | [Beszállító Neve] | [CNP/UI] | [Exp. Kód]
...
```

### Lépés 4: Konkrét Adatok Kitöltése

**Budapest Fül Példája:**

| A | B Név | C CNP/UI | D Kód Exploatáció |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |
| 1 | Agro Kft. | 12345678901 | EXP-001 |
| 2 | Bio Mezőgazdaság Zrt. | 98765432101 | EXP-002 |
| 3 | Farm Plus Kft. | 11223344556 | EXP-003 |
| 4 | Szarvas Tej Kft. | 22334455667 | EXP-004 |

**Debrecen Fül Példája:**

| A | B Név | C CNP/UI | D Kód Exploatáció |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |
| 1 | Östör Tej Kft. | 44556677889 | EXP-005 |
| 2 | Szarvasmarha Farm | 55667788990 | EXP-006 |
| 3 | Fejér Tejtermékek | 66778899001 | EXP-007 |

### Lépés 5: Fontos Szabályok

✅ **KÖTELEZŐ:**
- A B oszlopban (Név) minden sorban kell adatnak lennie az importáláshoz
- Az adatok a 6. sortól kezdődnek
- Az 1-5. sorok tetszés szerinti fejléc vagy üres cella

✅ **OPCIONÁLIS:**
- A C oszlop (CNP/UI) lehet üres
- A D oszlop (Kód Exploatáció) lehet üres
- Az A oszlop pusztán dokumentációs

❌ **KERÜLENDŐ:**
- Az 1-6. oszlop közötti sorszámok módosítása
- Üres sorok 6. sornál fent
- Excel makrók vagy egyéb extra funkciók

## Kész Sablon Használata

Ha rendelkezik egy előre kitöltött Excel sablonnal:

1. Nyissuk meg a fájlt
2. Szerezzünk meg az első fülről információkat
3. Módosítsuk az adatokat az Ön cégeire
4. Adjunk hozzá új füleket szükség szerint

## Mentés és Exportálás

- **Formátum:** .xlsx (Microsoft Excel 2010 vagy újabb)
- **Alternativi:** .xls (régebbi Excel verzió)
- **Nem támogatott:** .csv, .txt vagy más formátumok

1. Kattintson a **Fájl** menüre
2. Válassza a **Mentés Másként** opciót
3. Állítsa a formátumot **Excel munkafüzet (.xlsx)** -re
4. Adjon meg egy nevet (pl. "beszallitok.xlsx")
5. Kattintson **Mentés** gombra

## Import Futtatása

### API Végpont Használata

```bash
curl -X POST "http://localhost:5000/api/suppliergroups/import" \
  -F "file=@beszallitok.xlsx"
```

### Web Felület Használata

Az alkalmazás web felületén:

1. Navigáljon a **Beszállítók** > **Csoportok** oldalra
2. Kattintson az **"Import Excel"** gombra
3. Válassza ki az elkészített Excel fájlt
4. Kattintson az **"Importálás"** gombra
5. Vár meg míg az import befejezódik

## Elvárt Import Eredmény

Az importálás után az alábbiak történnek automatikusan:

1. ✅ A fülek neve alapján új gyűjtőpontok jönnek létre
2. ✅ A beszállítók az adatbázisba kerülnek
3. ✅ A kapcsolatok a gyűjtőpontok és beszállítók között etablálódnak
4. ✅ Az ismétlődő CNP/UI számok felismerésre kerülnek (duplikáció elkerülése)

## Hibaelhárítás Checklist

A sablon közvetlenül az importálás előtt ellenőrizze:

- [ ] Az összes fül neve helyesen van-e írva?
- [ ] Van-e "total" nevű fül (kihagyódni fog)?
- [ ] Az 1-5. sorok üres vagy fejléc sorok?
- [ ] A 6. sor az első adatsor?
- [ ] Az összes B oszlop (Név) kitöltve van az 6. sortól?
- [ ] A C és D oszlopok csak szükséges adatokat tartalmaznak?
- [ ] A fájl .xlsx formátumban mentetlenm-e?
- [ ] Az 52 karakternél rövidebb-e a fül nevei?

## Gyakori Hibák és Megoldások

### Hiba: "Az adatok nem importálódtak"

**Megoldás:** Ellenőrizze, hogy:
- Az adatok a 6. sortól kezdődnek
- A B oszlop (Név) kitöltött az összes sorban
- Nincs számformázás a CNP/UI oszlopban (szöveg kell)

### Hiba: "Duplikáltak a csoport- vagy beszállítónevek"

**Megoldás:**
- Ellenőrizze az azonos fülneveket
- Módosítsa az ismételt neveket (pl. "Budapest_North", "Budapest_South")

### Hiba: "Egy fül nem importálódott"

**Megoldás:**
- Ha a fül neve "total" → ez figyelmen kívül maradt (szándékos)
- Ha más → ellenőrizze, hogy az 1-5. sorok nem tartalmaznak-e adatokat

## Tipp: Mintafájl Létrehozása

Egy gyors módszer egy mintafájl létrehozásához:

1. Létrehozunk egy új Excel fájlt
2. Átnevezzünk egy lapot "Budapest"-nek
3. Egy másodikot "Debrecen"-nek
4. Egy harmadikot "total"-nak (ez kimarad)
5. Kitöltjük az 1-5. sorokat fejlécekkel
6. Hozzáadunk néhány mintaadatot a 6. sortól
7. Mentjük .xlsx formátumban

Ez a fájl rögtön importálható!

---

**További kérdések?** Tekintse meg a teljes dokumentációt: [SUPPLIER_GROUP_IMPORT_GUIDE.md](./SUPPLIER_GROUP_IMPORT_GUIDE.md)
