// === app.js ===

// Hent HTML-elementer
const bolkVelger = document.getElementById('bolkVelger');
const kategoriVelger = document.getElementById('kategoriVelger');
const fontFamilySelect = document.getElementById('font-family');
const toggleCaseCheckbox = document.getElementById('toggle-case');
const antallOrdVelger = document.getElementById('antallOrdVelger');
const tekstStorrelseVelger = document.getElementById('tekstStorrelseVelger');
const overskriftInput = document.getElementById('overskriftInput');
const temaVelger = document.getElementById('temaVelger');

const modalBolkVelger = document.getElementById('modalBolkVelger');
const modalKategoriVelger = document.getElementById('modalKategoriVelger');

const btnLagOppgave = document.getElementById('btnLagOppgave');
const btnNullstill = document.getElementById('btnNullstill');
const btnSkrivUt = document.getElementById('btnSkrivUt');
const btnLastNed = document.getElementById('btnLastNed');
const hamburgerBtn = document.getElementById('hamburgerBtn');

// Variabler for å holde styr på tilstander
let forrigeGyldigeBolk = 'bolk1'; 
let manueltValgteOrd = []; 

function oppdaterKategoriMeny() {
    const valgtBolkNøkkel = bolkVelger.value;
    
    // 1. Logikk for "Velg blant alle ord"
    if (valgtBolkNøkkel === 'manuell_alle') {
        kategoriVelger.style.display = 'none'; // Skjul underkategori
        
        // --- NYTT: Oppdaterer placeholder til "Blandede ord..." ---
        if (typeof overskriftInput !== 'undefined' && overskriftInput) {
            overskriftInput.placeholder = "Blandede ord...";
        }
        
        autoGenerate();
        return;
    }
    
    // Sørg for at underkategorimenyen er synlig for vanlige bolker og manuell kategori
    kategoriVelger.style.display = 'block';

    // 2. Logikk for "Velg ord selv"
    if (valgtBolkNøkkel === 'manuell_kategori') {
        // --- ENDRING HER: Siden vi åpner en manuell velger som støtter opptil 6 ord, 
        // lar vi enten menyen styre det, eller så kan vi synkronisere den.
        // For å sikre at du kan velge 6 ord, henter vi bare verdien direkte i åpneManuellVelger.
        åpneManuellVelger();
        return; 
    }

    // 3. Logikk for standard bolker (Bolk 1, Bolk 2 osv.)
    forrigeGyldigeBolk = valgtBolkNøkkel; // Husk hvilken bolk vi er i

    const valgtBolk = ordlisteKategorier[valgtBolkNøkkel];
    kategoriVelger.innerHTML = ''; // Tøm gamle underkategorier
    
    if (valgtBolk) {
        Object.keys(valgtBolk).forEach(kategoriNavn => {
            const option = document.createElement('option');
            option.value = kategoriNavn;
            option.textContent = kategoriNavn;
            kategoriVelger.appendChild(option);
        });
    }

    // --- NYTT: Oppdaterer placeholder til å vise gjeldende kategorinavn ---
    if (typeof overskriftInput !== 'undefined' && overskriftInput) {
        const valgtKategoriNøkkel = kategoriVelger.value;
        overskriftInput.placeholder = valgtKategoriNøkkel ? `${valgtKategoriNøkkel}...` : "Automatisk...";
    }

    autoGenerate();
}


function autoGenerate() {
    if (document.getElementById('capture-area').style.display === 'block') {
        generatePuzzle();
    }
}

function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
}

function generatePuzzle() {
    // Hvis brukeren står på "Velg ord selv" men klikker på sidemenyknappen, åpner vi modalen igjen.
    if (bolkVelger.value === 'manuell_kategori') {
        åpneManuellVelger();
        return;
    }

    document.getElementById('placeholder-image').style.display = 'none';
    document.getElementById('capture-area').style.display = 'block';

    const valgtBolkNøkkel = bolkVelger.value;
    const valgtKategoriNøkkel = kategoriVelger.value;
    const isUpper = toggleCaseCheckbox.checked;
    let antallOrd = parseInt(antallOrdVelger.value, 10);

    let aktivListe = [];

    // --- NYTT: Sjekk om det er Par-ord som er valgt ---
    const erParOrd = (valgtBolkNøkkel === 'bolk7' && valgtKategoriNøkkel === 'Par-ord');

    if (erParOrd) {
        // Tving visningen til 6 ord (3 par) og oppdater dropdown i menyen
        antallOrd = 6;
        antallOrdVelger.value = 6;
    }

    if (valgtBolkNøkkel === 'manuell_alle') {
        Object.keys(ordlisteKategorier).forEach(bolkKey => {
            Object.keys(ordlisteKategorier[bolkKey]).forEach(katKey => {
                aktivListe = aktivListe.concat(ordlisteKategorier[bolkKey][katKey]);
            });
        });
        // Fjern duplikater
        aktivListe = aktivListe.filter((item, index, self) => 
            index === self.findIndex((t) => t.ord === item.ord)
        );
        
        if (overskriftInput.value.trim() !== "") {
            document.getElementById('main-title').innerText = overskriftInput.value;
        } else {
            document.getElementById('main-title').innerText = `Oppgaver: Blandede ord`;
        }
    } else {
        if (!valgtBolkNøkkel || !valgtKategoriNøkkel) return;
        
        // Hent ordlisten basert på om det er par-ord eller vanlige ord
        if (erParOrd) {
            aktivListe = hentParOrdTilVisning();
        } else {
            aktivListe = ordlisteKategorier[valgtBolkNøkkel][valgtKategoriNøkkel] || [];
        }
        
        if (overskriftInput.value.trim() !== "") {
            document.getElementById('main-title').innerText = overskriftInput.value;
        } else {
            document.getElementById('main-title').innerText = `Oppgaver: ${valgtKategoriNøkkel}`;
        }
    }

    // Hvis det ikke er par-ord (som allerede har returnert 6 ferdige ord), gjør vi standard sjekk og shuffle
    let utvalgte = [];
    if (erParOrd) {
        utvalgte = aktivListe; 
    } else {
        if (!aktivListe || aktivListe.length < antallOrd) {
            alert(`Fant ikke nok ord (minst ${antallOrd}) i denne listen.`);
            return;
        }
        utvalgte = shuffle([...aktivListe]).slice(0, antallOrd);
    }

    // 1. GENERER LESE-ORD
    const leseBeholder = document.getElementById('leseOrdBeholder');
    leseBeholder.className = (antallOrd === 6) ? "lese-grid smal" : "lese-grid";
    leseBeholder.innerHTML = "";
    
    utvalgte.forEach(item => {
        const ordDiv = document.createElement('div');
        ordDiv.innerText = isUpper ? item.ord.toUpperCase() : item.ord.toLowerCase();
        leseBeholder.appendChild(ordDiv);
    });

    // 2. GENERER SKRIVELINJER
    const skriveBeholder = document.getElementById('skriveLinjerBeholder');
    skriveBeholder.className = "skrive-grid";
    skriveBeholder.innerHTML = "";

    const skrivelinjerHtml = `
        <div class="lines-container">
            <div class="l"></div>
            <div class="l"></div>
            <div class="l thick"></div>
            <div class="l"></div>
        </div>
    `;

    for (let i = 0; i < antallOrd; i++) {
        const feltDiv = document.createElement('div');
        feltDiv.innerHTML = skrivelinjerHtml;
        skriveBeholder.appendChild(feltDiv);
    }

    // 3. GENERER SETNINGER
    const setningBeholder = document.getElementById('setningerBeholder');
    setningBeholder.innerHTML = '';

    utvalgte.forEach(item => {
        let setningsTekst = item.setning;
        if (isUpper) setningsTekst = setningsTekst.toUpperCase();
        
        let modifisertSetning = setningsTekst.replace('___', '<span style="white-space: nowrap;"><span class="linje-blank"></span>');

        const rad = document.createElement('div');
        rad.className = 'setning-linje';
        rad.innerHTML = `<div class="setning-tekst">${modifisertSetning}</span></div>`;
        setningBeholder.appendChild(rad);
    });

    oppdaterFont();
    oppdaterTekstStorrelse();
    oppdaterTema(); // <-- LEGG TIL DENNE HER
}

// === HJELPEFUNKSJON FOR PAR-ORD ===
function hentParOrdTilVisning() {
    // Bruker den globale variabelen ordlisteKategorier slik som resten av appen din
    const allePar = ordlisteKategorier.bolk7["Par-ord"];
    
    // Stokker om på alle parene
    const tilfeldigePar = [...allePar].sort(() => 0.5 - Math.random());
    
    // Tar de 3 første pakkene (parene)
    const treUtvalgtePar = tilfeldigePar.slice(0, 3);
    
    // Flater ut arrayen slik at det blir 6 unike objekter i en liste
    let deSeksOrdene = treUtvalgtePar.flat();
    
    // Stokker om på de 6 ordene til slutt så de ikke står direkte ved siden av tvillingen sin
    return deSeksOrdene.sort(() => 0.5 - Math.random());
}

function oppdaterFont() {
    const valgtFont = fontFamilySelect.value;
    const ark = document.getElementById('capture-area');
    ark.style.fontFamily = valgtFont;
    document.querySelectorAll('#capture-area *').forEach(el => {
        el.style.fontFamily = valgtFont;
    });
}

function oppdaterTekstStorrelse() {
    const storrelse = tekstStorrelseVelger.value;
    const leseOrd = document.querySelectorAll('.lese-grid div');
    const setninger = document.querySelectorAll('.setning-linje');

    let leseSize = "2.1rem";
    let setningSize = "1.6rem";

    if (storrelse === 'liten') {
        leseSize = "1.7rem";
        setningSize = "1.35rem";
    } else if (storrelse === 'stor') {
        leseSize = "2.6rem";
        setningSize = "2.0rem";
    }

    leseOrd.forEach(el => el.style.fontSize = leseSize);
    setninger.forEach(el => el.style.fontSize = setningSize);
}

function resetForm() { 
    if(confirm("Nullstille alt?")) {
        bolkVelger.selectedIndex = 0;
        fontFamilySelect.selectedIndex = 0;
        temaVelger.selectedIndex = 0; // <-- LEGG TIL DENNE
        antallOrdVelger.selectedIndex = 0;
        tekstStorrelseVelger.selectedIndex = 0;
        toggleCaseCheckbox.checked = false;
        
        overskriftInput.value = "";

        document.getElementById('placeholder-image').style.display = 'flex';
        document.getElementById('capture-area').style.display = 'none';
        
        document.getElementById('leseOrdBeholder').innerHTML = "";
        document.getElementById('skriveLinjerBeholder').innerHTML = "";
        document.getElementById('setningerBeholder').innerHTML = "";
        
        oppdaterKategoriMeny();
    }
}

function downloadAsPDF() {
    const area = document.getElementById('capture-area');
    if (area.style.display === 'none') {
        alert("Du må generere en oppgave først!");
        return;
    }
    alert("Velg 'Lagre som PDF' under 'Destinasjon' i utskriftsvinduet som nå åpnes for å laste ned oppgaven.");
    window.print();
}

function toggleMenu() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// === LOGIKK FOR MANUELT ORDVALG FRA MENY ===
const modal = document.getElementById('ordVelgerModal');
const btnAvbrytKryss = document.getElementById('btnAvbrytKryss');
const btnAvbryt = document.getElementById('btnAvbryt');
const btnNullstillValgte = document.getElementById('btnNullstillValgte');
const btnGenererValgte = document.getElementById('btnGenererValgte');
const søkOrdInput = document.getElementById('søkOrdInput');
const alleOrdContainer = document.getElementById('alleOrdContainer');
const tellerValgte = document.getElementById('tellerValgte');
const tellerMaks = document.getElementById('tellerMaks');

function stripHtml(text) {
    return text.replace(/<\/?[^>]+(>|$)/g, "");
}

function oppdaterModalKategoriMeny() {
    if (!modalBolkVelger || !modalKategoriVelger) return;
    const valgtBolkNøkkel = modalBolkVelger.value;
    modalKategoriVelger.innerHTML = '';
    
    if (valgtBolkNøkkel === 'alle_ord') {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '— Alle lister inkludert —';
        modalKategoriVelger.appendChild(option);
        modalKategoriVelger.disabled = true;
    } else {
        modalKategoriVelger.disabled = false;
        const valgtBolk = ordlisteKategorier[valgtBolkNøkkel];
        
        if (valgtBolk) {
            Object.keys(valgtBolk).forEach(kategoriNavn => {
                const option = document.createElement('option');
                option.value = kategoriNavn;
                option.textContent = kategoriNavn;
                modalKategoriVelger.appendChild(option);
            });
        }
    }
    oppdaterModalVisning();
}

function åpneManuellVelger() {
    if (window.kunEndreBokstaver) return;
    if (!tellerMaks || !modal) return;

    tellerMaks.innerText = 6;
    søkOrdInput.value = '';
    
    if (typeof overskriftInput !== 'undefined' && overskriftInput) {
        overskriftInput.placeholder = "Manuelt valgte ord...";
    }
    
    if (modalBolkVelger) {
        modalBolkVelger.innerHTML = '';
        
        const alleOpsjon = document.createElement('option');
        alleOpsjon.value = 'alle_ord';
        alleOpsjon.textContent = 'Velg blant alle ord';
        modalBolkVelger.appendChild(alleOpsjon);
        
        Array.from(bolkVelger.options).forEach(opt => {
            if (opt.value && ordlisteKategorier[opt.value]) {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.textContent;
                modalBolkVelger.appendChild(option);
            }
        });

        if (ordlisteKategorier[bolkVelger.value]) {
            modalBolkVelger.value = bolkVelger.value;
        } else {
            modalBolkVelger.value = 'alle_ord';
        }
    }

    oppdaterModalKategoriMeny();
    oppdaterModalVisning();
    modal.style.display = 'flex';
}

function lukkModalOgAvbryt() {
    modal.style.display = 'none';
    if (forrigeGyldigeBolk) {
        bolkVelger.value = forrigeGyldigeBolk;
    }
}

if (btnAvbrytKryss) btnAvbrytKryss.addEventListener('click', lukkModalOgAvbryt);
if (btnAvbryt) btnAvbryt.addEventListener('click', lukkModalOgAvbryt);

if (btnNullstillValgte) {
    btnNullstillValgte.addEventListener('click', () => {
        manueltValgteOrd = [];
        oppdaterModalVisning();
    });
}

if (søkOrdInput) søkOrdInput.addEventListener('input', oppdaterModalVisning);


function oppdaterTema() {
    const ark = document.getElementById('capture-area');
    if (!ark) return;

    // Definer alle mulige temaklasser som skal fjernes før vi legger til ny
    const alleTemaer = [
        'theme-standard', 'theme-host', 'theme-vinter', 'theme-var', 
        'theme-rommet', 'theme-fest', 'theme-esc', 'theme-halloween', 
        'theme-jul', 'theme-dino', 'theme-pirat', 'theme-sport', 'theme-realfag'
    ];
    
    // Fjern gamle klasser
    ark.classList.remove(...alleTemaer);
    
    // Legg til den nye valgte klassen
    const valgtTema = temaVelger.value;
    ark.classList.add(valgtTema);
}


function oppdaterModalVisning() {
    const maksOrd = 6; 
    const isUpper = toggleCaseCheckbox.checked;
    const søkeTekst = stripHtml(søkOrdInput.value.toLowerCase().trim());

    let aktivListe = [];
    const mBolk = modalBolkVelger ? modalBolkVelger.value : '';
    const mKat = modalKategoriVelger ? modalKategoriVelger.value : '';

    if (mBolk === 'alle_ord') {
        Object.keys(ordlisteKategorier).forEach(bKey => {
            Object.keys(ordlisteKategorier[bKey]).forEach(kKey => {
                // Spesialhåndtering hvis det er par-ord-matrisen inni matrisen
                if (bKey === 'bolk7' && kKey === 'Par-ord') {
                    ordlisteKategorier[bKey][kKey].forEach(par => {
                        aktivListe = aktivListe.concat(par);
                    });
                } else {
                    aktivListe = aktivListe.concat(ordlisteKategorier[bKey][kKey]);
                }
            });
        });
        
        const sett = new Set();
        aktivListe = aktivListe.filter(item => {
            if(!item || !item.ord) return false;
            const duplikat = sett.has(item.ord.toLowerCase());
            sett.add(item.ord.toLowerCase());
            return !duplikat;
        });

    } else if (ordlisteKategorier[mBolk] && ordlisteKategorier[mBolk][mKat]) {
        if (mBolk === 'bolk7' && mKat === 'Par-ord') {
            ordlisteKategorier[mBolk][mKat].forEach(par => {
                aktivListe = aktivListe.concat(par);
            });
        } else {
            aktivListe = ordlisteKategorier[mBolk][mKat];
        }
    }

    aktivListe = [...aktivListe].sort((a, b) => a.ord.localeCompare(b.ord, 'no'));

    const boks1 = document.getElementById('boksGruppe1');
    const liste1 = document.getElementById('valgteOrdListe1');
    const liste2 = document.getElementById('valgteOrdListe2');

    if (liste1) liste1.innerHTML = '';
    if (liste2) liste2.innerHTML = '';

    manueltValgteOrd.forEach((item, index) => {
        const li = document.createElement('li');
        li.style.cssText = "background:#edf2f7; padding:8px; margin-bottom:5px; border-radius:4px; display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:1.1rem; color:#2d3748;";
        li.innerText = isUpper ? item.ord.toUpperCase() : item.ord.toLowerCase();
        
        const fjernBtn = document.createElement('button');
        fjernBtn.className = 'modal-fjern-btn';
        fjernBtn.innerText = 'X';
        fjernBtn.addEventListener('click', () => {
            manueltValgteOrd.splice(index, 1);
            oppdaterModalVisning();
        });
        
        li.appendChild(fjernBtn);

        if (index < 3) {
            if (liste1) liste1.appendChild(li);
        } else {
            if (liste2) liste2.appendChild(li);
        }
    });

    const antallValgt = manueltValgteOrd.length;
    if (tellerValgte) tellerValgte.innerText = antallValgt;
    if (tellerMaks) tellerMaks.innerText = (antallValgt <= 3) ? 3 : 6;
    if (btnGenererValgte) btnGenererValgte.disabled = (antallValgt !== 3 && antallValgt !== 6);

    if (boks1) {
        boks1.className = 'ord-gruppe-boks';
        if (antallValgt === 3 || antallValgt === 6) {
            boks1.style.backgroundColor = '#f0fff4'; 
            boks1.style.borderColor = '#38a169';
        } else {
            boks1.style.backgroundColor = '#fff5f5'; 
            boks1.style.borderColor = '#e53e3e';
        }
    }

    alleOrdContainer.innerHTML = '';
    
    aktivListe.forEach(item => {
        if (søkeTekst && !item.ord.toLowerCase().includes(søkeTekst)) return;

        const ordKnapp = document.createElement('div');
        ordKnapp.className = 'ord-knapp';
        ordKnapp.innerText = isUpper ? item.ord.toUpperCase() : item.ord.toLowerCase();

        const erAlleredeValgt = manueltValgteOrd.some(v => v.ord === item.ord);
        if (erAlleredeValgt) ordKnapp.classList.add('valgt');

        ordKnapp.addEventListener('click', () => {
            if (erAlleredeValgt) {
                manueltValgteOrd = manueltValgteOrd.filter(v => v.ord !== item.ord);
            } else {
                if (manueltValgteOrd.length < maksOrd) {
                    manueltValgteOrd.push(item);
                } else {
                    alert(`Du kan velge maksimalt 6 ord til denne oppgaven!`);
                }
            }
            oppdaterModalVisning();
        });

        alleOrdContainer.appendChild(ordKnapp);
    });
}

if (btnGenererValgte) {
    btnGenererValgte.addEventListener('click', () => {
        antallOrdVelger.value = manueltValgteOrd.length;

        document.getElementById('placeholder-image').style.display = 'none';
        document.getElementById('capture-area').style.display = 'block';

        const isUpper = toggleCaseCheckbox.checked;
        const antallOrd = manueltValgteOrd.length;

        document.getElementById('main-title').innerText = `Oppgaver: Manuelt valgte ord`;

        const leseBeholder = document.getElementById('leseOrdBeholder');
        leseBeholder.className = (antallOrd === 6) ? "lese-grid smal" : "lese-grid";
        leseBeholder.innerHTML = "";
        
        manueltValgteOrd.forEach(item => {
            const ordDiv = document.createElement('div');
            ordDiv.innerText = isUpper ? item.ord.toUpperCase() : item.ord.toLowerCase();
            leseBeholder.appendChild(ordDiv);
        });

        const skriveBeholder = document.getElementById('skriveLinjerBeholder');
        skriveBeholder.className = "skrive-grid";
        skriveBeholder.innerHTML = "";

        const skrivelinjerHtml = `<div class="lines-container"><div class="l"></div><div class="l"></div><div class="l thick"></div><div class="l"></div></div>`;
        for (let i = 0; i < antallOrd; i++) {
            const feltDiv = document.createElement('div');
            feltDiv.innerHTML = skrivelinjerHtml;
            skriveBeholder.appendChild(feltDiv);
        }

        const setningBeholder = document.getElementById('setningerBeholder');
        setningBeholder.innerHTML = '';

        manueltValgteOrd.forEach(item => {
            let setningsTekst = item.setning;
            if (isUpper) setningsTekst = setningsTekst.toUpperCase();
            let modifisertSetning = setningsTekst.replace('___', '<span style="white-space: nowrap;"><span class="linje-blank"></span>');

            const rad = document.createElement('div');
            rad.className = 'setning-linje';
            rad.innerHTML = `<div class="setning-tekst">${modifisertSetning}</span></div>`;
            setningBeholder.appendChild(rad);
        });

        oppdaterFont();
        oppdaterTekstStorrelse();
        oppdaterTema(); // <-- LEGG TIL DENNE HER OGSÅ
        modal.style.display = 'none';
    });
}

bolkVelger.addEventListener('change', () => {
    overskriftInput.value = ""; 
    oppdaterKategoriMeny();
});

kategoriVelger.addEventListener('change', () => {
    overskriftInput.value = ""; 
    if (modal && modal.style.display === 'flex') {
        oppdaterModalVisning();
    } else {
        autoGenerate();
    }
});

if (modalBolkVelger) modalBolkVelger.addEventListener('change', oppdaterModalKategoriMeny);
if (modalKategoriVelger) modalKategoriVelger.addEventListener('change', oppdaterModalVisning);

fontFamilySelect.addEventListener('change', oppdaterFont);
toggleCaseCheckbox.addEventListener('change', (event) => {
    event.stopPropagation();
    const isUpper = toggleCaseCheckbox.checked;

    if (modal && modal.style.display === 'flex') {
        const valgteOrdElementer = document.querySelectorAll('#boksGruppe1 li');
        valgteOrdElementer.forEach(li => {
            const tekstNode = li.firstChild;
            if (tekstNode && tekstNode.nodeType === Node.TEXT_NODE) {
                tekstNode.textContent = isUpper ? tekstNode.textContent.toUpperCase() : tekstNode.textContent.toLowerCase();
            }
        });

        const ordKnapper = document.querySelectorAll('.ord-knapp');
        ordKnapper.forEach(knapp => {
            knapp.innerText = isUpper ? knapp.innerText.toUpperCase() : knapp.innerText.toLowerCase();
        });
    } 
    
    if (document.getElementById('capture-area').style.display === 'block') {
        const leseOrdElementer = document.querySelectorAll('#leseOrdBeholder div');
        leseOrdElementer.forEach(el => {
            el.textContent = isUpper ? el.textContent.toUpperCase() : el.textContent.toLowerCase();
        });

        const setningsTekster = document.querySelectorAll('.setning-tekst');
        setningsTekster.forEach(el => {
            el.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = isUpper ? node.textContent.toUpperCase() : node.textContent.toLowerCase();
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    node.childNodes.forEach(subNode => {
                        if (subNode.nodeType === Node.TEXT_NODE) {
                            subNode.textContent = isUpper ? subNode.textContent.toUpperCase() : subNode.textContent.toLowerCase();
                        }
                    });
                }
            });
        });
    }
});

if (overskriftInput) {
    overskriftInput.addEventListener('input', () => {
        const mainTitle = document.getElementById('main-title');
        if (!mainTitle) return;

        if (overskriftInput.value.trim() !== "") {
            mainTitle.innerText = overskriftInput.value;
        } else {
            const valgtBolkNøkkel = bolkVelger.value;
            const valgtKategoriNøkkel = kategoriVelger.value;
            
            if (valgtBolkNøkkel === 'manuell_alle') {
                mainTitle.innerText = `Oppgaver: Blandede ord`;
            } else if (valgtBolkNøkkel === 'manuell_kategori') {
                mainTitle.innerText = `Oppgaver: Manuelt valgte ord`;
            } else {
                mainTitle.innerText = `Oppgaver: ${valgtKategoriNøkkel}`;
            }
        }
    });
}

antallOrdVelger.addEventListener('change', () => {
    if (modal && modal.style.display === 'flex') {
        oppdaterModalVisning();
    } else {
        autoGenerate();
    }
});

tekstStorrelseVelger.addEventListener('change', oppdaterTekstStorrelse);
temaVelger.addEventListener('change', oppdaterTema);

if (btnLagOppgave) btnLagOppgave.addEventListener('click', generatePuzzle);
if (btnNullstill) btnNullstill.addEventListener('click', resetForm);
if (btnSkrivUt) btnSkrivUt.addEventListener('click', () => window.print());
if (btnLastNed) btnLastNed.addEventListener('click', downloadAsPDF);
if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMenu);

window.onclick = function(event) {
    if (!event.target.closest('.menu-container')) {
        var dropdowns = document.getElementsByClassName("dropdown-menu");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    oppdaterKategoriMeny();
});