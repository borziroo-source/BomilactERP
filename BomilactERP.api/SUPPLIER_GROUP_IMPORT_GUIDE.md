# Beszállító Csoport Import Funkció - Dokumentáció

## Áttekintés

A beszállító csoport import funk­ció lehetővé teszi az Excel fájlok tömeges importálását, amely automatikusan:
- **Gyűjtőpontokat (csoport neveket)** hoz létre az Excel fülekből
- **Beszállítókat** azonosít és hoz létre
- **Kapcsolatokat** létesít a beszállítók és gyűjtőpontok között

## Szükséges Excel Formátum

### Fájl Szerkezete

Az Excel fájlnak a következő szerkezetre kell megfelelnie:

#### 1. Fülek (Sheets)
- **Minden fül egy gyűjtőpontot/gyűjtőcsatornát képvisel** (pl. "Budapest", "Debrecen", "Miskolc" stb.)
- **Kivétel:** A "total" nevű fül **automatikusan kimarad** az importálásból
- A fül **neve lesz a gyűjtőpont neve** az adatbázisban

#### 2. Oszlopok

Mindegyik fülön a következő szerkezet szükséges:

| Oszlop | Név | Leírás |
|--------|-----|--------|
| A | *Fejlécek/Üres* | Sorszámok vagy üres cella |
| B | **Név** | A beszállító teljes neve (kötelező) |
| C | **CNP/UI** | Adóazonosító szám (Közösségi azonosítási szám) |
| D | **Kod Exploatatie** | Üzemeltetési/Kihasználási kód |
| E+ | *Opcionális* | További oszlopok figyelmen kívül maradnak |

#### 3. Sorszerkezet

- **1-5. sor:** Fejlécek vagy egyéb információ (figyelmen kívül hagyott)
- **6. sor és után:** Beszállítók adatai

### Példa Excel Fájl Szerkezet

```
Budapest fül:
┌────┬─────────────────────────┬──────────────────┬──────────────────┐
│ A  │ B - Név                 │ C - CNP/UI        │ D - Kod Expl.    │
├────┼─────────────────────────┼──────────────────┼──────────────────┤
│ 1  │ Fejléc                  │ Fejléc            │ Fejléc           │
│ 2  │ Fejléc                  │ Fejléc            │ Fejléc           │
│ 3  │ Fejléc                  │ Fejléc            │ Fejléc           │
│ 4  │ Fejléc                  │ Fejléc            │ Fejléc           │
│ 5  │ Fejléc                  │ Fejléc            │ Fejléc           │
├────┼─────────────────────────┼──────────────────┼──────────────────┤
│ 6  │ Agro Kft.               │ 12345678901       │ EXP-001          │
│ 7  │ Bio Mezőgazdaság Zrt.   │ 98765432101       │ EXP-002          │
│ 8  │ Farm Plus Kft.          │ 11223344556       │ EXP-003          │
└────┴─────────────────────────┴──────────────────┴──────────────────┘

Debrecen fül:
┌────┬─────────────────────────┬──────────────────┬──────────────────┐
│ A  │ B - Név                 │ C - CNP/UI        │ D - Kod Expl.    │
├────┼─────────────────────────┼──────────────────┼──────────────────┤
│ 1  │ ...fejléc...            │ ...fejléc...      │ ...fejléc...     │
│ 5  │ [1-5. sorok: fejléc]    │                   │                  │
├────┼─────────────────────────┼──────────────────┼──────────────────┤
│ 6  │ Östör Tej Kft.          │ 44556677889       │ EXP-004          │
│ 7  │ Szarvasmarha Farm       │ 55667788990       │ EXP-005          │
└────┴─────────────────────────┴──────────────────┴──────────────────┘

total fül:
[Ez a fül figyelmen kívül marad - nem szükséges módosítani]
```

## Hogyan Működik az Import?

### 1. Fájl Feltöltés

```
POST /api/suppliergroups/import
Content-Type: multipart/form-data

[Excel fájl]
```

### 2. Import Folyamat

Lépésről lépésre:

1. **Fájl Validálás**
   - Ellenőrzés: Az fájl .xlsx vagy .xls formátumú-e
   - Ellenőrzés: A fájl nem üres-e

2. **Fülek Feldolgozása** (kivéve "total")
   - A fül neve az új gyűjtőpont neve lesz
   - Ha a gyűjtőpont már létezik az adatbázisban, az felhasználódik
   - Ha nem létezik, új gyűjtőpont hozódik létre

3. **Beszállítók Feldolgozása** (6. sortól kezdve)

   Minden sor feldolgozása:
   
   a) **Név Kiolvassás** (B oszlop)
      - Ha üres → sor átugrása
      - Ha nem üres → feldolgozás
   
   b) **Meglévő Beszállító Keresése**
      - CNP/UI alapján (*C oszlop)
      - Ha találat → a beszállító felhasználódik
      - Ha nincs találat → új beszállító hozódik létre
   
   c) **Beszállító Adatok Frissítése**
      - Név: `[B oszlop]`
      - CNP/UI (TaxNumber): `[C oszlop]`
      - Üzemeltetési kód: `[D oszlop]`
      - Típus: `Supplier` (vagy `Both`, ha már Customer)
   
   d) **Gyűjtőponthoz Rendelés**
      - Ha a beszállító még nem tartozik ehhez a gyűjtőponthoz → hozzárendelés
      - Ha már hozzá tartozik → nincs változás

4. **Mentés**
   - Összes módosítás mentése az adatbázisba
   - Naplózás az importálási folyamatról

### 3. Válasz

Az import befejezése után az API a következő információkat adja vissza:

```json
{
  "success": true,
  "message": "Import completed successfully",
  "groupsCreated": 2,
  "groupsUpdated": 0,
  "suppliersCreated": 15,
  "suppliersUpdated": 3,
  "associationsCreated": 18,
  "errors": []
}
```

**Mezők jelentése:**
- `success`: Az import sikeres volt-e
- `groupsCreated`: Létrehozott új gyűjtőpontok száma
- `groupsUpdated`: Frissített gyűjtőpontok száma
- `suppliersCreated`: Létrehozott új beszállítók száma
- `suppliersUpdated`: Frissített beszállítók száma
- `associationsCreated`: Létesített új kapcsolatok száma
- `errors`: Az importálás során felmerült hibák listája

## Fontos Megjegyzések

### Adatintegritás

1. **Duplikáció Megelőzése**
   - A beszállítók CNP/UI alapján kerülnek azonosításra
   - Ugyanaz a CNP/UI nem vezethet duplikált bejegyzésekhez
   - Egy beszállító több gyűjtőponthoz is tartozhat

2. **Típus Módosítások**
   - Ha egy "Customer" típusú beszállítót importálnak, típusa "Both"-ra módosul
   - A Supplier típus megmarad

3. **Üres Sorok**
   - Az üres nevű sorok automatikuson kihagyódnak
   - Az üres C és D oszlopok (CNP/UI, Exploitation Code) opcionálisak

### Naplózás

Az importálás folyamata részletesen naplózva van:
- Létrehozott/frissített objektumok
- Feldolgozott sorok száma
- Hibák és figyelmeztetések

### Hibakezelés

Az import **nem leáll** egyetlen sor hibája miatt. Az alábbiak történnek:

- Az adott sor feldolgozása **kimarad**
- A hiba **rögzítve** lesz az `errors` tömbben
- Az **többi sor feldolgozása folytatódik**

## Használat Lépésről Lépésre

### 1. Excel Fájl Előkészítése

- [ ] Nyissuk meg az Excel fájlt
- [ ] Ellenőrizzük: Van-e minden gyűjtőpont külön fülön?
- [ ] Ellenőrizzük: A "total" fül megvan-e (kihagyódni fog)?
- [ ] Ellenőrizzük: Az 1-5. sor fejléceket/üres cellákat tartalmaz?
- [ ] Ellenőrizzük: A 6. sortól vannak-e a beszállítók?
- [ ] Ellenőrizzük: B, C, D oszlopok kitöltöttek?
- [ ] Mentés .xlsx formátumban

### 2. Import Végzése

**API meghívás:**
```bash
curl -X POST "https://api.example.com/api/suppliergroups/import" \
  -F "file=@suppliers.xlsx"
```

**vagy web felületen keresztül:**
- Navigáljon a Beszállítók > Csoportok oldalra
- Kattintson az "Import Excel" gombra
- Válassza ki az Excel fájlt
- Kattintson az "Importálás" gombra

### 3. Eredmények Ellenőrzése

- [ ] Az API válasz `success: true`?
- [ ] Az `errors` tömb üres?
- [ ] Az jelentés tartalmazza az importált tételek számát?
- [ ] Az web felületen láthatók az új gyűjtőpontok?

## Hibaelhárítás

### "Csak Excel fájlok (.xlsx, .xls) engedélyezetek"

**Megoldás:** Győződjön meg, hogy az fájl .xlsx vagy .xls végződésűen menti.

### "Az adatbázis sikertelen frissítés, részleges importálás"

**OK:** Az import megáll, ha az adatbázis hiba lépett fel. Ne nyissa meg a fájlt, amíg az import fut.

### "Üres vagy hibás Excel fájl"

**OK:** Ellenőrizzse:
- Az fájl nem üres-e
- Az 1-5. sor fejléceket tartalmaz
- A 6. sortól vannak adatok
- Az B oszlop kitöltött minden sorban

## Adatbázis Figyelembe Vett Értékek

Az alábbi mezők frissítésre kerülnek az importálás során:

**SupplierGroup (Gyűjtőpont):**
- `Name` - A fül neve

**Partner (Beszállító):**
- `Name` - Beszállító neve
- `TaxNumber` - CNP/UI szám
- `ExploitationCode` - Üzemeltetési kód
- `Type` - Partner típusa (frissítve, ha szükséges)
- `IsActive` - Aktív státusz (alapértelmezetten: igaz)
- `SupplierGroupId` - Gyűjtőpont hivatkozása

## API Endpoint Referencia

### Import
- **Végpont:** `POST /api/suppliergroups/import`
- **Paraméterek:** `file` (multipart/form-data)
- **Válasz:** `ImportResult` objektum
- **HTTP Állapotok:**
  - `200 OK` - Import sikeres vagy részlegesen sikeres
  - `400 Bad Request` - Érvénytelen fájl
  - `500 Internal Server Error` - Szerver hiba

### Gyűjtőpontok Listája
- **Végpont:** `GET /api/suppliergroups`
- **Válasz:** Összes gyűjtőpont listája

### Csoport Tagjai
- **Végpont:** `GET /api/suppliergroups/{id}/members`
- **Válasz:** Az adott csoporthoz tartozó beszállítók

## Kérdések és Támogatás

Ha problémákat tapasztal az importálás során:

1. **Ellenőrizze a naplókat** - Az alkalmazás részletesen naplózza az importálást
2. **Tekintse meg az API választ** - Részletes hibaüzenetek lehetnek az `errors` tömbben
3. **Validálja az Excel fájlt** - Az alábbi ellenőrzések:
   - Fül nevek tartalmaznak-e "total" szót?
   - Van-e 6. sor az adatokkal?
   - Tartalmaz-e az B oszlop minden sorban értéket?
